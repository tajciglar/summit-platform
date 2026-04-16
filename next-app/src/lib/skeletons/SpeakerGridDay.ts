export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px]">
    {/* __SLOT_day_header__: "Day N: Theme Title" centered heading */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {/* __SLOT_speaker_cards__: array of speaker cards with circular photo, name, title, talk title, "View More" link */}
    </div>
  </div>
</section>
`;
export const slots = ['day_header', 'speaker_cards'];
