'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  LayoutGrid,
  List,
  Info,
  Grid,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import {
  awsServiceCategories,
  awsServiceCountByCategory,
  type Service,
} from '@/lib/aws-services-data' // Import type
import { useRouter, useSearchParams } from 'next/navigation'
import {
  SortType,
  PrefixDisplayType,
  useAwsServicesFilter,
} from '@/contexts/aws-services-filter-context'
import { getResourceNameFromServiceName } from '@/lib/get-aws-resource-name-from-service-name'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface AwsServicesListProps {
  services: Service[]
}

const SEARCH_PARAM = 'q'
const PAGE_PARAM = 'page'
const PAGE_SIZE = 50
const DEBOUNCE_TIME_MS = 300 // 300ms

export default function AwsServicesList({
  services: initialServices,
}: AwsServicesListProps) {
  const {
    selectedCategories,
    setSelectedCategories,
    layoutMode,
    setLayoutMode,
    sortType,
    setSortType,
    prefixDisplay,
    setPrefixDisplay,
  } = useAwsServicesFilter()

  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize searchTerm and page from URL
  const initialSearchTerm = searchParams.get(SEARCH_PARAM) || ''
  const initialPage = parseInt(searchParams.get(PAGE_PARAM) || '1', 10)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(initialSearchTerm)
  const [page, setPage] = useState(
    isNaN(initialPage) || initialPage < 1 ? 1 : initialPage
  )

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      searchTerm && setPage(1) // Reset to first page on new search
    }, DEBOUNCE_TIME_MS)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Sync debouncedSearchTerm and page to URL (but not in context)
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
    router.replace(`?${params.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, page])

  // Memoize filtered, sorted, and prefix-adjusted services
  const filteredServices = useMemo(() => {
    const search = debouncedSearchTerm.trim().toLowerCase()
    let filtered = initialServices.filter((service) => {
      const matchesSearchTerm =
        service.service.toLowerCase().includes(search) ||
        service.shortDescription.toLowerCase().includes(search) ||
        service.alsoKnownAs?.some((aka) => aka.toLowerCase().includes(search))
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
    if (prefixDisplay === 'without') {
      filtered = filtered.map((service) => ({
        ...service,
        service: service.serviceSimpleName || service.service,
      }))
    }

    return filtered
  }, [
    initialServices,
    debouncedSearchTerm,
    selectedCategories,
    sortType,
    prefixDisplay,
  ])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE))
  const paginatedServices = useMemo(
    () => filteredServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredServices, page]
  )

  // Memoize category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const { name: category } of awsServiceCategories) {
      counts[category] = initialServices.filter((service) =>
        service.categories.includes(category)
      ).length
    }
    return counts
  }, [initialServices])

  const serviceCountOfSelectedCategories = useMemo(
    () =>
      selectedCategories.reduce(
        (acc, category) => acc + (awsServiceCountByCategory[category] || 0),
        0
      ),
    [selectedCategories]
  )

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

  // Pagination controls

  return (
    <div className="min-h-screen container mx-auto p-4 md:py-8 md:px-0">
      <header className="mb-4 md:mb-8 text-center">
        <h1 className="text-4xl text-gray-100 font-bold tracking-tight">
          AWS Explorer
        </h1>
        <p className="text-gray-200 mt-2">
          Browse, explorer, and find your next AWS services...or quickly find
          the docs you need.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <aside className="flex flex-col-reverse md:block md:col-span-1 space-y-3 md:space-y-6 p-6 pt-2 md:pt-6 bg-card rounded-lg shadow self-start md:sticky md:top-[136px] md:h-fit">
          <div className="mt-4 md:mt-0">
            <h2 className="text-xl font-semibold mb-3">
              Search{' '}
              {selectedCategories.length > 0
                ? serviceCountOfSelectedCategories === 1
                  ? `in 1 service`
                  : `in ${serviceCountOfSelectedCategories} services`
                : initialServices.length === 1
                  ? `in 1 service`
                  : `in ${initialServices.length} services`}
              {selectedCategories.length > 0 ? (
                <span className="text-sm font-normal">
                  {selectedCategories.length === 1
                    ? ` (of ${selectedCategories.length} category)`
                    : ` (of ${selectedCategories.length} categories)`}
                </span>
              ) : (
                ''
              )}
            </h2>
            <Input
              type="text"
              placeholder="Search by name or description ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Filter by Category
              {selectedCategories.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategories([])
                    setPage(1) // Reset to first page
                    scrollTop()
                  }}
                  className="ml-2 py-1 h-auto text-sm text-primary hover:underline"
                >
                  Clear all filters
                </Button>
              )}
            </h2>
            <div className="space-y-2 max-h-36 md:max-h-96 overflow-y-auto pr-2">
              {awsServiceCategories.map(({ name: category, icon }) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="flex-grow flex items-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <img
                      src={`/aws/${icon}.svg`}
                      alt={icon}
                      className="h-5 w-5"
                    />
                    <div className="flex-grow">{category}</div>
                    <span className="ml-0 text-sm text-muted-foreground">
                      ({categoryCounts[category]})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Sort Mode</h2>
            <div className="flex flex-wrap gap-2">
              <RadioGroup
                value={sortType}
                onValueChange={(value: SortType) => {
                  setSortType(value)
                  setPage(1) // Reset to first page
                  scrollTop()
                }}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="category" id="sort-category" />
                  <Label htmlFor="sort-category">Category</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="simpleName" id="sort-simpleName" />
                  <Label htmlFor="sort-simpleName">Alphabet</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fullName" id="sort-fullName" />
                  <Label htmlFor="sort-fullName">
                    Alphabet (with Amazon/AWS)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Service name</h2>
            <div className="flex flex-wrap gap-2">
              <RadioGroup
                value={prefixDisplay}
                onValueChange={(value: PrefixDisplayType) => {
                  setPrefixDisplay(value)
                }}
                className="flex flex-wrap gap-3"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="without" id="prefix-without" />
                  <Label htmlFor="prefix-without">Without Amazon/AWS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="with" id="prefix-with" />
                  <Label htmlFor="prefix-with">With Amazon/AWS</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">View Mode</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={layoutMode === 'card' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setLayoutMode('card')}
                aria-label="Card view"
                className="w-fit px-2"
              >
                <LayoutGrid className="h-5 w-5" />
                Grid
              </Button>
              <Button
                variant={layoutMode === 'list' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setLayoutMode('list')}
                aria-label="List view"
                className="w-fit px-2"
              >
                <List className="h-5 w-5" /> List
              </Button>
              <Button
                variant={layoutMode === 'icon' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setLayoutMode('icon')}
                aria-label="Icon view"
                className="w-fit px-2"
              >
                <Grid className="h-5 w-5" /> Icon
              </Button>
            </div>
          </div>
        </aside>

        <main id="main-content" className="md:col-span-2 lg:col-span-3">
          {debouncedSearchTerm && filteredServices.length ? (
            <div className="mb-2 text-gray-100">
              Found {filteredServices.length} services match your search and
              categories.
            </div>
          ) : null}
          {filteredServices.length > 0 ? (
            <>
              <Pagination
                totalPages={totalPages}
                page={page}
                setPage={setPage}
              />
              {layoutMode === 'card' && (
                <ServiceCartsList filteredServices={paginatedServices} />
              )}
              {layoutMode === 'list' && (
                <ServiceListItemsList filteredServices={paginatedServices} />
              )}
              {layoutMode === 'icon' && (
                <ServiceIconsList filteredServices={paginatedServices} />
              )}
              <Pagination
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                scrollToTop={true}
              />
            </>
          ) : (
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
                <div className="-ml-3 -mr-2 text-white text-sm">
                  , select more or
                </div>
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
          )}
        </main>
      </div>
    </div>
  )
}

function ServiceCartsList({
  filteredServices,
}: {
  filteredServices: Service[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service) => (
        <ServiceCartItem key={service.service} service={service} />
      ))}
    </div>
  )
}

import { usePrefixDisplay } from '@/hooks/use-prefix-display'

function ServiceCartItem({ service }: { service: Service }) {
  const prefixDisplay = usePrefixDisplay()
  const displayName =
    prefixDisplay === 'with' ? service.service : service.serviceSimpleName

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <Link
            href={`/${service.slug}`}
            className="flex flex-wrap gap-2 items-center justify-between text-blue-600 hover:text-blue-700 hover:underline"
            scroll={true}
            target="_blank"
          >
            <ServiceIcons service={service} />
            <div className="flex-1 min-w-48">{displayName}</div>
          </Link>
        </CardTitle>
        <CardDescription className="text-xs h-10">
          {service.shortDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-x-1 space-y-1">
          {service.categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ServiceListItemsList({
  filteredServices,
}: {
  filteredServices: Service[]
}) {
  return (
    <div className="space-y-4">
      {filteredServices.map((service) => (
        <ServiceListItem key={service.service} service={service} />
      ))}
    </div>
  )
}

function ServiceListItem({ service }: { service: Service }) {
  const prefixDisplay = usePrefixDisplay()
  const displayName =
    prefixDisplay === 'with' ? service.service : service.serviceSimpleName

  return (
    <Card className="p-0">
      <Link href={`/${service.slug}`} passHref scroll={true} target="_blank">
        <div className="flex justify-between p-4 cursor-pointer hover:bg-accent transition-colors rounded">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {service.shortDescription}
            </p>
            <div className="mt-2 space-x-1 space-y-1">
              {service.categories.map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          <ServiceIcons service={service} />
        </div>
      </Link>
    </Card>
  )
}

function ServiceIconsList({
  filteredServices,
}: {
  filteredServices: Service[]
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredServices.map((service) => (
        <ServiceIconItem key={service.service} service={service} />
      ))}
    </div>
  )
}

function ServiceIconItem({ service }: { service: Service }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-3 pb-1 md:p-4 md:pb-2 lg:p-6 lg:pb-4">
        <CardTitle className="text-lg">
          <Link
            href={`/${service.slug}`}
            className="flex flex-col flex-wrap gap-1 items-center justify-between text-blue-600 hover:text-blue-700 hover:underline"
            scroll={true}
            target="_blank"
          >
            <ServiceIcons service={service} size="large" />
            <div className="text-center text-sm text-primary">
              {service.service}
            </div>
            <ul className="flex gap-2 flex-wrap justify-center">
              {service.iconResources?.map((r) => {
                const resourceName = getResourceNameFromServiceName(r, service)
                return (
                  <li key={r} className="flex flex-col items-center p-1">
                    <img
                      src={`/aws/${r}.svg`}
                      alt={`${resourceName} icon`}
                      className="inline h-5 w-5 lg:h-10 lg:w-10"
                    />
                    {/* {resourceName} */}
                  </li>
                )
              })}
            </ul>
          </Link>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

function ServiceIcons({
  service,
  size = 'small',
}: {
  service: Service
  size?: 'small' | 'large'
}) {
  const className = size === 'large' ? 'h-16 w-16 lg:h-24 lg:w-24' : 'h-12 w-12'

  return (
    <>
      {service.iconService ? (
        <img
          src={`/aws/${service.iconService}.svg`}
          alt={service.iconService}
          className={className}
        />
      ) : service.iconServices ? null : (
        <img
          src={`/aws/GeneralResource.svg`}
          alt={service.iconService}
          className={className}
        />
      )}
      {service.iconServices ? (
        <div className="flex flex-wrap justify-center gap-2">
          {service.iconServices.map((icon) => (
            <img
              key={icon}
              src={`/aws/${icon}.svg`}
              alt={icon}
              className={className}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}

function Pagination({
  totalPages,
  page,
  setPage,
  scrollToTop = false,
}: {
  totalPages: number
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  scrollToTop?: boolean
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
    <div className="flex justify-center items-center gap-2 my-6 flex-wrap">
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

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
}
