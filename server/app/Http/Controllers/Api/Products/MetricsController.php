<?php

namespace App\Http\Controllers\Api\Products;

use App\Entities\Metrics;
use App\Transformers\Products\MetricsTransformer;
use Dingo\Api\Routing\Helpers;
use App\Http\Controllers\Controller;


class MetricsController extends Controller
{
    use Helpers;

    protected $model;

    public function __construct(Metrics $model)
    {
        $this->model = $model;
    }

    public function index()
    {
        $paginator = $this->model->paginate();

        return $this->response->paginator($paginator, new MetricsTransformer());
    }
}
