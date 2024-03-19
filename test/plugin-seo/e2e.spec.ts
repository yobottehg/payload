import type { Page } from '@playwright/test'
import type { Payload } from 'payload/types'

import { expect, test } from '@playwright/test'
import path from 'path'
import { getFileByPath } from 'payload/uploads'
import { fileURLToPath } from 'url'

import type { Page as PayloadPage } from './payload-types.js'

import { initPageConsoleErrorCatch } from '../helpers.js'
import { AdminUrlUtil } from '../helpers/adminUrlUtil.js'
import { initPayloadE2E } from '../helpers/initPayloadE2E.js'
import config from '../uploads/config.js'
import { mediaSlug } from './shared.js'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const { beforeAll, describe } = test
let url: AdminUrlUtil
let page: Page
let id: string
let payload: Payload

describe('SEO Plugin', () => {
  beforeAll(async ({ browser }) => {
    const { serverURL } = await initPayloadE2E({ config, dirname })
    url = new AdminUrlUtil(serverURL, 'pages')

    const context = await browser.newContext()
    page = await context.newPage()
    initPageConsoleErrorCatch(page)

    const filePath = path.resolve(dirname, './image-1.jpg')
    const file = await getFileByPath(filePath)

    const mediaDoc = await payload.create({
      collection: mediaSlug,
      data: {},
      file,
    })

    const createdPage = (await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-page',
        meta: {
          description: 'This is a test meta description',
          image: mediaDoc.id,
          ogTitle: 'This is a custom og:title field',
          title: 'This is a test meta title',
        },
        title: 'Test Page',
      },
    })) as unknown as Promise<PayloadPage>
    id = createdPage.id
  })

  describe('Core functionality', () => {
    test('Config tab should be merged in correctly', async () => {
      await page.goto(url.edit(id))
      const contentTabsClass = '.tabs-field__tabs .tabs-field__tab-button'

      const firstTab = page.locator(contentTabsClass).nth(0)
      await expect(firstTab).toContainText('General')
    })

    test('Should auto-generate meta title when button is clicked in tabs', async () => {
      const contentTabsClass = '.tabs-field__tabs .tabs-field__tab-button'
      const autoGenerateButtonClass = '.group-field__wrap .render-fields div:nth-of-type(1) button'
      const metaTitleClass = '#field-title'

      const secondTab = page.locator(contentTabsClass).nth(1)
      await secondTab.click()

      const metaTitle = page.locator(metaTitleClass).nth(0)
      await expect(metaTitle).toHaveValue('This is a test meta title')

      const autoGenButton = page.locator(autoGenerateButtonClass).nth(0)
      await autoGenButton.click()

      await expect(metaTitle).toHaveValue('Website.com — Test Page')
    })

    // todo: Re-enable this test once required attributes are fixed
    /* test('Title should be required as per custom override', async () => {
      const metaTitleClass = '#field-title'

      const metaTitle = page.locator(metaTitleClass).nth(0)

      await expect(metaTitle).toHaveAttribute('required', '')
    }) */

    test('Indicator should be orangered and characters counted', async () => {
      const indicatorClass =
        '#field-meta > div > div.render-fields.render-fields--margins-small > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(3) > div'
      const indicatorLabelClass =
        '#field-meta > div > div.render-fields.render-fields--margins-small > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(2)'

      const indicator = page.locator(indicatorClass)
      const indicatorLabel = page.locator(indicatorLabelClass)

      await expect(indicatorLabel).toContainText('23/50-60 chars, 27 to go')
      await expect(indicator).toHaveCSS('background-color', 'rgb(255, 69, 0)')
    })

    test('Should generate a search result preview based on content', async () => {
      await page.goto(url.edit(id))
      const contentTabsClass = '.tabs-field__tabs .tabs-field__tab-button'
      const autoGenerateButtonClass = '.group-field__wrap .render-fields div:nth-of-type(1) button'
      const metaDescriptionClass = '#field-description'
      const previewClass =
        '#field-meta > div > div.render-fields.render-fields--margins-small > div:nth-child(6) > div:nth-child(3)'

      const secondTab = page.locator(contentTabsClass).nth(1)
      await secondTab.click()

      const metaDescription = page.locator(metaDescriptionClass).nth(0)
      await metaDescription.fill('My new amazing SEO description')

      const preview = page.locator(previewClass).nth(0)
      await expect(preview).toContainText('https://yoursite.com/en/')
      await expect(preview).toContainText('This is a test meta title')
      await expect(preview).toContainText('My new amazing SEO description')
    })
  })

  describe('i18n', () => {
    test('support for another language', async () => {
      await page.goto(url.edit(id))
      const contentTabsClass = '.tabs-field__tabs .tabs-field__tab-button'
      const autoGenerateButtonClass = '.group-field__wrap .render-fields div:nth-of-type(1) button'

      const secondTab = page.locator(contentTabsClass).nth(1)
      await secondTab.click()

      const autoGenButton = page.locator(autoGenerateButtonClass).nth(0)

      await expect(autoGenButton).toContainText('Auto-generate')

      // Go to account page
      await page.goto(url.account)

      const languageField = page.locator('.payload-settings__language .react-select')
      const options = page.locator('.rs__option')

      // Change language to Spanish
      await languageField.click()
      await options.locator('text=Español').click()

      // Navigate back to the page
      await page.goto(url.edit(id))

      await secondTab.click()

      await expect(autoGenButton).toContainText('Auto-génerar')
    })
  })
})
