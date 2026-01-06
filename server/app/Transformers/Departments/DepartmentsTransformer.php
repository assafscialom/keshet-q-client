<?php

namespace App\Transformers\Departments;

use App\Entities\Departments;
use League\Fractal\TransformerAbstract;

/**
 * Class DepartmentsTransformer.
 */
class DepartmentsTransformer extends TransformerAbstract
{
    /**
     * @param Departments $model
     * @return array
     */
    public function transform(Departments $model)
    {
        return [
            'department_id' => $model->department_id,
            'branch_id' => $model->id,
            'branch_name' => $model->name,
            'branch_address' => $model->address,
            'department_name' => $model->title
        ];
    }
}
