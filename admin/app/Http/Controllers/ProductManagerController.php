<?php

namespace App\Http\Controllers;

use App\Entities\Products;
use Illuminate\Http\Request;

class ProductManagerController extends Controller
{
    public function index()
    {
        return view('product-manager.index');
    }

    public function search(Request $request)
    {
        $str = $request->get('search', '');

        if (empty(trim($str))) {
            return response()->json([]);
        }

        $uniqueIds = Products::selectRaw('MIN(id) as id')
            ->where(function ($q) use ($str) {
                $q->where('sku', 'like', "%{$str}%")
                  ->orWhere('name', 'like', "%{$str}%");
            })
            ->groupBy('sku')
            ->limit(50)
            ->pluck('id');

        $products = Products::whereIn('id', $uniqueIds)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'image']);

        $appUrl = rtrim(config('app.url'), '/');

        return response()->json($products->map(function ($p) use ($appUrl) {
            $image = $p->image;
            if ($image && !str_starts_with($image, 'http')) {
                $image = $appUrl . '/storage/' . ltrim($image, '/');
            }
            return ['id' => $p->id, 'name' => $p->name, 'sku' => $p->sku, 'image' => $image];
        })->values());
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sku'  => 'required|string|max:100',
        ]);

        $product = Products::findOrFail($id);
        $oldSku  = $product->sku;

        Products::where('sku', $oldSku)->update([
            'name' => $request->input('name'),
            'sku'  => $request->input('sku'),
        ]);

        return response()->json(['success' => true]);
    }

    public function uploadImage(Request $request, $id)
    {
        $request->validate(['image' => 'required|image|max:4096']);

        $product = Products::findOrFail($id);

        $path = $request->file('image')->store('products', 'public');
        $url  = rtrim(config('app.url'), '/') . '/storage/' . $path;

        Products::where('sku', $product->sku)->update(['image' => $url]);

        return response()->json(['image' => $url]);
    }

    public function deleteImage($id)
    {
        $product = Products::findOrFail($id);

        if ($product->image) {
            if (!str_starts_with($product->image, 'http')) {
                \Storage::disk('public')->delete($product->image);
            }
            Products::where('sku', $product->sku)->update(['image' => null]);
        }

        return response()->json(['success' => true]);
    }
}
