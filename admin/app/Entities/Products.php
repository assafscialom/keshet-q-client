<?php

namespace App\Entities;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Products.
 */
class Products extends Model
{

    use SoftDeletes;
    protected $fillable = [
        "sku",
        "name",
        "description",
        "quantity",
        "department_id",
        "branch_id",
        "metric_id"
    ];


    /**
     * @param $branch_id
     * @param $department_id
     * @param $product
     */
    public static function loadFromFile($branch_id,$department_id,$product){

        $metric = Metrics::firstOrCreate(['type'=>$product['unit']]);
        $prod = array_merge(

            ["branch_id"=>$branch_id,
            "department_id"=>$department_id]
            ,[
            "sku"=>$product['code'],
            "name"=>$product['name'],
            "metric_id"=>$metric->id,
            ]);

        Products::updateOrCreate($prod);
    }
}
