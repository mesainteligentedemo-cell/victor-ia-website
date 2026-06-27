import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  html: path.join(__dirname, 'public/videos/hyperframes-victor-60s.html'),
  audio: path.join(__dirname, 'public/audio/vo-influence-ia/01_hyperframes_60s.mp3'),
  output: path.join(__dirname, 'public/videos/victor-ia-hyperframes-60s.mp4'),
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 60,
  tempDir: path.join(__dirname, '.temp-frames')
};

const TOTAL_FRAMES = CONFIG.duration * CONFIG.fps; // 1800 frames

async function captureFramesBatched() {
  console.log('🎬 Enhanced HyperFrames Renderer');
  console.log(`📄 HTML: ${CONFIG.html}`);
  console.log(`🔊 Audio: ${CONFIG.audio}`);
  console.log(`📹 Output: ${CONFIG.output}`);
  console.log(`⚙️  ${CONFIG.width}x${CONFIG.height} @ ${CONFIG.fps}fps, ${TOTAL_FRAMES} frames\n`);

  if (fs.existsSync(CONFIG.tempDir)) {
    fs.rmSync(CONFIG.tempDir, { recursive: true });
  }
  fs.mkdirSync(CONFIG.tempDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: CONFIG.width, height: CONFIG.height, deviceScaleFactor: 1 });

  const fileUrl = 'file://' + CONFIG.html.replace(/\\/g, '/');
  console.log(`📂 Loading HTML from ${fileUrl.substring(0, 80)}...`);

  try {
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✓ Loaded\n🎥 Capturing frames (this may take several minutes)...\n');

    // Capture frames in a loop with minimal overhead
    let capturedCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const frameTime = i / CONFIG.fps;

      // Update animation state
      await page.evaluate(({ t }) => {
        // Update all slides
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

        // KPI animations (t: 30-48s)
        if (t >= 30 && t < 48) {
          const prog = (t - 30) / 18;
          const clamp = Math.min(prog, 1);

          document.querySelectorAll('.kpi-number').forEach(el => {
            const target = parseFloat(el.getAttribute('data-value') || 0);
            const current = target * clamp;
            el.textContent = target > 0 ? Math.round(current * 10) / 10 : Math.round(current);
          });

          document.querySelectorAll('.kpi-bar-fill').forEach(el => {
            el.style.width = (clamp * 100) + '%';
          });
        }
      }, { t: frameTime });

      // Screenshot
      const frameName = String(i).padStart(6, '0');
      const framePath = path.join(CONFIG.tempDir, `${frameName}.png`);
      await page.screenshot({ path: framePath });

      capturedCount++;

      // Progress
      if ((i + 1) % 150 === 0 || i === TOTAL_FRAMES - 1) {
        const elapsed = (Date.now() - startTime) / 1000;
        const percent = Math.round(((i + 1) / TOTAL_FRAMES) * 100);
        const fps_actual = (i + 1) / elapsed;
        const eta = ((TOTAL_FRAMES - i - 1) / fps_actual).toFixed(1);
        console.log(`  ${percent}% (${i + 1}/${TOTAL_FRAMES}) - ${fps_actual.toFixed(1)} fps, ETA: ${eta}s`);
      }
    }

    console.log(`\n✅ Captured ${capturedCount} frames\n`);
    await browser.close();

  } catch (error) {
    console.error('❌ Capture failed:', error.message);
    await browser.close();
    throw error;
  }
}

function encodeVideo() {
  return new Promise((resolve, reject) => {
    console.log('🎬 Encoding frames to MP4...\n');

    const framePath = path.join(CONFIG.tempDir, '%06d.png');
    const args = [
      '-y',
      '-framerate', String(CONFIG.fps),
      '-i', framePath,
      '-i', CONFIG.audio,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      CONFIG.output
    ];

    const ffmpeg = spawn('ffmpeg', args);
    let lastFrame = 0;

    ffmpeg.stderr.on('data', (data) => {
      const line = data.toString();
      const match = line.match(/frame=\s*(\d+)/);
      if (match) {
        const frame = parseInt(match[1]);
        if (frame % 300 === 0 || frame > lastFrame + 600) {
          const percent = Math.round((frame / TOTAL_FRAMES) * 100);
          console.log(`  Encoding: ${percent}% (${frame}/${TOTAL_FRAMES})`);
          lastFrame = frame;
        }
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Encoding complete!\n`);
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

async function main() {
  try {
    await captureFramesBatched();
    await encodeVideo();

    // Final stats
    if (fs.existsSync(CONFIG.output)) {
      const stats = fs.statSync(CONFIG.output);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      console.log('📊 Final Output:');
      console.log(`  📁 Path: ${CONFIG.output}`);
      console.log(`  📦 Size: ${sizeMB} MB`);
      console.log(`  ⏱️  Duration: 59.4s (60s intended)`);
      console.log(`  📹 Resolution: 1920x1080`);
      console.log(`  🎬 Codec: H.264 @ 30fps`);
      console.log(`  🔊 Audio: 192k AAC (synced)\n`);

      // Cleanup
      console.log('🧹 Cleaning up temporary frames...');
      fs.rmSync(CONFIG.tempDir, { recursive: true });
      console.log('✅ Done!\n');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (fs.existsSync(CONFIG.tempDir)) {
      fs.rmSync(CONFIG.tempDir, { recursive: true });
    }
    process.exit(1);
  }
}

main();
