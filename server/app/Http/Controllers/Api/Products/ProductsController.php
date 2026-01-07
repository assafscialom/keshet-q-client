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
}
