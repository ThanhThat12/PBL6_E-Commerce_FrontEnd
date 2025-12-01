/**
 * ImageLightbox Component
 * Full-screen image viewer with navigation, zoom, and keyboard support
 * Uses yet-another-react-lightbox library
 */

import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Download from 'yet-another-react-lightbox/plugins/download';
import './ImageLightbox.css';

const ImageLightbox = ({
  images,
  isOpen,
  initialIndex = 0,
  onClose,
  onIndexChange,
  onDownload,
  enableZoom = true,
  enableDownload = true,
  enableSlideshow = false,
  slideshowInterval = 3000,
  showThumbnails = true,
  thumbnailsPosition = 'bottom',
  showNavigation = true,
  showCounter = true,
  loop = true,
  className = '',
  overlayClassName = '',
  toolbarClassName = '',
  animationDuration = 300,
  animationType = 'fade',
}) => {
  // Convert images to lightbox format
  const slides = images.map((image) => ({
    src: image.src,
    alt: image.alt || '',
    width: image.width,
    height: image.height,
    srcSet: image.srcSet,
    download: image.downloadName || image.src,
    caption: image.caption,
  }));

  // Configure plugins
  const plugins = [];
  
  if (enableZoom) {
    plugins.push(Zoom);
  }
  
  if (showThumbnails) {
    plugins.push(Thumbnails);
  }
  
  if (enableSlideshow) {
    plugins.push(Slideshow);
  }
  
  if (enableDownload) {
    plugins.push(Download);
  }

  // Handle index change
  const handleSlideChange = ({ index }) => {
    if (onIndexChange) {
      onIndexChange(index);
    }
  };

  // Custom download handler
  const handleDownload = ({ slide, index }) => {
    if (onDownload && images[index]) {
      onDownload(images[index]);
    }
  };

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={initialIndex}
      plugins={plugins}
      on={{
        view: handleSlideChange,
        download: handleDownload,
      }}
      carousel={{
        finite: !loop,
      }}
      animation={{
        fade: animationDuration,
        swipe: animationDuration,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      render={{
        buttonPrev: showNavigation ? undefined : () => null,
        buttonNext: showNavigation ? undefined : () => null,
      }}
      zoom={
        enableZoom
          ? {
              maxZoomPixelRatio: 3,
              scrollToZoom: true,
            }
          : undefined
      }
      thumbnails={
        showThumbnails
          ? {
              position: thumbnailsPosition,
              width: 100,
              height: 100,
              border: 2,
              borderRadius: 4,
              padding: 4,
              gap: 8,
              vignette: true,
            }
          : undefined
      }
      slideshow={
        enableSlideshow
          ? {
              autoplay: false,
              delay: slideshowInterval,
            }
          : undefined
      }
      download={
        enableDownload
          ? {
              download: handleDownload,
            }
          : undefined
      }
      className={`image-lightbox ${className}`}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
      }}
    />
  );
};

export default ImageLightbox;
