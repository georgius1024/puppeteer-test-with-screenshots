import puppeteer from 'puppeteer'

export function getBaseUrl() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000'
  return baseUrl.replace(/\/?$/, '') // No trailing slash
}

export const headless = Boolean(process.env.HEADLESS)
export const desktop = {
  width: 1280,
  height: 800
}

export const mobile = {
  width: 320,
  height: 568
}

export async function openPage(dimensions, options) {
  const browser = await puppeteer.launch({
    ...options,
    defaultViewport: dimensions,
    args: [
      `--window-size=${dimensions.width},${dimensions.height}`
    ]
  })
  const pages = await browser.pages()
  const page = pages[0]
  //const page = await browser.newPage()
  if (process.env.LOGIN && process.env.PASSWORD) {
    await page.authenticate({
      username: process.env.LOGIN, 
      password: process.env.PASSWORD
    })
  }
  //const page = await browser.newPage()
  await page.setViewport(dimensions)
  return page
}

export async function openDesktopPage(slowMo = 0) {
  const page = await openPage(desktop, { headless, slowMo })
  page.isMobile = false
  page.isDesktop = true

  return page
}

export async function openMobilePage(slowMo = 0) {
  const page = await openPage(mobile, { headless, slowMo })
  page.isMobile = true
  page.isDesktop = false
  return page
}

export async function navigate(page, url) {
  return await page.goto(`${baseUrl}/${url}`, { waitUntil: 'networkidle2' })
}

export async function closePage(page) {
  return await page.browser().close()
}

export async function inspectInnerText(page, selector) {
  return await page.$eval(selector, e => e.innerText)
}

export async function inspect(page, selector, attr) {
  const element = await page.$(selector)
  const property = await element.getProperty(attr)
  return await property.jsonValue()
}

export async function element(page, selector) {
  return await page.$(selector)
}

export async function expectElement(page, selector) {
  const element = await page.$(selector)
  expect(element).toBeTruthy()
}

export async function expectNotElement(page, selector) {
  const element = await page.$(selector)
  expect(element).toBe(null)
}

export async function expectInnerText(page, selector, text) {
  const innerText = await page.$eval(selector, e => e.innerText)
  expect(innerText).toContain(text)
}

export async function expectNotInnerText(page, selector, text) {
  const innerText = await page.$eval(selector, e => e.innerText)
  expecct(innerText).not.toContain(text)
}

export async function setLocalStorage(page, key, value) {
  const setStorage = new Function(`localStorage.setItem('${key}', '${value}')`)
  await page.evaluate(setStorage)
}
