'use client'

import { Download } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  filename: string
  name?: string
  buttonText?: string
  className?: string
}

export function DownloadSvg({
  id,
  filename,
  name,
  buttonText = 'SVG',
  className,
}: Props) {
  return (
    <Button
      variant="default"
      size="icon"
      className={cn('w-fit px-2', className)}
      onClick={async () => {
        const iconElement = document.getElementById(id) as HTMLImageElement
        console.log(iconElement)
        if (!iconElement) return

        try {
          // Get the SVG data
          const svgData = await fetch(iconElement.src).then((res) => res.text())
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(svgData, 'image/svg+xml')
          const svg = svgDoc.querySelector('svg')

          if (!svg) return

          // Create SVG blob and download link
          const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(svgBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${filename}.svg`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Error downloading SVG:', error)
        }
      }}
    >
      <Download className="h-4 w-4" /> {buttonText}
    </Button>
  )
}
