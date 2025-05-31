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
import { LayoutGrid, List, Info } from 'lucide-react'
import {
  awsServiceCategories,
  awsServiceCountByCategory,
  type Service,
} from '@/lib/aws-services-data' // Import type
import { useRouter, useSearchParams } from 'next/navigation'
import { useAwsServicesFilter } from '@/contexts/aws-services-filter-context'

interface AwsServicesListProps {
  services: Service[]
}

const SEARCH_PARAM = 'q'
const DEBOUNCE_TIME_MS = 300 // 300ms

export default function AwsServicesList({
  services: initialServices,
}: AwsServicesListProps) {
  const {
    selectedCategories,
    setSelectedCategories,
    layoutMode,
    setLayoutMode,
  } = useAwsServicesFilter()

  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize searchTerm from URL
  const initialSearchTerm = searchParams.get(SEARCH_PARAM) || ''
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(initialSearchTerm)

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, DEBOUNCE_TIME_MS)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Sync debouncedSearchTerm to URL (but not in context)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearchTerm) {
      params.set(SEARCH_PARAM, debouncedSearchTerm)
    } else {
      params.delete(SEARCH_PARAM)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [debouncedSearchTerm])

  // Memoize filtered services
  const filteredServices = useMemo(() => {
    const search = debouncedSearchTerm.trim().toLowerCase()
    return initialServices.filter((service) => {
      const matchesSearchTerm =
        service.service.toLowerCase().includes(search) ||
        service.shortDescription.toLowerCase().includes(search)
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => service.categories.includes(cat))
      return matchesSearchTerm && matchesCategories
    })
  }, [initialServices, debouncedSearchTerm, selectedCategories])

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
      setSelectedCategories((prev: string[]) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      )
    },
    [setSelectedCategories]
  )

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <header className="mb-4 md:mb-8 text-center">
        <h1 className="text-4xl text-gray-100 font-bold tracking-tight">
          AWS Explorer
        </h1>
        <p className="text-gray-200 mt-2 text-balance">
          Browse, explorer, and find your next AWS services... or quickly find
          the docs you need.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <aside className="flex flex-col-reverse md:block md:col-span-1 space-y-3 md:space-y-6 p-6 pt-2 md:pt-6 bg-card rounded-lg shadow self-start md:sticky md:top-[136px] md:h-fit">
          <div className="mt-4 md:mt-0">
            <h2 className="text-xl font-semibold mb-3">
              Search{' '}
              {selectedCategories.length > 0
                ? serviceCountOfSelectedCategories !== 1
                  ? `in ${serviceCountOfSelectedCategories} services`
                  : `in ${serviceCountOfSelectedCategories} service`
                : initialServices.length !== 1
                  ? `in ${initialServices.length} services`
                  : `in ${initialServices.length} service`}
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
            <h2 className="text-xl font-semibold mb-3">Filter by Category</h2>
            <div className="space-y-2 max-h-36 md:max-h-72 overflow-y-auto pr-2">
              {awsServiceCategories.map(({ name: category, icon }) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="flex gap-2 text-sm font-medium cursor-pointer"
                  >
                    <img src={`/aws/${icon}.svg`} className="h-5 w-5" />
                    {category}
                    <span className="ml-0 text-sm text-muted-foreground">
                      ({categoryCounts[category]})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <Button
                variant="link"
                onClick={() => setSelectedCategories([])}
                className="mt-4 p-0 h-auto text-sm text-primary hover:underline"
              >
                Clear all filters
              </Button>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">View Mode</h2>
            <div className="flex space-x-2">
              <Button
                variant={layoutMode === 'card' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setLayoutMode('card')}
                aria-label="Card view"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={layoutMode === 'list' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setLayoutMode('list')}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-2 lg:col-span-3">
          {debouncedSearchTerm ? (
            <div className="mb-2 text-gray-100">
              Found {filteredServices.length} services:
            </div>
          ) : null}
          {filteredServices.length > 0 ? (
            layoutMode === 'card' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCartItem
                      key={service?.id || `${service.slug}`}
                      service={service}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <ServiceListItem
                    key={service?.id || `${service.slug}`}
                    service={service}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No services match your criteria.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ServiceIcons({ service }: { service: Service }) {
  return (
    <>
      {service.iconService ? (
        <img src={`/aws/${service.iconService}.svg`} className="h-12 w-12" />
      ) : service.iconServices ? null : (
        <img src={`/aws/GeneralResource.svg`} className="h-12 w-12" />
      )}
      {service.iconServices ? (
        <div className="flex flex-wrap gap-2">
          {service.iconServices.map((icon) => (
            <img key={icon} src={`/aws/${icon}.svg`} className="h-12 w-12" />
          ))}
        </div>
      ) : null}
    </>
  )
}

function ServiceCartItem({ service }: { service: Service }) {
  return (
    <Card key={service.slug} className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <Link
            href={`/${service.slug}`}
            className="flex flex-wrap gap-2 items-center justify-between text-blue-600 hover:text-blue-700 hover:underline"
            scroll={true}
          >
            <ServiceIcons service={service} />
            <div className="flex-1">{service.serviceSimpleName}</div>
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

function ServiceListItem({ service }: { service: Service }) {
  return (
    <Card key={service.slug} className="p-0">
      <Link href={`/${service.slug}`} passHref scroll={true}>
        <div className="flex justify-between p-4 cursor-pointer hover:bg-accent transition-colors rounded">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              {service.serviceSimpleName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {service.shortDescription}
            </p>
            <div className="mt-2 space-x-1 space-y-1">
              {service.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
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
