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

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const service = getServiceBySlug((await params).slug)

  if (!service) {
    notFound() // Triggers the not-found page
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 text-3xl md:text-4xl">
            {service.iconService ? (
              <img
                src={`/aws/${service.iconService}.svg`}
                className="h-9 w-9 md:h-10 md:w-10"
              />
            ) : null}
            {service.iconServices ? (
              <div className="flex gap-2">
                {service.iconServices.map((icon) => (
                  <img
                    key={icon}
                    src={`/aws/${icon}.svg`}
                    className="h-9 w-9 md:h-10 md:w-10"
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
        <CardFooter>
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full">
              View Official Documentation{' '}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}
