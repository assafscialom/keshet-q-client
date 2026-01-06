<?php

use Illuminate\Database\Seeder;

class OrdersToProductsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for($i=0;$i<100;++$i){
            \App\Entities\OrdersToProducts::create([
                "product_id"=>rand(1,100),
                "order_id"=>rand(1,20),
                "quantity_in_order"=>rand(1,10),
                "comment"=>\Illuminate\Support\Str::random(200),
            ]);
        }
    }
}
