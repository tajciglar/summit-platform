export const skeleton = `
<section className="__bg__ py-4">
  <div className="mx-auto max-w-[1120px] px-5 flex flex-wrap items-center justify-center gap-6">
    {/* __SLOT_avatar_stack__: overlapping circular avatars */}
    {/* __SLOT_rating__: star rating display */}
    {/* __SLOT_text__: "Loved by X parents" text */}
  </div>
</section>
`;
export const slots = ['avatar_stack', 'rating', 'text'];
