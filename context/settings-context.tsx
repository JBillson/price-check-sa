"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

// Define settings type
export interface UserSettings {
  theme: "light" | "dark" | "system"
  currency: "ZAR" | "USD" | "EUR" | "GBP"
  notifications: boolean
  defaultShops: string[]
  language: "en" | "af" | "zu" | "xh"
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  currency: "ZAR",
  notifications: true,
  defaultShops: ["Woolworths", "Pick n Pay", "Checkers", "Spar", "Shoprite"],
  language: "en",
}

// Define settings context type
interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
  resetSettings: () => Promise<void>
}

// Create context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  resetSettings: async () => {},
})

// Settings provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)

  // Load settings on initial render and when user changes
  useEffect(() => {
    loadSettings()
  }, [user])

  // Load settings from appropriate storage
  const loadSettings = async () => {
    try {
      if (user) {
        // Load from database for authenticated users
        const response = await fetch("/api/settings")

        if (response.ok) {
          const data = await response.json()

          // Convert comma-separated string to array
          const defaultShops = data.settings.defaultShops.split(",")

          setSettings({
            theme: data.settings.theme,
            currency: data.settings.currency,
            notifications: data.settings.notifications,
            defaultShops,
            language: data.settings.language,
          })
        }
      } else {
        // Load from localStorage for non-authenticated users
        const localSettings = localStorage.getItem("userSettings")

        if (localSettings) {
          setSettings(JSON.parse(localSettings))
        } else {
          // If no settings found, use default
          setSettings(DEFAULT_SETTINGS)
        }
      }
    } catch (error) {
      console.error("Failed to load settings", error)
      setSettings(DEFAULT_SETTINGS)
    }
  }

  // Update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    try {
      if (user) {
        // Save to database for authenticated users
        await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSettings),
        })
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem("userSettings", JSON.stringify(updatedSettings))
      }
    } catch (error) {
      console.error("Failed to save settings", error)
    }
  }

  // Reset settings to default
  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS)

    try {
      if (user) {
        // Save to database for authenticated users
        await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(DEFAULT_SETTINGS),
        })
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem("userSettings", JSON.stringify(DEFAULT_SETTINGS))
      }
    } catch (error) {
      console.error("Failed to reset settings", error)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>{children}</SettingsContext.Provider>
  )
}

// Custom hook to use settings context
export function useSettings() {
  return useContext(SettingsContext)
}

