"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSettings, DEFAULT_SETTINGS, type UserSettings } from "@/context/settings-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { user } = useAuth()
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize local settings when settings are loaded
  useEffect(() => {
    setLocalSettings(settings)
    setIsLoading(false)
  }, [settings])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(localSettings)
    toast.success("Settings saved successfully")
  }

  // Handle reset to defaults
  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS)
    resetSettings()
    toast.success("Settings reset to defaults")
  }

  // Handle theme change
  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setLocalSettings({ ...localSettings, theme: value })
  }

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setLocalSettings({ ...localSettings, currency: value as UserSettings["currency"] })
  }

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLocalSettings({ ...localSettings, language: value as UserSettings["language"] })
  }

  // Handle notifications toggle
  const handleNotificationsChange = (checked: boolean) => {
    setLocalSettings({ ...localSettings, notifications: checked })
  }

  // Handle shop selection
  const handleShopChange = (shop: string, checked: boolean) => {
    if (checked) {
      setLocalSettings({
        ...localSettings,
        defaultShops: [...localSettings.defaultShops, shop],
      })
    } else {
      setLocalSettings({
        ...localSettings,
        defaultShops: localSettings.defaultShops.filter((s) => s !== shop),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Settings</CardTitle>
          <CardDescription>
            {user
              ? `Customize your experience, ${user.name}. These settings will be saved to your account.`
              : "Customize your experience. These settings will be saved to your device."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Appearance</h3>
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup value={localSettings.theme} onValueChange={handleThemeChange} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Regional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={localSettings.currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZAR">South African Rand (R)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={localSettings.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="af">Afrikaans</SelectItem>
                      <SelectItem value="zu">isiZulu</SelectItem>
                      <SelectItem value="xh">isiXhosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notifications</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={localSettings.notifications}
                  onCheckedChange={handleNotificationsChange}
                />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Default Shops</h3>
              <p className="text-sm text-muted-foreground">
                Select the shops you want to include in your price comparisons by default
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {["Woolworths", "Pick n Pay", "Checkers", "Spar", "Shoprite"].map((shop) => (
                  <div key={shop} className="flex items-center space-x-2">
                    <Checkbox
                      id={`shop-${shop}`}
                      checked={localSettings.defaultShops.includes(shop)}
                      onCheckedChange={(checked) => handleShopChange(shop, checked as boolean)}
                    />
                    <Label htmlFor={`shop-${shop}`}>{shop}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

