export async function uploadFile(file: File, r2Binding?: any, prefix: string = 'upload'): Promise<string | null> {
  if (r2Binding) {
    // Cloudflare R2 Upload
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${prefix}-${Date.now()}-${Math.floor(Math.random()*1000)}.${ext}`;
      
      const buffer = await file.arrayBuffer();
      await r2Binding.put(fileName, buffer, {
        httpMetadata: { contentType: file.type || 'image/png' }
      });
      
      return `/api/media/${fileName}`;
    } catch (e) {
      console.error("R2 Upload failed:", e);
      return null;
    }
  } else {
    // Local Node.js FS Upload
    if (typeof globalThis.process !== 'undefined' && !globalThis.navigator?.userAgent?.includes('Cloudflare')) {
      try {
        const fsName = ['node', 'fs'].join(':');
        const pathName = ['node', 'path'].join(':');
        const fs = await import(/* @vite-ignore */ fsName);
        const path = await import(/* @vite-ignore */ pathName);
        
        const uploadsDir = path.resolve('./public/uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || '.png';
        const fileName = `${prefix}-${Date.now()}-${Math.floor(Math.random()*1000)}${ext}`;
        
        fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
        return `/uploads/${fileName}`;
      } catch (e) {
        console.error("Local FS Upload failed:", e);
        return null;
      }
    }
  }
  return null;
}
