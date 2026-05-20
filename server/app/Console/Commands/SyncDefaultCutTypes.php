<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Entities\CutTypes;
use App\Entities\Products;
use Illuminate\Support\Facades\DB;

class SyncDefaultCutTypes extends Command
{
    protected $signature = 'cut-types:sync-defaults {--dry-run : Show what would be done without making changes}';
    protected $description = 'Add default cut types (גוש, עבה, דק) to all products';

    private $defaults = ['גוש', 'עבה', 'דק'];

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        // 1. Ensure cut types exist
        $cutTypeIds = [];
        foreach ($this->defaults as $name) {
            $ct = CutTypes::withTrashed()->firstOrCreate(['name' => $name]);
            if ($ct->trashed()) {
                if (!$dryRun) $ct->restore();
                $this->line("  restored: {$name}");
            }
            $cutTypeIds[] = $ct->id;
            $this->line("  cut type '{$name}' → id {$ct->id}");
        }

        // 2. Get all products
        $products = Products::all();
        $this->info("Products: {$products->count()} | Cut types: " . implode(', ', $this->defaults));

        // 3. Attach missing cut types
        $added = 0;
        foreach ($products as $product) {
            foreach ($cutTypeIds as $cutTypeId) {
                $exists = DB::table('product_cut_types')
                    ->where('product_id', $product->id)
                    ->where('cut_type_id', $cutTypeId)
                    ->exists();

                if (!$exists) {
                    if (!$dryRun) {
                        DB::table('product_cut_types')->insert([
                            'product_id'  => $product->id,
                            'cut_type_id' => $cutTypeId,
                        ]);
                    }
                    $added++;
                }
            }
        }

        if ($dryRun) {
            $this->warn("Dry run — {$added} entries would be added.");
        } else {
            $this->info("Done. {$added} entries added.");
        }

        return 0;
    }
}
