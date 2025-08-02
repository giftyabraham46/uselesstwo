# Tree Calculator - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Reference](#api-reference)
6. [Development](#development)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Overview

The Tree Calculator is an AI-powered application that analyzes tree images to estimate dimensions and leaf characteristics. It processes two 2D images (front and side views) to extract:

- **Tree Dimensions**: Height, width, depth with confidence scores
- **Leaf Analysis**: Size, count, type classification, and dominant colors
- **3D Foliage Data**: Volume, density, and mesh information for 3D reconstruction

### Key Features

- 🌳 **Dual Image Processing**: Front and side view analysis
- 🧠 **AI-Powered Analysis**: Computer vision and machine learning
- 📏 **Accurate Measurements**: Optional real-world scaling with camera metadata
- 🍃 **Detailed Leaf Analysis**: Size, count, and color extraction
- 📊 **Rich Visualizations**: Charts, graphs, and 3D representations
- 📄 **Multiple Export Formats**: PDF reports, 3D models (OBJ/GLTF), images

## Architecture

### Backend (FastAPI + Python)
```
backend/
├── app/
│   ├── api/           # API routes and endpoints
│   ├── core/          # Configuration and settings
│   ├── models/        # Data models and schemas
│   └── services/      # Business logic services
├── tests/             # Unit and integration tests
├── models/            # ML model files
├── uploads/           # Uploaded images (created at runtime)
└── results/           # Analysis results (created at runtime)
```

### Frontend (React.js)
```
frontend/
├── src/
│   ├── components/    # React components
│   ├── services/      # API service layer
│   └── utils/         # Utility functions
├── public/            # Static assets
└── build/             # Production build (created at build time)
```

### Key Technologies

- **Backend**: FastAPI, OpenCV, scikit-learn, PyTorch, ReportLab
- **Frontend**: React.js, Axios, Recharts, Three.js, Material-UI
- **Computer Vision**: OpenCV, NumPy, PIL, scikit-image
- **Machine Learning**: PyTorch, scikit-learn, DBSCAN clustering

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd leavescounter
   ```

2. **Run the setup script:**
   ```bash
   # On Linux/macOS
   ./setup.sh
   
   # On Windows
   setup.bat
   ```

3. **Start the applications:**
   
   **Backend (Terminal 1):**
   ```bash
   # Activate virtual environment from project root
   cd leavescounter
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python backend/main.py
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm start
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000`

### Docker Installation

1. **Using Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

## Usage

### Step-by-Step Guide

1. **Prepare Images:**
   - Take front and side view photos of the tree
   - Ensure the entire tree is visible
   - Use good lighting conditions
   - Take views at 90° angles from each other

2. **Upload Images:**
   - Navigate to the upload page
   - Drag and drop or click to select front view image
   - Drag and drop or click to select side view image

3. **Add Metadata (Optional):**
   - Camera height from ground (meters)
   - Distance from camera to tree (meters)
   - Image DPI/resolution

4. **Analyze:**
   - Click "Analyze Tree" button
   - Wait for processing to complete (typically 10-30 seconds)

5. **View Results:**
   - Review tree dimensions and confidence scores
   - Examine leaf analysis data
   - Explore 3D foliage information
   - View visualizations and charts

6. **Export Results:**
   - Download PDF report
   - Export 3D models (OBJ/GLTF)
   - Save visualization images

### Best Practices for Image Capture

- **Lighting**: Use even, natural lighting; avoid harsh shadows
- **Distance**: Stand far enough to capture the entire tree
- **Angles**: Take front and side views at exactly 90° angles
- **Stability**: Use a tripod or stable surface for sharp images
- **Background**: Choose contrasting backgrounds when possible
- **Reference Objects**: Include known-size objects for scaling

## API Reference

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### Upload Images
```http
POST /upload
Content-Type: multipart/form-data

Parameters:
- front_image: File (required)
- side_image: File (required)
- camera_height: Float (optional)
- distance_from_tree: Float (optional)
- image_dpi: Integer (optional)

Response:
{
  "session_id": "uuid",
  "status": "uploaded",
  "message": "Images uploaded successfully"
}
```

#### Process Images
```http
POST /process/{session_id}

Response:
{
  "session_id": "uuid",
  "status": "completed",
  "result": {
    "dimensions": {...},
    "leaf_analysis": {...},
    "foliage_data": {...}
  }
}
```

#### Get Results
```http
GET /results/{session_id}

Response:
{
  "session_id": "uuid",
  "dimensions": {
    "height": 12.5,
    "width": 8.3,
    "depth": 7.1,
    "confidence": 0.85,
    "unit": "meters"
  },
  "leaf_analysis": {
    "average_leaf_size": 145.2,
    "estimated_leaf_count": 15000,
    "leaf_type": "elongated",
    "edge_density": 0.125,
    "dominant_colors": ["#228B22", "#32CD32"]
  },
  "foliage_data": {
    "volume": 1250.5,
    "density": 0.012,
    "vertex_count": 25000,
    "face_count": 12500
  }
}
```

#### Export Results
```http
POST /export/{session_id}
Content-Type: application/x-www-form-urlencoded

Parameters:
- format: String (pdf|png|obj|gltf)

Response: File download
```

#### List Sessions
```http
GET /sessions

Response:
{
  "sessions": [
    {
      "session_id": "uuid",
      "created_at": 1659456789,
      "has_results": true
    }
  ]
}
```

## Development

### Backend Development

1. **Activate virtual environment:**
   ```bash
   # From project root directory
   source venv/bin/activate
   ```

2. **Install development dependencies:**
   ```bash
   pip install pytest black flake8 mypy
   ```

3. **Run in development mode:**
   ```bash
   python main.py
   ```

### Frontend Development

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### Code Style and Linting

**Backend:**
```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

**Frontend:**
```bash
# Lint JavaScript
npm run lint

# Format code
npm run format
```

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Test Coverage

```bash
# Backend coverage
cd backend
python -m pytest tests/ --cov=app --cov-report=html

# Frontend coverage
cd frontend
npm test -- --coverage
```

## Deployment

### Production Environment Variables

Create a `.env` file in the backend directory:

```env
# Production settings
DEBUG=False
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR=/var/uploads
RESULTS_DIR=/var/results

# Database
DATABASE_URL=postgresql://user:pass@localhost/treedb

# Security
SECRET_KEY=your-secret-key-here
```

### Docker Production Deployment

1. **Build production images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run build
   # Serve build/ directory with nginx or apache
   ```

## Troubleshooting

### Common Issues

#### "Permission denied" when activating virtual environment
- The virtual environment is located in the **project root**, not in the backend directory
- Use `source venv/bin/activate` from the project root directory
- If you're in the backend directory, use `source ../venv/bin/activate`
- Never run the activate script directly - always use `source`

#### "Module not found" errors
- Ensure virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

#### Images not uploading
- Check file size limits (default 10MB per image)
- Verify file formats are supported (JPEG, PNG, BMP)
- Ensure backend server is running

#### Processing takes too long
- Large images take more time to process
- Consider resizing images before upload
- Check server resources (CPU, memory)

#### Poor analysis accuracy
- Ensure good image quality and lighting
- Provide camera metadata for better scaling
- Make sure entire tree is visible in both images

#### CORS errors in browser
- Verify backend CORS configuration
- Check API base URL in frontend configuration
- Ensure both frontend and backend are running

### Debug Mode

Enable debug mode for more detailed error messages:

**Backend:**
```bash
export DEBUG=True
python main.py
```

**Frontend:**
```bash
REACT_APP_DEBUG=true npm start
```

### Log Files

- Backend logs: Check console output or configure logging
- Frontend logs: Check browser developer console
- Server logs: Check system logs for deployment issues

### Performance Optimization

1. **Image Preprocessing:**
   - Resize large images before processing
   - Use appropriate compression levels

2. **Backend Optimization:**
   - Consider GPU acceleration for ML models
   - Implement result caching
   - Use background tasks for long-running processes

3. **Frontend Optimization:**
   - Implement image compression before upload
   - Add loading states and progress indicators
   - Use lazy loading for large result sets

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test` and `pytest`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
