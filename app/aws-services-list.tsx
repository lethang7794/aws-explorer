'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { awsServiceCategories, type Service } from '@/lib/aws-services-data' // Import type

interface AwsServicesListProps {
  services: Service[]
}

type LayoutMode = 'card' | 'list'

export default function AwsServicesList({
  services: initialServices,
}: AwsServicesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>(initialServices)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('card')

  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearchTerm =
        service.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.shortDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => service.categories.includes(cat))
      return matchesSearchTerm && matchesCategories
    })
  }, [services, searchTerm, selectedCategories])

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          AWS Services Explorer
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse, search, and filter AWS services.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 space-y-6 p-6 bg-card rounded-lg shadow self-start md:sticky md:top-8 md:h-fit">
          <div>
            <h2 className="text-xl font-semibold mb-3">Search Services</h2>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Filter by Category</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {awsServiceCategories.map(({ name: category, icon }) => {
                // Count the number of services in this category
                const count = services.filter((service) =>
                  service.categories.includes(category)
                ).length
                return (
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
                        ({count})
                      </span>
                    </Label>
                  </div>
                )
              })}
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

        <main className="md:col-span-3">
          {filteredServices.length > 0 ? (
            layoutMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.slug} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        <Link
                          href={`/services/${service.slug}`}
                          className="flex flex-wrap justify-between text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <div>{service.serviceSimpleName}</div>
                          {service.iconService ? (
                            <img
                              src={`/aws/${service.iconService}.svg`}
                              className="h-8 w-8"
                            />
                          ) : !service.iconServices ? (
                            <img
                              src={`/aws/GeneralResource.svg`}
                              className="h-8 w-8"
                            />
                          ) : null}
                          {service.iconServices ? (
                            <div className="flex gap-2">
                              {service.iconServices.map((icon) => (
                                <img
                                  key={icon}
                                  src={`/aws/${icon}.svg`}
                                  className="h-8 w-8"
                                />
                              ))}
                            </div>
                          ) : null}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs h-10 overflow-hidden">
                        {service.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-x-1 space-y-1">
                        {service.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <Card key={service.slug} className="p-0">
                    <Link href={`/services/${service.slug}`} passHref>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent transition-colors rounded">
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            {service.serviceSimpleName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.shortDescription}
                          </p>
                          <div className="mt-2 space-x-1 space-y-1">
                            {service.categories.map((category) => (
                              <Badge
                                key={category}
                                variant="secondary"
                                className="text-xs"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
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
