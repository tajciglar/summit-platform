export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px]">
    {/* __SLOT_heading__: section heading */}
    {/* __SLOT_subheading__: supporting text */}
    <div className="mt-8 space-y-6">
      {/* __SLOT_bonus_items__: vertical stack of bonus cards, each with image + title + description + value */}
    </div>
    <div className="mt-10 text-center">
      {/* __SLOT_cta__: CTA button */}
    </div>
  </div>
</section>
`;
export const slots = ['heading', 'subheading', 'bonus_items', 'cta'];
