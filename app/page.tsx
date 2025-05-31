import AwsServicesList from '@/components/aws-services-list'
import { awsServicesData } from '@/lib/aws-services-data' // Import from centralized data file

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground gradient">
      <AwsServicesList services={awsServicesData} />
    </main>
  )
}
