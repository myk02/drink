"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"

export function CopyLinkButton({ url, label = "Copy link" }: { url: string; label?: string }) {
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
      return
    } catch {
      // Clipboard API unavailable (insecure context / denied) — legacy fallback.
    }
    try {
      const ta = document.createElement("textarea")
      ta.value = url
      ta.setAttribute("readonly", "")
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      toast.success("Link copied")
    } catch {
      toast.error("Couldn't copy — long-press the URL to copy it")
    }
  }
  return (
    <button
      onClick={handle}
      className="mt-2 w-full bg-white text-[#121212] font-bold text-xs py-2 inline-flex items-center justify-center gap-2 cursor-pointer"
    >
      <Share2 className="w-3.5 h-3.5" /> {label}
    </button>
  )
}
