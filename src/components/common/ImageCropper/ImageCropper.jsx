/**
 * ImageCropper Component
 * Modal dialog for cropping images with zoom, pan, and rotation controls
 * Uses react-easy-crop library
 */

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropper.css';

const ImageCropper = ({
  image,
  aspectRatio,
  cropShape = 'rect',
  minWidth,
  minHeight,
  initialCropArea,
  minZoom = 1,
  maxZoom = 3,
  initialZoom = 1,
  enableRotation = true,
  rotationStep = 90,
  showGrid = true,
  showZoomControls = true,
  showRotationControls = true,
  restrictPosition = true,
  onCropComplete,
  onCancel,
  onZoomChange,
  onRotationChange,
  isOpen,
  onClose,
  className = '',
  cropperClassName = '',
  controlsClassName = '',
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Get image source URL
  const getImageSrc = () => {
    if (typeof image === 'string') {
      return image;
    }
    if (image instanceof File || image instanceof Blob) {
      return URL.createObjectURL(image);
    }
    return '';
  };

  const handleCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const handleZoomChange = useCallback(
    (newZoom) => {
      setZoom(newZoom);
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    },
    [onZoomChange]
  );

  const handleRotationChange = useCallback(
    (newRotation) => {
      setRotation(newRotation);
      if (onRotationChange) {
        onRotationChange(newRotation);
      }
    },
    [onRotationChange]
  );

  const handleCropComplete = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (croppedAreaPixels && onCropComplete) {
      onCropComplete(croppedAreaPixels, rotation);
    }
    onClose();
  }, [croppedAreaPixels, rotation, onCropComplete, onClose]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  }, [onCancel, onClose]);

  const handleRotateLeft = useCallback(() => {
    const newRotation = rotation - rotationStep;
    handleRotationChange(newRotation);
  }, [rotation, rotationStep, handleRotationChange]);

  const handleRotateRight = useCallback(() => {
    const newRotation = rotation + rotationStep;
    handleRotationChange(newRotation);
  }, [rotation, rotationStep, handleRotationChange]);

  if (!isOpen) {
    return null;
  }

  const imageSrc = getImageSrc();

  return (
    <div className={`image-cropper-modal ${className}`}>
      <div className="image-cropper-overlay" onClick={handleCancel} />
      
      <div className="image-cropper-container">
        {/* Header */}
        <div className="image-cropper-header">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <button
            className="image-cropper-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Cropper Area */}
        <div className={`image-cropper-area ${cropperClassName}`}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape={cropShape}
            showGrid={showGrid}
            restrictPosition={restrictPosition}
            minZoom={minZoom}
            maxZoom={maxZoom}
            onCropChange={handleCropChange}
            onZoomChange={handleZoomChange}
            onRotationChange={handleRotationChange}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Controls */}
        <div className={`image-cropper-controls ${controlsClassName}`}>
          {/* Zoom Controls */}
          {showZoomControls && (
            <div className="image-cropper-control-group">
              <label className="text-sm font-medium">Zoom</label>
              <div className="flex items-center gap-3">
                <button
                  className="control-btn"
                  onClick={() => handleZoomChange(Math.max(minZoom, zoom - 0.1))}
                  disabled={zoom <= minZoom}
                >
                  −
                </button>
                <input
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <button
                  className="control-btn"
                  onClick={() => handleZoomChange(Math.min(maxZoom, zoom + 0.1))}
                  disabled={zoom >= maxZoom}
                >
                  +
                </button>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {zoom.toFixed(1)}x
                </span>
              </div>
            </div>
          )}

          {/* Rotation Controls */}
          {showRotationControls && enableRotation && (
            <div className="image-cropper-control-group">
              <label className="text-sm font-medium">Rotation</label>
              <div className="flex items-center gap-3">
                <button className="control-btn" onClick={handleRotateLeft}>
                  ↺ {rotationStep}°
                </button>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <button className="control-btn" onClick={handleRotateRight}>
                  ↻ {rotationStep}°
                </button>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {rotation}°
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="image-cropper-actions">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
