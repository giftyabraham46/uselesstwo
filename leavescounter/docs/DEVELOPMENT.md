# Development Guide - Tree Calculator

## Getting Started with Development

This guide will help you set up the development environment and understand the codebase structure.

### Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- Git
- Basic knowledge of React.js and FastAPI

### Development Setup

1. **Clone and Setup:**
   ```bash
   git clone <repo-url>
   cd leavescounter
   ./setup.sh  # or setup.bat on Windows
   ```

2. **Development Workflow:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   source venv/bin/activate
   python main.py
   
   # Terminal 2 - Frontend  
   cd frontend
   npm start
   
   # Terminal 3 - Testing
   python -m pytest backend/tests/
   npm test --prefix frontend
   ```

## Architecture Deep Dive

### Backend Architecture

#### Core Components

1. **API Layer** (`app/api/routes.py`)
   - RESTful endpoints for image upload, processing, and export
   - Request validation and error handling
   - File upload management

2. **Service Layer** (`app/services/`)
   - `ImageProcessor`: Image preprocessing and segmentation
   - `TreeAnalyzer`: Dimension extraction and leaf analysis
   - `ReportGenerator`: Export functionality (PDF, 3D models)

3. **Models** (`app/models/schemas.py`)
   - Pydantic models for request/response validation
   - Data structures for analysis results

4. **Configuration** (`app/core/config.py`)
   - Environment-based settings
   - File path management
   - ML model configuration

#### Image Processing Pipeline

```mermaid
graph TD
    A[Upload Images] --> B[Preprocessing]
    B --> C[Background Removal]
    C --> D[Tree Segmentation]
    D --> E[Dimension Extraction]
    E --> F[Leaf Analysis]
    F --> G[3D Model Generation]
    G --> H[Report Generation]
