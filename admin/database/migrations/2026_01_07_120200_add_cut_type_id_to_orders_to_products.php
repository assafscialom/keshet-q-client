<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCutTypeIdToOrdersToProducts extends Migration
{
    public function up()
    {
        Schema::table('orders_to_products', function (Blueprint $table) {
            $table->bigInteger('cut_type_id')->nullable()->after('comment');
            $table->index('cut_type_id');
        });
    }

    public function down()
    {
        Schema::table('orders_to_products', function (Blueprint $table) {
            $table->dropIndex(['cut_type_id']);
            $table->dropColumn('cut_type_id');
        });
    }
}
