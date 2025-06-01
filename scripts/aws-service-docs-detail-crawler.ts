import { chromium } from 'playwright'
import { extractDetailInfo } from './aws-services-docs-crawler'

// This script is used to extract detailed information about AWS service using Playwright.
async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  const detail = extractDetailInfo(context, {
    service: 'Braket',
    url: '',
    shortDescription: '',
    categories: [],
  })

  console.log(detail)
}
