<?php

namespace App\Helpers;

use App\Entities\ConfigurationPrinter;
use App\Transformers\ForPrint\ClientTransformer;

class PrintHelper
{
    public static function Client($content)
    {
        $printer_id = ConfigurationPrinter::where('department_id', $content->department_id)->pluck('client_printer')->first();
       return self::print((new ClientTransformer())->transform($content), $printer_id);
    }

    public static function Sorter($content)
    {
        $printer_id = ConfigurationPrinter::where('department_id', $content->department_id)->pluck('sorter_printer')->first();
        return self::print((new ClientTransformer())->transform($content), $printer_id);
    }

    private static function print($content, $printer_id)
    {
       $response =  \Bnb\GoogleCloudPrint\Facades\GoogleCloudPrint::asHtml()
            ->content($content)
            ->printer($printer_id)
            ->send();
       if(isset($response->data->status)){
           if($response->data->status =! "QUEUED"){
               throw new \Exception('printer error');
           }
       }else{
           throw new \Exception('printer error');
       }
    }
}