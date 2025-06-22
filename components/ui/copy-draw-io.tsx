'use client'

import { Copy } from 'lucide-react'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  id: string
  filename: string
  name?: string
  size?: number
  borderColor?: BorderColor
  buttonText?: React.ReactNode
  className?: string
  variant?: ButtonProps['variant']
}

type BorderColor = '#FF8000' | '#0000FF'

export function CopyDrawIO({
  id,
  name = '',
  size = 64,
  borderColor,
  buttonText = 'DrawIO',
  className,
  variant = 'ghost',
}: Props) {
  return (
    <Button
      variant={variant}
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

          // Resize SVG
          if (size) {
            svg.setAttribute('width', size.toString())
            svg.setAttribute('height', size.toString())
          }

          // Create SVG blob
          const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })

          // Get draw.io shape with service/resource name
          const shape = getShape({
            name,
            borderColor: borderColor || '',
            svg: (await svgBlob.text()) || '',
          })

          // Encode and copy to clipboard
          const encodedShape = encodeURIComponent(shape)
          await navigator.clipboard.writeText(encodedShape)

          toast(`draw.io shape for "${name}" copied 🎊`, {
            description: 'You can paste it to draw.io',
          })
        } catch (error) {
          if (error instanceof Error)
            toast(`Failed to copy ${name} (draw.io) `, {
              description: `{${error.name}: ${error.message}`,
            })
        }
      }}
    >
      <Copy className="h-4 w-4" /> {buttonText}
    </Button>
  )
}

function getShape({
  name,
  borderColor,
  svg,
}: {
  name: string
  borderColor: string
  svg: string
}) {
  // Encode to Base64
  const base64 = btoa(svg)

  // Create a full data URI
  const dataUri = `data:image/svg+xml,${base64}`

  const borderColorText = borderColor ? `labelBorderColor=${borderColor};` : ''

  return `<mxGraphModel>
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="2" value=" ${name} "
      style="shape=image;verticalLabelPosition=bottom;verticalAlign=top;html=1;fontFamily=Arial;fontSize=12;aspect=fixed;imageAspect=0;editableCssRules=.*;image=${dataUri};${borderColorText};labelBackgroundColor=default;spacingTop=-4;"
      vertex="1" parent="1">
      <mxGeometry width="60" height="60" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>`
}
