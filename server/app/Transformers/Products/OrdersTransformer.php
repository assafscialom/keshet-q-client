<?php

namespace App\Transformers\Products;

use App\Entities\Metrics;
use App\Entities\Orders;
use App\Entities\OrdersToProducts;
use App\Entities\Products;
use League\Fractal\TransformerAbstract;

/**
 * Class ProductsTransformer.
 */
class OrdersTransformer extends TransformerAbstract
{
    public function transform(Orders $model)
    {
        $products = OrdersToProducts::select(["orders_to_products.quantity_in_order","metrics.type","products.*",'orders_to_products.comment'])
            ->leftJoin('products', 'orders_to_products.product_id', '=', 'products.id')
            ->leftJoin('metrics', 'metrics.id', '=', 'products.metric_id')
            ->where('order_id',$model->id)
            ->get()->toArray();
        return [
            'id' => $model->id,
            'customer_name'=>$model->customer_name,
            'order_number' => $model->order_number,
            'department_id' => $model->department_id,
            'status' => $model->status->name,
            "products"=>$products
        ];
    }
}
