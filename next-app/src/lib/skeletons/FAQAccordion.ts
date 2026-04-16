export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[740px] text-center">
    {/* __SLOT_heading__: "Frequently Asked Questions" heading */}
    {/* __SLOT_subheading__: optional supporting text */}
  </div>
  <div className="mx-auto max-w-[740px] mt-8 space-y-3">
    {/* __SLOT_items__: accordion items with question + answer, collapsible */}
  </div>
</section>
`;
export const slots = ['heading', 'subheading', 'items'];
