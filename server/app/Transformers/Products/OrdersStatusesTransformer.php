<?php

namespace App\Transformers\Products;

use App\Entities\Metrics;
use App\Entities\Orders;
use App\Entities\Products;
use League\Fractal\TransformerAbstract;

/**
 * Class ProductsTransformer.
 */
class OrdersStatusesTransformer extends TransformerAbstract
{
    public function transform(Orders $model)
    {
        return [
            'id' => $model->id,
            'department_id'=>$model->department_id,
            'order_number' => $model->order_number,
            'status' => $model->status->name,
        ];
    }
}
