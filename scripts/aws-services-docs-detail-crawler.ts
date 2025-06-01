import { chromium } from 'playwright'
import fs from 'fs'

const AWS_DOCS_URL = 'https://docs.aws.amazon.com/lambda/'
const OUTPUT_PATH = 'data/aws-service-detail.json'

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to AWS detail page of a service
    await page.goto(AWS_DOCS_URL, {
      waitUntil: 'domcontentloaded',
    })

    // Find all sections
    const sectionsEl = await page.$$('section')
    const sections = []

    // Iterate through each section
    for (const sectionEl of sectionsEl) {
      const section: Record<string, any> = {}

      // Get section name
      const sectionName = await sectionEl.$eval('h2', (el) =>
        el.textContent?.trim()
      )

      // Find all items in the section
      const itemsEl = await sectionEl.$$('li[data-selection-item]')
      const items = []

      // Iterate through each item
      for (const itemEl of itemsEl) {
        // Get item link
        const itemLink = await itemEl.$eval('h3 a', (el) =>
          el.getAttribute('href')
        )

        // Get item name
        const itemName = await itemEl.$eval('h3 a span', (el) =>
          el.textContent?.trim()
        )

        // Get item description
        const itemDescription = await itemEl.$eval(
          'div div:nth-child(2) div div div',
          (el) => el.textContent?.trim()
        )

        // Collect item data
        const item = {
          name: itemName,
          link: itemLink,
          description: itemDescription,
        }
        // Push item data to items array
        items.push(item)
      }

      // Collect section data
      section.name = sectionName
      section.items = items

      // Push section data to sections array
      sections.push(section)
    }
    console.log({ sections: JSON.stringify(sections, null, 2) })

    // Save results to JSON file
    // fs.writeFileSync(OUTPUT_PATH, JSON.stringify({servicesData}, null, 2))
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Main error: ${err.message}`)
    } else {
      console.error('Main error:', err)
    }
  } finally {
    await browser.close()
  }
})()
