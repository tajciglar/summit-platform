export const skeleton = `
<section className="__bg__ py-[50px] px-5">
  <div className="mx-auto max-w-[1120px] text-center">
    {/* __SLOT_heading__: "Speakers Featured In" or similar */}
    <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12">
      {/* __SLOT_logos__: media/brand logo images in a row */}
    </div>
  </div>
</section>
`;
export const slots = ['heading', 'logos'];
