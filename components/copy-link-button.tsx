"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"

export function CopyLinkButton({ url, label = "Copy link" }: { url: string; label?: string }) {
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy")
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
