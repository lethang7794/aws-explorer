import { BrowserContext, chromium, ElementHandle } from 'playwright'
import { writeFileSync } from 'fs'

const AWS_DOCS_URL = 'https://docs.aws.amazon.com/'

export type ServiceCrawl = {
  service: string
  shortDescription: string
  detailDescription?: string
  url: string
  categories: string[]
  sections?: ServiceCrawlSection[]
}

export type ServiceCrawlSection = {
  name?: string
  items: {
    name?: string | null
    link?: string | null
    description?: string | null
  }[]
}

const PAGINATION_SIZE = 30
function getPaginationAriaLabel(i: number) {
  return `Page ${i + 1} of all pages`
}
const OUTPUT_PATH = 'data/aws-services.json'

main()

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to AWS docs main page
    await page.goto(AWS_DOCS_URL, {
      waitUntil: 'domcontentloaded',
    })
    console.log('Loaded AWS docs main page')

    // Extract service categories and cards
    const servicesData: ServiceCrawl[] = []

    // TODO: remove this limit when scraping all services
    for (let i = 0; i < PAGINATION_SIZE; i++) {
      const buttonArialLabel = getPaginationAriaLabel(i)
      const paginationButton = await page.$(
        `button[aria-label="${buttonArialLabel}"]`
      )
      if (paginationButton) {
        // Go to page i + 1
        console.log(`Go to page ${i + 1}`)
        await paginationButton.click()
        // await page.waitForTimeout(1000); // Wait for page to load

        const serviceCards = await page.$$('li[data-selection-item]')

        for (const card of serviceCards) {
          const serviceData = await extractServiceData(card)
          servicesData.push(serviceData!)
        }
      } else {
        console.warn(`No pagination button found for ${buttonArialLabel}`)
      }
    }

    await runInBatches(servicesData, 10, async (service: ServiceCrawl) => {
      try {
        // Extract detailed description from service page
        const { detailDescription, sections } = await extractDetailInfo(
          context,
          service
        )
        service.detailDescription = detailDescription
        service.sections = sections
        console.log(`Extracted detail for ${service.service}`)
      } catch (detailError) {
        if (detailError instanceof Error) {
          console.error(
            `Error extracting detail for ${service.service}: ${detailError.message}`
          )
        } else {
          console.log(
            `Unexpected error extracting detail for ${service.service}: ${detailError}`
          )
        }
      }
    })

    // Save results to JSON file
    writeFileSync(OUTPUT_PATH, JSON.stringify(servicesData, null, 2))
    console.log(`Saved data for ${servicesData.length} services`)
  } catch (mainError) {
    if (mainError instanceof Error) {
      console.error(`Main error: ${mainError.message}`)
    } else {
      console.log(`Unexpected main error: ${mainError}`)
    }
  } finally {
    await browser.close()
  }
}

async function extractServiceData(
  card: ElementHandle<SVGElement | HTMLElement>
) {
  let serviceData: ServiceCrawl
  try {
    // Extract basic service info
    const serviceName = await card.$eval('h5', (el: HTMLElement) =>
      el.innerText.trim().replace(' ', '')
    )
    const shortDescription = await card.$eval('h5 ~ div', (el: HTMLElement) =>
      el.innerText.trim()
    )

    const categories = await card.$$eval(
      'ul > li > span',
      (els: HTMLElement[]) => els.map((el) => el.innerText.trim())
    )

    // Get service detail URL
    const detailUrl = await card.$eval('h5 > a', (el) =>
      el.getAttribute('href')
    )
    const absoluteUrl = new URL(cleanPath(detailUrl || ''), AWS_DOCS_URL).href

    console.log(`Processed: ${serviceName}`)
    // Store collected data
    serviceData = {
      service: serviceName,
      shortDescription,
      url: absoluteUrl,
      categories,
    }
    return serviceData
  } catch (cardError) {
    if (cardError instanceof Error) {
      console.error(`Error processing card: ${cardError.message}`)
    } else {
      console.log(`Unexpected error processing card: ${cardError}`)
    }
  }
}

// Utility function to clean up URL paths
function cleanPath(urlPath?: string) {
  return urlPath?.split('/?')[0].split('?')[0] || ''
}

// Function to extract detailed description from service page
async function extractDetailInfo(
  context: BrowserContext,
  service: ServiceCrawl
) {
  const url = service.url
  const serviceName = service.service

  // Open a new page for the service detail
  const detailPage = await context.newPage()
  await detailPage.goto(url, {
    // waitUntil: 'domcontentloaded',
  })

  // Extract detailed description
  let detailDescription = ''
  const sections = []

  try {
    // The detail description can be in various places, so we try multiple selectors
    // - In the div after the title, e.g. https://docs.aws.amazon.com/apigateway/
    // - or in the second cell of the first row of the table, e.g. https://docs.aws.amazon.com/decision-guides/latest/modern-apps-strategy-on-aws-how-to-choose/modern-apps-strategy-on-aws-how-to-choose.html
    // - or in the first paragraph of the main content, e.g. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
    const detailDescriptionEl = await detailPage.$(
      'h1 ~ div, table tbody tr td:nth-child(2) p, div#main-content div#main-col-body p:first-of-type'
    )
    detailDescription = (await detailDescriptionEl?.innerText()) || ''

    // Find all sections
    const sectionsEl = await detailPage.$$('section')

    // Iterate through each section
    for (const sectionEl of sectionsEl) {
      let section: ServiceCrawlSection

      // Get section name
      const sectionNameEl = await sectionEl.$('h2')
      const sectionName = await sectionNameEl?.textContent()

      // Find all items in the section
      const itemsEl = await sectionEl.$$('li[data-selection-item]')
      const items = []

      // Iterate through each item
      for (const itemEl of itemsEl) {
        // Get item link
        const itemLinkEl = await itemEl.$('h3 a')
        const itemLink = await itemLinkEl?.getAttribute('href')

        // Get item name
        const itemNameEl = await itemEl.$('h3 a span, h3')
        const itemName = await itemNameEl?.textContent()

        // Get item description
        const itemDescription = await itemEl.$eval(
          'div div:nth-child(2) div div div',
          (el: HTMLElement) => el.innerText.trim()
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
      section = {
        name: sectionName!,
        items: items,
      }

      // Push section data to sections array
      sections.push(section)
    }
  } catch (e) {
    if (e instanceof Error) {
      console.warn(
        `No description found for ${JSON.stringify(service)} ${serviceName}: ${e.message}`
      )
    }
  }

  // Close detail page
  await detailPage.close()

  return {
    detailDescription: detailDescription || undefined,
    sections: sections.length > 0 ? sections : undefined,
  }
}

// Function to run async operations in batches
async function runInBatches(
  items: any[],
  batchSize: number,
  asyncFn: (item: any) => Promise<void>
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(batch.map((item) => asyncFn(item)))
  }
}
