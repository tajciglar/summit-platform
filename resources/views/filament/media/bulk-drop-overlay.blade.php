{{--
    Window-level dropzone for the Media Library list page.

    Listens for OS file drags anywhere on the page, shows a full-screen
    overlay, and uploads the dropped files to the ListMediaItems Livewire
    component's `bulkDropFiles` property. The server-side
    `updatedBulkDropFiles` hook persists them and redirects to the Create
    page with rows pre-populated.
--}}
<div
    x-data="mediaBulkDrop()"
    x-cloak
    x-show="active"
    x-transition.opacity
    @dragenter.window="onDragEnter($event)"
    @dragleave.window="onDragLeave($event)"
    @dragover.window.prevent="onDragOver($event)"
    @drop.window.prevent="onDrop($event)"
    class="fi-media-bulk-drop pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-primary-600/20 backdrop-blur-sm"
>
    <div class="rounded-2xl border-4 border-dashed border-primary-500 bg-white px-12 py-10 text-center shadow-2xl dark:bg-gray-900">
        <div class="text-2xl font-semibold text-gray-900 dark:text-white" x-text="message"></div>
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400" x-text="subMessage"></div>
        <div class="mt-4 h-2 w-72 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800" x-show="uploading">
            <div
                class="h-full bg-primary-500 transition-all"
                :style="{ width: progress + '%' }"
            ></div>
        </div>
    </div>
</div>

<script>
    function mediaBulkDrop() {
        return {
            active: false,
            uploading: false,
            progress: 0,
            dragDepth: 0,
            message: 'Drop files to upload',
            subMessage: 'Images and PDFs',

            isFileDrag(e) {
                if (! e.dataTransfer) return false;
                const types = e.dataTransfer.types;
                if (! types) return false;
                return Array.from(types).includes('Files');
            },

            onDragEnter(e) {
                if (this.uploading) return;
                if (! this.isFileDrag(e)) return;
                this.dragDepth++;
                this.active = true;
            },

            onDragLeave(e) {
                if (this.uploading) return;
                this.dragDepth = Math.max(0, this.dragDepth - 1);
                if (this.dragDepth === 0) {
                    this.active = false;
                }
            },

            onDragOver(e) {
                if (this.uploading) return;
                if (this.isFileDrag(e)) {
                    this.active = true;
                }
            },

            onDrop(e) {
                this.dragDepth = 0;
                if (! this.isFileDrag(e)) {
                    this.active = false;
                    return;
                }

                const files = Array.from(e.dataTransfer.files || []);
                if (files.length === 0) {
                    this.active = false;
                    return;
                }

                const root = document.querySelector('[wire\\:id]');
                if (! root || ! window.Livewire) {
                    this.active = false;
                    return;
                }

                const component = window.Livewire.find(root.getAttribute('wire:id'));
                if (! component) {
                    this.active = false;
                    return;
                }

                this.uploading = true;
                this.progress = 0;
                this.message = `Uploading ${files.length} ${files.length === 1 ? 'file' : 'files'}…`;
                this.subMessage = 'Hold tight — redirecting when done';

                component.uploadMultiple(
                    'bulkDropFiles',
                    files,
                    () => {
                        // Server-side updatedBulkDropFiles will redirect.
                        this.message = 'Done — redirecting…';
                        this.progress = 100;
                    },
                    (error) => {
                        console.error('Bulk drop upload failed', error);
                        this.message = 'Upload failed';
                        this.subMessage = 'Check the console for details';
                        this.uploading = false;
                        setTimeout(() => { this.active = false; }, 2000);
                    },
                    (event) => {
                        if (event && typeof event.detail?.progress === 'number') {
                            this.progress = event.detail.progress;
                        }
                    },
                );
            },
        };
    }
</script>
