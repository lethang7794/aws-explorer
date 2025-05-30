import awsServices from "../data/aws-services.json";

export interface Service {
  id?: string;
  slug: string;
  service: string;
  shortDescription: string;
  url: string;
  categories: string[];
  detailDescription: string;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

export const awsServicesData: Service[] = awsServices.map((service) => ({
  ...service,
  slug: generateSlug(service.service),
}));

function getAllCategories(services: Service[]) {
  const categoriesSet = new Set<string>();
  services.forEach((service) => {
    service.categories.forEach((category) => categoriesSet.add(category));
  });
  return Array.from(categoriesSet).sort();
}

export const awsServiceCategories = getAllCategories(awsServicesData);

export const getServiceBySlug = (slug: string): Service | undefined => {
  return awsServicesData.find((service) => service.slug === slug);
};
