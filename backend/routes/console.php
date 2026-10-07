<?php

use Illuminate\Support\Facades\Schedule;

// Remove expired admin API tokens daily.
Schedule::command('sanctum:prune-expired --hours=24')->daily();
