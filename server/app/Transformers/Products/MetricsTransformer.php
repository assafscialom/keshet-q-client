<?php

namespace App\Transformers\Products;

use App\Entities\Metrics;
use League\Fractal\TransformerAbstract;

/**
 * Class ProductsTransformer.
 */
class MetricsTransformer extends TransformerAbstract
{
    public function transform(Metrics $model)
    {
        return [
            'id' => $model->id,
            'type' => $model->type
        ];
    }
}
