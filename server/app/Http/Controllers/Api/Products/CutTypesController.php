<?php

namespace App\Http\Controllers\Api\Products;

use App\Entities\CutTypes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CutTypesController extends Controller
{
    public function index()
    {
        return response()->json(CutTypes::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255',
        ]);

        $cutType = CutTypes::create([
            'name' => $request->name,
        ]);

        return response()->json($cutType, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|max:255',
        ]);

        $cutType = CutTypes::findOrFail($id);
        $cutType->update([
            'name' => $request->name,
        ]);

        return response()->json($cutType);
    }

    public function destroy($id)
    {
        $cutType = CutTypes::findOrFail($id);
        $cutType->delete();

        return response()->json(['success' => true]);
    }
}
