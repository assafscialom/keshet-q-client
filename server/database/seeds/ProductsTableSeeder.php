<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for($i=0;$i<5000;++$i){
            \App\Entities\Products::create([
                "sku"=>Str::random(),
                "name"=>Str::random(),
                "description"=>Str::random(50),
//                "quantity"=>rand(1,100),
                "department_id"=>rand(1,100),
                "branch_id"=>rand(1,19),
                "metric_id"=>rand(1,2),
            ]);
        }
    }
}
