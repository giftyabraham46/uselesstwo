from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

class TreeDimensions(BaseModel):
    height: float
    width: float
    depth: float
    confidence: float
    unit: str = "relative"  # or "meters" if calibrated

class LeafAnalysis(BaseModel):
    average_leaf_size: float
    estimated_leaf_count: int
    leaf_type: Optional[str] = None
    leaf_confidence: Optional[float] = None
    edge_density: float
    dominant_colors: List[str]

class FoliageData(BaseModel):
    volume: float
    density: float
    texture_map: Optional[str] = None
    vertex_count: int
    face_count: int

class TreeAnalysisResult(BaseModel):
    session_id: str
    dimensions: TreeDimensions
    leaf_analysis: LeafAnalysis
    foliage_data: FoliageData
    processing_time: Optional[float] = None
    created_at: datetime = datetime.now()

class UploadMetadata(BaseModel):
    camera_height: Optional[float] = None
    distance_from_tree: Optional[float] = None
    image_dpi: Optional[int] = None

class ProcessingStatus(BaseModel):
    session_id: str
    status: str  # uploaded, processing, completed, failed
    progress: Optional[float] = None
    message: Optional[str] = None
