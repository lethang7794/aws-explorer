import ServicesList from '@/components/services-list'
import { Footer } from '@/components/footer'
import { awsServicesData } from '@/lib/aws-services-data' // Import from centralized data file

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground gradient">
      <ServicesList services={awsServicesData} />
      <Footer />
    </main>
  )
}
