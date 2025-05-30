import awsServices from '../data/aws-services.json'

export interface Service {
  id?: string
  slug?: string
  service: string
  serviceSimpleName?: string
  shortDescription: string
  url: string
  categories: string[]
  detailDescription: string
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

export const awsServicesData: Service[] = awsServices
  .map((s) => ({
    ...s,
    serviceSimpleName: simplifyServiceName(s.service).trim(),
    slug: generateSlug(s.service),
  }))
  .sort((a, b) => a.serviceSimpleName.localeCompare(b.serviceSimpleName))
// console.log('AWS Services Data:', awsServicesData)

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
