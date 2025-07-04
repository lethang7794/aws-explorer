import {
  AWS_ICONS_EXTRACT_PATH,
  AWS_ICONS_TRANSFORM_PATH,
} from '@/constants/aws-icons-etl'
import fs from 'fs'
import path from 'path'

async function deleteDirectories(mainDir: string): Promise<void> {
  const dirEntries = await fs.promises.readdir(mainDir, {
    withFileTypes: true,
  })

  for (const entry of dirEntries) {
    const dirPath = path.join(mainDir, entry.name)

    if (entry.isDirectory()) {
      if (
        entry.name.includes('_16') ||
        entry.name.includes('16') ||
        entry.name.includes('_32') ||
        entry.name.includes('32') ||
        entry.name.includes('_64') ||
        entry.name.includes('64') ||
        entry.name.includes('_48_Dark')
      ) {
        await fs.promises.rmdir(dirPath, { recursive: true })
        console.info(`Deleted directory: ${dirPath}`)
      } else {
        await deleteDirectories(dirPath)
      }
    }
  }
}

async function deleteNonSvgFiles(mainDir: string): Promise<void> {
  const dirEntries = await fs.promises.readdir(mainDir, {
    withFileTypes: true,
  })

  for (const entry of dirEntries) {
    const entryPath = path.join(mainDir, entry.name)

    if (entry.isDirectory()) {
      await deleteNonSvgFiles(entryPath)
    } else {
      const ext = path.extname(entryPath).toLowerCase()
      if (ext !== '.svg') {
        await fs.promises.unlink(entryPath)
        console.log(`Deleted file: ${entryPath}`)
      }
    }
  }
}

async function renameFiles(mainDir: string): Promise<void> {
  const dirEntries = await fs.promises.readdir(mainDir, {
    withFileTypes: true,
  })

  for (const entry of dirEntries) {
    const entryPath = path.join(mainDir, entry.name)
    const ext = path.extname(entryPath)
    const baseName = path.basename(entryPath, ext)
    const newName =
      baseName.replace(
        /^Arch_|_48|_32|Arch-Category_|Res_|_Light|&| |\./g,
        ''
      ) + ext

    if (entry.isDirectory()) {
      await renameFiles(entryPath)
    } else {
      const newEntryPath = path.join(mainDir, newName)
      await fs.promises.rename(entryPath, newEntryPath)
      console.log(`Renamed file: ${entryPath} to ${newEntryPath}`)
    }
  }
}

async function copySvgFilesToIconsDirectory(mainDir: string): Promise<void> {
  const iconsDir = path.join(process.cwd(), AWS_ICONS_TRANSFORM_PATH)
  const iconsWithoutPrefixDir = path.join(
    process.cwd(),
    `${AWS_ICONS_TRANSFORM_PATH}-without-prefix`
  )

  let prefix = ''

  // Create the icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir)
  }
  if (!fs.existsSync(iconsWithoutPrefixDir)) {
    fs.mkdirSync(iconsWithoutPrefixDir)
  }

  const dirEntries = await fs.promises.readdir(mainDir, {
    withFileTypes: true,
  })

  for (const entry of dirEntries) {
    const entryPath = path.join(mainDir, entry.name)

    if (entryPath.includes('Architecture-Group-Icons')) {
      prefix = 'ArchitectureGroup_'
    } else if (entryPath.includes('Architecture-Service-Icons')) {
      prefix = 'ArchitectureService_'
    } else if (entryPath.includes('Category-Icons')) {
      prefix = 'Category_'
    } else if (entryPath.includes('General-Icons')) {
      prefix = 'General_'
    } else if (entryPath.includes('Resource-Icons')) {
      prefix = 'Resource'
    }

    if (entry.isDirectory()) {
      await copySvgFilesToIconsDirectory(entryPath)
    } else if (path.extname(entryPath).toLowerCase() === '.svg') {
      const targetPath = path.join(iconsDir, `${prefix}${entry.name}`)
      const targetWithoutPrefixPath = [
        'Category_',
        'ArchitectureGroup_',
        'General_',
      ].includes(prefix)
        ? path.join(`${iconsDir}-without-prefix`, `${prefix}${entry.name}`) // Keep prefix for Category icons, Architecture-Group and General
        : path.join(`${iconsDir}-without-prefix`, `${entry.name}`)

      await fs.promises.copyFile(entryPath, targetPath)
      await fs.promises.copyFile(entryPath, targetWithoutPrefixPath)
      console.log(`Copied file: ${entryPath} to ${targetPath}`)
    }
  }
}

;(async () => {
  const directoryPath = path.join(process.cwd(), AWS_ICONS_EXTRACT_PATH)

  try {
    await deleteDirectories(directoryPath)
    console.log('Deletion completed.')

    await deleteNonSvgFiles(directoryPath)
    console.log('Deletion completed.')

    await renameFiles(directoryPath)
    console.log('Renaming completed.')

    await copySvgFilesToIconsDirectory(directoryPath)
    console.log('Copying completed.')
  } catch (error) {
    console.error('Error:', error)
  }
})()
