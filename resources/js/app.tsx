import { createInertiaApp } from '@inertiajs/react'
import { type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import '../css/app.css'

const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx', { eager: true })

createInertiaApp({
  resolve: (name) => {
    const page = pages[`./Pages/${name}.tsx`]
    if (!page) throw new Error(`Page not found: ${name}`)
    return page.default
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
