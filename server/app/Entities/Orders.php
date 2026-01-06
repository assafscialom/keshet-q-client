<?php

namespace App\Entities;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Products.
 */
class Orders extends Model
{
    protected $fillable = ['order_number','order_status_id', 'department_id', 'comment','customer_name'];

    public function status()
    {
        return $this->hasOne(OrdersStatuses::class, 'id', 'order_status_id');
    }

    public function products(){
        return $this->hasMany(OrdersToProducts::class,'order_id','id')->with(['product_name']);
    }

    public static function byStatus($department_id, $status_id)
    {
        $data = Orders::where('order_status_id',$status_id);

        if(!empty($department_id)){
            $data = $data->where('department_id',$department_id);
        }
        $data = $data->whereDate('created_at', Carbon::today())->with(['status'])->orderBy('created_at','desc')->get();
        return $data;
    }

    public static function Archive($department_id)
    {
        if(!empty($department_id)){
            return Orders::where('department_id',$department_id)->whereDate('created_at', Carbon::today())->orderBy('created_at','desc')->with(['status'])->paginate(33);
        }else{
            return Orders::whereDate('created_at', Carbon::today())->orderBy('created_at','desc')->with(['status'])->paginate(33);
        }
    }

    public static function searchByOrderID($department_id,$search_order_id)
    {
//        $data = Orders::whereIn('order_status_id',[3,4]);
        $data = Orders::where('department_id', $department_id)->whereDate('created_at', Carbon::today())->where('order_number',"like" , "%".$search_order_id."%");
        $data = $data->orderBy('created_at','desc')->with(['status'])->paginate(20);
        return $data;
    }

    public static function  withProducts($order_id){
        return Orders::where('id',$order_id)->with(['status','products'])->first();
    }
}
