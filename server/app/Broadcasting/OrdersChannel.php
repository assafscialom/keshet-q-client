<?php

namespace App\Broadcasting;

use App\Entities\User;

class OrdersChannel
{
    /**
     * Create a new channel instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     *
     * @param  \App\Entities\User  $user
     * @return array|bool
     */
    public function join()
    {
        return true;
    }
}
