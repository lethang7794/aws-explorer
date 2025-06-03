import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { type Service } from '@/lib/aws-services-data'
import { getResourceNameFromServiceName } from '@/lib/get-aws-resource-name-from-service-name'
import { getServiceAkaText } from '@/helpers/get-service-aka-text'
import { ServiceIcons } from './service-icons'

export function ServiceIconItem({ service }: { service: Service }) {
  const akaText = getServiceAkaText(service)

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
            <div className="w-full text-center text-sm text-primary">
              <div>{service.service}</div>
              {akaText && (
                <div className="whitespace overflow-hidden truncate">
                  {akaText}
                </div>
              )}
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
