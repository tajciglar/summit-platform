<?php

use Illuminate\Support\Facades\Schedule;

// Auto-update summit current_phase based on inline phase dates.
Schedule::command('summits:update-phases')->everyFiveMinutes();
