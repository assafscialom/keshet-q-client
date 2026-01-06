<?php

namespace App\Http\Controllers\Api\Branches;

use App\Entities\Branches;
use App\Transformers\Branches\BranchesTransformer;
use Illuminate\Http\Request;
use Dingo\Api\Routing\Helpers;
use App\Http\Controllers\Controller;

class BranchesController extends Controller
{
    use Helpers;

    protected $model;

    public function __construct(Branches $model)
    {
        $this->model = $model;
    }

    public function index(Request $request)
    {
        $paginator = $this->model->paginate($request->get('limit', config('app.pagination_limit', 50)));

        if ($request->has('limit')) {
            $paginator->appends('limit', $request->get('limit'));
        }

        return $this->response->paginator($paginator, new BranchesTransformer());
    }

}
