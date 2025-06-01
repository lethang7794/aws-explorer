import type { Metadata } from 'next'
import './globals.css'
import { AwsServicesFilterProvider } from '@/contexts/aws-services-filter-context'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'AWS Explorer',
  description:
    'Browse, explorer, and find your next AWS services... or quickly find the docs you need.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☁️</text></svg>"
        />
      </head>
      <body className="h-full">
        <Suspense>
          <AwsServicesFilterProvider>{children}</AwsServicesFilterProvider>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
