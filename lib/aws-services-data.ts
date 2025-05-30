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

export const getServiceBySlug = (slug: string): Service | undefined => {
  return awsServicesData.find((service) => service.slug === slug);
};
