# Tree Calculator

An AI-powered tool that uses two 2D images (front and side views) of a tree to estimate its relative height, width, depth, and leaf size. The tool also reconstructs a colored, pseudo-3D foliage approximation using edge mapping and ML models.

## Features

- **Dual Image Input**: Upload front and side view images of trees (JPEG, PNG, BMP, WebP)
- **Dimension Extraction**: Calculate height, width, and depth using computer vision
- **Leaf Size Estimation**: Analyze leaf patterns using edge detection and ML
- **3D Foliage Reconstruction**: Generate realistic tree foliage models
- **Multiple Export Formats**: Download results as images, 3D models, or PDF reports

## Tech Stack

- **Frontend**: React.js with modern UI components
- **Backend**: FastAPI (Python) for high-performance API
- **Computer Vision**: OpenCV, PIL for image processing
- **Machine Learning**: PyTorch for model inference
- **3D Visualization**: Three.js for web-based 3D rendering

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd leavescounter
```

2. Set up backend with virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python main.py
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
leavescounter/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core functionality
│   │   ├── models/         # ML models
│   │   └── services/       # Business logic
│   ├── models/             # Trained ML models
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

## API Endpoints

- `POST /api/upload` - Upload tree images
- `POST /api/process` - Process images and extract tree data
- `GET /api/results/{id}` - Get processing results
- `POST /api/export` - Export results in various formats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
