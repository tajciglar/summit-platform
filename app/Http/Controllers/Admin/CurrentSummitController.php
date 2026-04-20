<?php

namespace App\Http\Controllers\Admin;

use App\Filament\Resources\Summits\SummitResource;
use App\Http\Controllers\Controller;
use App\Models\Summit;
use App\Support\CurrentSummit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CurrentSummitController extends Controller
{
    /**
     * Pick (or clear) the "current summit" filter for the active domain.
     * Linked from the nav sidebar's summit items.
     * `all` is a sentinel that clears the filter.
     */
    public function set(Request $request, string $summit): RedirectResponse
    {
        if ($summit === 'all') {
            CurrentSummit::clear();

            return redirect($request->header('Referer') ?: url('/admin'));
        }

        if ($s = Summit::find($summit)) {
            CurrentSummit::set($s);

            return redirect(SummitResource::getUrl('view', ['record' => $s]));
        }

        return redirect($request->header('Referer') ?: url('/admin'));
    }
}
