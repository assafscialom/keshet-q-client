<?php

namespace App\Http\Controllers\Api\Print;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PrintController extends Controller
{
    const CUT   = "\x1D\x56\x00";   // GS V 0 - full cut
    const INIT  = "\x1B\x40";       // ESC @ - initialize
    const LF    = "\x0A";
    const BOLD_ON  = "\x1B\x45\x01";
    const BOLD_OFF = "\x1B\x45\x00";
    const ALIGN_CENTER = "\x1B\x61\x01";
    const ALIGN_RIGHT  = "\x1B\x61\x02";
    const ALIGN_LEFT   = "\x1B\x61\x00";
    const SIZE_LARGE   = "\x1D\x21\x11"; // double width + height
    const SIZE_MEDIUM  = "\x1D\x21\x01"; // double height only
    const SIZE_NORMAL  = "\x1D\x21\x00";

    public function print(Request $request, $branch_id)
    {
        $printerIp = '192.168.1.3';
        $printerPort = 9100;

        $data = $request->validate([
            'order_number'   => 'required',
            'customer_name'  => 'required|string',
            'department_name'=> 'nullable|string',
            'items'          => 'required|array',
            'items.*.sku'    => 'nullable',
            'items.*.name'   => 'required|string',
            'items.*.quantity'=> 'required',
            'items.*.metric' => 'nullable|string',
            'items.*.note'   => 'nullable|string',
            'items.*.cut_type'=> 'nullable|string',
        ]);

        $pages = [
            $this->buildPage($data, 'מקור'),
            $this->buildPage($data, 'העתק ללקוח'),
            $this->buildCustomerPage($data),
        ];

        $output = self::INIT;
        foreach ($pages as $page) {
            $output .= $page . self::CUT;
        }

        try {
            $sock = fsockopen($printerIp, $printerPort, $errno, $errstr, 5);
            if (!$sock) {
                return response()->json(['success' => false, 'message' => "Cannot connect to printer: $errstr"], 500);
            }
            fwrite($sock, $output);
            fclose($sock);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function buildPage(array $data, string $label): string
    {
        $date = now()->format('d.m.Y H:i');
        $out = self::INIT;

        // Header: label right, logo left (text only)
        $out .= self::ALIGN_RIGHT . self::BOLD_ON . $label . self::BOLD_OFF . self::LF;
        $out .= self::ALIGN_CENTER . "קשת טעמים" . self::LF;

        // Order number
        $out .= self::SIZE_LARGE . self::ALIGN_CENTER . "No." . $data['order_number'] . self::LF;
        $out .= self::SIZE_NORMAL;

        // Customer
        $out .= str_repeat("-", 32) . self::LF;
        $out .= self::ALIGN_RIGHT . self::BOLD_ON . "שם לקוח " . self::BOLD_OFF . $data['customer_name'] . self::LF;

        // Department
        if (!empty($data['department_name'])) {
            $out .= self::ALIGN_CENTER . $data['department_name'] . self::LF;
        }
        $out .= str_repeat("-", 32) . self::LF;

        // Items
        foreach ($data['items'] as $item) {
            $out .= self::ALIGN_RIGHT;
            $out .= self::BOLD_ON . 'מק"ט ' . self::BOLD_OFF . ($item['sku'] ?? '-') . self::LF;
            $out .= self::BOLD_ON . 'שם    ' . self::BOLD_OFF . $item['name'] . self::LF;
            $out .= self::BOLD_ON . 'כמות  ' . self::BOLD_OFF . $item['quantity'] . ($item['metric'] ?? '') . self::LF;
            if (!empty($item['cut_type'])) {
                $out .= self::BOLD_ON . 'חיתוך ' . self::BOLD_OFF . $item['cut_type'] . self::LF;
            }
            if (!empty($item['note'])) {
                $out .= self::BOLD_ON . 'הערה  ' . self::BOLD_OFF . $item['note'] . self::LF;
            }
            $out .= str_repeat("-", 32) . self::LF;
        }

        // Footer
        $out .= self::ALIGN_LEFT . $date . "  ";
        $out .= self::ALIGN_RIGHT . "תיתכן סטייה קלה בין הכמות המוזמנת לכמות המסופקת" . self::LF;
        $out .= str_repeat(self::LF, 3);

        return $out;
    }

    private function buildCustomerPage(array $data): string
    {
        $date = now()->format('d.m.Y H:i');
        $out = self::INIT;

        $out .= self::ALIGN_CENTER . "קשת טעמים" . self::LF;
        $out .= self::SIZE_LARGE . self::ALIGN_CENTER . $data['order_number'] . self::LF;
        $out .= self::SIZE_NORMAL;

        if (!empty($data['department_name'])) {
            $out .= self::ALIGN_CENTER . $data['department_name'] . self::LF;
        }

        $out .= str_repeat("-", 32) . self::LF;
        $out .= self::ALIGN_RIGHT . self::BOLD_ON . "שם לקוח " . self::BOLD_OFF . $data['customer_name'] . self::LF;
        $out .= str_repeat("-", 32) . self::LF;
        $out .= self::ALIGN_LEFT . $date . self::LF;
        $out .= str_repeat(self::LF, 3);

        return $out;
    }
}