```

### Frontend Architecture

#### Component Structure

```
src/
├── components/
│   ├── Header.js              # Navigation header
│   ├── UploadPage.js          # Main upload interface
│   ├── ImagePreview.js        # Image preview component
│   ├── MetadataForm.js        # Metadata input form
│   ├── ResultsPage.js         # Results display
│   ├── ResultsStats.js        # Statistics cards
│   ├── TreeVisualization.js   # Charts and graphs
│   ├── ExportButtons.js       # Export functionality
│   └── SessionsPage.js        # Session management
├── services/
│   └── treeApi.js            # API communication
└── App.js                    # Main application
```

#### State Management

- React hooks for local state management
- API service layer for data fetching
- Session-based result storage

## Key Algorithms

### 1. Tree Segmentation

**Location:** `backend/app/services/image_processor.py`

```python
def segment_tree(self, image):
    # Convert to HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    
    # Create vegetation mask (green colors)
    green_mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Morphological operations for cleanup
    kernel = np.ones((5, 5), np.uint8)
    clean_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel)
    
    # Find largest contour (main tree)
    contours = cv2.findContours(clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest_contour = max(contours, key=cv2.contourArea)
    
    # Apply mask to original image
    return apply_mask(image, largest_contour)
```

### 2. Dimension Extraction

**Location:** `backend/app/services/tree_analyzer.py`

```python
def extract_dimensions(self, front_image, side_image, camera_params):
    # Get bounding boxes from both views
    front_bounds = self._get_tree_boundaries(front_image)
    side_bounds = self._get_tree_boundaries(side_image)
    
    # Extract dimensions in pixels
    height = front_bounds['height']
    width = front_bounds['width'] 
    depth = side_bounds['width']  # Depth from side view
    
    # Convert to real-world units if camera params provided
    if camera_params:
        scale_factor = self._calculate_scale_factor(camera_params)
        height *= scale_factor
        width *= scale_factor
        depth *= scale_factor
    
    return TreeDimensions(height, width, depth, confidence)
```

### 3. Leaf Analysis

**Location:** `backend/app/services/tree_analyzer.py`

```python
def analyze_leaves(self, front_image, side_image):
    # Edge detection for leaf boundaries
    edges = cv2.Canny(gray_image, threshold1, threshold2)
    
    # Find contours that match leaf characteristics
    contours = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    leaf_contours = self._filter_leaf_contours(contours)
    
    # Calculate average leaf size
    leaf_areas = [cv2.contourArea(contour) for contour in leaf_contours]
    average_size = np.mean(leaf_areas)
    
    # Estimate total leaf count
    total_area = self._calculate_tree_area(front_image)
    estimated_count = total_area / average_size
    
    # Extract dominant colors using K-means clustering
    dominant_colors = self._extract_dominant_colors(front_image, leaf_contours)
    
    return LeafAnalysis(average_size, estimated_count, dominant_colors)
```

## Adding New Features

### Adding a New Analysis Feature

1. **Backend Changes:**
   
   a. Add new fields to schemas (`app/models/schemas.py`):
   ```python
   class LeafAnalysis(BaseModel):
       # ... existing fields
       new_feature: Optional[float] = None
   ```
   
   b. Implement analysis logic (`app/services/tree_analyzer.py`):
   ```python
   def analyze_new_feature(self, image):
       # Your analysis logic here
       result = perform_analysis(image)
       return result
   ```
   
   c. Update the main analysis method:
   ```python
   def analyze_leaves(self, front_image, side_image):
       # ... existing code
       new_feature = self.analyze_new_feature(front_image)
       
       return LeafAnalysis(
           # ... existing fields
           new_feature=new_feature
       )
   ```

2. **Frontend Changes:**
   
   a. Update results display (`components/ResultsPage.js`):
   ```jsx
   <div className="stat-item">
     <div className="stat-value">{results.leaf_analysis.new_feature}</div>
     <div className="stat-label">New Feature</div>
   </div>
   ```

### Adding a New Export Format

1. **Backend Implementation:**
   
   a. Add format to report generator (`app/services/report_generator.py`):
   ```python
   def generate_new_format(self, session_id, result):
       # Implementation for new format
       output_path = f"results/{session_id}/output.newformat"
       # Generate file...
       return output_path
   ```
   
   b. Update the export endpoint (`app/api/routes.py`):
   ```python
   elif format.lower() == "newformat":
       file_path = report_generator.generate_new_format(session_id, result)
   ```

2. **Frontend Updates:**
   
   Add new export button (`components/ExportButtons.js`):
   ```jsx
   { format: 'newformat', label: '📄 New Format', description: 'Description' }
   ```

## Testing

### Backend Testing

**Unit Tests:** Test individual functions
```python
def test_tree_segmentation(self):
    processor = ImageProcessor()
    test_image = create_test_image()
    segmented = processor.segment_tree(test_image)
    assert segmented is not None
```

**Integration Tests:** Test API endpoints
```python
def test_upload_endpoint(self):
    with TestClient(app) as client:
        files = {"front_image": test_file, "side_image": test_file}
        response = client.post("/api/upload", files=files)
        assert response.status_code == 200
```

### Frontend Testing

**Component Tests:**
```jsx
import { render, screen } from '@testing-library/react';
import UploadPage from './UploadPage';

test('renders upload interface', () => {
  render(<UploadPage />);
  expect(screen.getByText('Upload Tree Images')).toBeInTheDocument();
});
```

**API Tests:**
```jsx
import { uploadImages } from '../services/treeApi';

test('uploads images successfully', async () => {
  const frontFile = new File(['front'], 'front.jpg', { type: 'image/jpeg' });
  const sideFile = new File(['side'], 'side.jpg', { type: 'image/jpeg' });
  
  const response = await uploadImages(frontFile, sideFile);
  expect(response.session_id).toBeDefined();
});
```

## Performance Optimization

### Backend Optimizations

1. **Image Processing:**
   ```python
   # Resize large images before processing
   if image.shape[0] > MAX_HEIGHT or image.shape[1] > MAX_WIDTH:
       image = cv2.resize(image, target_size, interpolation=cv2.INTER_LANCZOS4)
   ```

2. **Caching Results:**
   ```python
   # Cache processed results
   import functools
   
   @functools.lru_cache(maxsize=100)
   def process_image_cached(image_hash):
       return process_image(image)
   ```

3. **Async Processing:**
   ```python
   from fastapi import BackgroundTasks
   
   @router.post("/process/{session_id}")
   async def process_images_async(session_id: str, background_tasks: BackgroundTasks):
       background_tasks.add_task(process_images_task, session_id)
       return {"status": "processing"}
   ```

### Frontend Optimizations

1. **Image Compression:**
   ```jsx
   const compressImage = (file, maxSize = 1024) => {
     return new Promise((resolve) => {
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       const img = new Image();
       
       img.onload = () => {
         const ratio = Math.min(maxSize / img.width, maxSize / img.height);
         canvas.width = img.width * ratio;
         canvas.height = img.height * ratio;
         
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         canvas.toBlob(resolve, 'image/jpeg', 0.8);
       };
       
       img.src = URL.createObjectURL(file);
     });
   };
   ```

2. **Progress Indicators:**
   ```jsx
   const [uploadProgress, setUploadProgress] = useState(0);
   
   const uploadWithProgress = async (file) => {
     const formData = new FormData();
     formData.append('file', file);
     
     return axios.post('/upload', formData, {
       onUploadProgress: (progressEvent) => {
         const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
         setUploadProgress(progress);
       }
     });
   };
   ```

## Debugging

### Common Issues and Solutions

1. **Memory Issues:**
   ```python
   # Monitor memory usage
   import psutil
   
   def check_memory():
       memory = psutil.virtual_memory()
       print(f"Memory usage: {memory.percent}%")
   ```

2. **Image Processing Errors:**
   ```python
   try:
       processed_image = cv2.imread(image_path)
       if processed_image is None:
           raise ValueError(f"Could not load image: {image_path}")
   except Exception as e:
       logger.error(f"Image processing failed: {e}")
       raise
   ```

3. **API Connection Issues:**
   ```jsx
   const api = axios.create({
     baseURL: process.env.REACT_APP_API_URL,
     timeout: 30000,
     retry: 3,
     retryDelay: 1000
   });
   ```

### Logging

**Backend Logging:**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def process_image(image_path):
    logger.info(f"Processing image: {image_path}")
    try:
        # Processing logic
        logger.info("Image processed successfully")
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise
```

**Frontend Logging:**
```jsx
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  debug: (message, data) => process.env.NODE_ENV === 'development' && console.log(`[DEBUG] ${message}`, data)
};
```

## Deployment Considerations

### Environment Variables

**Backend (.env):**
```
DEBUG=False
MAX_FILE_SIZE=52428800
UPLOAD_DIR=/var/uploads
RESULTS_DIR=/var/results
DATABASE_URL=postgresql://user:pass@localhost/treedb
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,yourdomain.com
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_MAX_FILE_SIZE=50000000
REACT_APP_ANALYTICS_ID=your-analytics-id
```

### Security Best Practices

1. **File Upload Validation:**
   ```python
   ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp'}
   MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
   
   def validate_file(file):
       if file.size > MAX_FILE_SIZE:
           raise ValueError("File too large")
       
       ext = os.path.splitext(file.filename)[1].lower()
       if ext not in ALLOWED_EXTENSIONS:
           raise ValueError("Invalid file type")
   ```

2. **Input Sanitization:**
   ```python
   from pydantic import validator
   
   class UploadMetadata(BaseModel):
       camera_height: Optional[float] = None
       
       @validator('camera_height')
       def validate_camera_height(cls, v):
           if v is not None and (v <= 0 or v > 100):
               raise ValueError('Camera height must be between 0 and 100 meters')
           return v
   ```

This development guide provides a comprehensive overview of the Tree Calculator codebase and development practices. Use it as a reference when contributing to the project or extending its functionality.
