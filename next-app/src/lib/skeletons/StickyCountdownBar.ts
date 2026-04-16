export const skeleton = `
<div className="fixed top-0 left-0 right-0 z-50 __bg__ py-2 shadow-lg">
  <div className="mx-auto max-w-[1120px] px-4 flex items-center justify-center gap-4">
    {/* __SLOT_message__: short promotional text */}
    <div className="flex items-center gap-3 shrink-0">
      {/* __SLOT_countdown__: days:hours:mins:secs digits */}
    </div>
    {/* __SLOT_cta__: small CTA button */}
  </div>
</div>
`;
export const slots = ['message', 'countdown', 'cta'];
