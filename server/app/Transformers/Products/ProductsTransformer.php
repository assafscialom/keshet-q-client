<?php

namespace App\Transformers\Products;

use App\Entities\Products;
use League\Fractal\TransformerAbstract;

/**
 * Class ProductsTransformer.
 */
class ProductsTransformer extends TransformerAbstract
{

    /**
     * @param Products $model
     * @return array
     */
    public function transform(Products $model)
    {
        return [
            'product_id' => $model->product_id,
            'product_sku' => $model->sku,
            'product_name' => $model->product_name,
            'product_description' => $model->description,
            'product_quantity' => $model->quantity,
            'branch_id' => $model->branch_id,
            'branch_name' => $model->branch_name,
            'branch_address' => $model->address,
            'department_id' => $model->department_id,
            'department_name' => $model->department_name,
            'metric_type' => $model->type
        ];
    }
}
