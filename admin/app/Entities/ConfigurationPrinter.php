<?php

namespace App\Entities;

use Illuminate\Database\Eloquent\Model;

class ConfigurationPrinter extends Model
{
    protected $table = "configuration_print";

    public $timestamps = false;

    protected $fillable = [
        "department_id",
        "client_printer",
        "sorter_printer",
    ];


}
