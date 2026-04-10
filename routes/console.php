<?php

use Illuminate\Support\Facades\Schedule;

// Auto-update summit phases every 5 minutes based on phase schedules
Schedule::command('summits:update-phases')->everyFiveMinutes();

// Generate daily reports for active summits at 2 AM
Schedule::command('reports:generate-daily')->dailyAt('02:00');

// Sync unsynced optins to ActiveCampaign every 5 minutes
Schedule::command('optins:sync-activecampaign')->everyFiveMinutes();
