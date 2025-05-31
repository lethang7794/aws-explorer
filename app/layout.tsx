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
          <AwsServicesFilterProvider>
            {children}
            <footer className="w-full py-4 text-center text-sm text-muted-foreground bg-transparent">
              <div>
                Made by{' '}
                <a
                  href="https://lethang7794.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  Thắng
                </a>
                .&nbsp;Open-sourced at{' '}
                <a
                  href="https://github.com/lethang7794/aws-explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  aws-explorer
                </a>
                .
              </div>
            </footer>
          </AwsServicesFilterProvider>
        </Suspense>
      </body>
    </html>
  )
}
