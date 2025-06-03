import { type Service } from '@/lib/aws-services-data'

export function getServiceAkaText(service: Service) {
  const aka = service.alsoKnownAs?.[0]
  const akaText =
    (aka && aka?.length === 3) ||
    (aka && service.serviceSimpleName && service.serviceSimpleName?.length <= 4)
      ? `(${aka})`
      : ''
  return akaText
}
