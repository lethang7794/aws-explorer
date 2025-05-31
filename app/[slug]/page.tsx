import {
  awsServicesData,
  getServiceBySlug,
  Service,
} from '@/lib/aws-services-data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/footer'
import { pascalToSentenceAWS, pascalToTitleCase } from '@/lib/text'

interface ServiceDetailPageProps {
  params: {
    slug: string
  }
}

// This function can be used by Next.js to generate static pages at build time
export async function generateStaticParams() {
  return awsServicesData.map((service) => ({
    slug: service.slug,
  }))
}

// Add this function for metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const service = getServiceBySlug((await params).slug)
  if (!service) return {}

  return {
    title: service.service,
    description: service.shortDescription,
    icons: {
      icon: service.iconService
        ? `/aws/${service.iconService}.svg`
        : service.iconServices?.[0]
          ? `/aws/${service.iconServices[0]}.svg`
          : undefined,
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const service = getServiceBySlug((await params).slug)
  console.log('🚀 ~ service:', service)

  if (!service) {
    notFound() // Triggers the not-found page
  }

  return (
    <div className="bg-background text-foreground gradient">
      <div className="min-h-screen container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap gap-2 items-center text-3xl md:text-4xl">
              {service.iconService ? (
                <img
                  src={`/aws/${service.iconService}.svg`}
                  className="h-20 w-20 md:h-24 md:w-24"
                  alt={`${service.iconService} icon`}
                />
              ) : null}
              {service.iconServices ? (
                <div className="flex flex-wrap gap-2">
                  {service.iconServices.map((icon) => (
                    <img
                      key={icon}
                      alt={`${icon} icon`}
                      src={`/aws/${icon}.svg`}
                      className="h-20 w-20 md:h-24 md:w-24"
                    />
                  ))}
                </div>
              ) : null}
              <div>{service.service}</div>
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-1">
              {service.shortDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              {/* <h2 className="text-xl font-semibold mb-2">Categories</h2> */}
              <div className="flex flex-wrap gap-2">
                {service.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              {/* <h2 className="text-xl font-semibold mb-2">Detailed Description</h2> */}
              <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {service.detailDescription}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full" variant="outline">
                View Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </CardFooter>
        </Card>
        {service.iconResources && service.iconResources.length > 0 ? (
          <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Resources:</h2>
            <ul className="flex gap-8 flex-wrap justify-center">
              {service.iconResources?.map((r) => {
                const resourceName = getResourceNameFromServiceName(r, service)

                return (
                  <li
                    key={r}
                    className="flex flex-col items-center border-2 border-gray-200 p-4 rounded-lg"
                  >
                    <img
                      src={`/aws/${r}.svg`}
                      alt={`${resourceName} icon`}
                      className="inline h-24 w-24"
                    />
                    {resourceName}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  )
}

function getResourceNameFromServiceName(
  resource: string,
  service: Service
): string {
  let resourceWithoutPrefix = resource.replace(service.iconService || '', '')
  //
  // Special cases:
  //
  // - SageMaker AI
  if (service.iconService === 'AmazonSageMakerAI') {
    resourceWithoutPrefix = resource.replace('AmazonSageMaker', '')
  }
  // - VPC
  if (service.iconService === 'AmazonVirtualPrivateCloud') {
    resourceWithoutPrefix = resource.replace('AmazonVPC', '')
  }
  // - IAM
  if (service.iconService === 'AWSIdentityandAccessManagement') {
    resourceWithoutPrefix = resource.replace('AWSIdentityAccessManagement', '')
  }
  // - EFS
  if (service.iconService === 'AmazonEFS') {
    resourceWithoutPrefix = resource.replace('AmazonElasticFileSystem', '')
  }

  return pascalToTitleCase(resourceWithoutPrefix)
    .replace('A W S', 'AWS')
    .replace('H D F S', 'HDFS')
    .replace('E M R', 'EMR')
    .replace('Open Search', 'OpenSearch')
    .replace('Gluefor ', 'Glue for ')
    .replace('R A3', 'RA3')
    .replace('Editorv20', 'Editor v2.0')
    .replace('M L', 'ML')
    .replace('H T T P', 'HTTP')
    .replace('A M I', 'AMI')
    .replace('for N E T', 'for .NET')
    .replace('D B', 'DB')
    .replace('I P', 'IP')
    .replace('Instancewith', 'Instance with')
    .replace('Cloud Watch', 'CloudWatch')
    .replace(/Container([123])/, 'Container $1')
    .replace('Copi Io T C L I', 'Copilot CLI')
    .replace('E C S ', 'ECS ')
    .replace('Dynamo DB', 'DynamoDB')
    .replace('Globalsecondaryindex', 'Global Secondary Index')
    .replace('Infrequent Access', 'Infrequent-Access')
    .replace('Postgre S Q L', 'PostgreSQL')
    .replace('A Z', 'AZ')
    .replace('Elasti Cachefor ', 'ElastiCache for ')
    .replace('Crossaccount', 'Cross-account')
    .replace('R U M', 'RUM')
    .replace('Ops Center', 'OpsCenter')
    .replace('A S2', 'AS2')
    .replace('F T P S', 'FTPS')
    .replace('S F T P', 'SFTP')
    .replace('AWSFTP', 'AWS FTP')
    .replace('F Sx', 'FSx')
    .replace('D N S', 'DNS')
    .replace('V P C ', 'VPC ')
    .replace('I A', 'IA')
    .replace('Directorybucket', 'Directory bucket')
    .replace('N A T', 'NAT')
    .replace('V P N', 'VPN')
    .replace('Virtualprivatecloud V P C', 'Virtual private cloud (VPC)')
    .replace('Q P U', 'QPU')
    .replace(/Simulator([1234])/, 'Simulator $1')
    .replace('R O S', 'ROS')
    .replace('A D', 'AD')
    .replace('S T S', 'STS')
    .replace('IA M ', 'IAM ')
    .replace('M F A', 'MFA')
    .replace('Volumegp3', 'Volume gp3')
    .replace('E F S ', 'EFS ')
    .replace('Backupfor A W S', 'Backup for AWS')
    .replace(
      'AWS Backupsupportfor Amazon FSxfor Net App O N T A P',
      'AWS Backup support for Amazon FSx for NetApp ONTAP'
    )
    .replace('AWS Backupsupportfor ', 'AWS Backup support for ')
    .replace('V Mware', 'VMware')
    .replace('', '')
}
