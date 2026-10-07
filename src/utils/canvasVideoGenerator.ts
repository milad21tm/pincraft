import { PosterDesignConfig, ProductData } from '../types';
import { loadImage, createIsolatedProductCanvas } from './canvasPosterRenderer';

export interface VideoGenerationProgress {
  progress: number; // 0 to 100
  phase: string;
}

/**
 * Generate a 6-second high-conversion animated Pinterest Video Pin (1080x1920)
 * using Canvas + MediaRecorder
 */
export async function generatePinterestVideoPin(
  product: ProductData,
  config: PosterDesignConfig,
  onProgress?: (p: VideoGenerationProgress) => void
): Promise<{ videoBlob: Blob; videoUrl: string }> {
  const width = 720; // 720x1280 or 1080x1920 (720x1280 delivers fast, silky smooth 30fps recording in browser)
  const height = 1280;
  const fps = 30;
  const durationSeconds = 6;
  const totalFrames = fps * durationSeconds;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context');

  // Load product image
  onProgress?.({ progress: 10, phase: 'بارگذاری دارایی‌های بصری...' });
  const imgSrc =
    product.images[config.selectedImageIndex] ||
    product.images[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=85';

  const rawImg = await loadImage(imgSrc);
  const prodElement = config.removeBackground
    ? createIsolatedProductCanvas(rawImg, 35)
    : rawImg;

  // Setup MediaRecorder
  const stream = canvas.captureStream(fps);
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }
  if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 3500000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<{ videoBlob: Blob; videoUrl: string }>(
    (resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        resolve({ videoBlob: blob, videoUrl });
      };
      recorder.onerror = (err) => reject(err);
    }
  );

  recorder.start();

  onProgress?.({ progress: 20, phase: 'رندر فریم‌های انیمیشن ویدیو پین...' });

  // Render loop
  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / totalFrames; // 0.0 to 1.0
    const timeSec = t * durationSeconds;

    renderVideoFrame(ctx, width, height, prodElement, product, config, t, timeSec);

    // Give browser event loop breathing room every 5 frames
    if (frame % 5 === 0) {
      const currentPct = 20 + Math.floor((frame / totalFrames) * 75);
      onProgress?.({
        progress: currentPct,
        phase: `رندر فریم ${frame + 1} از ${totalFrames} (${Math.round(timeSec)} ثانیه)...`,
      });
      await new Promise((r) => setTimeout(r, 16));
    }
  }

  onProgress?.({ progress: 95, phase: 'فشرده‌سازی و نهایی‌سازی فایل ویدیو...' });
  recorder.stop();

  const result = await recordingPromise;
  onProgress?.({ progress: 100, phase: 'ویدیو با موفقیت تولید شد!' });
  return result;
}

function renderVideoFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  prodImg: CanvasImageSource,
  product: ProductData,
  config: PosterDesignConfig,
  progress: number,
  timeSec: number
) {
  ctx.clearRect(0, 0, width, height);

  // 1. Dynamic Background with subtle shifting glow
  const bgGrad = ctx.createLinearGradient(
    0,
    0,
    width * (1 + Math.sin(progress * Math.PI) * 0.1),
    height
  );
  bgGrad.addColorStop(0, '#09090b');
  bgGrad.addColorStop(0.5, '#18181b');
  bgGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Animated radial glow behind product
  const glowRadius = 250 + Math.sin(timeSec * 3) * 30;
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    30,
    width / 2,
    height * 0.42,
    glowRadius
  );
  radialGlow.addColorStop(0, 'rgba(225, 29, 72, 0.22)');
  radialGlow.addColorStop(0.7, 'rgba(244, 63, 94, 0.05)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Animated Product (Smooth Ken Burns Slow Zoom)
  const zoomFactor = 1 + progress * 0.08; // 1.0 -> 1.08
  const baseBoxW = width * 0.72;
  const baseBoxH = height * 0.44;
  const curW = baseBoxW * zoomFactor;
  const curH = baseBoxH * zoomFactor;
  const curX = (width - curW) / 2;
  const curY = height * 0.18 + (baseBoxH - curH) / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 20;

  // Draw product
  const imgW = (prodImg as any).naturalWidth || (prodImg as any).width || curW;
  const imgH = (prodImg as any).naturalHeight || (prodImg as any).height || curH;
  const ratio = Math.min(curW / imgW, curH / imgH);
  const dw = imgW * ratio;
  const dh = imgH * ratio;
  const dx = curX + (curW - dw) / 2;
  const dy = curY + (curH - dh) / 2;

  ctx.drawImage(prodImg, dx, dy, dw, dh);
  ctx.restore();

  // 3. Brand Wordmark at top
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px "Plus Jakarta Sans", "Vazirmatn", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(
    (config.brandText || product.brand || 'PINCRAFT STORE').toUpperCase(),
    width / 2,
    70
  );

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '500 16px "Vazirmatn", sans-serif';
  ctx.fillText(product.category || 'کالکشن پرفروش پینترست', width / 2, 98);
  ctx.restore();

  // 4. Kinetic Hook / Title Reveal
  ctx.save();
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';
  const marginX = 45;

  // Hook tag pops in with bounce
  const hookOpacity = Math.min(1, progress * 4);
  if (config.hookText) {
    ctx.fillStyle = `rgba(253, 164, 175, ${hookOpacity})`;
    ctx.font = '700 20px "Vazirmatn", sans-serif';
    ctx.fillText('✦ ' + config.hookText, width - marginX, height * 0.68);
  }

  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 28px "Vazirmatn", sans-serif';
  ctx.fillText(config.titleText || product.title, width - marginX, height * 0.73, width - marginX * 2);

  // Key Feature with animated checkmark
  if (product.keyFeatures && product.keyFeatures.length > 0 && progress > 0.25) {
    const featOpacity = Math.min(1, (progress - 0.25) * 4);
    ctx.fillStyle = `rgba(255, 255, 255, ${featOpacity * 0.9})`;
    ctx.font = '600 18px "Vazirmatn", sans-serif';
    ctx.fillText('✓ ' + product.keyFeatures[0], width - marginX, height * 0.78);
  }

  // 5. Pulsing Discount Badge
  if (config.showDiscountBadge && config.badgeText) {
    const pulseScale = 1 + Math.sin(timeSec * 5) * 0.05;
    ctx.save();
    ctx.translate(75, 175);
    ctx.scale(pulseScale, pulseScale);
    ctx.font = '700 16px "Vazirmatn", sans-serif';
    const textW = ctx.measureText(config.badgeText).width;
    const bw = textW + 30;
    const bh = 36;
    ctx.fillStyle = '#E11D48';
    drawSimpleRoundedRect(ctx, -bw / 2, -bh / 2, bw, bh, 18);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(config.badgeText, 0, 6);
    ctx.restore();
  }

  // 6. Animated CTA Action Bar at Bottom (Pulsing Button)
  const barY = height - 140;
  const barW = width - marginX * 2;
  const barH = 75;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  drawSimpleRoundedRect(ctx, marginX, barY, barW, barH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Price
  if (config.showPriceBadge && config.priceText) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 26px "Vazirmatn", sans-serif';
    ctx.fillText(config.priceText, width - marginX - 20, barY + 48);
  }

  // Pulsing Shop Button
  const btnPulse = 1 + Math.sin(timeSec * 4) * 0.04;
  const btnW = 220;
  const btnH = 50;
  const btnX = marginX + 16;
  const btnY = barY + (barH - btnH) / 2;

  ctx.save();
  ctx.translate(btnX + btnW / 2, btnY + btnH / 2);
  ctx.scale(btnPulse, btnPulse);
  ctx.fillStyle = '#E11D48';
  drawSimpleRoundedRect(ctx, -btnW / 2, -btnH / 2, btnW, btnH, 14);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '700 20px "Vazirmatn", sans-serif';
  ctx.fillText(config.ctaText || 'مشاهده و خرید 🛒', 0, 7);
  ctx.restore();

  // Progress Bar Indicator at bottom edge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, height - 6, width, 6);
  ctx.fillStyle = '#E11D48';
  ctx.fillRect(0, height - 6, width * progress, 6);

  ctx.restore();
}

function drawSimpleRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
