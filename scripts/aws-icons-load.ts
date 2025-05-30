import fs from 'fs'
import path from 'path'
import { RecursiveDirectory, recursiveDirectory } from 'recursive-directory'
import { serviceNames } from './service-names'
import {
  AWS_ICONS_DATA_PATH,
  AWS_ICONS_EXTRACT_PATH,
} from '@/constants/aws-icons-etl'

type Data = {
  service: string
  type: string
  name: string
  component: string
  importComponent?: string
  categories: string[]
}

//
;(async () => {
  const files: RecursiveDirectory = (await recursiveDirectory(
    AWS_ICONS_EXTRACT_PATH,
    true
  )) as RecursiveDirectory

  const data: Data[] = []

  files.forEach((file) => {
    let name = ''
    let service = ''
    let type = ''
    let component = ''
    let importComponent = ''
    let categories: string[] = []
    let obj: Data
    let prefix = ''

    const { fullpath, filename } = file

    if (fullpath.includes('Architecture-Group-Icons')) {
      prefix = 'ArchitectureGroup'
    } else if (fullpath.includes('Architecture-Service-Icons')) {
      prefix = 'ArchitectureService'
      console.log(
        `Processing Architecture Service Icon: ${filename} (${fullpath})`
      )
      service = convertFilenameToServiceName(filename)
    } else if (fullpath.includes('Category-Icons')) {
      prefix = 'Category'
    } else if (fullpath.includes('Resource-Icons')) {
      prefix = 'Resource'
    }

    name = removeSpecialCharacters(
      `${prefix} ${filename
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
        .trim()}`
    )

    component = removeSpecialCharacters(
      `${prefix}${filename.replace('.svg', '')}`
    )

    // TODO: update path to match the new import structure
    importComponent = `import ${component} from 'aws-react-icons/icons/${component}';`

    if (fullpath.includes('Architecture-Group-Icons')) {
      prefix = 'Architecture Group'
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
      service: service,
      type: type,
      categories: categories,
      name: name,
      component: component,
      // importComponent: importComponent,
    }

    categories = []

    data.push(obj)
  })

  data.sort((a, b) => a?.categories[1]?.localeCompare(b.categories[1]))

  data.sort((a, b) => a?.categories[0]?.localeCompare(b.categories[0]))

  fs.writeFileSync(
    path.resolve(process.cwd(), AWS_ICONS_DATA_PATH),
    JSON.stringify(
      {
        data,
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
  // Remove the extension
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '')

  if (serviceNames[nameWithoutExtension]) {
    return serviceNames[nameWithoutExtension]
  }

  return nameWithoutExtension
}
