<?php

namespace App\Entities;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Branches.
 */
class Branches extends Model
{
    protected $fillable = ['name', 'address', 'printer_ip'];
}