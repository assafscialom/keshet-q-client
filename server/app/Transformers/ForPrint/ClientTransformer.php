<?php

namespace App\Transformers\ForPrint;

use App\Entities\Orders;
use App\Entities\OrdersToProducts;
use League\Fractal\TransformerAbstract;

/**
 * Class DepartmentsTransformer.
 */
class ClientTransformer extends TransformerAbstract
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
        foreach ($products as $product) {
            $prods .= self::format('sku', $product['sku']);
            $prods .= self::format('name', $product['name']);
            $prods .= self::format('type', $product['type']);
            $prods .= self::format('quantity', $product['quantity_in_order']);
            $prods .= self::format('description', $product['description'],true);
        }
        return
            "<!doctype html><html lang='en-US'><head><meta charset='utf-8'></head><body>".
            "<h1>Order # $model->id</h1>" .
            "<h2>products</h2>".
            "$prods </body></html>";
    }

    static function format($name, $value,$underscore = false)
    {
        $style = "";
        if($underscore){
            $style = "style='border-bottom: 1px solid #000000;'";
        }
        return "<p ".$style."><span style='text-align: left'>$name </span> : <span style='text-align: right'>$value</span></p>";
    }
}
