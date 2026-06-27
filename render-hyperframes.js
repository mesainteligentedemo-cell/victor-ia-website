import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renderVideo() {
  const htmlPath = path.resolve(__dirname, 'public/videos/hyperframes-victor-60s.html');
  const audioPath = path.resolve(__dirname, 'public/audio/vo-influence-ia/01_hyperframes_60s.mp3');
  const outputPath = path.resolve(__dirname, 'public/videos/victor-ia-hyperframes-60s.mp4');
  const framesDir = path.resolve(__dirname, '.render-frames');

  // Duraciones
  const DURATION_SEC = 60;
  const FPS = 30;
  const TOTAL_FRAMES = DURATION_SEC * FPS;

  console.log('🎬 Starting HyperFrames render...');
  console.log(`📄 HTML: ${htmlPath}`);
  console.log(`🔊 Audio: ${audioPath}`);
  console.log(`📹 Output: ${outputPath}`);
  console.log(`⏱️  Duration: ${DURATION_SEC}s @ ${FPS}fps (${TOTAL_FRAMES} frames)`);

  // Crear directorio para frames
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  let browser;
  try {
    // Lanzar Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    // Cargar HTML
    const fileUrl = 'file://' + htmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    console.log(`✓ HTML loaded`);

    // Capturar frames
    console.log(`🎥 Capturing ${TOTAL_FRAMES} frames...`);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const timestamp = i / FPS;

      // Animar slides basado en timestamp
      await page.evaluate((t) => {
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
          const fromStr = slide.getAttribute('data-from') || '0s';
          const toStr = slide.getAttribute('data-to') || '60s';
          const from = parseFloat(fromStr);
          const to = parseFloat(toStr);

          if (t >= from && t < to) {
            const progress = (t - from) / (to - from);
            slide.style.opacity = Math.min(1, progress * 2);
          } else {
            slide.style.opacity = 0;
          }
        });

        // Animar KPIs
        const kpiNumbers = document.querySelectorAll('.kpi-number');
        kpiNumbers.forEach(kpi => {
          const targetValue = parseFloat(kpi.getAttribute('data-value') || '0');
          const progress = Math.max(0, (t - 30) / 18);
          const currentValue = targetValue * Math.min(progress, 1);

          if (t >= 30 && t < 48) {
            kpi.textContent = Math.round(currentValue * 10) / 10;
          }
        });

        // Animar progress bars
        const kpiBars = document.querySelectorAll('.kpi-bar-fill');
        kpiBars.forEach(bar => {
          const progress = Math.max(0, (t - 30) / 18);
          const fillPercent = Math.min(100, progress * 100);

          if (t >= 30 && t < 48) {
            bar.style.width = fillPercent + '%';
          }
        });
      }, timestamp);

      // Capturar frame
      const frameNum = String(i).padStart(6, '0');
      const framePath = path.join(framesDir, `frame-${frameNum}.png`);
      await page.screenshot({ path: framePath, omitBackground: true });

      if ((i + 1) % 30 === 0) {
        process.stdout.write(`\r✓ ${i + 1}/${TOTAL_FRAMES} frames captured`);
      }
    }
    console.log(`\n✓ Frame capture complete`);

    await browser.close();

    // Crear video con FFmpeg usando frames + audio
    console.log(`\n🎬 Creating video with FFmpeg...`);

    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-y', // Overwrite output file
        '-framerate', String(FPS),
        '-i', path.join(framesDir, 'frame-%06d.png'),
        '-i', audioPath,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '18',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        outputPath
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);

      ffmpeg.stderr.on('data', (data) => {
        process.stdout.write(`\r${data.toString().trim().split('\n').pop()}`);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`\n\n✅ Video rendered successfully!`);

          // Estadísticas del archivo
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`📊 Final video: ${outputPath}`);
            console.log(`📦 Size: ${sizeMB} MB`);
            console.log(`⏱️  Duration: ${DURATION_SEC}s`);
            console.log(`📹 Codec: H.264 @ ${FPS}fps`);
            console.log(`🔊 Audio: MP3 (synced)`);

            // Limpiar frames
            console.log(`\n🧹 Cleaning up temporary frames...`);
            fs.rmSync(framesDir, { recursive: true });
            console.log(`✓ Cleanup complete`);
          }

          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });

  } catch (error) {
    console.error('❌ Render failed:', error);
    if (browser) await browser.close();
    throw error;
  }
}

renderVideo().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});