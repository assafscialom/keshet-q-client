<?php

use Illuminate\Database\Seeder;

class MetricsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\Entities\Metrics::create([
            "type" => "kg"
        ]);
        \App\Entities\Metrics::create([
            "type" => "unit"
        ]);
    }
}
