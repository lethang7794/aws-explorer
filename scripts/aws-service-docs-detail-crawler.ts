import { chromium } from 'playwright'
import { extractDetailInfo } from './extractDetailInfo'

const TEST_DOC_PAGES = [
  'https://docs.aws.amazon.com/decision-guides/latest/modern-apps-strategy-on-aws-how-to-choose/modern-apps-strategy-on-aws-how-to-choose.html',
  'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html',
  'https://docs.aws.amazon.com/apigateway/',
]

// This script is used to extract detailed information from AWS service documentation pages.
// It is useful for testing the extractDetailInfo function with specific URLs.
async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  for (const url of TEST_DOC_PAGES) {
    const detail = await extractDetailInfo(context, {
      service: '',
      url: url,
      shortDescription: '',
      categories: [],
    })

    console.log(detail)
  }

  await browser.close()
}

main()
