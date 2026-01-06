<?php

use Illuminate\Database\Seeder;

class BranchesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for($i=1;$i<20;$i++) {
            \App\Entities\Branches::create([
                "name" => $i." Branche",
                "address" => Str::random(5),
            ]);
        }
    }
}
