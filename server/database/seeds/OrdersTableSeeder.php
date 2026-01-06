<?php

use Illuminate\Database\Seeder;

class OrdersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for($i=0;$i<100;++$i){
            \App\Entities\Orders::create([
                "order_number"=>rand(1,99999),
                "customer_name"=>rand(1,200),
                "order_status_id"=>rand(1,3),
                "department_id"=>rand(1,10),
            ]);
        }
    }
}
