/**
 * Utility to process, compress and convert local gallery images to clean Data URLs
 */
export async function fileToDataUrl(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG format for photos to optimize size
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extract average/dominant hex color from an image data URL (useful for fabric swatch photos)
 */
export async function extractAverageColor(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('#C75C5C');
        return;
      }
      ctx.drawImage(img, 0, 0, 16, 16);
      const imageData = ctx.getImageData(0, 0, 16, 16).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        // Skip purely transparent or close to pure white/black if mixed
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
      if (count === 0) {
        resolve('#C75C5C');
        return;
      }
      const avgR = Math.round(r / count).toString(16).padStart(2, '0');
      const avgG = Math.round(g / count).toString(16).padStart(2, '0');
      const avgB = Math.round(b / count).toString(16).padStart(2, '0');
      resolve(`#${avgR}${avgG}${avgB}`);
    };
    img.onerror = () => resolve('#C75C5C');
    img.src = dataUrl;
  });
}
