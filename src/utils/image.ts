export const flipImage = async (src: string, horizontal: boolean, vertical: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas context not available"));
      
      ctx.translate(horizontal ? img.width : 0, vertical ? img.height : 0);
      ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

export const cropImageTo9x16 = async (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetRatio = 9 / 16;
      const imgRatio = img.width / img.height;
      
      let cropWidth = img.width;
      let cropHeight = img.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        // Image is wider than 9:16, crop width
        cropWidth = img.height * targetRatio;
        offsetX = (img.width - cropWidth) / 2;
      } else {
        // Image is taller than 9:16, crop height
        cropHeight = img.width / targetRatio;
        offsetY = (img.height - cropHeight) / 2;
      }

      // Resize to exactly 720x1280 for Veo
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas context not available"));
      
      ctx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 0, 720, 1280);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};
