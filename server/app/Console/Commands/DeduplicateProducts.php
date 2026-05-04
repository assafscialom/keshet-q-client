<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeduplicateProducts extends Command
{
    protected $signature = 'products:deduplicate {--dry-run : Show duplicates without deleting}';
    protected $description = 'Remove duplicate products (same sku + branch_id + department_id), keeping the oldest record';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        $duplicates = DB::select("
            SELECT sku, branch_id, department_id, COUNT(*) as total, MIN(id) as keep_id
            FROM products
            WHERE deleted_at IS NULL
            GROUP BY sku, branch_id, department_id
            HAVING COUNT(*) > 1
        ");

        if (empty($duplicates)) {
            $this->info('No duplicates found.');
            return 0;
        }

        $this->info(count($duplicates) . ' duplicate group(s) found:');
        $this->table(['SKU', 'Branch', 'Department', 'Count', 'Keep ID'], array_map(fn($r) => [
            $r->sku, $r->branch_id, $r->department_id, $r->total, $r->keep_id
        ], $duplicates));

        if ($dryRun) {
            $this->warn('Dry run — nothing deleted.');
            return 0;
        }

        if (!$this->confirm('Delete all duplicates? (oldest record per group is kept)')) {
            return 0;
        }

        $deleted = 0;
        foreach ($duplicates as $group) {
            $count = DB::table('products')
                ->where('sku', $group->sku)
                ->where('branch_id', $group->branch_id)
                ->where('department_id', $group->department_id)
                ->whereNull('deleted_at')
                ->where('id', '!=', $group->keep_id)
                ->delete();
            $deleted += $count;
        }

        $this->info("Done. {$deleted} duplicate record(s) deleted.");
        return 0;
    }
}
