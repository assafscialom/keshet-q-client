<?php

namespace App\Transformers\ForPrint;

use App\Entities\Departments;
use App\Entities\Orders;
use App\Entities\OrdersToProducts;
use League\Fractal\TransformerAbstract;

/**
 * Class DepartmentsTransformer.
 */
class SorterTransformer extends TransformerAbstract
{
    /**
     * @param Departments $model
     * @return array
     */
    public function transform(Orders $model)
    {
        $products = OrdersToProducts::select(["orders_to_products.quantity_in_order", "metrics.type", "products.*", 'orders_to_products.comment'])
            ->leftJoin('products', 'orders_to_products.product_id', '=', 'products.id')
            ->leftJoin('metrics', 'metrics.id', '=', 'products.metric_id')
            ->where('order_id', $model->id)
            ->get()->toArray();
        $prods = "";
        $prods .=ClientTransformer::line();

        foreach ($products as $product) {
            $prods .= ClientTransformer::format('sku',$product['sku']);
            $prods .= ClientTransformer::format('name',$product['name']);
            $prods .= ClientTransformer::format('type',$product['type']);
            $prods .= ClientTransformer::format('quantity',$product['quantity']);
            $prods .= ClientTransformer::format('description',$product['description']);
            $prods .=ClientTransformer::line();
        }

        return
            "\tOrder # $model->id  \n\n" .
            "\tproducts \n \n" . $prods;
    }
}
