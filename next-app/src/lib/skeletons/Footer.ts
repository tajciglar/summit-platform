export const skeleton = `
<footer className="__bg__ py-[50px] px-5">
  <div className="mx-auto max-w-[1120px]">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* __SLOT_brand__: summit name + short description */}
      {/* __SLOT_links_1__: quick links column */}
      {/* __SLOT_links_2__: support links column */}
    </div>
    <div className="mt-8 pt-8 border-t __border_color__ text-center">
      {/* __SLOT_copyright__: copyright text + tagline */}
    </div>
  </div>
</footer>
`;
export const slots = ['brand', 'links_1', 'links_2', 'copyright'];
