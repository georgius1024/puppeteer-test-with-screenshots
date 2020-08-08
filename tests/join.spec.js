const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch')
import puppeteer from 'puppeteer'
export const headless = Boolean(process.env.HEADLESS)
export const dimensions = {
  width: 1280,
  height: 800
}
const screenshots = path.join(__dirname, 'screenshots')
describe('Behaviour', () => {
  let browser, page
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless,
      defaultViewport: dimensions,
      args: [
        `--window-size=${dimensions.width},${dimensions.height}`,
        '--ignore-certificate-errors',
        '--allow-running-insecure-content',
        '--allow-insecure-localhost'
      ]
    })
    page = await browser.newPage()
    await page.goto(`${process.env.BASE_URL}`, { waitUntil: 'networkidle2' })
  })

  it('Contains text signature', async () => {
    const text = await page.$eval('.calc h3', e => e.innerText)
    expect(text).toContain('Easy calculator')
  })

  it('Contains increment button', async () => {
    const increment = await page.$('.calc #increment')
    expect(increment).toBeTruthy()
  })
  it('Contains decrement button', async () => {
    const decrement = await page.$('.calc #decrement')
    expect(decrement).toBeTruthy()
  })

  it('Contains reset button', async () => {
    const reset = await page.$('.calc #reset')
    expect(reset).toBeTruthy()
  })

  it('Contains counter', async () => {
    const counter = await page.$('.calc #counter')
    expect(counter).toBeTruthy()
  })

  it('Click on increment increases counter', async () => {
    await page.click('.calc #increment')
    const text = await page.$eval('.calc #counter', e => e.innerText)
    expect(Number(text)).toBe(1)
  })

  it('Click on decrement decreases counter', async () => {
    await page.click('.calc #decrement')
    const text = await page.$eval('.calc #counter', e => e.innerText)
    expect(Number(text)).toBe(0)
  })

  afterAll(async () => {
    await page.browser().close()
  })
})

describe('Open', () => {
  let browser, page
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless,
      defaultViewport: dimensions,
      args: [
        `--window-size=${dimensions.width},${dimensions.height}`,
        '--ignore-certificate-errors',
        '--allow-running-insecure-content',
        '--allow-insecure-localhost'
      ]
    })
    page = await browser.newPage()
    await page.goto(`${process.env.BASE_URL}`, { waitUntil: 'networkidle2' })
    if (!fs.existsSync(`${screenshots}/original.png`)) {
      await page.screenshot({
        path: `${screenshots}/original.png`,
        type: 'png'
      })
    }
    if (fs.existsSync(`${screenshots}/difference.png`)) {
      fs.unlinkSync(`${screenshots}/difference.png`)
    }
  })
  test('Match screenshot', async () => {
    await page.screenshot({
      path: `${screenshots}/current.png`,
      type: 'png'
    })
    const original = PNG.sync.read(fs.readFileSync(`${screenshots}/original.png`))
    const current = PNG.sync.read(fs.readFileSync(`${screenshots}/current.png`))
    const diff = new PNG(dimensions)

    const differentPixels = pixelmatch(original.data, current.data, diff.data, dimensions.width, dimensions.height, {
      threshold: 0.1
    })
    if (differentPixels) {
      fs.writeFileSync(`${screenshots}/difference.png`, PNG.sync.write(diff))
    }
    expect(differentPixels).toBe(0)
  })
  afterAll(async () => {
    await page.browser().close()
  })
})
