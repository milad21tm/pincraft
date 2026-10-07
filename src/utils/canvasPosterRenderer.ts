import { PosterDesignConfig, ProductData } from '../types';

export function getSafeImageUrl(src: string): string {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/api/')) {
    return src;
  }
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(src)}`;
  }
  return src;
}

/**
 * Helper to load an image safely with crossOrigin and backend proxy fallback
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const targetUrl = getSafeImageUrl(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If direct/proxied load fails, try original URL as fallback
      if (targetUrl !== src) {
        const directImg = new Image();
        directImg.crossOrigin = 'anonymous';
        directImg.onload = () => resolve(directImg);
        directImg.onerror = () => reject(new Error('Failed to load image: ' + src));
        directImg.src = src;
      } else {
        reject(new Error('Failed to load image: ' + src));
      }
    };
    img.src = targetUrl;
  });
}

/**
 * Client-side Chroma background removal helper
 */
export function createIsolatedProductCanvas(
  sourceImg: HTMLImageElement,
  tolerance = 30
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceImg.naturalWidth || sourceImg.width || 600;
  canvas.height = sourceImg.naturalHeight || sourceImg.height || 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Sample corner pixel to estimate background color
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
    );

    // If close to corner background, make transparent
    if (dist < tolerance) {
      data[i + 3] = 0;
    } else if (dist < tolerance + 20) {
      // Soft edge feathering
      data[i + 3] = Math.floor((data[i + 3] * (dist - tolerance)) / 20);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Draw wrapped text nicely on canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        // truncate remaining
        const remaining = words.slice(n).join(' ');
        ctx.fillText(remaining, x, currentY);
        currentY += lineHeight;
        return currentY;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

/**
 * Render complete 1080x1920 (9:16) or 1000x1500 (2:3) Pinterest Poster
 */
export async function renderPinterestPoster(
  canvas: HTMLCanvasElement,
  product: ProductData,
  config: PosterDesignConfig
): Promise<void> {
  const is9x16 = config.aspectRatio === '9:16';
  const width = 1080;
  const height = is9x16 ? 1920 : 1620;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // 1. Background Setup
  if (config.customBackdropUrl) {
    try {
      const bgImg = await loadImage(config.customBackdropUrl);
      ctx.drawImage(bgImg, 0, 0, width, height);
      // Soft scrim overlay for readability
      const scrim = ctx.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      scrim.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
      scrim.addColorStop(0.7, 'rgba(0, 0, 0, 0.35)');
      scrim.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, width, height);
    } catch {
      drawDefaultBackground(ctx, width, height, config.templateStyle);
    }
  } else {
    drawDefaultBackground(ctx, width, height, config.templateStyle);
  }

  // 2. Product Image
  const imgSrc =
    product.images[config.selectedImageIndex] ||
    product.images[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=85';

  try {
    const rawProductImg = await loadImage(imgSrc);
    let finalProductElement: CanvasImageSource = rawProductImg;

    if (config.removeBackground) {
      finalProductElement = createIsolatedProductCanvas(rawProductImg, 35);
    }

    // Position Product in Center with luxury layout
    const prodBoxY = height * 0.22;
    const prodBoxHeight = height * 0.46;
    const prodBoxWidth = width * 0.82;
    const prodBoxX = (width - prodBoxWidth) / 2;

    // Draw luxury glass or pedestal underlay if not custom backdrop
    if (!config.customBackdropUrl && !config.removeBackground) {
      // Rounded card frame with subtle border
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 15;
      drawRoundedRect(ctx, prodBoxX, prodBoxY, prodBoxWidth, prodBoxHeight, 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
      ctx.restore();

      // Clip image inside rounded box
      ctx.save();
      drawRoundedRect(ctx, prodBoxX, prodBoxY, prodBoxWidth, prodBoxHeight, 28);
      ctx.clip();

      // Draw aspect-fill
      drawImageAspectFill(
        ctx,
        finalProductElement,
        prodBoxX,
        prodBoxY,
        prodBoxWidth,
        prodBoxHeight
      );
      ctx.restore();
    } else {
      // Floating isolated product with soft 3D shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 25;

      const pW = prodBoxWidth * 0.88;
      const pH = prodBoxHeight * 0.88;
      const pX = (width - pW) / 2;
      const pY = prodBoxY + (prodBoxHeight - pH) / 2;

      drawImageAspectFit(ctx, finalProductElement, pX, pY, pW, pH);
      ctx.restore();
    }
  } catch (e) {
    console.error('Failed to draw product image:', e);
  }

  // 3. Top Zone: Brand Wordmark & Category
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 34px "Plus Jakarta Sans", "Vazirmatn", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(
    (config.brandText || product.brand || 'PINCRAFT STORE').toUpperCase(),
    width / 2,
    110
  );

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '500 24px "Vazirmatn", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(product.category || 'مجموعه جدید ۲۰۲۶', width / 2, 155);
  ctx.restore();

  // 4. Badges (Discount & USP)
  if (config.showDiscountBadge && config.badgeText) {
    ctx.save();
    const badgeX = 80;
    const badgeY = height * 0.20;
    drawBadge(ctx, badgeX, badgeY, config.badgeText, '#E11D48', '#FFFFFF');
    ctx.restore();
  }

  // 5. Bottom Typography & Copy Area
  const bottomBoxY = height * 0.71;
  const paddingX = 75;
  const contentWidth = width - paddingX * 2;

  ctx.save();
  // Hook / Problem-Solution Headline
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';

  if (config.hookText) {
    ctx.fillStyle = '#FDA4AF'; // Soft rose accent
    ctx.font = '700 32px "Vazirmatn", sans-serif';
    ctx.fillText('✦ ' + config.hookText, width - paddingX, bottomBoxY + 30);
  }

  // Main Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 48px "Vazirmatn", sans-serif';
  const titleY = config.hookText ? bottomBoxY + 95 : bottomBoxY + 50;
  wrapText(
    ctx,
    config.titleText || product.title,
    width - paddingX,
    titleY,
    contentWidth,
    62,
    2
  );

  // Key Features Bullet (1 or 2 high points)
  if (product.keyFeatures && product.keyFeatures.length > 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '500 25px "Vazirmatn", sans-serif';
    const featY = titleY + 125;
    ctx.fillText('✓ ' + product.keyFeatures[0], width - paddingX, featY);
    if (product.keyFeatures[1]) {
      ctx.fillText('✓ ' + product.keyFeatures[1], width - paddingX, featY + 38);
    }
  }

  // Price & CTA Action Bar
  const ctaBarY = height - 190;
  const ctaBarHeight = 96;

  // Background Bar for CTA
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  drawRoundedRect(ctx, paddingX, ctaBarY, contentWidth, ctaBarHeight, 24);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.stroke();

  // Price on Right / Left depending on RTL
  if (config.showPriceBadge && config.priceText) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 38px "Vazirmatn", sans-serif';
    ctx.fillText(config.priceText, width - paddingX - 30, ctaBarY + 62);

    if (product.originalPrice) {
      ctx.font = '500 24px "Vazirmatn", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      const priceMetrics = ctx.measureText(config.priceText);
      const strikeX = width - paddingX - 45 - priceMetrics.width;
      ctx.fillText(product.originalPrice, strikeX, ctaBarY + 60);
      // strikethrough line
      const origMetrics = ctx.measureText(product.originalPrice);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(strikeX + origMetrics.width + 5, ctaBarY + 52);
      ctx.lineTo(strikeX - 5, ctaBarY + 52);
      ctx.stroke();
    }
  }

  // Clickable Action Pill Button on opposite side
  const btnWidth = 340;
  const btnHeight = 64;
  const btnX = paddingX + 24;
  const btnY = ctaBarY + (ctaBarHeight - btnHeight) / 2;

  ctx.shadowColor = 'rgba(225, 29, 72, 0.4)';
  ctx.shadowBlur = 20;
  drawRoundedRect(ctx, btnX, btnY, btnWidth, btnHeight, 18);
  ctx.fillStyle = '#E11D48'; // Rose 600
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 28px "Vazirmatn", sans-serif';
  ctx.fillText(config.ctaText || 'مشاهده و خرید 🛒', btnX + btnWidth / 2, btnY + 43);

  // Bottom Pinterest Indicator
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '500 20px "Plus Jakarta Sans", "Vazirmatn", sans-serif';
  ctx.fillText('PIN ON PINTEREST  ·  LIMITED STOCK', width / 2, height - 45);

  ctx.restore();
}

/**
 * Draw background based on style
 */
function drawDefaultBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: PosterDesignConfig['templateStyle']
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);

  switch (style) {
    case 'luxury_editorial':
      gradient.addColorStop(0, '#1c1917'); // Warm dark stone
      gradient.addColorStop(0.4, '#0c0a09');
      gradient.addColorStop(1, '#171717');
      break;
    case 'minimal_studio':
      gradient.addColorStop(0, '#262626');
      gradient.addColorStop(0.5, '#171717');
      gradient.addColorStop(1, '#0a0a0a');
      break;
    case 'bold_sale':
      gradient.addColorStop(0, '#4c0519'); // Dark rose wine
      gradient.addColorStop(0.5, '#1c1917');
      gradient.addColorStop(1, '#09090b');
      break;
    case 'organic_lifestyle':
      gradient.addColorStop(0, '#14281d'); // Deep pine botanical
      gradient.addColorStop(0.6, '#0f1715');
      gradient.addColorStop(1, '#080d0b');
      break;
    case 'tech_dark':
    default:
      gradient.addColorStop(0, '#0f172a'); // Deep slate
      gradient.addColorStop(0.5, '#020617');
      gradient.addColorStop(1, '#090d16');
      break;
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient radial glow behind product
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    40,
    width / 2,
    height * 0.42,
    width * 0.65
  );
  radialGlow.addColorStop(0, 'rgba(244, 63, 94, 0.12)');
  radialGlow.addColorStop(0.6, 'rgba(255, 255, 255, 0.03)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Subtle geometric grid hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 60; x < width; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawRoundedRect(
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

function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bgColor: string,
  textColor: string
) {
  ctx.font = '700 24px "Vazirmatn", sans-serif';
  const paddingX = 22;
  const paddingY = 12;
  const textWidth = ctx.measureText(text).width;
  const w = textWidth + paddingX * 2;
  const h = 48;

  ctx.shadowColor = 'rgba(225, 29, 72, 0.5)';
  ctx.shadowBlur = 15;
  drawRoundedRect(ctx, x, y, w, h, 24);
  ctx.fillStyle = bgColor;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w / 2, y + 33);
}

function drawImageAspectFill(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = (img as HTMLImageElement).naturalWidth || (img as any).width || w;
  const imgH = (img as HTMLImageElement).naturalHeight || (img as any).height || h;
  const ratio = Math.max(w / imgW, h / imgH);
  const nw = imgW * ratio;
  const nh = imgH * ratio;
  const nx = x + (w - nw) / 2;
  const ny = y + (h - nh) / 2;
  ctx.drawImage(img, nx, ny, nw, nh);
}

function drawImageAspectFit(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = (img as HTMLImageElement).naturalWidth || (img as any).width || w;
  const imgH = (img as HTMLImageElement).naturalHeight || (img as any).height || h;
  const ratio = Math.min(w / imgW, h / imgH);
  const nw = imgW * ratio;
  const nh = imgH * ratio;
  const nx = x + (w - nw) / 2;
  const ny = y + (h - nh) / 2;
  ctx.drawImage(img, nx, ny, nw, nh);
}
