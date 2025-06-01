import { BrowserContext, chromium } from 'playwright'
import { writeFileSync } from 'fs'

const AWS_DOCS_URL = 'https://docs.aws.amazon.com/'

type Service = {
  service: string
  shortDescription: string
  detailDescription?: string
  url: string
  categories: string[]
}

const PAGINATION_SIZE = 1
function getPaginationAriaLabel(i: number) {
  return `Page ${i + 1} of all pages`
}
const OUTPUT_PATH = 'data/aws-services.json'

;(async () => {
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
    const servicesData: Service[] = []

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
          try {
            // Extract basic service info
            const serviceName = await card.$eval('h5', (el: HTMLElement) =>
              el.innerText.trim().replace(' ', '')
            )
            const shortDescription = await card.$eval(
              'h5 ~ div',
              (el: HTMLElement) => el.innerText.trim()
            )

            const categories = await card.$$eval(
              'ul > li > span',
              (els: HTMLElement[]) => els.map((el) => el.innerText.trim())
            )

            // Get service detail URL
            const detailUrl = await card.$eval('h5 > a', (el) =>
              el.getAttribute('href')
            )
            const absoluteUrl = new URL(
              cleanPath(detailUrl || ''),
              AWS_DOCS_URL
            ).href

            // Store collected data
            servicesData.push({
              service: serviceName,
              shortDescription,
              url: absoluteUrl,
              categories,
            })

            console.log(`Processed: ${serviceName}`)
          } catch (cardError) {
            if (cardError instanceof Error) {
              console.error(`Error processing card: ${cardError.message}`)
            } else {
              console.log(`Unexpected error processing card: ${cardError}`)
            }
          }
        }
      } else {
        console.warn(`No pagination button found for ${buttonArialLabel}`)
      }
    }

    await runInBatches(servicesData, 10, async (service: Service) => {
      try {
        // Extract detailed description from service page
        service.detailDescription = await extractDetailDescription(
          context,
          service
        )
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
})()

// Utility function to clean up URL paths
function cleanPath(urlPath?: string) {
  return urlPath?.split('/?')[0].split('?')[0] || ''
}

// Function to extract detailed description from service page
async function extractDetailDescription(
  context: BrowserContext,
  service: Service
) {
  const DECISION_GUIDES_CATEGORY = 'Decision Guides'

  const url = service.url
  const serviceName = service.service

  // Open a new page for the service detail
  const detailPage = await context.newPage()
  await detailPage.goto(url, {
    // waitUntil: 'domcontentloaded',
  })

  // Extract detailed description
  let detailDescription = ''
  // For Decision Guides, the description is in a different place
  if (service.categories.includes(DECISION_GUIDES_CATEGORY)) {
    try {
      detailDescription = await detailPage.$eval(
        'table tbody tr td:nth-child(2) p',
        (el: HTMLElement) => el.innerText.trim()
      )
    } catch (e) {
      if (e instanceof Error) {
        console.warn(
          `No description found for ${JSON.stringify(service)} ${serviceName}: ${e.message}`
        )
      }
    }
  } else {
    try {
      detailDescription = await detailPage.$eval(
        'h1 ~ div',
        (el: HTMLElement) => el.innerText.trim()
      )
    } catch (e) {
      if (e instanceof Error) {
        console.warn(
          `No description found for ${JSON.stringify(service)} ${serviceName}: ${e.message}`
        )
      }
    }
  }

  // Close detail page
  await detailPage.close()

  return detailDescription
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
