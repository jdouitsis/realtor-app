import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  title?: string
  className?: string
}

/**
 * Share button that uses native share sheet on mobile and copies to clipboard on desktop.
 *
 * @example
 * <ShareButton title="Event Title" />
 */
export function ShareButton({ title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const isMobile = navigator.maxTouchPoints > 0

  const handleShare = async () => {
    const url = window.location.href

    // Use native share sheet on mobile devices
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
        return
      } catch {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Copy to clipboard on desktop (or as fallback)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant={copied ? 'default' : 'outline'}
      size="sm"
      onClick={handleShare}
      className={cn(copied && 'bg-green-600 hover:bg-green-600', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {isMobile ? 'Share' : 'Copy Link'}
        </>
      )}
    </Button>
  )
}
