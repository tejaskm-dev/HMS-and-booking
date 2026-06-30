/**
 * Utility to compress files client-side before uploading.
 * Heavily compresses images down to KBs using canvas.
 */
export async function compressFile(file: File): Promise<File> {
  // Only compress images. Other file types (like videos or PDFs) cannot be
  // compressed client-side in a lightweight way, so we return them as-is.
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Max dimension for the compressed image (1200px is perfect for chat previews/detail views)
        const MAX_DIMENSION = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object from the blob
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              
              console.log(
                `[Compression] Compressed "${file.name}" from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024).toFixed(2)}KB`
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.6 // Quality: 0.6 is the sweet spot for heavy compression with good clarity
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
