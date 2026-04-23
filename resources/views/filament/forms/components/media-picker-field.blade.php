{{-- JSON-backed media picker — reuses the MediaPickerInput view since both
     fields expose the same accessor surface (getCategory / getRole /
     getSubCategoryFilter / getUploadStatePath / isUploadAllowed). --}}
@include('filament.forms.components.media-picker-input')
