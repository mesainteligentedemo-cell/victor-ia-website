import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DURATION_SEC = 60;
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = DURATION_SEC * FPS;

const htmlPath = path.join(__dirname, 'public/videos/hyperframes-victor-60s.html');
const audioPath = path.join(__dirname, 'public/audio/vo-influence-ia/01_hyperframes_60s.mp3');
const outputPath = path.join(__dirname, 'public/videos/victor-ia-hyperframes-60s.mp4');
const framesDir = path.join(__dirname, '.frames-temp');

console.log('🎬 HyperFrames Video Renderer');
console.log(`📄 Source: ${htmlPath}`);
console.log(`🔊 Audio: ${audioPath}`);
console.log(`📹 Output: ${outputPath}`);
console.log(`📊 Settings: ${WIDTH}x${HEIGHT} @ ${FPS}fps, ${DURATION_SEC}s\n`);

async function captureFrames() {
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const fileUrl = 'file://' + htmlPath.replace(/\\/g, '/');
  console.log(`📂 Loading: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });

  console.log(`🎥 Capturing ${TOTAL_FRAMES} frames...\n`);

  let lastProgressPercent = 0;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const timestamp = i / FPS;

    // Update slide visibility
    await page.evaluate(({ t }) => {
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

      // Animate KPI numbers (seconds 30-48)
      if (t >= 30 && t < 48) {
        const kpiProgress = (t - 30) / 18;
        const kpiNumbers = document.querySelectorAll('.kpi-number');

        kpiNumbers.forEach(kpi => {
          const target = parseFloat(kpi.getAttribute('data-value') || 0);
          const current = target * Math.min(kpiProgress, 1);
          const value = target > 0 ? Math.round(current * 10) / 10 : Math.round(current);
          kpi.textContent = value;
        });

        // Animate progress bars
        const bars = document.querySelectorAll('.kpi-bar-fill');
        bars.forEach(bar => {
          bar.style.width = (Math.min(kpiProgress, 1) * 100) + '%';
        });
      }
    }, { t: timestamp });

    // Capture frame
    const framePath = path.join(framesDir, `frame-${String(i).padStart(6, '0')}.png`);
    await page.screenshot({ path: framePath });

    const progressPercent = Math.floor((i / TOTAL_FRAMES) * 100);
    if (progressPercent !== lastProgressPercent && progressPercent % 5 === 0) {
      console.log(`  ${progressPercent}% (${i}/${TOTAL_FRAMES} frames)`);
      lastProgressPercent = progressPercent;
    }
  }

  console.log(`✅ Frame capture complete!\n`);
  await browser.close();
}

function encodeVideo() {
  return new Promise((resolve, reject) => {
    console.log('🎬 Encoding video with FFmpeg...\n');

    const args = [
      '-y',
      '-framerate', String(FPS),
      '-i', path.join(framesDir, 'frame-%06d.png'),
      '-i', audioPath,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-v', 'info',
      outputPath
    ];

    const ffmpeg = spawn('ffmpeg', args);
    let lastLine = '';

    ffmpeg.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      lastLine = lines[lines.length - 2] || lastLine;
      if (lastLine.includes('frame=')) {
        process.stdout.write(`\r${lastLine.trim().substring(0, 80)}`);
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Video encoding complete!\n');
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
    await captureFrames();
    await encodeVideo();

    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      console.log('📊 Final Output:');
      console.log(`  📁 Path: ${outputPath}`);
      console.log(`  📦 Size: ${sizeMB} MB`);
      console.log(`  ⏱️  Duration: ${DURATION_SEC}s`);
      console.log(`  📹 Resolution: ${WIDTH}x${HEIGHT}`);
      console.log(`  🎬 Framerate: ${FPS}fps`);
      console.log(`  🔊 Audio: Synced (192k AAC)\n`);

      // Cleanup
      console.log('🧹 Cleaning up temporary frames...');
      fs.rmSync(framesDir, { recursive: true });
      console.log('✅ Done!\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true });
    }
    process.exit(1);
  }
}

main();
