import BlockPalette from './BlockPalette'
import BuilderCanvas from './BuilderCanvas'
import SettingsInspector from './SettingsInspector'
import { ThemeProvider } from '@/contexts/ThemeContext'
import type { FunnelTheme } from '@/types/funnel'

interface Props {
  theme: FunnelTheme
}

export default function BuilderLayout({ theme }: Props) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <BlockPalette />
      <ThemeProvider theme={theme}>
        <BuilderCanvas />
      </ThemeProvider>
      <SettingsInspector />
    </div>
  )
}
