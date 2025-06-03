import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { type Service } from '@/lib/aws-services-data'
import { usePrefixDisplay } from '@/hooks/use-prefix-display'
import { getServiceAkaText } from '@/helpers/get-service-aka-text'
import { ServiceIcons } from './service-icons'
import { getServiceImageUrl } from '@/helpers/get-service-image-url'

export function ServiceListItem({ service }: { service: Service }) {
  const prefixDisplay = usePrefixDisplay()
  const displayName =
    prefixDisplay === 'with' ? service.service : service.serviceSimpleName
  const akaText = getServiceAkaText(service)

  return (
    <Card className="p-0">
      <Link href={`/${service.slug}`} passHref scroll={true} target="_blank">
        <div className="flex justify-between p-4 cursor-pointer hover:bg-accent transition-colors rounded">
          <div className="flex-grow mr-2">
            <h3>
              <span className="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                {displayName}
                {akaText && ' '}
                {akaText}{' '}
              </span>
              <span className="italic text-lg mt-1">
                {service.shortDescription}
              </span>
            </h3>
            <div className="mt-2 space-x-1 space-y-1">
              {service.categories.map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {service.detailDescription}
            </p>
          </div>
          <ServiceIcons service={service} classNameWrapper='justify-end' />
        </div>
        {service.images && service.images.length > 0 ? (
          <div className="flex flex-col gap-4 items-center justify-center px-4 pb-4">
            {service.images.slice(0, 3).map((img) => (
              <img
                key={img.url}
                alt={img.alt}
                className="aspect-auto object-center w-full max-w-2xl rounded-md"
                src={getServiceImageUrl(img)}
              />
            ))}
          </div>
        ) : null}
      </Link>
    </Card>
  )
}
