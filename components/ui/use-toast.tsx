import type React from "react"
// This is a simplified version of the toast component
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function toast({ title, description, action }: ToastProps) {
  return sonnerToast(title, {
    description,
    action,
  })
}

