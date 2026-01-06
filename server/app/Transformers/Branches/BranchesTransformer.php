<?php

namespace App\Transformers\Branches;

use App\Entities\Branches;
use League\Fractal\TransformerAbstract;

/**
 * Class BranchesTransformer.
 */
class BranchesTransformer extends TransformerAbstract
{

    /**
     * @param Branches $model
     * @return array
     */
    public function transform(Branches $model)
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'address' => $model->address
        ];
    }
}
