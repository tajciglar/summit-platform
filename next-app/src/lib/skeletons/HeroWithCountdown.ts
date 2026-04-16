export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
    <div>
      {/* __SLOT_eyebrow__: small uppercase badge text */}
      {/* __SLOT_headline__: large h1 headline */}
      {/* __SLOT_subheadline__: supporting paragraph text */}
      {/* __SLOT_cta__: primary CTA button (pill shape) */}
      {/* __SLOT_social_proof__: avatar stack + rating + text */}
    </div>
    <div className="flex items-center justify-center">
      {/* __SLOT_hero_visual__: speaker photo collage or countdown timer */}
    </div>
  </div>
</section>
`;
export const slots = ['eyebrow', 'headline', 'subheadline', 'cta', 'social_proof', 'hero_visual'];
