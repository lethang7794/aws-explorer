'use client'

import { Copy } from 'lucide-react'
import { Button } from './button'

interface Props {
  id: string
  name?: string
  targetSize?: number
  buttonText?: string
}

export function CopySvg({
  id,
  name,
  targetSize = 512,
  buttonText = 'SVG',
}: Props) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="w-fit px-2"
      onClick={async () => {
        const iconElement = document.getElementById(id) as HTMLImageElement
        if (!iconElement) return

        try {
          const data = await fetch(iconElement.src)
          try {
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
          } catch (err) {
            if (err instanceof Error) {
              console.error(err.name, err.message)
            }
          }
        } catch (error) {
          console.error('Error copying SVG:', error)
        }
      }}
    >
      <Copy className="h-4 w-4 mr-1" /> {buttonText}
    </Button>
  )
}
