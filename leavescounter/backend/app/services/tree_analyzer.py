import cv2
import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from scipy.spatial.distance import pdist, squareform
from typing import Dict, List, Tuple, Optional
import math
from app.models.schemas import TreeDimensions, LeafAnalysis, FoliageData

class TreeAnalyzer:
    """Analyzes tree dimensions, leaf patterns, and generates foliage data"""
    
    def __init__(self):
        self.reference_object_size = None  # Can be set if reference object is detected
    
    def extract_dimensions(
        self, 
        front_image: np.ndarray, 
        side_image: np.ndarray,
        camera_height: Optional[float] = None,
        distance_from_tree: Optional[float] = None
    ) -> TreeDimensions:
        """Extract tree dimensions from front and side view images"""
        
        # Get tree boundaries from both views
        front_bounds = self._get_tree_boundaries(front_image)
        side_bounds = self._get_tree_boundaries(side_image)
        
        # Calculate relative dimensions
        height_pixels = front_bounds['height']
        width_pixels = front_bounds['width']
        depth_pixels = side_bounds['width']  # Depth comes from side view width
        
        # Calculate scale factor if camera parameters are provided
        scale_factor = 1.0
        unit = "relative"
        
        if camera_height and distance_from_tree:
            # Use camera parameters to estimate real-world scale
            scale_factor = self._calculate_scale_factor(
                height_pixels, camera_height, distance_from_tree, front_image.shape
            )
            unit = "meters"
        
        # Calculate confidence based on image quality and boundary detection
        confidence = self._calculate_dimension_confidence(front_bounds, side_bounds)
        
        return TreeDimensions(
            height=height_pixels * scale_factor,
            width=width_pixels * scale_factor,
            depth=depth_pixels * scale_factor,
            confidence=confidence,
            unit=unit
        )
    
    def analyze_leaves(self, front_image: np.ndarray, side_image: np.ndarray) -> LeafAnalysis:
        """Analyze leaf patterns and estimate leaf characteristics"""
        
        # Extract edges from both images
        front_edges = self._extract_edges(front_image)
        side_edges = self._extract_edges(side_image)
        
        # Find leaf-like contours
        front_contours = self._find_leaf_contours(front_edges)
        side_contours = self._find_leaf_contours(side_edges)
        
        # Combine contours from both views
        all_contours = front_contours + side_contours
        
        if not all_contours:
            # Default values if no leaves detected
            return LeafAnalysis(
                average_leaf_size=0.0,
                estimated_leaf_count=0,
                edge_density=0.0,
                dominant_colors=[]
            )
        
        # Calculate average leaf size
        leaf_areas = [cv2.contourArea(contour) for contour in all_contours]
        average_leaf_size = np.mean(leaf_areas) if leaf_areas else 0.0
        
        # Estimate total leaf count using density analysis
        total_tree_area = self._calculate_tree_area(front_image)
        estimated_leaf_count = int(total_tree_area / average_leaf_size) if average_leaf_size > 0 else 0
        
        # Calculate edge density
        edge_density = self._calculate_edge_density(front_edges, side_edges)
        
        # Extract dominant colors from leaf regions
        dominant_colors = self._extract_dominant_colors(front_image, front_contours)
        
        # Classify leaf type (placeholder - would use trained ML model)
        leaf_type, leaf_confidence = self._classify_leaf_type(all_contours)
        
        return LeafAnalysis(
            average_leaf_size=average_leaf_size,
            estimated_leaf_count=estimated_leaf_count,
            leaf_type=leaf_type,
            leaf_confidence=leaf_confidence,
            edge_density=edge_density,
            dominant_colors=dominant_colors
        )
    
    def generate_foliage_data(self, dimensions: TreeDimensions, leaf_analysis: LeafAnalysis) -> FoliageData:
        """Generate 3D foliage data for visualization"""
        
        # Calculate tree volume (approximated as ellipsoid)
        volume = (4/3) * math.pi * (dimensions.width/2) * (dimensions.depth/2) * (dimensions.height/2)
        
        # Calculate foliage density based on leaf count and volume
        density = leaf_analysis.estimated_leaf_count / volume if volume > 0 else 0
        
        # Estimate vertex and face count for 3D model
        # Base on leaf count and complexity
        vertex_count = min(leaf_analysis.estimated_leaf_count * 4, 50000)  # Cap for performance
        face_count = min(leaf_analysis.estimated_leaf_count * 2, 25000)
        
        return FoliageData(
            volume=volume,
            density=density,
            vertex_count=vertex_count,
            face_count=face_count
        )
    
    def _get_tree_boundaries(self, image: np.ndarray) -> Dict[str, float]:
        """Get tree boundaries from segmented image"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Find non-zero pixels (tree pixels)
        tree_pixels = np.where(gray > 0)
        
        if len(tree_pixels[0]) == 0:
            return {'height': 0, 'width': 0, 'top': 0, 'bottom': 0, 'left': 0, 'right': 0}
        
        # Get bounding box
        top = np.min(tree_pixels[0])
        bottom = np.max(tree_pixels[0])
        left = np.min(tree_pixels[1])
        right = np.max(tree_pixels[1])
        
        height = bottom - top
        width = right - left
        
        return {
            'height': height,
            'width': width,
            'top': top,
            'bottom': bottom,
            'left': left,
            'right': right
        }
    
    def _calculate_scale_factor(
        self, 
        height_pixels: float, 
        camera_height: float, 
        distance: float, 
        image_shape: Tuple[int, int]
    ) -> float:
        """Calculate scale factor to convert pixels to real-world units"""
        # Simplified perspective calculation
        # This would be more sophisticated in a real implementation
        
        # Estimate field of view (typical camera FOV ~60 degrees)
        fov_degrees = 60
        fov_radians = math.radians(fov_degrees)
        
        # Calculate real-world height of image at distance
        image_height_real = 2 * distance * math.tan(fov_radians / 2)
        
        # Calculate pixels per meter
        pixels_per_meter = image_shape[0] / image_height_real
        
        # Return meters per pixel
        return 1.0 / pixels_per_meter
    
    def _calculate_dimension_confidence(self, front_bounds: Dict, side_bounds: Dict) -> float:
        """Calculate confidence score for dimension extraction"""
        # Base confidence on boundary detection quality
        front_area = front_bounds['height'] * front_bounds['width']
        side_area = side_bounds['height'] * side_bounds['width']
        
        # Confidence decreases if tree is very small in image
        min_area_threshold = 10000  # pixels
        area_confidence = min(1.0, (front_area + side_area) / (2 * min_area_threshold))
        
        # Additional factors could include edge sharpness, contrast, etc.
        return max(0.1, min(1.0, area_confidence))
    
    def _extract_edges(self, image: np.ndarray) -> np.ndarray:
        """Extract edges optimized for leaf detection"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Apply bilateral filter to preserve edges while reducing noise
        filtered = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Multi-scale edge detection
        edges1 = cv2.Canny(filtered, 30, 80)
        edges2 = cv2.Canny(filtered, 50, 120)
        
        # Combine edge maps
        edges = cv2.bitwise_or(edges1, edges2)
        
        return edges
    
    def _find_leaf_contours(self, edges: np.ndarray) -> List[np.ndarray]:
        """Find contours that likely represent leaves"""
        # Find all contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by size and shape characteristics
        leaf_contours = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            
            # Filter by size (leaves should be within certain size range)
            if 20 < area < 5000:  # Adjust based on image resolution
                # Check if contour is roughly leaf-shaped
                if perimeter > 0:
                    circularity = 4 * math.pi * area / (perimeter * perimeter)
                    
                    # Leaves are typically not perfectly circular
                    if 0.1 < circularity < 0.9:
                        leaf_contours.append(contour)
        
        return leaf_contours
    
    def _calculate_tree_area(self, image: np.ndarray) -> float:
        """Calculate total tree area in pixels"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        tree_pixels = np.sum(gray > 0)
        return float(tree_pixels)
    
    def _calculate_edge_density(self, front_edges: np.ndarray, side_edges: np.ndarray) -> float:
        """Calculate edge density as a measure of foliage complexity"""
        total_edges = np.sum(front_edges > 0) + np.sum(side_edges > 0)
        total_pixels = front_edges.size + side_edges.size
        
        return total_edges / total_pixels if total_pixels > 0 else 0.0
    
    def _extract_dominant_colors(self, image: np.ndarray, contours: List[np.ndarray]) -> List[str]:
        """Extract dominant colors from leaf regions"""
        if not contours:
            return []
        
        # Create mask from leaf contours
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        cv2.fillPoly(mask, contours, 255)
        
        # Extract pixels within leaf regions
        leaf_pixels = image[mask > 0]
        
        if len(leaf_pixels) == 0:
            return []
        
        # Use K-means clustering to find dominant colors
        leaf_pixels_reshaped = leaf_pixels.reshape(-1, 3)
        
        try:
            kmeans = KMeans(n_clusters=min(5, len(leaf_pixels_reshaped)), random_state=42, n_init=10)
            kmeans.fit(leaf_pixels_reshaped)
            
            # Convert RGB values to hex colors
            dominant_colors = []
            for color in kmeans.cluster_centers_:
                hex_color = "#{:02x}{:02x}{:02x}".format(
                    int(color[0]), int(color[1]), int(color[2])
                )
                dominant_colors.append(hex_color)
            
            return dominant_colors[:3]  # Return top 3 colors
            
        except Exception:
            # Fallback: return average color
            avg_color = np.mean(leaf_pixels_reshaped, axis=0)
            hex_color = "#{:02x}{:02x}{:02x}".format(
                int(avg_color[0]), int(avg_color[1]), int(avg_color[2])
            )
            return [hex_color]
    
    def _classify_leaf_type(self, contours: List[np.ndarray]) -> Tuple[Optional[str], Optional[float]]:
        """Classify leaf type based on shape characteristics"""
        if not contours:
            return None, None
        
        # Simple shape-based classification (placeholder)
        # In a real implementation, this would use a trained CNN
        
        # Calculate shape features for all contours
        shape_features = []
        
        for contour in contours:
            if len(contour) < 5:
                continue
                
            # Fit ellipse to contour
            try:
                ellipse = cv2.fitEllipse(contour)
                aspect_ratio = max(ellipse[1]) / min(ellipse[1])
                
                # Calculate solidity (convex hull ratio)
                hull = cv2.convexHull(contour)
                solidity = cv2.contourArea(contour) / cv2.contourArea(hull)
                
                shape_features.append({
                    'aspect_ratio': aspect_ratio,
                    'solidity': solidity
                })
                
            except Exception:
                continue
        
        if not shape_features:
            return None, None
        
        # Simple classification based on average features
        avg_aspect_ratio = np.mean([f['aspect_ratio'] for f in shape_features])
        avg_solidity = np.mean([f['solidity'] for f in shape_features])
        
        # Basic classification rules
        if avg_aspect_ratio > 2.5 and avg_solidity > 0.7:
            return "elongated", 0.6
        elif avg_aspect_ratio < 1.5 and avg_solidity > 0.8:
            return "rounded", 0.6
        elif avg_solidity < 0.6:
            return "serrated", 0.5
        else:
            return "general", 0.4
