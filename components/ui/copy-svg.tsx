'use client'

import { Copy } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  id: string
  name?: string
  targetSize?: number
  buttonText?: string
  className?: string
}

export function CopySvg({
  id,
  name,
  targetSize = 512,
  buttonText = 'SVG',
  className,
}: Props) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('w-fit px-2', className)}
      onClick={async () => {
        const iconElement = document.getElementById(id) as HTMLImageElement
        if (!iconElement) return

        try {
          const data = await fetch(iconElement.src)
          if (
            ClipboardItem.supports('image/svg+xml') &&
            'write' in navigator.clipboard
          ) {
            const blob = await data.blob()
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ])
            console.log('SVG copied as image')
          } else {
            console.log('SVG images are not supported by the clipboard.')
            const text = await data.text()
            await navigator.clipboard.writeText(text)
            console.log('SVG copied as source code')
          }

          toast(`${name} (SVG) copied 🎊`, {
            description:
              'You can paste it to draw.io, Whatsapp, Word, Google Docs...',
          })
        } catch (err) {
          if (err instanceof Error)
            toast(`Failed to copy ${name} (SVG) `, {
              description: `{${err.name}: ${err.message}`,
            })
        }
      }}
    >
      <Copy className="h-4 w-4 mr-1" /> {buttonText}
    </Button>
  )
}
