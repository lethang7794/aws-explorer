import AWS_SERVICES from '@/data/aws-services.json'
import AWS_ICONS from '@/data/aws-icons.json'
import { SERVICE_TO_ICON_FILENAME } from '@/data/aws-service-icon-mapping'
import { AWS_CATEGORY_TO_ICON } from '@/data/aws-icon-from-category'
import { ServiceCrawl } from '@/scripts/aws-services-docs-crawler'

export interface Service extends ServiceCrawl {
  id?: string
  slug?: string
  serviceSimpleName?: string
  iconService?: string
  iconServices?: string[]
  iconResources?: string[]
}

export interface ServiceCategory {
  name: string
  icon?: string
  slug: string
  services: Service[]
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
  return service.trim()
    .replace(/^AWS /, '')
    .replace(/^AWS\n/, '')
    .replace(/^Amazon /, '')
    .replace(/or AWS /g, 'or ')
    .replace(/or Amazon /g, 'or ')
    .trim()
}

const awsIconsByName: Record<string, AwsIcon> = AWS_ICONS.data.reduce(
  (acc, s) => {
    if (s.service) {
      acc[s.service] = s
    }
    return acc
  },
  {} as Record<string, AwsIcon>
)

export const awsServicesData: Service[] = AWS_SERVICES.map((s) => {
  let icon = awsIconsByName[s.service]

  if (s.service === 'Amazon VPC') {
    icon = awsIconsByName['Amazon Virtual Private Cloud']
  }
  if (s.service === 'Amazon Elastic File System') {
    icon = awsIconsByName['Amazon EFS']
  }

  const simpleName = simplifyServiceName(s.service).trim()

  return {
    ...s,
    serviceSimpleName: simpleName,
    slug: generateSlug(simpleName),
    iconService:
      icon?.name ||
      ((typeof SERVICE_TO_ICON_FILENAME[s.service] === 'string'
        ? SERVICE_TO_ICON_FILENAME[s.service]
        : undefined) as string) ||
      undefined,
    iconServices: Array.isArray(SERVICE_TO_ICON_FILENAME[s.service])
      ? (SERVICE_TO_ICON_FILENAME[s.service] as string[])
      : undefined,
    iconResources: icon ? icon.resources || [] : undefined,
  }
}).sort((a, b) => a.serviceSimpleName.localeCompare(b.serviceSimpleName))

function getAllCategories(services: Service[]): ServiceCategory[] {
  const categoriesSet = new Set<string>()
  services.forEach((service) => {
    service.categories.forEach((category) => categoriesSet.add(category))
  })
  return Array.from(categoriesSet)
    .sort()
    .map((c) => {
      return {
        name: c,
        slug: generateSlug(c),
        services: services.filter((service) => service.categories.includes(c)),
        icon: AWS_CATEGORY_TO_ICON[c] || undefined,
      }
    })
}

export const awsServiceCategories = getAllCategories(awsServicesData)

export const awsServiceCountByCategory = awsServiceCategories.reduce(
  (acc, { name: category }) => {
    const count = awsServicesData.filter((service) =>
      service.categories.includes(category)
    ).length
    return { ...acc, [category]: count }
  },
  {} as Record<string, number>
)

export const getServiceBySlug = (slug: string): Service | undefined => {
  return awsServicesData.find((service) => service.slug === slug)
}
