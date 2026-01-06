<?php

namespace App\Http\Controllers\Api\Departments;

use App\Entities\Departments;
use App\Transformers\Departments\SorterTransformer;
use Dingo\Api\Routing\Helpers;
use App\Http\Controllers\Controller;

class DepartmentsController extends Controller
{
    use Helpers;

    protected $model;

    public function __construct(Departments $model)
    {
        $this->model = $model;
    }

    public function show($branch_id)
    {
        $paginator = $this->model->select(['*', 'departments.name as title', 'departments.id as department_id'])
            ->where('branch_id', $branch_id)->leftJoin('branches', 'branches.id', '=', 'departments.branch_id')->paginate();

        return $this->response->paginator($paginator, new SorterTransformer());
    }

}
