import React, { useState } from 'react';
import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon, 
  XMarkIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

/**
 * ImagePreview Component - Xem trước hình ảnh với zoom, fullscreen
 * 
 * @param {string} src - URL hình ảnh
 * @param {string} alt - Alt text
 * @param {string} title - Tiêu đề hiển thị
 * @param {boolean} showControls - Hiển thị controls zoom
 * @param {boolean} allowFullscreen - Cho phép fullscreen
 * @param {string} className - Custom classes
 */
const ImagePreview = ({ 
  src,
  alt = 'Image preview',
  title = '',
  showControls = true,
  allowFullscreen = true,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    handleResetZoom();
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Preview Component
  const PreviewContent = ({ isFullscreenMode = false }) => (
    <div 
      className={`
        relative 
        ${isFullscreenMode 
          ? 'w-full h-full bg-neutral-900 flex items-center justify-center' 
          : `rounded-lg overflow-hidden border border-border shadow-soft ${className}`
        }
      `}
      onWheel={handleWheel}
    >
      {/* Image Container */}
      <div
        className={`
          relative 
          overflow-hidden
          ${isFullscreenMode ? 'w-full h-full' : 'w-full h-full'}
          ${zoom > 1 ? 'cursor-move' : 'cursor-zoom-in'}
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="w-full h-full object-contain select-none transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
        />
      </div>

      {/* Title */}
      {title && isFullscreenMode && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className={`
          absolute 
          ${isFullscreenMode ? 'bottom-8 left-1/2 transform -translate-x-1/2' : 'bottom-4 right-4'}
          flex items-center gap-2
          bg-white/90 
          backdrop-blur-sm
          rounded-lg 
          p-2 
          shadow-medium
        `}>
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="
              p-2 
              rounded-md 
              hover:bg-neutral-100 
              disabled:opacity-50 
              disabled:cursor-not-allowed
              transition-colors
            "
            aria-label="Zoom out"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5 text-text-primary" />
          </button>

          {/* Zoom Level */}
          <span className="text-sm font-semibold text-text-primary px-2 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="
              p-2 
              rounded-md 
              hover:bg-neutral-100 
              disabled:opacity-50 
              disabled:cursor-not-allowed
              transition-colors
            "
            aria-label="Zoom in"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5 text-text-primary" />
          </button>

          {/* Reset */}
          {zoom !== 1 && (
            <button
              onClick={handleResetZoom}
              className="
                px-3 
                py-2 
                rounded-md 
                hover:bg-neutral-100 
                transition-colors
                text-xs
                font-semibold
                text-text-primary
              "
            >
              Reset
            </button>
          )}

          {/* Fullscreen */}
          {allowFullscreen && !isFullscreenMode && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={handleFullscreen}
                className="
                  p-2 
                  rounded-md 
                  hover:bg-neutral-100 
                  transition-colors
                "
                aria-label="Fullscreen"
              >
                <ArrowsPointingOutIcon className="w-5 h-5 text-text-primary" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Close Fullscreen */}
      {isFullscreenMode && (
        <button
          onClick={handleCloseFullscreen}
          className="
            absolute 
            top-4 
            right-4 
            p-2 
            rounded-full 
            bg-white/90 
            hover:bg-white
            transition-colors
            shadow-medium
          "
          aria-label="Close fullscreen"
        >
          <XMarkIcon className="w-6 h-6 text-text-primary" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Normal Preview */}
      <PreviewContent />

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-neutral-900">
          <PreviewContent isFullscreenMode={true} />
        </div>
      )}
    </>
  );
};

export default ImagePreview;
