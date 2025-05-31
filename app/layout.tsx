import type { Metadata } from 'next'
import './globals.css'
import { AwsServicesFilterProvider } from '@/contexts/aws-services-filter-context'
import { Suspense } from 'react'

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
    <html lang="en">
      <body>
        <Suspense>
          <AwsServicesFilterProvider>{children}</AwsServicesFilterProvider>
        </Suspense>
      </body>
    </html>
  )
}
