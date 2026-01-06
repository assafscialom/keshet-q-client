<?php

use Illuminate\Database\Seeder;

class StatusesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\Entities\OrdersStatuses::create(
            ["name" => "in progress"]
        );
        \App\Entities\OrdersStatuses::create(
            ["name" => "done"]
        );
        \App\Entities\OrdersStatuses::create(
            ["name" => "archive"]
        );
        \App\Entities\OrdersStatuses::create(
        ["name" => "cancel"]
    );
    }
}
