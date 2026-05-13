<?php

namespace App\Http\Controllers\Api\Print;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PrintController extends Controller
{
    // Client calls this → stores job in queue
    public function queue(Request $request, $branch_id)
    {
        $data = $request->validate([
            'order_number'    => 'required',
            'customer_name'   => 'required|string',
            'department_name' => 'nullable|string',
            'items'           => 'required|array',
        ]);

        $job = DB::table('print_jobs')->insertGetId([
            'branch_id'  => $branch_id,
            'payload'    => json_encode($data),
            'status'     => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'job_id' => $job]);
    }

    // Agent polls this → gets pending jobs for its branch
    public function poll($branch_id)
    {
        $jobs = DB::table('print_jobs')
            ->where('branch_id', $branch_id)
            ->where('status', 'pending')
            ->orderBy('id')
            ->limit(5)
            ->get();

        return response()->json($jobs);
    }

    // Agent calls this after printing
    public function done($job_id)
    {
        DB::table('print_jobs')
            ->where('id', $job_id)
            ->update(['status' => 'done', 'updated_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function failed($job_id)
    {
        DB::table('print_jobs')
            ->where('id', $job_id)
            ->update(['status' => 'failed', 'updated_at' => now()]);

        return response()->json(['success' => true]);
    }
}
