import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getServiceAkaText } from '@/helpers/get-service-aka-text'
import { getServiceImageUrl } from '@/helpers/get-service-image-url'
import { usePrefixDisplay } from '@/hooks/use-prefix-display'
import type { Service } from '@/lib/aws-services-data'
import { ServiceIcons } from './service-icons'

export function ServiceCardItem({ service }: { service: Service }) {
  const prefixDisplay = usePrefixDisplay()

  const displayName =
    prefixDisplay === 'with' ? service.service : service.serviceSimpleName

  const akaText = getServiceAkaText(service)

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
            <ServiceIcons
              service={service}
              classNameWrapper="justify-start !flex-shrink"
              size="medium"
            />
            <div className="flex-1 min-w-48">
              {displayName}
              <p className="whitespace-pre overflow-hidden truncate">
                {akaText}
              </p>
            </div>
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
        {service.images && service.images.length > 0
          ? service.images.slice(0, 3).map((img) => (
              <div key={img.url} className="mt-4 w-full">
                <img
                  loading="lazy"
                  className="aspect-auto object-center w-full max-w-2xl rounded-lg"
                  src={getServiceImageUrl(img)}
                  alt={img.alt}
                />
              </div>
            ))
          : null}
      </CardContent>
    </Card>
  )
}
