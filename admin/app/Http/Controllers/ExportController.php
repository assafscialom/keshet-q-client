<?php

namespace App\Http\Controllers;

use App\Entities\Branches;
use App\Entities\Metrics;
use App\Entities\Products;
use Illuminate\Http\Request;
use \PhpOffice\PhpSpreadsheet\IOFactory;

class ExportController extends Controller
{
    public function form($branch_id = null)
    {

        $branches = Branches::with('departments')->get();
        $selected_branch = $branches->where('id', $branch_id);
        return view('admin.export', ['branches' => $branches, "selected_branch" => $selected_branch]);
    }

    public function submit(Request $request)
    {
        $file = request()->file('file');
        $department_id = request("department_id");
        $branch_id = request("branch_id");
        try{
            if($file){
                $spreadsheet = IOFactory::load($file->getPathName());
            }else{
                return response()->json(['success'=>false,"message"=>"file not chosen"]);
            }
        }
        catch (\Exception $exception){
            return response()->json(['success'=>false,"message"=>"check file","error"=>$exception]);
        }
        $worksheet = $spreadsheet->getActiveSheet();
        $title_row = TRUE;
//        \DB::beginTransaction();
        $unit = "גר";
        $processed = 0;
        foreach ($worksheet->getRowIterator() AS $row) {
            $cellIterator = $row->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
            $cells = [];
            foreach ($cellIterator as $cell) {
                $cells[] = $cell->getValue();
            }
            if ($title_row) {
                $title_row = false;
                continue;
            }
//                if ($cells[0] != "Product code" || $cells[0] != "מס פריט מרכזי"||
//                    $cells[1] != "Name" ||$cells[1] != "שם מלא"||
//                    $cells[2] != "Unit(Metric)") {
//                    return response()->json(['success'=>false,'message'=>"bad file format"]);
//                }
//                $title_row = FALSE;
//            } else {
                if(!is_null($cells[0])&&!is_null($cells[1])){

                    if(isset($cells[2])){
                        $unitid = Metrics::firstOrCreate(['type'=>$cells[2]])->id;
                    }else{
                        $unitid = Metrics::where('type',$unit)->first()->id;
                    }
//                    sleep(1);
                    \DB::table('products')->insert(["branch_id"=>$branch_id,"department_id"=>$department_id,"sku"=>$cells[0],"name" => $cells[1], "metric_id" => $unitid]);
//                    Products::create(["branch_id"=>$branch_id,"department_id"=>$department_id,"sku"=>$cells[0],"name" => $cells[1], "metric_id" => $unitid]);
                    \DB::table('importLog')->insert([
                        "branch_id"=>$branch_id,
                        "department_id"=>$department_id,
                        "inprogress"=>++$processed,
                        "fullcount"=>$worksheet->getHighestRow(),
                        "hashsolt"=>request("hash"),
//                        "created_at"=>now()
                    ]);
//                    echo("{full_count:".$worksheet->getHighestRow().",processed:".++$processed."}");
//                    flush();
//                    Products::loadFromFile($branch_id,$department_id,$prod);
                }else{
//                    DB::rollBack();
                    return response()->json(['success'=>false,'message'=>"product not found"]);
                }
        }

//        \DB::commit();
        \DB::table('importLog')->where('hashsolt',request("hash"))->delete();
        return response()->json(['success'=>true,'message'=>"All done"]);
        //  end
    }
}
