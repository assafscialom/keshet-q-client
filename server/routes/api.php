<?php

$api = app('Dingo\Api\Routing\Router');

$api->version('v1', function($api){
    $api->group(['middleware' => ['throttle:660,1', 'bindings'], 'namespace' => 'App\Http\Controllers'], function($api) {

        $api->post('/realtime/auth', function(){
            return true;
        })->middleware('auth.realtime');

        $api->get('ping', 'Api\PingController@index');

        $api->get('assets/{uuid}/render', 'Api\Assets\RenderFileController@show');

        $api->post('login', 'Auth\LoginController@login');
        $api->post('register', 'Auth\RegisterController@register');

        $api->group(['prefix' => 'branches'], function ($api) {
            $api->get('/', 'Api\Branches\BranchesController@index');
        });

        $api->group(['prefix' => 'metrics'], function ($api) {
            $api->get('/', 'Api\Products\MetricsController@index');
        });

        $api->group(['prefix' => 'orders' , 'namespace' => 'Api\Orders'], function ($api) {

            $api->group(['prefix' => 'lists'], function ($api) {
                $api->get('progress/{department_id?}', 'OrdersController@progress');
                $api->get('done/{department_id?}', 'OrdersController@done');
                $api->get('all/{department_id?}', 'OrdersController@all');
                $api->get('archive/{department_id?}', 'OrdersController@archive');
            });
            $api->get('search/{department_id}', 'OrdersController@searchByOrderID');

            $api->get('statuses', 'OrdersController@statuses');
            $api->get('/{department_id}', 'OrdersController@index');
            $api->get('/{department_id}/statuses', 'OrdersController@showStatusOrders');
            $api->get('/{order_id}/products', 'OrdersController@withProducts');
            $api->post('/', 'OrdersController@store');
            $api->patch('/{id}', 'OrdersController@update');
            $api->delete('/{id}', 'OrdersController@destroy');
        });

        $api->group(['prefix' => 'departments'], function ($api) {
            $api->get('/{branch_id}', 'Api\Departments\DepartmentsController@show');
        });

        $api->group(['prefix' => 'products'], function ($api) {
            $api->get('/{branch_id}/{department_id}', 'Api\Products\ProductsController@show');
            $api->get('search/{branch_id}/{department_id}', 'Api\Products\ProductsController@search');
        });



        $api->group(['middleware' => ['auth:api'], ], function ($api) {

            $api->group(['prefix' => 'users'], function ($api) {
                $api->get('/', 'Api\Users\UsersController@index');
                $api->post('/', 'Api\Users\UsersController@store');
                $api->get('/{uuid}', 'Api\Users\UsersController@show');
                $api->put('/{uuid}', 'Api\Users\UsersController@update');
                $api->patch('/{uuid}', 'Api\Users\UsersController@update');
                $api->delete('/{uuid}', 'Api\Users\UsersController@destroy');
            });

            $api->group(['prefix' => 'roles'], function ($api) {
                $api->get('/', 'Api\Users\RolesController@index');
                $api->post('/', 'Api\Users\RolesController@store');
                $api->get('/{uuid}', 'Api\Users\RolesController@show');
                $api->put('/{uuid}', 'Api\Users\RolesController@update');
                $api->patch('/{uuid}', 'Api\Users\RolesController@update');
                $api->delete('/{uuid}', 'Api\Users\RolesController@destroy');
            });

            $api->get('permissions', 'Api\Users\PermissionsController@index');

            $api->group(['prefix' => 'me'], function($api) {
                $api->get('/', 'Api\Users\ProfileController@index');
                $api->put('/', 'Api\Users\ProfileController@update');
                $api->patch('/', 'Api\Users\ProfileController@update');
                $api->put('/password', 'Api\Users\ProfileController@updatePassword');
            });

            $api->group(['prefix' => 'assets'], function($api) {
                $api->post('/', 'Api\Assets\UploadFileController@store');
            });

        });

    });

});



