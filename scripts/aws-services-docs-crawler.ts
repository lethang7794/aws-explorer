import { chromium, ElementHandle } from 'playwright'
import { writeFileSync } from 'fs'
import { extractDetailInfo } from './aws-service-crawl-detail'

const AWS_DOCS_URL = 'https://docs.aws.amazon.com/'
const OUTPUT_PATH = 'data/aws-services.json'
const BATCH_SIZE = 10
const PAGINATION_SIZE = 30

function getPaginationAriaLabel(i: number) {
  return `Page ${i + 1} of all pages`
}

export type ServiceCrawl = {
  service: string
  shortDescription: string
  detailDescription?: string
  url: string
  categories: string[]
  sections?: ServiceCrawlSection[]
  images?: Image[]
}

type Image = {
  url: string
  alt?: string
}

export type ServiceCrawlSection = {
  name?: string
  items: {
    name?: string | null
    link?: string | null
    description?: string | null
  }[]
}

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

    await runInBatches(
      servicesData,
      BATCH_SIZE,
      async (service: ServiceCrawl) => {
        try {
          // Extract detailed description from service page
          const { detailDescription, sections, images } =
            await extractDetailInfo(context, service)
          service.detailDescription = detailDescription
          service.sections = sections
          service.images = images
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
      }
    )

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
      el.innerText.trim().replace(' ', ' ')
    )
    const shortDescription = await card.$eval('h5 ~ div', (el: HTMLElement) =>
      el.innerText.trim().replace(' ', ' ')
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
