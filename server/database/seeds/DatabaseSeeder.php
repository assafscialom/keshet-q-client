<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
//        $this->call(RoleTableSeeder::class);
//        $this->call(UsersTableSeeder::class);

        $this->call(BranchesTableSeeder::class);
        $this->call(DepartmentsTableSeeder::class);
        $this->call(MetricsTableSeeder::class);
        $this->call(ProductsTableSeeder::class);
        $this->call(StatusesTableSeeder::class);
        $this->call(OrdersTableSeeder::class);
        $this->call(OrdersToProductsTableSeeder::class);
    }
}
