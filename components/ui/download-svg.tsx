'use client'

import { Download } from 'lucide-react'
import { Button, ButtonProps, buttonVariants } from './button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { VariantProps } from 'class-variance-authority'

interface Props {
  id: string
  filename: string
  name?: string
  buttonText?: React.ReactNode
  size?: number
  className?: string
  variant?: ButtonProps['variant']
}

export function DownloadSvg({
  id,
  filename,
  name,
  buttonText = 'SVG',
  size,
  className,
  variant = 'outline',
}: Props) {
  return (
    <Button
      variant={variant}
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

          // Resize SVG
          if (size) {
            svg.setAttribute('width', size.toString())
            svg.setAttribute('height', size.toString())
          }

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

          toast(`SVG for "${name}" downloaded 🎊`, {
            description: <>{filename}.svg</>,
          })
        } catch (error) {
          if (error instanceof Error)
            toast(`Failed to download ${name} (SVG) `, {
              description: `{${error.name}: ${error.message}`,
            })
        }
      }}
    >
      <Download className="h-4 w-4" /> {buttonText}
    </Button>
  )
}
