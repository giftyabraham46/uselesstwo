from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional
import uuid
import os
import json
from datetime import datetime
from app.services.image_processor import ImageProcessor
from app.services.tree_analyzer import TreeAnalyzer
from app.services.report_generator import ReportGenerator
from app.core.config import settings
from app.models.schemas import TreeAnalysisResult

router = APIRouter()

# Initialize services
image_processor = ImageProcessor()
tree_analyzer = TreeAnalyzer()
report_generator = ReportGenerator()

def serialize_datetime(obj):
    """Custom JSON serializer for datetime objects"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def dict_with_datetime_serialization(data):
    """Convert dict with datetime objects to JSON-serializable format"""
    if isinstance(data, dict):
        return {k: serialize_datetime(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [serialize_datetime(item) for item in data]
    else:
        return serialize_datetime(data)

@router.post("/upload")
async def upload_images(
    front_image: UploadFile = File(...),
    side_image: UploadFile = File(...),
    camera_height: Optional[float] = Form(None),
    distance_from_tree: Optional[float] = Form(None),
    image_dpi: Optional[int] = Form(None)
):
    """Upload front and side view images of a tree"""
    
    # Validate file types
    for image in [front_image, side_image]:
        if not any(image.filename.lower().endswith(ext) for ext in settings.ALLOWED_EXTENSIONS):
            raise HTTPException(status_code=400, detail=f"Invalid file type for {image.filename}")
    
    # Generate unique session ID
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(settings.UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    # Save uploaded files
    front_path = os.path.join(session_dir, f"front_{front_image.filename}")
    side_path = os.path.join(session_dir, f"side_{side_image.filename}")
    
    with open(front_path, "wb") as f:
        content = await front_image.read()
        f.write(content)
    
    with open(side_path, "wb") as f:
        content = await side_image.read()
        f.write(content)
    
    # Save metadata
    metadata = {
        "session_id": session_id,
        "front_image": front_path,
        "side_image": side_path,
        "camera_height": camera_height,
        "distance_from_tree": distance_from_tree,
        "image_dpi": image_dpi
    }
    
    metadata_path = os.path.join(session_dir, "metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f)
    
    return JSONResponse({
        "session_id": session_id,
        "status": "uploaded",
        "message": "Images uploaded successfully"
    })

@router.post("/process/{session_id}")
async def process_tree_images(session_id: str):
    """Process uploaded tree images and extract dimensions and leaf information"""
    
    session_dir = os.path.join(settings.UPLOAD_DIR, session_id)
    metadata_path = os.path.join(session_dir, "metadata.json")
    
    if not os.path.exists(metadata_path):
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Load metadata
    with open(metadata_path, "r") as f:
        metadata = json.load(f)
    
    try:
        # Step 1: Preprocess images
        front_processed = image_processor.preprocess_image(metadata["front_image"])
        side_processed = image_processor.preprocess_image(metadata["side_image"])
        
        # Step 2: Segment trees from background
        front_segmented = image_processor.segment_tree(front_processed)
        side_segmented = image_processor.segment_tree(side_processed)
        
        # Step 3: Extract dimensions
        dimensions = tree_analyzer.extract_dimensions(
            front_segmented, 
            side_segmented,
            metadata.get("camera_height"),
            metadata.get("distance_from_tree")
        )
        
        # Step 4: Analyze leaf patterns
        leaf_analysis = tree_analyzer.analyze_leaves(front_segmented, side_segmented)
        
        # Step 5: Generate 3D foliage data
        foliage_data = tree_analyzer.generate_foliage_data(dimensions, leaf_analysis)
        
        # Compile results
        result = TreeAnalysisResult(
            session_id=session_id,
            dimensions=dimensions,
            leaf_analysis=leaf_analysis,
            foliage_data=foliage_data
        )
        
        # Save results
        results_dir = os.path.join(settings.RESULTS_DIR, session_id)
        os.makedirs(results_dir, exist_ok=True)
        
        results_path = os.path.join(results_dir, "analysis_result.json")
        result_dict = result.dict()
        
        # Convert datetime objects to ISO format strings
        if 'created_at' in result_dict:
            result_dict['created_at'] = result_dict['created_at'].isoformat()
        
        with open(results_path, "w") as f:
            json.dump(result_dict, f, indent=2)
        
        return JSONResponse({
            "session_id": session_id,
            "status": "completed",
            "result": result_dict
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/results/{session_id}")
async def get_results(session_id: str):
    """Get analysis results for a session"""
    
    results_path = os.path.join(settings.RESULTS_DIR, session_id, "analysis_result.json")
    
    if not os.path.exists(results_path):
        raise HTTPException(status_code=404, detail="Results not found")
    
    with open(results_path, "r") as f:
        result = json.load(f)
    
    return JSONResponse(result)

@router.post("/export/{session_id}")
async def export_results(
    session_id: str,
    format: str = Form(...),  # pdf, obj, gltf, png
):
    """Export results in various formats"""
    
    results_path = os.path.join(settings.RESULTS_DIR, session_id, "analysis_result.json")
    
    if not os.path.exists(results_path):
        raise HTTPException(status_code=404, detail="Results not found")
    
    with open(results_path, "r") as f:
        result = json.load(f)
    
    try:
        if format.lower() == "pdf":
            file_path = report_generator.generate_pdf_report(session_id, result)
        elif format.lower() == "obj":
            file_path = report_generator.generate_3d_model(session_id, result, "obj")
        elif format.lower() == "gltf":
            file_path = report_generator.generate_3d_model(session_id, result, "gltf")
        elif format.lower() == "png":
            file_path = report_generator.generate_visualization(session_id, result)
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
        
        return FileResponse(
            path=file_path,
            media_type='application/octet-stream',
            filename=os.path.basename(file_path)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/sessions")
async def list_sessions():
    """List all processing sessions"""
    sessions = []
    if os.path.exists(settings.UPLOAD_DIR):
        for session_id in os.listdir(settings.UPLOAD_DIR):
            session_dir = os.path.join(settings.UPLOAD_DIR, session_id)
            if os.path.isdir(session_dir):
                metadata_path = os.path.join(session_dir, "metadata.json")
                if os.path.exists(metadata_path):
                    with open(metadata_path, "r") as f:
                        metadata = json.load(f)
                    sessions.append({
                        "session_id": session_id,
                        "created_at": os.path.getctime(session_dir),
                        "has_results": os.path.exists(os.path.join(settings.RESULTS_DIR, session_id))
                    })
    
    return JSONResponse({"sessions": sessions})
