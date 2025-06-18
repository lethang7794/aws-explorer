import AWS_ICONS from '@/data/aws-icons.json'
import { SERVICE_TO_ICON_FILENAME } from '@/data/aws-service-icon-mapping'
import AWS_SERVICES from '@/data/aws-services.json'
import { ServiceCrawl } from '@/scripts/aws-services-docs-crawler'

export interface Service extends ServiceCrawl {
  id?: string
  slug?: string
  serviceSimpleName?: string
  iconService?: string
  iconServices?: string[]
  iconResources?: string[]
  alsoKnownAs?: string[]
}

interface ServiceWithRelated extends Service {
  othersInCategory: Service[]
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
  iconName: string
  iconNames?: string[]
  iconNameWithPrefix?: string
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
    .trim()
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
      icon?.iconName ||
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
        icon: getCategoryIcon(c),
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

export const getServiceBySlug = (
  slug: string
): ServiceWithRelated | undefined => {
  const service = awsServicesData.find((service) => service.slug === slug)
  if (!service) return undefined
  return {
    ...service,
    othersInCategory: awsServicesData.filter((s) =>
      s.categories.includes(service.categories[0])
    ),
  }
}

function getCategoryIcon(c: string): string {
  const CATEGORY_TO_ICON = {
    'AWS Management Console': 'AWS-Management-Console',
    Analytics: 'Category_Analytics',
    'Application Integration': 'Category_Application-Integration',
    Blockchain: 'Category_Blockchain',
    'Business Applications': 'Category_Business-Applications',
    'Cloud Financial Management': 'Category_Cloud-Financial-Management',
    Compute: 'Category_Compute',
    'Compute HPC': 'Category_Compute',
    Containers: 'Category_Containers',
    'Cryptography & PKI': 'Category_Security-Identity-Compliance',
    'Customer Enablement Services': 'Category_Customer-Enablement',
    Database: 'Category_Database',
    'Decision Guides': 'GeneralResource',
    'Developer Tools': 'Category_Developer-Tools',
    'End User Computing': 'Category_End-User-Computing',
    'Front-End Web & Mobile': 'Category_Front-End-Web-Mobile',
    'Game Development': 'Category_Games',
    'General Reference': 'GeneralResource',
    'Internet of Things (IoT)': 'Category_Internet-of-Things',
    'Machine Learning': 'Category_Artificial-Intelligence',
    'Management & Governance': 'Category_Management-Governance',
    Marketplace: 'AWS-Marketplace',
    'Media Services': 'Category_Media-Services',
    'Migration & Transfer': 'Category_Migration-Modernization',
    'Networking & Content Delivery': 'Category_Networking-Content-Delivery',
    'Partner Central': 'GeneralResource',
    'Quantum Computing': 'Category_Quantum-Technologies',
    Robotics: 'Category_Robotics',
    Satellite: 'Category_Satellite',
    'Security, Identity, & Compliance': 'Category_Security-Identity-Compliance',
    Serverless: 'Category_Serverless',
    Storage: 'Category_Storage',
  } as Record<string, string>
  if (CATEGORY_TO_ICON[c]) {
    return CATEGORY_TO_ICON[c]
  }
  return `Category_${c.replaceAll(' & ', '-').replaceAll(' ', '-').replaceAll(',', '')}`
}
