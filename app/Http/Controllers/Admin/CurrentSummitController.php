<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Summit;
use App\Support\CurrentSummit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CurrentSummitController extends Controller
{
    /**
     * Pick (or clear) the "current summit" filter for the active domain.
     * Linked from the tenant-picker dropdown's summit items.
     * `all` is a sentinel that clears the filter.
     */
    public function set(Request $request, string $summit): RedirectResponse
    {
        if ($summit === 'all') {
            CurrentSummit::clear();
        } elseif ($s = Summit::find($summit)) {
            CurrentSummit::set($s);
        }

        return redirect(
            $request->header('Referer') ?: url('/admin'),
        );
    }
}
