'use client'

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react'
import { Button } from '@/components/ui/button'
import {
  awsServiceCountByCategory,
  type Service,
} from '@/lib/aws-services-data'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAwsServicesFilter } from '@/contexts/aws-services-filter-context'
import { scrollTop } from '@/helpers/scroll-top'
import { Pagination } from './pagination'
import { ServiceListItem } from './service-list-item'
import { ServiceCardItem } from './service-card-item'
import { ServiceIconItem } from './service-icon-item'
import { ServiceDrawIOItem } from './service-drawio-item'
import { SearchFilterSection } from './search-filter-section'

interface ServicesListProps {
  services: Service[]
}

const SEARCH_PARAM = 'q'
const PAGE_PARAM = 'page'
const PAGE_SIZE_PARAM = 'pageSize'
const DEFAULT_PAGE_SIZE = 50
export const PAGE_SIZES = [20, 50, 100]
const DEBOUNCE_TIME_MS = 300 // 300ms

export default function ServicesList({
  services: initialServices,
}: ServicesListProps) {
  const {
    selectedCategories,
    setSelectedCategories,
    layoutMode,
    sortType,
    prefixDisplay,
  } = useAwsServicesFilter()

  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize searchTerm, page, and pageSize from URL
  const initialSearchTerm = searchParams.get(SEARCH_PARAM) || ''
  const initialPage = parseInt(searchParams.get(PAGE_PARAM) || '1', 10)
  const initialPageSize = parseInt(
    searchParams.get(PAGE_SIZE_PARAM) || DEFAULT_PAGE_SIZE.toString(),
    10
  )
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(initialSearchTerm)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize)
      setPage(1) // Reset to first page when changing page size

      // Update URL
      const params = new URLSearchParams(searchParams.toString())
      if (newPageSize !== DEFAULT_PAGE_SIZE) {
        params.set(PAGE_SIZE_PARAM, newPageSize.toString())
      } else {
        params.delete(PAGE_SIZE_PARAM)
      }
      // Reset to first page
      params.delete(PAGE_PARAM)

      router.push(`?${params.toString()}`, { scroll: false })
      scrollTop()
    },
    [searchParams, router]
  )

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      searchTerm && setPage(1) // Reset to first page on new search
    }, DEBOUNCE_TIME_MS)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Sync debouncedSearchTerm, page, and pageSize to URL (but not in context)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearchTerm) {
      params.set(SEARCH_PARAM, debouncedSearchTerm)
    } else {
      params.delete(SEARCH_PARAM)
    }
    if (page > 1) {
      params.set(PAGE_PARAM, String(page))
    } else {
      params.delete(PAGE_PARAM)
    }
    if (pageSize !== DEFAULT_PAGE_SIZE) {
      params.set(PAGE_SIZE_PARAM, pageSize.toString())
    } else {
      params.delete(PAGE_SIZE_PARAM)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
    scrollTop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, page, pageSize])

  // Memoize filtered, sorted, and prefix-adjusted services
  const filteredServices = useMemo(() => {
    const search = debouncedSearchTerm.trim().toLowerCase()

    let filtered = initialServices.filter((service) => {
      let matchesSearchTerm =
        service.service.toLowerCase().includes(search) ||
        service.shortDescription.toLowerCase().includes(search) ||
        service.alsoKnownAs?.some((aka) =>
          aka.toLowerCase().includes(search)
        ) ||
        service.categories?.some((cat) => cat.toLowerCase().includes(search))

      if (layoutMode === 'drawio') {
        matchesSearchTerm =
          service.service.toLowerCase().includes(search) ||
          service.alsoKnownAs?.some((aka) =>
            aka.toLowerCase().includes(search)
          ) ||
          service.iconResources?.some((icon) =>
            icon.toLowerCase().replaceAll('-', ' ').includes(search)
          )!
      }
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => service.categories.includes(cat))

      return matchesSearchTerm && matchesCategories
    })

    // Sort the filtered services based on sortType
    if (sortType === 'fullName') {
      filtered = filtered.sort((a, b) => a.service.localeCompare(b.service))
    } else if (sortType === 'simpleName') {
      filtered = filtered.sort((a, b) => {
        const aName = a.serviceSimpleName || a.service
        const bName = b.serviceSimpleName || b.service
        return aName.localeCompare(bName)
      })
    } else if (sortType === 'category') {
      filtered = filtered.sort((a, b) => {
        const aCat = a.categories[0] || ''
        const bCat = b.categories[0] || ''
        return aCat.localeCompare(bCat)
      })
    }

    // Adjust service names based on prefixDisplay
    // if (prefixDisplay === 'without') {
    //   return filtered.map((service) => ({
    //     ...service,
    //     service: service.serviceSimpleName || service.service,
    //   }))
    // }

    return filtered
  }, [
    initialServices,
    debouncedSearchTerm,
    selectedCategories,
    sortType,
    prefixDisplay,
    layoutMode,
  ])

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / pageSize)
  const paginatedServices = useMemo(
    () => filteredServices.slice((page - 1) * pageSize, page * pageSize),
    [filteredServices, page, pageSize]
  )

  const serviceCountOfSelectedCategories = useMemo(() => {
    if (filteredServices.length === 0) {
      return initialServices.length
    }
    return selectedCategories.reduce(
      (acc, category) => acc + (awsServiceCountByCategory[category] || 0),
      0
    )
  }, [selectedCategories, initialServices])

  const handleCategoryChange = useCallback(
    (category: string) => {
      setPage(1) // Reset to first page on category change
      scrollTop()
      setSelectedCategories((prev: string[]) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      )
    },
    [setSelectedCategories]
  )

  return (
    <div className="min-h-screen container min-[2000px]:max-w-full mx-auto p-4 md:py-8 md:px-0 min-[2000px]:px-8">
      <header className="mb-4 md:mb-8 text-center">
        <h1 className="text-4xl text-gray-100 font-bold tracking-tight">
          AWS Explorer
        </h1>
        <p className="text-gray-200 mt-2">
          Browse, explorer, and find your next AWS services; find the docs you
          need; download architecture icons...
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-[2000px]:grid-cols-9 gap-6">
        <SearchFilterSection
          className="min-[2000px]:col-span-2 min-[2500px]:col-span-1"
          services={filteredServices}
          selectedCategories={selectedCategories}
          handleCategoryChange={handleCategoryChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setPage={setPage}
          serviceCountOfSelectedCategories={serviceCountOfSelectedCategories}
          pageSize={pageSize}
          handlePageSizeChange={handlePageSizeChange}
          totalServices={initialServices.length}
        />

        <main
          id="main-content"
          className="md:col-span-2 lg:col-span-3 min-[2000px]:col-span-7 min-[2500px]:col-span-8"
        >
          <FoundServices
            searchTerm={debouncedSearchTerm}
            services={filteredServices}
          />
          {filteredServices.length > 0 ? (
            <>
              <Pagination
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                className="mb-4 md:mb-6"
              />
              {layoutMode === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedServices.map((service) => (
                    <ServiceCardItem key={service.service} service={service} />
                  ))}
                </div>
              )}
              {layoutMode === 'list' && (
                <div className="space-y-4">
                  {paginatedServices.map((service) => (
                    <ServiceListItem key={service.service} service={service} />
                  ))}
                </div>
              )}
              {layoutMode === 'icon' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 min-[2000px]:grid-cols-6 min-[2399px]:grid-cols-7 min-[2879px]:grid-cols-8 min-[3839px]:grid-cols-9 min-[4000px]:grid-cols-10 gap-6">
                  {paginatedServices.map((service) => (
                    <ServiceIconItem key={service.service} service={service} />
                  ))}
                </div>
              )}
              {layoutMode === 'drawio' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 min-[2000px]:grid-cols-5 min-[2399px]:grid-cols-6 min-[2879px]:grid-cols-7 min-[3839px]:grid-cols-8 min-[4000px]:grid-cols-9 gap-6">
                  {paginatedServices.map((service) => (
                    <ServiceDrawIOItem
                      key={service.service}
                      service={service}
                    />
                  ))}
                </div>
              )}
              <Pagination
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                scrollToTop={true}
                className="mt-4 md:mt-6"
              />
            </>
          ) : (
            <NotFoundService
              setSearchTerm={setSearchTerm}
              setSelectedCategories={setSelectedCategories}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function FoundServices({
  searchTerm,
  services,
}: {
  searchTerm: string
  services: Service[]
}) {
  return (
    <div>
      {searchTerm && services.length ? (
        <div className="mb-2 text-gray-100">
          Found {services.length} services match your search and categories.
        </div>
      ) : null}
    </div>
  )
}

function NotFoundService({
  setSearchTerm,
  setSelectedCategories,
}: {
  setSearchTerm: Dispatch<SetStateAction<string>>
  setSelectedCategories: Dispatch<SetStateAction<string[]>>
}) {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <p className="text-xl text-white">
        No services match your search and filters.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setSearchTerm('')
          }}
          className="p-1 h-auto text-sm text-white italic underline hover:underline"
        >
          Clear search
        </Button>
        <div className="-ml-3 -mr-2 text-white text-sm">, select more or</div>
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedCategories([])
          }}
          className="p-1 h-auto text-sm text-white italic underline hover:underline"
        >
          all categories
        </Button>
      </div>
    </div>
  )
}
