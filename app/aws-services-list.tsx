"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface Service {
  service: string
  shortDescription: string
  url: string
  categories: string[]
  detailDescription: string
}

interface AwsServicesListProps {
  services: Service[]
}

export default function AwsServicesList({ services: initialServices }: AwsServicesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>(initialServices)

  // Effect to update services if initialServices prop changes (though not typical for this static data example)
  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  const allCategories = useMemo(() => {
    const categoriesSet = new Set<string>()
    services.forEach((service) => {
      service.categories.forEach((category) => categoriesSet.add(category))
    })
    return Array.from(categoriesSet).sort()
  }, [services])

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearchTerm =
        service.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategories =
        selectedCategories.length === 0 || selectedCategories.every((cat) => service.categories.includes(cat))
      return matchesSearchTerm && matchesCategories
    })
  }, [services, searchTerm, selectedCategories])

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">AWS Services Explorer</h1>
        <p className="text-muted-foreground mt-2">Browse, search, and filter AWS services.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 space-y-6 p-6 bg-card rounded-lg shadow">
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
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {allCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm font-medium cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <button onClick={() => setSelectedCategories([])} className="mt-4 text-sm text-primary hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <main className="md:col-span-3">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.service} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.service}</CardTitle>
                    <CardDescription className="text-xs h-10 overflow-hidden">
                      {service.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-4">{service.detailDescription}</p>
                    <div className="space-x-1">
                      {service.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      Learn More <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No services match your criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
