<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();
});
//export
Route::group(['prefix' => 'admin','as' => 'voyager.', 'middleware' => 'admin.user'], function()
{
    Route::get('export','ExportController@form')->name('export.form');
    Route::get('log/{hash?}',function(){
        return \DB::table('importLog')->where('hashsolt',\request('hash'))->orderBy('id','desc')->limit(1)->get();
    })->name('export.log');
    Route::post('export','ExportController@submit')->name('export.submit');
});