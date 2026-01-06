<?php

namespace App\Console\Commands;

use App\Entities\Orders;
use Illuminate\Console\Command;

class OrderArchive extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'order:archive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Archive orders that already done';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $date = new \DateTime();
        $date->modify('-15 minutes');
        $formatted_date = $date->format('Y-m-d H:i:s');
        Orders::where('order_status_id',2)->where('updated_at','<=',$formatted_date)->update(['order_status_id'=>3]);
    }
}
