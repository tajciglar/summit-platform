export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div>
      {/* __SLOT_heading__: section heading */}
      {/* __SLOT_body__: descriptive body text, can include bullet points */}
      {/* __SLOT_cta__: CTA button */}
    </div>
    <div>
      {/* __SLOT_image__: feature image or photo */}
    </div>
  </div>
</section>
`;
export const slots = ['heading', 'body', 'cta', 'image'];
