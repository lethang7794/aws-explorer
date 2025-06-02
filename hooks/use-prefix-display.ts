import { useContext } from 'react'
import { AwsServicesFilterContext } from '@/contexts/aws-services-filter-context'

export function usePrefixDisplay() {
  const context = useContext(AwsServicesFilterContext)
  if (!context) {
    throw new Error('usePrefixDisplay must be used within AwsServicesFilterProvider')
  }
  return context.prefixDisplay
}
