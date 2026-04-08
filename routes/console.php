<?php

use Illuminate\Support\Facades\Schedule;

// Auto-update summit phases every 5 minutes based on phase schedules
Schedule::command('summits:update-phases')->everyFiveMinutes();
