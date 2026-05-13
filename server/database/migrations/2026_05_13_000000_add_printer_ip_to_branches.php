<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPrinterIpToBranches extends Migration
{
    public function up()
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->string('printer_ip')->nullable()->after('address');
        });
    }

    public function down()
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn('printer_ip');
        });
    }
}
