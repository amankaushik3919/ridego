"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "#f3f4f6",
          "--normal-text": "#191c1e",
          "--normal-border": "#e1e2e4",
          "--error-bg": "#ffdad6",
          "--error-text": "#93000a",
          "--error-border": "#ba1a1a",
          "--success-bg": "#6cf8bb",
          "--success-text": "#005236",
          "--success-border": "#006c49",
          "--info-bg": "#dbe1ff",
          "--info-text": "#00174b",
          "--info-border": "#004ac6",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl border font-body-md text-body-md",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
