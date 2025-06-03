'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { type Service } from '@/lib/aws-services-data' // Import type
import { scrollTop } from '@/helpers/scroll-top'

export function Pagination({
  totalPages,
  page,
  setPage,
  scrollToTop = false,
  className,
}: {
  totalPages: number
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  scrollToTop?: boolean
  className?: string
}) {
  if (totalPages <= 1) return null

  // Helper to generate page numbers to display
  const getPages = () => {
    const pages: number[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push(-1) // -1 means ellipsis
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i)
      }
      if (page < totalPages - 2) pages.push(-1)
      pages.push(totalPages)
    }
    return pages
  }

  const pages = getPages()

  return (
    <div
      className={`flex justify-center items-center gap-2 flex-wrap ${className}`}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setPage((p) => Math.max(1, p - 1))
          if (scrollToTop) {
            scrollTop()
          }
        }}
        disabled={page === 1}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <>
        {pages.map((p, idx) =>
          p === -1 ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                setPage(p)
                if (scrollToTop) {
                  scrollTop()
                }
              }}
              aria-current={p === page ? 'page' : undefined}
              className={p === page ? 'font-bold' : ''}
            >
              {p}
            </Button>
          )
        )}
      </>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setPage((p) => Math.min(totalPages, p + 1))
          if (scrollToTop) {
            scrollTop()
          }
        }}
        disabled={page === totalPages}
      >
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
