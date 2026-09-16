/**
 * Generates PWA PNG icons from the Skills Mine horizontal SVG logo.
 * The logo is placed on a white square background, centred with padding.
 *
 * Run once:  node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')

// Source: horizontal logo SVG (230×55 viewBox)
const svgPath = path.join(publicDir, 'skillsMine-logo.svg')
const svgContent = fs.readFileSync(svgPath)

// Sizes to generate
const sizes = [64, 192, 512]

async function generateIcon(size, outputName, paddingFactor = 0.15) {
  const padding = Math.round(size * paddingFactor)
  const logoW = size - padding * 2
  // Logo is 230:55 ratio — keep aspect ratio
  const logoH = Math.round((logoW * 55) / 230)
  const top = Math.round((size - logoH) / 2)
  const left = padding

  // Resize SVG to fit within padded area
  const resizedLogo = await sharp(svgContent)
    .resize(logoW, logoH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer()

  // Composite onto white square background
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .composite([{ input: resizedLogo, top, left }])
    .png()
    .toFile(path.join(publicDir, outputName))

  console.log(`✓ Generated ${outputName} (${size}×${size})`)
}

async function generateMaskableIcon(size, outputName) {
  // Maskable: logo on brand blue background (#03478c), less padding (safe zone = inner 80%)
  const padding = Math.round(size * 0.1)
  const logoW = size - padding * 2
  const logoH = Math.round((logoW * 55) / 230)
  const top = Math.round((size - logoH) / 2)
  const left = padding

  const resizedLogo = await sharp(svgContent)
    .resize(logoW, logoH, { fit: 'contain', background: { r: 3, g: 71, b: 140, alpha: 0 } })
    // Invert to white for dark background
    .negate({ alpha: false })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 3, g: 71, b: 140, alpha: 255 }, // #03478c brand blue
    },
  })
    .composite([{ input: resizedLogo, top, left }])
    .png()
    .toFile(path.join(publicDir, outputName))

  console.log(`✓ Generated ${outputName} (${size}×${size}) [maskable]`)
}

async function generateAppleTouchIcon(size, outputName) {
  // Apple touch: logo on white, rounded feel (iOS clips to circle/squircle itself)
  await generateIcon(size, outputName, 0.12)
}

async function main() {
  console.log('Generating PWA icons from skillsMine-logo.svg...\n')

  await generateIcon(64, 'pwa-64x64.png')
  await generateIcon(192, 'pwa-192x192.png')
  await generateIcon(512, 'pwa-512x512.png')
  await generateMaskableIcon(512, 'maskable-icon-512x512.png')
  await generateAppleTouchIcon(180, 'apple-touch-icon-180x180.png')

  console.log('\n✅ All PWA icons generated in public/')
}

main().catch((e) => { console.error(e); process.exit(1) })
