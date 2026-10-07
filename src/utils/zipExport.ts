import JSZip from 'jszip';
import { PinMetadata, ProductData } from '../types';

export async function exportPinterestZipPackage(
  canvas: HTMLCanvasElement | null,
  product: ProductData,
  metadata: PinMetadata,
  selectedTitle: string,
  selectedDesc: string
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Export High-Res PNG
  if (canvas) {
    const pngDataUrl = canvas.toDataURL('image/png');
    const pngBase64 = pngDataUrl.replace(/^data:image\/png;base64,/, '');
    zip.file('01_pinterest_poster_1080x1920.png', pngBase64, { base64: true });

    // 2. Export High-Res JPG
    const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const jpgBase64 = jpgDataUrl.replace(/^data:image\/jpeg;base64,/, '');
    zip.file('02_pinterest_poster_optimized.jpg', jpgBase64, { base64: true });
  }

  // 3. Export Comprehensive Pinterest Metadata Text
  const textContent = `=====================================================
📌 PINTEREST AUTOMATION HUB - READY-TO-PUBLISH METADATA
=====================================================

محصول: ${product.title}
برند: ${product.brand}
قیمت: ${product.price}
لینک محصول جهت تگ کردن در پین: ${product.sourceUrl || ''}

-----------------------------------------------------
1. عنوان پیشنهادی و بهینه‌شده پین (PIN TITLE):
-----------------------------------------------------
${selectedTitle || metadata.titles[0]?.text}

سایر مدل‌های عنوان سئو:
${metadata.titles.map((t, i) => `[مدل ${i + 1} - ${t.style}]: ${t.text}`).join('\n')}

-----------------------------------------------------
2. توضیحات بهینه‌شده پین (PIN DESCRIPTION):
-----------------------------------------------------
${selectedDesc || metadata.descriptions[0]?.text}

مدل جایگزین توضیحات:
${metadata.descriptions[1]?.text || ''}

-----------------------------------------------------
3. دعوت به اقدام (CALL TO ACTION):
-----------------------------------------------------
${metadata.callToAction}

-----------------------------------------------------
4. متن جایگزین برای سئو و دسترسی‌پذیری (ALT TEXT):
-----------------------------------------------------
${metadata.altText}

-----------------------------------------------------
5. هشتگ‌های ترند پینترست (TRENDING HASHTAGS):
-----------------------------------------------------
${metadata.trendingHashtags.join(' ')}

-----------------------------------------------------
6. بردهای پیشنهادی جهت ذخیره پین (SUGGESTED BOARDS):
-----------------------------------------------------
${metadata.pinterestBoards.join('\n')}

-----------------------------------------------------
نکات مهم افزایش تعامل پینترست:
- بهترین زمان انتشار پین: ساعت ۸ شب الی ۱۱ شب.
- حتماً لینک مستقیم صفحه محصول را در فیلد Destination Link وارد نمایید.
- در بردهای مرتبط ذخیره کنید تا به عنوان پین اصلی ایندکس شود.
=====================================================`;

  zip.file('03_pinterest_metadata_ready.txt', textContent);

  // 4. Export JSON for developer/automation tools
  const jsonContent = JSON.stringify(
    {
      product,
      metadata,
      selectedTitle,
      selectedDesc,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
  zip.file('04_pinterest_payload.json', jsonContent);

  return await zip.generateAsync({ type: 'blob' });
}
