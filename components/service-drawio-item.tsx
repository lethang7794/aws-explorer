import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyDrawIO } from '@/components/ui/copy-draw-io'
import { getServiceAkaText } from '@/helpers/get-service-aka-text'
import { usePrefixDisplay } from '@/hooks/use-prefix-display'
import type { Service } from '@/lib/aws-services-data'
import { getResourceNameFromServiceName } from '@/lib/get-aws-resource-name-from-service-name'
import { ServiceIcons } from './service-icons'

export function ServiceDrawIOItem({ service }: { service: Service }) {
  const prefixDisplay = usePrefixDisplay()
  const displayName =
    prefixDisplay === 'with' ? service.service : service.serviceSimpleName
  const akaText = getServiceAkaText(service)

  if (
    service.categories.some((category) =>
      ['Decision Guides', 'Partner Central'].includes(category)
    )
  ) {
    return null
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-3 pb-1 md:p-4 md:pb-2 lg:p-6 lg:pb-4 bg-gray-100">
        <CardTitle className="text-lg">
          <div className="group relative flex flex-col flex-wrap gap-1 items-center justify-between">
            <ServiceIcons service={service} size="medium" />
            <div className="flex gap-1 flex-wrap justify-center items-center w-full text-center text-sm min-[2879px]:text-xl min-[3839px]:text-2xl min-[4000px]:text-4xl text-primary">
              <div className="font-[Arial]">{displayName} </div>
              {akaText && (
                <div className="whitespace overflow-hidden truncate">
                  {akaText}
                </div>
              )}
              <Link
                href={`/${service.slug}`}
                className="h-[14px] text-blue-600 hover:text-blue-700 hover:underline"
                scroll={true}
                target="_blank"
              >
                <ExternalLink className="block self-baseline" size={14} />
              </Link>
            </div>
            <div className="absolute z-10 inset-0 bottom-6 hidden group-hover:flex flex-col mx-auto w-min flex-wrap gap-1 justify-center items-center">
              <CopyDrawIO
                id={service.iconService || ''}
                name={service.service}
                filename={service.iconService || ''}
                size={60}
                borderColor="#FF8000"
                variant="default"
                className="hidden md:flex"
                buttonText={<>draw.io</>}
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        {service.iconResources?.length ? (
          <ul className="mt-4 pb-4 flex gap-2 flex-wrap justify-center">
            {service.iconResources?.map((r) => {
              const resourceName = getResourceNameFromServiceName(r, service)
              return (
                <li
                  key={r}
                  className="group relative flex flex-col items-center border-2 border-gray-200 p-2 rounded-lg"
                >
                  <img
                    loading="lazy"
                    id={r}
                    src={`/aws/${r}.svg`}
                    alt={`${resourceName} icon`}
                    className="inline h-10 w-10 lg:h-12 lg:w-12 min-[3839px]:h-20 min-[3839px]:w-20 min-[4000px]:h-24 min-[4000px]:w-24"
                  />
                  <div className="font-normal text-xs lg:text-sm min-[2879px]:text-lg min-[3839px]:text-xl min-[4000px]:text-3xl max-w-20 text-center font-[Arial] min-w-fit">
                    {resourceName}
                  </div>
                  <div className="absolute z-10 inset-0 hidden group-hover:flex flex-col mx-auto w-min flex-wrap gap-1 justify-center items-center">
                    <CopyDrawIO
                      id={r}
                      filename={r}
                      name={resourceName}
                      size={65}
                      borderColor="#0000FF"
                      variant="default"
                      className="hidden md:flex"
                      buttonText={<>draw.io</>}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
