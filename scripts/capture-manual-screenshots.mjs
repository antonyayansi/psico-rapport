import { createServer } from 'http'
import { readFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import puppeteer from 'puppeteer-core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const outDir = join(root, 'documentacion-indecopi/04_manual_usuario/capturas')
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
}

function serveDist(port) {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    let filePath = join(dist, urlPath === '/' ? 'index.html' : urlPath)
    if (!filePath.startsWith(dist)) {
      res.writeHead(403)
      res.end()
      return
    }
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(dist, 'index.html')
    }
    const data = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })
    res.end(data)
  })
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}

const shots = [
  { file: '01-inicio.png', path: '/', wait: 800 },
  { file: '02-login.png', path: '/login', wait: 800 },
  { file: '03-consentimiento.png', path: '/consent', wait: 1000 },
  { file: '04-onboarding.png', path: '/onboarding', wait: 1000 },
  { file: '05-chat.png', path: '/uwu', wait: 1500 },
  { file: '06-mascota.png', path: '/pet', wait: 1200 },
  { file: '07-animo.png', path: '/tracking', wait: 1000 },
  { file: '08-comunidad.png', path: '/community', wait: 1200 },
  { file: '09-terapeutas.png', path: '/therapists', wait: 1200 },
  { file: '10-matching.png', path: '/matching', wait: 1200 },
  { file: '11-estadisticas.png', path: '/stats', wait: 1500 },
  { file: '12-registro-terapeuta.png', path: '/therapist-register', wait: 1000 },
]

mkdirSync(outDir, { recursive: true })
const port = 4177
const server = await serveDist(port)
const base = `http://127.0.0.1:${port}`

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
})

const page = await browser.newPage()
await page.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})

for (const shot of shots) {
  const url = `${base}${shot.path}`
  console.log('Capturando', shot.file, '→', url)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await new Promise((r) => setTimeout(r, shot.wait))
  await page.screenshot({
    path: join(outDir, shot.file),
    type: 'png',
    fullPage: false,
  })
}

await browser.close()
server.close()
console.log('Listo:', outDir)
