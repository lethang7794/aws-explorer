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
  iconName: string
  iconNameWithPrefix?: string
  component?: string
  importComponent?: string
  resources?: string[]
}
main()

async function main() {
  const files: RecursiveDirectory = (await recursiveDirectory(
    AWS_ICONS_EXTRACT_PATH,
    true
  )) as RecursiveDirectory

  const items: Icon[] = []

  files.forEach((file) => {
    let processedFilename = ''
    let service = ''
    let type = ''
    let component = ''
    let importComponent = ''
    let categories: string[] = []
    let obj: Icon
    let prefix = ''

    const { fullpath, filename } = file

    // processedFilename = removeSpecialCharacters(
    //   `${filename
    //     .replace(/([A-Z]+)(?=[A-Z][a-z0-9])/g, (match) =>
    //       match.length > 1 ? match.charAt(0) + match.slice(1) + ' ' : match
    //     )
    //     .replace(/([a-z])([A-Z])/g, '$1 $2')
    //     .replace('.svg', '')
    //     .replace('32', '')
    //     .replaceAll('Io T', 'IoT ')
    //     .replace('AP Is', 'APIs')
    //     .replace('HTTP 2', 'HTTP2 ')
    //     .replace('S3', 'S3 ')
    //     .replace('FSxfor', 'FSx for')
    //     .replace('RA 3', 'RA3')
    //     .replace('EC2', 'EC2 ')
    //     .replace('Lo Ra WAN', 'LoRaWAN')
    //     .replace('Siteto', 'Site to')
    //     .trim()}`
    // )
    processedFilename = filename.replace('.svg', '')

    // component = removeSpecialCharacters(
    //   `${prefix}${filename.replace('.svg', '')}`
    // )

    // // TODO: update path to match the new import structure
    // importComponent = `import ${component} from 'aws-react-icons/icons/${component}';`

    if (fullpath.includes('Architecture-Group-Icons')) {
      prefix = 'ArchitectureGroup_'
      type = 'Architecture Group'
    } else if (fullpath.includes('Architecture-Service-Icons')) {
      type = 'Architecture Service'
      prefix = ''
      service = convertFilenameToServiceName(filename)
    } else if (fullpath.includes('Category-Icons')) {
      type = 'Category'
      prefix = 'Category_'
    } else if (fullpath.includes('Resource-Icons')) {
      type = 'Resource'
      prefix = ''
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
      categories.push(`${processedFilename}`)
    }

    // if (
    //   component.toLowerCase().includes('DatabaseMigrationService'.toLowerCase())
    // ) {
    //   categories.push('DMS')
    // }

    obj = {
      service: service || undefined,
      // serviceAlternativeName: serviceNames[service] || undefined,
      type: type,
      categories: categories,
      iconName: [prefix, processedFilename.trim()].filter(Boolean).join(''),
      // iconNameWithPrefix: `${prefix}${processedFilename}`,
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
}

function removeSpecialCharacters(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '')
}

function convertFilenameToServiceName(filename: string) {
  const processedServiceName = filename
    .replace(/\.[^/.]+$/, '') // Remove the extension
    .replaceAll('-', ' ')

  // if (ICON_FILENAME_TO_SERVICE[processedServiceName]) {
  //   return ICON_FILENAME_TO_SERVICE[processedServiceName]
  // }

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
          if (icon.iconName === 'AmazonSageMakerAI') {
            return resource.iconName.startsWith('AmazonSageMaker')
          }
          if (icon.iconName === 'AmazonVirtualPrivateCloud') {
            return resource.iconName.startsWith('AmazonVPC')
          }
          if (icon.iconName === 'AWSIdentityandAccessManagement') {
            return resource.iconName.startsWith('AWSIdentityAccessManagement')
          }
          if (icon.iconName === 'AmazonEFS') {
            return resource.iconName.startsWith('AmazonElasticFileSystem')
          }
          return resource.iconName.startsWith(icon.iconName)
        })
        .map((resource) => resource.iconName)
      return {
        ...icon,
        resources: matchedResources.length ? matchedResources : undefined,
      }
    }
    return icon
  })
}
