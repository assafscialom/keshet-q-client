<?php

namespace App\Http\Controllers\Api\Orders;

use App\Entities\Orders;
use App\Entities\OrdersStatuses;
use App\Entities\OrdersToProducts;
use App\Events\OrderEvent;
use App\Http\Requests\CreateOrder;
use App\Transformers\Products\OrdersStatusesTransformer;
use App\Transformers\Products\OrdersTransformer;
use Carbon\Carbon;
use Dingo\Api\Routing\Helpers;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;


class OrdersController extends Controller
{
    use Helpers;

    protected $model;

    public function __construct(Orders $model)
    {
        $this->model = $model;
    }

    public function index($department_id)
    {
        $paginator = $this->model
            ->select(["orders.*"])
            ->leftJoin('orders_to_products', 'orders_to_products.order_id', '=', 'orders.id')
            ->where('orders.department_id', $department_id)->paginate();
        return $this->response->paginator($paginator, new OrdersTransformer());
    }

    public function showStatusOrders($department_id)
    {
        $paginator = $this->model->where('department_id', $department_id)
            ->paginate();
        return $this->response->paginator($paginator, new OrdersStatusesTransformer());
    }

    public function statuses()
    {
        return response()->json(OrdersStatuses::get());
    }

    public function store(CreateOrder $request)
    {

        $order_last = Orders::where('department_id',$request->department_id)->whereDate('created_at', Carbon::today())->latest('created_at')->first();
        isset($order_last['order_number']) ? $order_number = $order_last['order_number'] + 1: $order_number = 1;
        $order = [
            'order_number'=>$order_number,
            'customer_name'=>$request->customer_name,
            'order_status_id' => 1,
            'department_id' => $request->department_id
        ];

        $order = $this->model->create($order);
        foreach ($request->products as $product) {
            $comment = data_get($product, 'comment');
            $cutTypeId = data_get($product, 'cut_type_id');
            if ($cutTypeId === '') {
                $cutTypeId = null;
            }
            DB::table('orders_to_products')->insert([
                "order_id" => $order->id,
                'product_id' => data_get($product, 'product_id'),
                "comment" => $comment,
                "quantity_in_order" => data_get($product, 'quantity'),
                "cut_type_id" => $cutTypeId ? (int)$cutTypeId : null,
                "created_at" => now(),
                "updated_at" => now(),
            ]);
        }

//        try {
//            if(request('debug')){
//                throw new \Exception('some error');
//            }
//            $temp_order = \App\Entities\Orders::withProducts($order->id);
//            \App\Helpers\PrintHelper::Client($temp_order);
//        } catch (\Exception $ex) {
//            return response()->json(['success' => false, "message" => "error with printer", "order_id" => $order->id]);
//        }
//        event(new OrderEvent($order));

        return $this->response->item($order, new OrdersTransformer());
    }

    public function update(Request $request, $id)
    {
        $order = $this->model->where('id', $id)->firstOrFail();

        $order->order_status_id = $request->status_id;

        $order->update();

        return $this->response->item($order->fresh(), new OrdersTransformer());
    }

    public function setStatus(Request $request)
    {
        /**
         * Валидация. Добавляю сообщение в базу,
         * получаю модель Comment $comment с сообщением
         */

//        event(new OrderEvent($comment)); // Это для примера. Отправка сообщения всем активным пользователям канала
//        broadcast(new ChatMessage($comment))->toOthers(); // Отправляю сообщение всем, кроме текущего пользователя
    }

    public function withProducts($order_id)
    {
        $order = Orders::withProducts($order_id);
        return response()->json($order);
    }


    public function progress($department_id = null)
    {
        $orders = Orders::byStatus($department_id, 1);
        return response()->json($orders);
    }

    public function done($department_id = null)
    {
        $orders = Orders::byStatus($department_id, 2);
        return response()->json($orders);
    }

    public function all($department_id = null)
    {
        $department_id = explode(',',$department_id);
        $orders = [];
        foreach($department_id as $depart_id){
            $orders[$depart_id]['progress'] = Orders::byStatus($depart_id, 1);
            $orders[$depart_id]['done'] = Orders::byStatus($depart_id, 2);
        }
        return response()->json($orders);
    }

    public function archive($department_id = null)
    {
        return response()->json(Orders::Archive($department_id));
    }

    public function searchByOrderID($department_id = null)
    {
        $search = \request()->get("search");
        if(empty($search)||is_null($search)){
            return response()->json(['data'=>[]]);
        }
        return response()->json(Orders::searchByOrderID($department_id, $search));
    }

}
