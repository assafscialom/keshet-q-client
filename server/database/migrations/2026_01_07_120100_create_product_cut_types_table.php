<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProductCutTypesTable extends Migration
{
    public function up()
    {
        Schema::create('product_cut_types', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('product_id');
            $table->bigInteger('cut_type_id');
            $table->timestamps();

            $table->unique(['product_id', 'cut_type_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_cut_types');
    }
}
