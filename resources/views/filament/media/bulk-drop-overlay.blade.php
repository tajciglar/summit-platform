{{--
    Window-level dropzone for the Media Library list page.

    Renders a hidden full-screen overlay and binds drag/drop listeners on
    `window` directly (no Alpine dependency, so timing-independent). On drop
    the dropped files are forwarded to the ListMediaItems Livewire
    component via uploadMultiple(); `updatedBulkDropFiles` then redirects
    to the Create page with rows pre-populated.
--}}
<div
    id="media-bulk-drop-overlay"
    style="display:none;"
    class="fi-media-bulk-drop pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-primary-600/20 backdrop-blur-sm"
>
    <div class="rounded-2xl border-4 border-dashed border-primary-500 bg-white px-12 py-10 text-center shadow-2xl dark:bg-gray-900">
        <div id="media-bulk-drop-msg" class="text-2xl font-semibold text-gray-900 dark:text-white">Drop files to upload</div>
        <div id="media-bulk-drop-sub" class="mt-2 text-sm text-gray-600 dark:text-gray-400">Images and PDFs</div>
        <div id="media-bulk-drop-bar" class="mt-4 h-2 w-72 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800" style="display:none;">
            <div id="media-bulk-drop-bar-fill" class="h-full bg-primary-500 transition-all" style="width:0%"></div>
        </div>
    </div>
</div>

<script>
(function () {
    console.log('[bulk-drop] overlay script loaded');

    const overlay = document.getElementById('media-bulk-drop-overlay');
    const msgEl = document.getElementById('media-bulk-drop-msg');
    const subEl = document.getElementById('media-bulk-drop-sub');
    const barEl = document.getElementById('media-bulk-drop-bar');
    const fillEl = document.getElementById('media-bulk-drop-bar-fill');

    let dragDepth = 0;
    let uploading = false;

    function isFileDrag(e) {
        if (! e.dataTransfer) return false;
        const types = e.dataTransfer.types;
        if (! types) return false;
        return Array.from(types).includes('Files');
    }

    function show() { overlay.style.display = 'flex'; }
    function hide() { overlay.style.display = 'none'; }

    window.addEventListener('dragenter', (e) => {
        if (uploading) return;
        if (! isFileDrag(e)) return;
        dragDepth++;
        show();
    });

    window.addEventListener('dragleave', (e) => {
        if (uploading) return;
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) hide();
    });

    window.addEventListener('dragover', (e) => {
        if (! isFileDrag(e)) return;
        e.preventDefault(); // required to allow drop
    });

    window.addEventListener('drop', (e) => {
        dragDepth = 0;
        if (! isFileDrag(e)) {
            hide();
            return;
        }
        e.preventDefault();

        const files = Array.from(e.dataTransfer.files || []);
        console.log('[bulk-drop] drop fired, files:', files.length, files.map(f => f.name));

        if (files.length === 0) {
            hide();
            return;
        }

        if (! window.Livewire) {
            console.warn('[bulk-drop] Livewire not available');
            hide();
            return;
        }

        const component = window.Livewire.all().find((c) => {
            try {
                const data = c.snapshot?.data ?? {};
                return Object.prototype.hasOwnProperty.call(data, 'bulkDropFiles');
            } catch (_) { return false; }
        });

        if (! component) {
            console.warn('[bulk-drop] ListMediaItems component not found. Components on page:',
                window.Livewire.all().map(c => c.name));
            hide();
            return;
        }

        console.log('[bulk-drop] uploading to component', component.name, component.id);

        const wire = component.$wire ?? component;
        if (typeof wire.uploadMultiple !== 'function') {
            console.error('[bulk-drop] uploadMultiple not available on component', component);
            hide();
            return;
        }

        uploading = true;
        msgEl.textContent = `Uploading ${files.length} ${files.length === 1 ? 'file' : 'files'}…`;
        subEl.textContent = 'Hold tight — redirecting when done';
        barEl.style.display = 'block';
        fillEl.style.width = '0%';

        wire.uploadMultiple(
            'bulkDropFiles',
            files,
            (uploadedFilenames) => {
                console.log('[bulk-drop] upload finished', uploadedFilenames);
                msgEl.textContent = 'Done — redirecting…';
                fillEl.style.width = '100%';
            },
            (error) => {
                console.error('[bulk-drop] upload failed', error);
                msgEl.textContent = 'Upload failed';
                subEl.textContent = 'Check the console for details';
                uploading = false;
                setTimeout(hide, 2000);
            },
            (event) => {
                const p = event?.detail?.progress;
                if (typeof p === 'number') fillEl.style.width = p + '%';
            },
        );
    });
})();
</script>
