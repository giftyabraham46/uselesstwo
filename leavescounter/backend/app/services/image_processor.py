import cv2
import numpy as np
from PIL import Image
import os
from typing import Tuple, Optional
from app.core.config import settings

class ImageProcessor:
    """Handles image preprocessing, normalization, and segmentation"""
    
    def __init__(self):
        self.max_size = settings.MAX_IMAGE_SIZE
        self.min_size = settings.MIN_IMAGE_SIZE
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image: resize, normalize, and prepare for analysis
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize image while maintaining aspect ratio
        image = self._resize_image(image)
        
        # Normalize image
        image = self._normalize_image(image)
        
        return image
    
    def segment_tree(self, image: np.ndarray) -> np.ndarray:
        """
        Segment tree from background using computer vision techniques
        """
        # Convert to different color spaces for better segmentation
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        
        # Create mask for green vegetation
        green_mask = self._create_vegetation_mask(hsv)
        
        # Apply morphological operations to clean up mask
        kernel = np.ones((5, 5), np.uint8)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel)
        
        # Find largest contour (main tree)
        contours, _ = cv2.findContours(green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Get the largest contour
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Create mask from largest contour
            mask = np.zeros(green_mask.shape, dtype=np.uint8)
            cv2.fillPoly(mask, [largest_contour], 255)
            
            # Apply mask to original image
            segmented = image.copy()
            segmented[mask == 0] = [0, 0, 0]  # Set background to black
            
            return segmented
        else:
            # If no vegetation detected, return original image
            return image
    
    def _resize_image(self, image: np.ndarray) -> np.ndarray:
        """Resize image while maintaining aspect ratio"""
        h, w = image.shape[:2]
        
        # Calculate new dimensions
        if h > w:
            new_h = min(h, self.max_size[1])
            new_w = int(w * (new_h / h))
        else:
            new_w = min(w, self.max_size[0])
            new_h = int(h * (new_w / w))
        
        # Ensure minimum size
        if new_h < self.min_size[1] or new_w < self.min_size[0]:
            scale = max(self.min_size[1] / new_h, self.min_size[0] / new_w)
            new_h = int(new_h * scale)
            new_w = int(new_w * scale)
        
        return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    
    def _normalize_image(self, image: np.ndarray) -> np.ndarray:
        """Normalize image values"""
        # Convert to float and normalize to [0, 1]
        normalized = image.astype(np.float32) / 255.0
        
        # Apply histogram equalization to improve contrast
        # Convert back to uint8 for processing
        image_uint8 = (normalized * 255).astype(np.uint8)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        lab = cv2.cvtColor(image_uint8, cv2.COLOR_RGB2LAB)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        return enhanced
    
    def _create_vegetation_mask(self, hsv_image: np.ndarray) -> np.ndarray:
        """Create mask for green vegetation"""
        # Define range for green colors in HSV
        # Lower and upper bounds for green
        lower_green1 = np.array([35, 40, 40])
        upper_green1 = np.array([85, 255, 255])
        
        # Create mask for green areas
        green_mask = cv2.inRange(hsv_image, lower_green1, upper_green1)
        
        # Additional mask for lighter greens
        lower_green2 = np.array([25, 30, 30])
        upper_green2 = np.array([95, 255, 255])
        green_mask2 = cv2.inRange(hsv_image, lower_green2, upper_green2)
        
        # Combine masks
        combined_mask = cv2.bitwise_or(green_mask, green_mask2)
        
        return combined_mask
    
    def extract_edges(self, image: np.ndarray) -> np.ndarray:
        """Extract edges for leaf analysis"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply Canny edge detection
        edges = cv2.Canny(blurred, 50, 150)
        
        return edges
    
    def get_image_info(self, image_path: str) -> dict:
        """Get basic information about the image"""
        image = Image.open(image_path)
        
        return {
            "width": image.width,
            "height": image.height,
            "mode": image.mode,
            "format": image.format,
            "size_mb": os.path.getsize(image_path) / (1024 * 1024)
        }
