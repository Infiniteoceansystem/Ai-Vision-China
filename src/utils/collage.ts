export const createCollage = async (images: string[], type: '2x2' | '1x2' | '2x1'): Promise<string> => {
  if (images.length === 0) throw new Error("No images provided for collage");
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas context not available");
  
  const loadedImages = await Promise.all(images.map(src => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }));

  const width = loadedImages[0].width;
  const height = loadedImages[0].height;

  // Add a small gap between images (e.g., 20px) and white background
  const gap = 20;

  if (type === '2x2') {
    canvas.width = width * 2 + gap * 3;
    canvas.height = height * 2 + gap * 3;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const positions = [
      {x: gap, y: gap}, 
      {x: width + gap * 2, y: gap},
      {x: gap, y: height + gap * 2}, 
      {x: width + gap * 2, y: height + gap * 2}
    ];
    loadedImages.slice(0, 4).forEach((img, i) => {
      if (positions[i]) {
        ctx.drawImage(img, positions[i].x, positions[i].y, width, height);
      }
    });
  } else if (type === '1x2') {
    canvas.width = width * 2 + gap * 3;
    canvas.height = height + gap * 2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    loadedImages.slice(0, 2).forEach((img, i) => {
      ctx.drawImage(img, gap + i * (width + gap), gap, width, height);
    });
  } else if (type === '2x1') {
    canvas.width = width + gap * 2;
    canvas.height = height * 2 + gap * 3;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    loadedImages.slice(0, 2).forEach((img, i) => {
      ctx.drawImage(img, gap, gap + i * (height + gap), width, height);
    });
  }

  return canvas.toDataURL('image/png');
};
