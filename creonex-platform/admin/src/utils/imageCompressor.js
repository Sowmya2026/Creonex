/**
 * Handles image compression and conversion to Base64 (Data URL).
 * Ideal for storing images directly in Firestore (limit < 1MB).
 * 
 * @param {File} file - The image file object
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width (default: 800px)
 * @param {number} options.maxHeight - Max height (default: 800px)
 * @param {number} options.quality - Quality 0-1 (default: 0.7)
 * @returns {Promise<string>} Base64 string
 */
export const compressImage = (file, options = {}) => {
    return new Promise((resolve, reject) => {
        const { maxWidth = 800, maxHeight = 800, quality = 0.7 } = options;
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed Base64
                // Use JPEG for photos as it compresses better than PNG
                // If transparency is needed, use 'image/webp' if browser supports it, or 'image/png'
                const outputFormat = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
                // Note: to save space in Firestore, JPEG/WebP is preferred over PNG unless transparency is vital.
                // Let's force WebP if possible for best compression/quality ratio, or JPEG.
                // However, user might need transparency. Let's stick to input type but resize aggressively.

                const dataUrl = canvas.toDataURL(outputFormat, quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
            img.src = event.target.result;
        };

        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};
