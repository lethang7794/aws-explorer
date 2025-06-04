import { awsServicesData, getServiceBySlug } from '@/lib/aws-services-data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/footer'
import { getResourceNameFromServiceName } from '@/lib/get-aws-resource-name-from-service-name'
import { AWS_DOCS_URL } from '@/constants/aws-docs'
import { DownloadSvg } from '@/components/ui/download-svg'
import { DownloadPng } from '@/components/ui/download-png'
import { CopyPng } from '@/components/ui/copy-png'
import { CopySvg } from '@/components/ui/copy-svg'
import { ServiceIcons } from '@/components/service-icons'

interface ServiceDetailPageProps {
  params: {
    slug: string
  }
}

// This function can be used by Next.js to generate static pages at build time
export async function generateStaticParams() {
  return awsServicesData.map((service) => ({
    slug: service.slug,
  }))
}

// Add this function for metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const service = getServiceBySlug((await params).slug)
  if (!service) return {}

  return {
    title: service.service,
    description: service.shortDescription,
    icons: {
      icon: service.iconService
        ? `/aws/${service.iconService}.svg`
        : service.iconServices?.[0]
          ? `/aws/${service.iconServices[0]}.svg`
          : undefined,
    },
    openGraph: {
      title: service.service,
      description: service.shortDescription,
      images: service.iconService
        ? [`/aws/${service.iconService}.svg`]
        : service.iconServices?.length
          ? service.iconServices.map((icon) => `/aws/${icon}.svg`)
          : [],
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const service = getServiceBySlug((await params).slug)

  if (!service) {
    notFound() // Triggers the not-found page
  }

  // Sort related services to maintain consistent order
  const sortedServices = [...service.othersInCategory].sort((a, b) =>
    a.service.localeCompare(b.service)
  )

  // Find current service index in the sorted list
  const currentIndex = sortedServices.findIndex((s) => s.slug === service.slug)

  // Get previous 3 and next 3 services (wrapping around if needed)
  const related = []
  const total = sortedServices.length

  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue // Skip current service
    const index = (currentIndex + i + total) % total
    related.push(sortedServices[index])
  }

  // Remove duplicates that might occur when total services < 7
  const uniqueRelated = Array.from(
    new Map(related.map((s) => [s.slug, s])).values()
  )

  return (
    <div className="bg-background text-foreground gradient">
      <div className="min-h-screen container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap gap-2 items-center">
              {service.iconService ? (
                <div className="flex flex-col gap-2">
                  <img
                    src={`/aws/${service.iconService}.svg`}
                    className="h-20 w-20 md:h-24 md:w-24"
                    alt={`${service.iconService} icon`}
                    id={service.iconService}
                  />
                </div>
              ) : null}
              {service.iconServices ? (
                <div className="flex flex-wrap gap-2">
                  {service.iconServices.map((icon) => (
                    <img
                      key={icon}
                      alt={`${icon} icon`}
                      src={`/aws/${icon}.svg`}
                      className="h-20 w-20 md:h-24 md:w-24"
                    />
                  ))}
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-2 text-3xl md:text-4xl">
                <div className="mr-2">{service.service}</div>
              </div>
              {service.alsoKnownAs && service.alsoKnownAs.length > 0 ? (
                <div className="flex-grow font-normal text-lg md:text-4xl">
                  {'('}
                  {`${service.alsoKnownAs.map((aka) => aka)}`}
                  {')'}
                </div>
              ) : null}
            </CardTitle>

            <CardDescription className="text-lg text-muted-foreground pt-1">
              {service.shortDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              {/* <h2 className="text-xl font-semibold mb-2">Categories</h2> */}
              <div className="flex flex-wrap gap-2">
                {service.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              {/* <h2 className="text-xl font-semibold mb-2">Detailed Description</h2> */}
              <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {service.detailDescription}
              </p>
            </div>
          </CardContent>
          {service.sections?.length ? null : (
            <CardFooter>
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full" variant="outline">
                  View Documentation
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </CardFooter>
          )}
        </Card>

        {service.iconService && service.iconService != 'Toolkit' ? (
          <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
            <h2 className="flex justify-between items-baseline text-xl font-semibold mb-2">
              <span>Icon</span>{' '}
              <span className="text-sm font-normal italic"></span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <DownloadSvg
                id={service.iconService}
                filename={service.iconService}
                name={service.service}
                className="hidden md:flex"
                buttonText={
                  <>
                    Download SVG <Star fill="yellow" strokeWidth={1} />
                  </>
                }
              />
              <DownloadPng
                id={service.iconService}
                filename={service.iconService}
                name={service.service}
                targetSize={1024}
                buttonText="Download PNG"
              />
              <CopyPng
                id={service.iconService}
                name={service.service}
                targetSize={1024}
                className="hidden md:flex"
                buttonText="Copy PNG"
              />
            </div>
          </div>
        ) : null}

        {service.iconResources && service.iconResources.length > 0 ? (
          <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
            <h2 className="flex justify-between items-baseline text-xl font-semibold mb-2">
              <span>Resources</span>{' '}
              <span className="text-sm font-normal italic">
                (Hover over the resource to download/copy)
              </span>
            </h2>
            <ul className="flex gap-4 flex-wrap justify-center">
              {service.iconResources?.map((r) => {
                const resourceName = getResourceNameFromServiceName(r, service)
                return (
                  <li
                    key={r}
                    className="group relative flex flex-col items-center border-2 border-gray-200 p-2 rounded-lg"
                  >
                    <img
                      id={r}
                      src={`/aws/${r}.svg`}
                      alt={`${resourceName} icon`}
                      className="inline h-12 w-12 lg:h-20 lg:w-20"
                    />
                    <div className="text-xs lg:text-base">{resourceName}</div>
                    <div className="absolute inset-0 hidden group-hover:flex flex-col mx-auto w-min flex-wrap gap-1 justify-center items-center">
                      <DownloadSvg
                        id={r}
                        filename={r}
                        name={resourceName}
                        className="hidden md:flex"
                        buttonText={
                          <>
                            SVG <Star fill="yellow" strokeWidth={1} />
                          </>
                        }
                      />
                      <CopyPng
                        id={r}
                        name={resourceName}
                        targetSize={1024}
                        className="hidden md:flex"
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {service.sections && service.sections.length > 0 ? (
          <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Docs</h2>
            <ul className="mt-4 flex flex-col gap-6 flex-wrap justify-center">
              {service.sections?.map((docSection, idx) => {
                return (
                  <div key={idx}>
                    <div className="italic text-lg">{docSection.name}</div>
                    <li
                      key={docSection.name}
                      className="mt-1 flex flex-col gap-2 items-start"
                    >
                      <ul className="list-disc pl-5">
                        {docSection.items.map((item) => {
                          return (
                            <li key={item.name} className="mt-2">
                              <a
                                href={
                                  item.link?.startsWith('/')
                                    ? AWS_DOCS_URL + item.link
                                    : item.link || '#'
                                }
                                className="text-blue-500 hover:underline "
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.name || item.link}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </div>
                )
              })}
            </ul>
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-8"
            >
              <Button className="w-full" variant="outline">
                View Official Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        ) : null}

        {service.images && service.images.length > 0 ? (
          <div className="mt-8 flex flex-col gap-6">
            {service.images.map((img) => (
              <div key={img.url} className="w-full">
                <img
                  alt={img.alt}
                  className="aspect-auto object-center w-full rounded-lg"
                  src={AWS_DOCS_URL + img.url}
                />
                {img.alt ? (
                  <div className="text-center text-base text-white mt-2">
                    {img.alt}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {uniqueRelated && uniqueRelated.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Other services in the same category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueRelated.slice(0, 6).map((relatedService) => (
                <Link
                  key={relatedService.slug}
                  href={`/${relatedService.slug}`}
                  className="block"
                >
                  <Card className="h-full hover:bg-accent/50 transition-colors">
                    <CardHeader className="flex flex-row flex-wrap items-center gap-2 pt-3 pb-2">
                      <ServiceIcons
                        service={relatedService}
                        classNameWrapper="justify-start flex-shrink"
                      />
                      <CardTitle className="text-lg">
                        {relatedService.service}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="line-clamp-2 text-muted-foreground">
                        {relatedService.shortDescription}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
