'use client'

import { Copy } from 'lucide-react'
import { Button } from './button'

interface Props {
  id: string
  name?: string
  targetSize?: number
  buttonText?: string
}

export function CopyPng({
  id,
  name,
  targetSize = 512,
  buttonText = 'PNG',
}: Props) {
  return (
    <Button
      variant="default"
      size="icon"
      className="w-fit px-2"
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

          // Calculate scale factor to fit within targetSize while maintaining aspect ratio
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
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject // Handle image loading errors
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
          const pngBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Failed to create PNG blob.'))
            }, 'image/png')
          })

          // Write PNG to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': pngBlob,
            }),
          ])

          alert(`PNG for ${name || 'image'} copied to clipboard`)
        } catch (error) {
          console.error('Error copying PNG:', error)
          alert(
            `Failed to copy PNG: ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }}
    >
      <Copy className="h-4 w-4 mr-1" /> {buttonText}
    </Button>
  )
}
