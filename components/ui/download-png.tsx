'use client'

import { Download } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  id: string
  filename: string
  name?: string
  targetSize?: number
  buttonText?: string
  className?: string
}

export function DownloadPng({
  id,
  filename,
  name,
  targetSize = 512,
  buttonText = 'PNG',
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
          // Get the SVG data
          const svgData = await fetch(iconElement.src).then((res) => res.text())
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(svgData, 'image/svg+xml')
          const svg = svgDoc.querySelector('svg')
          if (!svg) return

          // Get SVG dimensions
          const bbox = svg.getBBox()
          const originalWidth = bbox.width || 64
          const originalHeight = bbox.height || 64

          // Calculate scale factor to fit within 512x512 while maintaining aspect ratio
          const scale = Math.min(
            targetSize / originalWidth,
            targetSize / originalHeight
          )
          const width = originalWidth * scale
          const height = originalHeight * scale

          // Create a temporary SVG element with viewBox to maintain aspect ratio
          const tempSVG = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
          )
          tempSVG.setAttribute('width', targetSize.toString())
          tempSVG.setAttribute('height', targetSize.toString())
          tempSVG.setAttribute(
            'viewBox',
            `0 0 ${originalWidth} ${originalHeight}`
          )
          tempSVG.innerHTML = svg.outerHTML

          // Create a temporary image element and wait for it to load
          const img = new Image()
          img.src =
            'data:image/svg+xml;base64,' +
            btoa(new XMLSerializer().serializeToString(tempSVG))
          await new Promise((resolve) => {
            img.onload = resolve
          })

          // Create canvas and draw the image with scaling
          const canvas = document.createElement('canvas')
          canvas.width = targetSize
          canvas.height = targetSize
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          // Center the image in the canvas
          const x = (targetSize - width) / 2
          const y = (targetSize - height) / 2
          ctx.drawImage(img, x, y, width, height)
          // Create PNG blob
          const pngBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob)
            }, 'image/png')
          })

          // Create download link
          const url = URL.createObjectURL(pngBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${filename}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          toast(`${name} (PNG) downloaded 🎊`, {
            description: (
              <>
                It's <b>{filename}.png</b>
              </>
            ),
          })
        } catch (error) {
          if (error instanceof Error)
            toast(`Failed to download ${name} (PNG) `, {
              description: `{${error.name}: ${error.message}`,
            })
        }
      }}
    >
      <Download className="h-4 w-4" /> {buttonText}
    </Button>
  )
}
