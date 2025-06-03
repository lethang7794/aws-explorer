import { AWS_DOCS_URL } from '@/constants/aws-docs'

export function getServiceImageUrl(img: { url: string; alt?: string }): string {
  return AWS_DOCS_URL + img.url
}
