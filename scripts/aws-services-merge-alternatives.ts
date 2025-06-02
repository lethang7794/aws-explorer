import fs from 'fs/promises'
import path from 'path'

interface Alternative {
  name: string
  description: string
}

interface AlternativeMap {
  [key: string]: Alternative[]
}

interface AkaMap {
  [key: string]: string[]
}

async function mergeAlternatives() {
  try {
    // Read the main services file
    const servicesPath = path.join(__dirname, '../data/aws-services.json')
    const servicesData = await fs.readFile(servicesPath, 'utf-8')
    const services = JSON.parse(servicesData)

    // Read the alternatives file
    const alternativesPath = path.join(
      __dirname,
      '../data/aws-services-alternatives.json'
    )
    const alternativesData = await fs.readFile(alternativesPath, 'utf-8')
    const alternatives: AlternativeMap = JSON.parse(alternativesData)

    // Read the AKA names file
    const akaPath = path.join(__dirname, '../data/aws-services-aka.json')
    const akaData = await fs.readFile(akaPath, 'utf-8')
    const akaNames: AkaMap = JSON.parse(akaData).data

    // Add alternatives and AKA names to each service
    services.forEach((service: any) => {
      const serviceName = service.service

      // Add alternatives
      const alternativeServices = alternatives[serviceName]
      if (alternativeServices && alternativeServices.length > 0) {
        service.alternatives = alternativeServices
      }

      const akaList = akaNames[serviceName]
      // Add AKA names
      if (akaList && akaList.length > 0) {
        service.alsoKnownAs = akaList
      }
    })

    // Write the updated services back to file
    await fs.writeFile(servicesPath, JSON.stringify(services, null, 2))
    console.log('Successfully merged alternatives into services data')
  } catch (error) {
    console.error('Error merging alternatives:', error)
    throw error
  }
}

mergeAlternatives().catch(console.error)
