<?php

namespace App\Http\Controllers\Api\Products;

use App\Entities\Products;
use App\Transformers\Products\ProductsTransformer;
use Dingo\Api\Routing\Helpers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Class UsersController.
 *
 * @author Jose Fonseca <jose@ditecnologia.com>
 */
class ProductsController extends Controller
{
    use Helpers;

    /**
     * @var Products
     */
    protected $model;

    /**
     * UsersController constructor.
     *
     * @param Products $model
     */
    public function __construct(Products $model)
    {
        $this->model = $model;
    }

    /**
     * @param $id
     * @return mixed
     */
    public function show($branch_id, $department_id)
    {
        $paginator = $this->model->select(
            ['*', 'products.name as product_name',
                'products.id as product_id',
                'branches.name as branch_name',
                'departments.name as department_name'
            ])
            ->where('products.branch_id', $branch_id)->where('products.department_id', $department_id)
            ->leftJoin('branches', 'branches.id', '=', 'products.branch_id')
            ->leftJoin('departments', 'departments.id', '=', 'products.department_id')
            ->leftJoin('metrics', 'metrics.id', '=', 'products.metric_id')
            ->paginate();

        return $this->response->paginator($paginator, new ProductsTransformer());
    }

    public function search($branch_id, $department_id)
    {
        if (empty($branch_id)) {
            return response()->json(["message" => "branch_id not set"]);
        }
        if (empty($department_id)) {
            return response()->json(["message" => "department_id not set"]);
        }
        $str = request()->get("search");
        if (empty($str)&&$str!=0||is_null($str)) {
            return response()->json(['data'=>[]]);
        }
        $data = $this->model->select(
            [
                'products.sku',
                'products.name as product_name',
                'products.id as product_id',
                'products.description',
                'products.department_id',
                'products.quantity',
                'products.branch_id as branch_id',
                'products.image',
                'branches.name as branch_name',
                'branches.address',
                'departments.name as department_name',
                'departments.id as department_id',
                "metrics.type",
            ])
            ->where('products.branch_id', '=', $branch_id)
            ->where('products.department_id', '=', $department_id)
            ->leftJoin('branches', 'products.branch_id', '=', 'branches.id')
            ->leftJoin('departments', 'products.department_id', '=', 'departments.id')
            ->leftJoin('metrics', 'products.metric_id', "=", 'metrics.id')
            ->where(function($q) use ($str){
                $q->where('products.sku', 'like', "%".$str."%")
                    ->orWhere('products.name', 'like', "%".$str."%");
            })
            ->limit(50)
            ->get();
        return $this->collection($data, new ProductsTransformer);
    }

    public function createProduct(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'sku'           => 'required|string|max:100',
            'branch_id'     => 'required|integer',
            'department_id' => 'required|integer',
            'description'   => 'nullable|string',
        ]);

        $product = $this->model->create([
            'name'          => $request->input('name'),
            'sku'           => $request->input('sku'),
            'branch_id'     => $request->input('branch_id'),
            'department_id' => $request->input('department_id'),
            'description'   => $request->input('description', ''),
        ]);

        $product->product_id   = $product->id;
        $product->product_name = $product->name;

        return $this->item($product, new ProductsTransformer);
    }

    public function updateProduct(Request $request, $product_id)
    {
        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'sku'         => 'sometimes|string|max:100',
            'description' => 'nullable|string',
        ]);

        $product = $this->model->findOrFail($product_id);
        $product->update($request->only(['name', 'sku', 'description']));

        $product->product_id   = $product->id;
        $product->product_name = $product->name;

        return $this->item($product, new ProductsTransformer);
    }

    public function manage(Request $request)
    {
        $str = $request->get('search', '');

        if (empty($str)) {
            return $this->collection(collect([]), new ProductsTransformer);
        }

        // Get one representative product_id per unique SKU
        $uniqueIds = $this->model->selectRaw('MIN(id) as id')
            ->where(function ($q) use ($str) {
                $q->where('sku', 'like', "%{$str}%")
                  ->orWhere('name', 'like', "%{$str}%");
            })
            ->groupBy('sku')
            ->limit(50)
            ->pluck('id');

        $products = $this->model->select([
            'products.id as product_id',
            'products.sku',
            'products.name as product_name',
            'products.description',
            'products.image',
            'products.quantity',
            'products.branch_id',
            'products.department_id',
            'branches.name as branch_name',
            'branches.address',
            'departments.name as department_name',
        ])
        ->leftJoin('branches', 'branches.id', '=', 'products.branch_id')
        ->leftJoin('departments', 'departments.id', '=', 'products.department_id')
        ->whereIn('products.id', $uniqueIds)
        ->orderBy('products.name')
        ->get();

        return $this->collection($products, new ProductsTransformer);
    }

    public function cutTypes($product_id)
    {
        $product = $this->model->with('cutTypes')->findOrFail($product_id);
        return response()->json($product->cutTypes);
    }

    public function syncCutTypes(Request $request, $product_id)
    {
        $request->validate([
            'cut_type_ids' => 'array',
            'cut_type_ids.*' => 'integer',
        ]);

        $product = $this->model->findOrFail($product_id);
        $cutTypeIds = $request->input('cut_type_ids', []);
        $product->cutTypes()->sync($cutTypeIds);

        return response()->json($product->cutTypes);
    }

    public function uploadImage(Request $request, $product_id)
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $product = $this->model->findOrFail($product_id);

        if ($product->image) {
            \Storage::disk('public')->delete($product->image);
        }

        $path = $request->file('image')->store('products', 'public');

        // Update image for all products with same SKU across all branches
        $this->model->where('sku', $product->sku)->update(['image' => $path]);

        $url = rtrim(env('APP_URL'), '/') . '/storage/' . $path;

        return response()->json(['product_image' => $url]);
    }

    public function deleteImage($product_id)
    {
        $product = $this->model->findOrFail($product_id);

        if ($product->image) {
            \Storage::disk('public')->delete($product->image);
            // Clear image for all products with same SKU across all branches
            $this->model->where('sku', $product->sku)->update(['image' => null]);
        }

        return response()->json(['success' => true]);
    }
}
