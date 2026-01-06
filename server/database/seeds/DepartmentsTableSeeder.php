<?php

use Illuminate\Database\Seeder;

class DepartmentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for ($i = 1; $i < 20; $i++) {
            for ($a = 1; $a < 30; $a++) {
                \App\Entities\Departments::create([
                    "name" => $a . " Department",
                    "branch_id" => $i,
                ]);
            }
        }
    }
}
