<?php

namespace App\Entities;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Branches.
 */
class Branches extends Model
{
    public function departments(){
        return $this->hasMany(Departments::class,'branch_id','id');
    }
}