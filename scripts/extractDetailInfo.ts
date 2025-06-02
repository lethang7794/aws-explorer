import { BrowserContext, ElementHandle } from 'playwright'
import { ServiceCrawl, ServiceCrawlSection } from './aws-services-docs-crawler'

// Function to extract detailed description from service page

export async function extractDetailInfo(
  context: BrowserContext,
  service: ServiceCrawl
) {
  const url = service.url
  const serviceName = service.service

  // Open a new page for the service detail
  const detailPage = await context.newPage()
  await detailPage.goto(url, {
    waitUntil: 'domcontentloaded',
  })

  // Extract detailed description
  let detailDescription = ''
  const sections = []

  try {
    // The detail description can be in various places, so we try multiple selectors

    let detailDescriptionEl: ElementHandle<HTMLElement | SVGElement> | null
    if (url.includes('decision-guides')) {
      // Decision guide: First paragraph, e.g. https://docs.aws.amazon.com/decision-guides/latest/modern-apps-strategy-on-aws-how-to-choose/modern-apps-strategy-on-aws-how-to-choose.html
      detailDescriptionEl = await detailPage.$(
        '#main-col-body h2:first-of-type ~ p'
      )
    } else if (url.includes('developerguide')) {
      // Developer guide: First paragraph of the main content, e.g. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
      detailDescriptionEl = await detailPage.$(
        'div#main-content div#main-col-body p:first-of-type'
      )
    } else {
      // - Docs page: The div after the title, e.g. https://docs.aws.amazon.com/apigateway/
      detailDescriptionEl = await detailPage.$('h1 ~ div')
    }

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
