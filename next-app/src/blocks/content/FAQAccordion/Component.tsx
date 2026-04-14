import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { Props } from './schema'

export function FAQAccordion(props: Props) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[760px] px-6">
        <header className="text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-primary))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
        </header>
        <Accordion className="mt-10 rounded-xl border border-gray-200 bg-white px-4 shadow-sm">
          {props.items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-base font-semibold text-gray-900 md:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600">
                {item.answer.split(/\n{2,}/).map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
