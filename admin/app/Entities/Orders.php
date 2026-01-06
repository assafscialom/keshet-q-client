<?php

namespace App\Entities;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Products.
 */
class Orders extends Model
{
    protected $fillable = ['order_status_id', 'department_id', 'comment'];

    public function status()
    {
        return $this->hasOne(OrdersStatuses::class, 'id', 'order_status_id');
    }

    public function products(){
        return $this->hasMany(OrdersToProducts::class,'order_id','id')->with(['product_name']);
    }


    public static function byStatus($department_id, $status_id)
    {
        $data = Orders::where('order_status_id',$status_id)->with(['status']);
        if($status_id==2||$status_id==3){
            $data = $data->orWhere('order_status_id',4);
        }
        if(!empty($department_id)){
            $data = $data->where('department_id',$department_id);
        }
        $data = $data->orderBy('created_at','desc')->get();
        return $data;
    }

    public static function  withProducts($order_id){
        return Orders::where('id',$order_id)->with(['status','products'])->first();
    }
}
