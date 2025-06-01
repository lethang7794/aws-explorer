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
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/footer'
import { getResourceNameFromServiceName } from '@/lib/get-aws-resource-name-from-service-name'
import { AWS_DOCS_URL } from '@/constants/aws-docs'

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
            <CardTitle className="flex flex-wrap gap-2 items-center text-3xl md:text-4xl">
              {service.iconService ? (
                <img
                  src={`/aws/${service.iconService}.svg`}
                  className="h-20 w-20 md:h-24 md:w-24"
                  alt={`${service.iconService} icon`}
                />
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
              <div>{service.service}</div>
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
        {service.iconResources && service.iconResources.length > 0 ? (
          <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Resources</h2>
            <ul className="flex gap-4 flex-wrap justify-center">
              {service.iconResources?.map((r) => {
                const resourceName = getResourceNameFromServiceName(r, service)
                return (
                  <li
                    key={r}
                    className="flex flex-col items-center border-2 border-gray-200 p-2 rounded-lg"
                  >
                    <img
                      src={`/aws/${r}.svg`}
                      alt={`${resourceName} icon`}
                      className="inline h-20 w-20"
                    />
                    {resourceName}
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
      </div>
      <Footer />
    </div>
  )
}
