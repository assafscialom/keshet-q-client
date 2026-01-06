<?php

namespace App\Transformers\Products;

use App\Entities\Products;
use League\Fractal\TransformerAbstract;

/**
 * Class ProductsTransformer.
 */
class ProductOrderTransformer extends TransformerAbstract
{

    /**
     * @param Products $model
     * @return array
     */
    public function transform(Products $model, $qty)
    {
        return [
            'product_id' => $model->product_id,
            'product_sku' => $model->sku,
            'product_name' => $model->product_name,
            'product_description' => $model->description,
            'product_quantity' => $qty,
            'department_name' => $model->department_name,
            'metric_type' => $model->type
        ];
    }
}
