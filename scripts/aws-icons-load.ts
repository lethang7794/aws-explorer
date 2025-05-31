import fs from 'fs'
import path from 'path'
import { RecursiveDirectory, recursiveDirectory } from 'recursive-directory'
import { ICON_FILENAME_TO_SERVICE } from '../data/aws-service-icon-mapping'
import {
  AWS_ICONS_DATA_PATH,
  AWS_ICONS_EXTRACT_PATH,
} from '@/constants/aws-icons-etl'

type Icon = {
  service?: string
  type: string
  categories: string[]
  name: string
  nameWithPrefix: string
  component?: string
  importComponent?: string
  resources?: string[]
}

//
;(async () => {
  const files: RecursiveDirectory = (await recursiveDirectory(
    AWS_ICONS_EXTRACT_PATH,
    true
  )) as RecursiveDirectory

  const items: Icon[] = []

  files.forEach((file) => {
    let name = ''
    let service = ''
    let type = ''
    let component = ''
    let importComponent = ''
    let categories: string[] = []
    let obj: Icon
    let prefix = ''

    const { fullpath, filename } = file

    if (fullpath.includes('Architecture-Group-Icons')) {
      prefix = 'ArchitectureGroup'
    } else if (fullpath.includes('Architecture-Service-Icons')) {
      prefix = 'ArchitectureService'
      service = convertFilenameToServiceName(filename)
    } else if (fullpath.includes('Category-Icons')) {
      prefix = 'Category'
    } else if (fullpath.includes('Resource-Icons')) {
      prefix = 'Resource'
    }

    name = removeSpecialCharacters(
      `${filename
        .replace(/([A-Z]+)(?=[A-Z][a-z0-9])/g, (match) =>
          match.length > 1 ? match.charAt(0) + match.slice(1) + ' ' : match
        )
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace('.svg', '')
        .replace('32', '')
        .replaceAll('Io T', 'IoT ')
        .replace('AP Is', 'APIs')
        .replace('HTTP 2', 'HTTP2 ')
        .replace('S3', 'S3 ')
        .replace('FSxfor', 'FSx for')
        .replace('RA 3', 'RA3')
        .replace('EC2', 'EC2 ')
        .replace('Lo Ra WAN', 'LoRaWAN')
        .replace('Siteto', 'Site to')
        .trim()}`
    )

    component = removeSpecialCharacters(
      `${prefix}${filename.replace('.svg', '')}`
    )

    // TODO: update path to match the new import structure
    importComponent = `import ${component} from 'aws-react-icons/icons/${component}';`

    if (fullpath.includes('Architecture-Group-Icons')) {
      prefix = 'ArchitectureGroup-'
      type = 'Architecture Group'
    } else if (fullpath.includes('Architecture-Service-Icons')) {
      type = 'Architecture Service'
    } else if (fullpath.includes('Category-Icons')) {
      type = 'Category'
    } else if (fullpath.includes('Resource-Icons')) {
      type = 'Resource'
    }

    if (fullpath.includes('Arch_')) {
      categories.push(
        fullpath.split('Arch_')[1].split('/')[0].replace(/-/g, ' ').trim()
      )
      if (
        fullpath.split('Arch_')[1].split('/')[0].replace(/-/g, ' ').trim() ===
        'Internet of Things'
      ) {
        categories.push('IoT')
      }
    } else if (fullpath.includes('Res_')) {
      categories.push(
        fullpath.split('Res_')[1].split('/')[0].replace(/-/g, ' ').trim()
      )
    } else if (fullpath.includes('Arch-')) {
      categories.push(`${name}`)
    }

    if (
      component.toLowerCase().includes('DatabaseMigrationService'.toLowerCase())
    ) {
      categories.push('DMS')
    }

    obj = {
      service: service || undefined,
      // serviceAlternativeName: serviceNames[service] || undefined,
      type: type,
      categories: categories,
      name: name.trim(),
      nameWithPrefix: `${prefix}${name}`,
      // component: component,
      // importComponent: importComponent,
    }

    categories = []

    items.push(obj)
  })

  items.sort((a, b) => a?.categories[1]?.localeCompare(b.categories[1]))

  items.sort((a, b) => a?.categories[0]?.localeCompare(b.categories[0]))

  const itemsWithResources = groupResourcesOfService(items)

  fs.writeFileSync(
    path.resolve(process.cwd(), AWS_ICONS_DATA_PATH),
    JSON.stringify(
      {
        data: itemsWithResources,
      },
      null,
      2
    )
  )
})()

function removeSpecialCharacters(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '')
}

function convertFilenameToServiceName(filename: string) {
  const processedServiceName = filename.replace(/\.[^/.]+$/, '') // Remove the extension

  if (ICON_FILENAME_TO_SERVICE[processedServiceName]) {
    return ICON_FILENAME_TO_SERVICE[processedServiceName]
  }

  return processedServiceName
}

function groupResourcesOfService(data: Icon[]): Icon[] {
  const resources = data.filter((item) => item.type === 'Resource')

  return data.map((icon) => {
    if (icon.type === 'Architecture Service') {
      const matchedResources = resources
        .filter((resource) => {
          //
          // Special cases:
          //
          // - SageMaker AI
          if (icon.name === 'AmazonSageMakerAI') {
            return resource.name.startsWith('AmazonSageMaker')
          }
          if (icon.name === 'AmazonVirtualPrivateCloud') {
            return resource.name.startsWith('AmazonVPC')
          }
          if (icon.name === 'AWSIdentityandAccessManagement') {
            return resource.name.startsWith('AWSIdentityAccessManagement')
          }
          if (icon.name === 'AmazonEFS') {
            return resource.name.startsWith('AmazonElasticFileSystem')
          }
          return resource.name.startsWith(icon.name)
        })
        .map((resource) => resource.name)
      return {
        ...icon,
        resources: matchedResources.length ? matchedResources : undefined,
      }
    }
    return icon
  })
}
