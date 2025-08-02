import unittest
import os
import sys
import tempfile
import shutil
from unittest.mock import patch, MagicMock

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.image_processor import ImageProcessor
from app.services.tree_analyzer import TreeAnalyzer
from app.models.schemas import TreeDimensions, LeafAnalysis, FoliageData

class TestImageProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = ImageProcessor()
        self.test_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        shutil.rmtree(self.test_dir)
    
    def test_resize_image(self):
        """Test image resizing functionality"""
        import numpy as np
        
        # Create a test image
        test_image = np.random.randint(0, 255, (2000, 1500, 3), dtype=np.uint8)
        
        # Resize the image
        resized = self.processor._resize_image(test_image)
        
        # Check that the image was resized
        self.assertLessEqual(max(resized.shape[:2]), max(self.processor.max_size))
        self.assertGreaterEqual(min(resized.shape[:2]), min(self.processor.min_size))
    
    def test_normalize_image(self):
        """Test image normalization"""
        import numpy as np
        
        # Create a test image
        test_image = np.random.randint(0, 255, (500, 500, 3), dtype=np.uint8)
        
        # Normalize the image
        normalized = self.processor._normalize_image(test_image)
        
        # Check that the output is uint8
        self.assertEqual(normalized.dtype, np.uint8)
        
        # Check that values are in valid range
        self.assertGreaterEqual(normalized.min(), 0)
        self.assertLessEqual(normalized.max(), 255)

class TestTreeAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = TreeAnalyzer()
    
    def test_calculate_scale_factor(self):
        """Test scale factor calculation"""
        scale_factor = self.analyzer._calculate_scale_factor(
            height_pixels=1000,
            camera_height=1.7,
            distance=5.0,
            image_shape=(1080, 1920)
        )
        
        # Scale factor should be positive
        self.assertGreater(scale_factor, 0)
    
    def test_get_tree_boundaries(self):
        """Test tree boundary detection"""
        import numpy as np
        
        # Create a simple test image with a white rectangle (tree) on black background
        test_image = np.zeros((500, 400, 3), dtype=np.uint8)
        test_image[100:400, 150:350] = 255  # White rectangle
        
        boundaries = self.analyzer._get_tree_boundaries(test_image)
        
        # Check that boundaries are detected
        self.assertGreater(boundaries['height'], 0)
        self.assertGreater(boundaries['width'], 0)
        self.assertEqual(boundaries['height'], 300)  # 400 - 100
        self.assertEqual(boundaries['width'], 200)   # 350 - 150
    
    def test_extract_dimensions(self):
        """Test dimension extraction"""
        import numpy as np
        
        # Create test images
        front_image = np.zeros((500, 400, 3), dtype=np.uint8)
        front_image[50:450, 100:300] = 255  # Tree in front view
        
        side_image = np.zeros((500, 300, 3), dtype=np.uint8)
        side_image[50:450, 50:250] = 255   # Tree in side view
        
        dimensions = self.analyzer.extract_dimensions(front_image, side_image)
        
        # Check that dimensions are returned
        self.assertIsInstance(dimensions, TreeDimensions)
        self.assertGreater(dimensions.height, 0)
        self.assertGreater(dimensions.width, 0)
        self.assertGreater(dimensions.depth, 0)
        self.assertGreaterEqual(dimensions.confidence, 0)
        self.assertLessEqual(dimensions.confidence, 1)

class TestSchemas(unittest.TestCase):
    def test_tree_dimensions_creation(self):
        """Test TreeDimensions model creation"""
        dimensions = TreeDimensions(
            height=10.5,
            width=8.2,
            depth=6.7,
            confidence=0.85
        )
        
        self.assertEqual(dimensions.height, 10.5)
        self.assertEqual(dimensions.width, 8.2)
        self.assertEqual(dimensions.depth, 6.7)
        self.assertEqual(dimensions.confidence, 0.85)
        self.assertEqual(dimensions.unit, "relative")
    
    def test_leaf_analysis_creation(self):
        """Test LeafAnalysis model creation"""
        leaf_analysis = LeafAnalysis(
            average_leaf_size=150.5,
            estimated_leaf_count=5000,
            edge_density=0.125,
            dominant_colors=["#228B22", "#32CD32"]
        )
        
        self.assertEqual(leaf_analysis.average_leaf_size, 150.5)
        self.assertEqual(leaf_analysis.estimated_leaf_count, 5000)
        self.assertEqual(leaf_analysis.edge_density, 0.125)
        self.assertEqual(len(leaf_analysis.dominant_colors), 2)
    
    def test_foliage_data_creation(self):
        """Test FoliageData model creation"""
        foliage_data = FoliageData(
            volume=1250.0,
            density=0.004,
            vertex_count=25000,
            face_count=12500
        )
        
        self.assertEqual(foliage_data.volume, 1250.0)
        self.assertEqual(foliage_data.density, 0.004)
        self.assertEqual(foliage_data.vertex_count, 25000)
        self.assertEqual(foliage_data.face_count, 12500)

if __name__ == '__main__':
    unittest.main()
