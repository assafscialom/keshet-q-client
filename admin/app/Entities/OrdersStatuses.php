<?php

namespace App\Entities;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrdersStatuses extends Model
{
    use SoftDeletes;

    protected $table = "order_statuses";
    protected $hidden = ['created_at','updated_at','deleted_at'];

    protected $fillable = ['name'];
}
