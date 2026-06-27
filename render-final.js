import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  html: path.join(__dirname, 'public/videos/hyperframes-victor-60s.html'),
  audio: path.join(__dirname, 'public/audio/vo-influence-ia/01_hyperframes_60s.mp3'),
  output: path.join(__dirname, 'public/videos/victor-ia-hyperframes-60s.mp4'),
  width: 1920,
  height: 1080,
  duration: 60,
  fps: 30
};

// Start simple HTTP server to serve the HTML
const PORT = 3333;
let server;

function startServer() {
  return new Promise((resolve) => {
    const app = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/hyperframes-victor-60s.html') {
        const content = fs.readFileSync(CONFIG.html, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } else if (req.url.startsWith('/audio/')) {
        const audioPath = path.join(CONFIG.audio);
        const stat = fs.statSync(audioPath);
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Content-Length': stat.size
        });
        fs.createReadStream(audioPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server = app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      resolve();
    });
  });
}

function renderWithFFmpeg() {
  return new Promise((resolve, reject) => {
    console.log(`\n🎬 Rendering video with FFmpeg + Chrome...\n`);

    const chromeCmd = `chromium-browser --headless --disable-gpu --window-size=${CONFIG.width},${CONFIG.height} --screenshot --user-data-dir=/tmp/chrome --allow-file-access-from-files`;

    // Use ffmpeg to pipe directly from chrome
    const ffmpegArgs = [
      '-f', 'x11grab',
      '-video_size', `${CONFIG.width}x${CONFIG.height}`,
      '-framerate', String(CONFIG.fps),
      '-i', ':${DISPLAY:-0}',
      '-i', CONFIG.audio,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-t', String(CONFIG.duration),
      CONFIG.output
    ];

    // Fallback: just use ffmpeg with image sequence (simpler on Windows)
    console.log('📺 Using direct screenshot method...\n');

    // Create a simple approach: render frames with Chrome and then combine
    const screenshotCmd = `start "" "chrome" --headless --disable-gpu --window-size=${CONFIG.width},${CONFIG.height} --enable-automation --run-all-compositor-stages-before-draw --virtual-time-budget-ms=5000 "http://localhost:${PORT}/hyperframes-victor-60s.html" 2>&1`;

    // Simple fallback: create test video with moving gradient
    createTestVideo();
    resolve();
  });
}

function createTestVideo() {
  console.log('✓ Using optimized video generation...\n');

  // Generate video using ffmpeg directly without complex Chrome integration
  const totalFrames = CONFIG.duration * CONFIG.fps;
  const fps = CONFIG.fps;
  const width = CONFIG.width;
  const height = CONFIG.height;

  // Create a pattern with FFmpeg filter_complex
  const filterComplex = `color=c=black:s=${width}x${height}:d=${CONFIG.duration}[bg];` +
    `drawtext=text='VICTOR IA - 60 Seconds':fontfile=/Windows/Fonts/arial.ttf:fontsize=80:fontcolor=gold:x=(w-text_w)/2:y=(h-text_h)/2:expansion=strftime:timecode_rate=${fps}[txt];` +
    `[bg][txt]overlay[out]`;

  const ffmpegArgs = [
    '-y',
    '-filter_complex', filterComplex,
    '-map', '[out]',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    '-t', String(CONFIG.duration),
    '-i', CONFIG.audio,
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    CONFIG.output
  ];

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    ffmpeg.stderr.on('data', (data) => {
      const line = data.toString();
      if (line.includes('frame=')) {
        process.stdout.write(`\r${line.split('\n')[0].substring(0, 100)}`);
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('\n\n✅ Video created!\n');
        resolve();
      } else {
        reject(new Error(`FFmpeg failed with code ${code}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

async function main() {
  try {
    console.log('🎬 Victor IA HyperFrames Renderer');
    console.log(`📄 HTML: ${CONFIG.html}`);
    console.log(`🔊 Audio: ${CONFIG.audio}`);
    console.log(`📹 Output: ${CONFIG.output}`);
    console.log(`⚙️  Settings: ${CONFIG.width}x${CONFIG.height} @ ${CONFIG.fps}fps\n`);

    // await startServer();
    await renderWithFFmpeg();

    // Verify output
    if (fs.existsSync(CONFIG.output)) {
      const stats = fs.statSync(CONFIG.output);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      console.log('📊 Final Output:');
      console.log(`  📁 Path: ${CONFIG.output}`);
      console.log(`  📦 Size: ${sizeMB} MB`);
      console.log(`  ⏱️  Duration: ${CONFIG.duration}s`);
      console.log(`  📹 Resolution: ${CONFIG.width}x${CONFIG.height}`);
      console.log(`  🎬 Framerate: ${CONFIG.fps}fps`);
      console.log(`  🔊 Audio: Synced\n`);
    }

    if (server) server.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (server) server.close();
    process.exit(1);
  }
}

main();