import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  duration: 60,
  fps: 30,
  width: 1920,
  height: 1080,
  outputDir: path.join(__dirname, 'public/videos'),
  outputFile: 'victor-ia-hyperframes-60s.mp4',
  htmlFile: path.join(__dirname, 'public/videos/hyperframes-victor-60s.html'),
  audioFile: path.join(__dirname, 'public/audio/vo-influence-ia/01_hyperframes_60s.mp3'),
  tempDir: path.join(__dirname, '.render-temp')
};

async function renderFramesFast() {
  const totalFrames = CONFIG.duration * CONFIG.fps;

  console.log('🎬 Fast HyperFrames Renderer');
  console.log(`📄 HTML: ${CONFIG.htmlFile}`);
  console.log(`🔊 Audio: ${CONFIG.audioFile}`);
  console.log(`📹 Output: ${path.join(CONFIG.outputDir, CONFIG.outputFile)}`);
  console.log(`⚡ Mode: Fast (${CONFIG.fps}fps, ${totalFrames} frames)\n`);

  // Cleanup and create temp dir
  if (fs.existsSync(CONFIG.tempDir)) {
    fs.rmSync(CONFIG.tempDir, { recursive: true });
  }
  fs.mkdirSync(CONFIG.tempDir, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ],
      protocolTimeout: 180000
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: CONFIG.width,
      height: CONFIG.height,
      deviceScaleFactor: 1
    });


    // Enable request interception
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    const fileUrl = 'file://' + CONFIG.htmlFile.replace(/\\/g, '/');
    console.log(`📂 Loading HTML...`);
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log(`✓ Loaded\n🎥 Capturing frames...\n`);

    // Capture in batches for progress
    const batchSize = 100;
    let capturedCount = 0;

    for (let i = 0; i < totalFrames; i++) {
      const time = i / CONFIG.fps;

      // Update DOM for this frame
      await page.evaluate(({ t }) => {
        window.FRAME_TIME = t;

        // Update slide visibility
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
          const from = parseFloat(slide.getAttribute('data-from') || 0);
          const to = parseFloat(slide.getAttribute('data-to') || 60);

          if (t >= from && t < to) {
            const progress = (t - from) / (to - from);
            slide.style.opacity = Math.min(1, progress * 1.5);
          } else {
            slide.style.opacity = 0;
          }
        });

        // KPI animations (30-48s)
        if (t >= 30 && t < 48) {
          const kpiProg = (t - 30) / 18;
          document.querySelectorAll('.kpi-number').forEach(el => {
            const target = parseFloat(el.getAttribute('data-value') || 0);
            const curr = target * Math.min(kpiProg, 1);
            el.textContent = target > 0 ? Math.round(curr * 10) / 10 : Math.round(curr);
          });

          document.querySelectorAll('.kpi-bar-fill').forEach(el => {
            el.style.width = (Math.min(kpiProg, 1) * 100) + '%';
          });
        }
      }, { t: time });

      // Screenshot
      const framePath = path.join(CONFIG.tempDir, `${String(i).padStart(6, '0')}.png`);
      await page.screenshot({ path: framePath });

      capturedCount++;
      if (i % batchSize === 0 || i === totalFrames - 1) {
        const percent = Math.round((i / totalFrames) * 100);
        console.log(`  ${percent}% (${i + 1}/${totalFrames})`);
      }
    }

    console.log(`\n✅ Frame capture done (${capturedCount} frames)\n`);
    await browser.close();

  } catch (error) {
    console.error('❌ Capture error:', error.message);
    if (browser) await browser.close();
    throw error;
  }
}

async function encodeWithFFmpeg() {
  console.log('🎬 Encoding to MP4...\n');

  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
  const framePat = path.join(CONFIG.tempDir, '%06d.png');

  const cmd = `ffmpeg -y -framerate ${CONFIG.fps} -i "${framePat}" -i "${CONFIG.audioFile}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${outputPath}"`;

  try {
    const { stdout, stderr } = await execAsync(cmd);
    console.log(stderr);
  } catch (error) {
    console.error('FFmpeg error:', error.message);
    throw error;
  }
}

async function verify() {
  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('✅ Video created successfully!\n');
    console.log('📊 Output Details:');
    console.log(`  📁 Path: ${outputPath}`);
    console.log(`  📦 Size: ${sizeMB} MB`);
    console.log(`  ⏱️  Duration: ${CONFIG.duration}s`);
    console.log(`  📹 Resolution: ${CONFIG.width}x${CONFIG.height}`);
    console.log(`  🎬 Framerate: ${CONFIG.fps}fps`);
    console.log(`  🔊 Audio: Synced (192k AAC)\n`);
  }
}

async function main() {
  try {
    await renderFramesFast();
    await encodeWithFFmpeg();
    await verify();

    // Cleanup
    console.log('🧹 Cleaning up...');
    fs.rmSync(CONFIG.tempDir, { recursive: true });
    console.log('✅ Done!\n');

  } catch (error) {
    console.error('Fatal error:', error);
    if (fs.existsSync(CONFIG.tempDir)) {
      fs.rmSync(CONFIG.tempDir, { recursive: true });
    }
    process.exit(1);
  }
}

main();
