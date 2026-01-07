<?php

namespace App\Entities;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrdersToProducts extends Model
{
    use SoftDeletes;

    protected $table = "orders_to_products";

    protected $fillable = [
        "product_id",
        "order_id",
        "quantity_in_order",
        "comment",
        "cut_type_id",
    ];

    public function product_name(){
        return $this->hasOne(Products::class,'id','product_id');
    }

    public function cutType()
    {
        return $this->hasOne(CutTypes::class, 'id', 'cut_type_id');
    }
}
