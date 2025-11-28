/**
 * Image Cropping Utilities
 * Helper functions for image cropping operations
 */

/**
 * Creates a cropped image blob from a source image and crop area
 * @param {string|File} imageSrc - Source image URL or File
 * @param {Object} cropAreaPixels - Crop area in pixels {x, y, width, height}
 * @param {number} rotation - Rotation angle in degrees
 * @returns {Promise<Blob>} Cropped image blob
 */
export const getCroppedImg = async (imageSrc, cropAreaPixels, rotation = 0) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // Handle File objects
    if (imageSrc instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        image.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSrc);
    } else {
      image.src = imageSrc;
    }

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const { width, height } = cropAreaPixels;

      // Set canvas size to crop dimensions
      canvas.width = width;
      canvas.height = height;

      // Apply rotation if needed
      if (rotation !== 0) {
        const radians = (rotation * Math.PI) / 180;
        ctx.translate(width / 2, height / 2);
        ctx.rotate(radians);
        ctx.translate(-width / 2, -height / 2);
      }

      // Draw the cropped image
      ctx.drawImage(
        image,
        cropAreaPixels.x,
        cropAreaPixels.y,
        cropAreaPixels.width,
        cropAreaPixels.height,
        0,
        0,
        width,
        height
      );

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        0.95
      );
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

/**
 * Creates a File object from a cropped blob
 * @param {Blob} blob - Cropped image blob
 * @param {string} fileName - Original file name
 * @returns {File} File object
 */
export const blobToFile = (blob, fileName) => {
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  const newFileName = `${nameWithoutExt}_cropped.${extension}`;
  
  return new File([blob], newFileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

/**
 * Gets image dimensions from a File or URL
 * @param {string|File} imageSrc - Image source
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    if (imageSrc instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        image.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSrc);
    } else {
      image.src = imageSrc;
    }

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

/**
 * Calculates crop area to center a specific aspect ratio within an image
 * @param {number} imageWidth - Image width in pixels
 * @param {number} imageHeight - Image height in pixels
 * @param {number} aspectRatio - Desired aspect ratio (width / height)
 * @returns {Object} Crop area {x, y, width, height}
 */
export const getCenteredCropArea = (imageWidth, imageHeight, aspectRatio) => {
  const imageAspectRatio = imageWidth / imageHeight;
  
  let cropWidth, cropHeight;
  
  if (imageAspectRatio > aspectRatio) {
    // Image is wider than desired aspect ratio
    cropHeight = imageHeight;
    cropWidth = imageHeight * aspectRatio;
  } else {
    // Image is taller than desired aspect ratio
    cropWidth = imageWidth;
    cropHeight = imageWidth / aspectRatio;
  }
  
  const x = (imageWidth - cropWidth) / 2;
  const y = (imageHeight - cropHeight) / 2;
  
  return {
    x,
    y,
    width: cropWidth,
    height: cropHeight,
  };
};
