"use client"

import { useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useSettings } from "@/context/settings-context"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)

  // Set theme based on user settings
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render the provider after mounting to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider {...props} forcedTheme={settings.theme === "system" ? undefined : settings.theme}>
      {children}
    </NextThemesProvider>
  )
}

