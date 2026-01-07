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

    public function cutTypes()
    {
        return $this->belongsToMany(CutTypes::class, 'product_cut_types', 'product_id', 'cut_type_id');
    }
}
