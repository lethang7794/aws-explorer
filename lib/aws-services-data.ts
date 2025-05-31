import awsServices from '../data/aws-services.json'
import awsIcons from '../data/aws-icons.json'
import { serviceNameToIcon } from '@/scripts/service-names'

export interface Service {
  id?: string
  slug?: string
  service: string
  serviceSimpleName?: string
  shortDescription: string
  url: string
  categories: string[]
  detailDescription: string
  iconService?: string
  iconServices?: string[]
  iconResources?: string[]
}

interface AwsIcon {
  service?: string
  type: string
  categories: string[]
  name: string
  names?: string[]
  nameWithPrefix: string
  resources?: string[]
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function simplifyServiceName(service: string): string {
  return service
    .replace(/AWS /g, '')
    .replace(/AWS\n/g, '')
    .replace(/Amazon /g, '')
    .trim()
}

const awsIconsByName: Record<string, AwsIcon> = awsIcons.data.reduce(
  (acc, s) => {
    if (s.service) {
      acc[s.service] = s
    }
    return acc
  },
  {} as Record<string, AwsIcon>
)

export const awsServicesData: Service[] = awsServices
  .map((s) => {
    const icon = awsIconsByName[s.service]
    console.log(
      'Processing service:',
      s.service,
      'Icon:',
      icon ? icon.name : 'None'
    )
    return {
      ...s,
      serviceSimpleName: simplifyServiceName(s.service).trim(),
      slug: generateSlug(s.service),
      iconService:
        icon?.name ||
        ((typeof serviceNameToIcon[s.service] === 'string'
          ? serviceNameToIcon[s.service]
          : undefined) as string) ||
        undefined,
      iconServices: Array.isArray(serviceNameToIcon[s.service])
        ? (serviceNameToIcon[s.service] as string[])
        : undefined,
      iconResources: icon ? icon.resources || [] : undefined,
    }
  })
  .sort((a, b) => a.serviceSimpleName.localeCompare(b.serviceSimpleName))

function getAllCategories(services: Service[]) {
  const categoriesSet = new Set<string>()
  services.forEach((service) => {
    service.categories.forEach((category) => categoriesSet.add(category))
  })
  return Array.from(categoriesSet).sort()
}

export const awsServiceCategories = getAllCategories(awsServicesData)

export const getServiceBySlug = (slug: string): Service | undefined => {
  return awsServicesData.find((service) => service.slug === slug)
}
