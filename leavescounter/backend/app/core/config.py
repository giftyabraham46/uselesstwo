from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Tree Calculator"
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = [".jpg", ".jpeg", ".png", ".bmp", ".webp"]
    UPLOAD_DIR: str = "uploads"
    RESULTS_DIR: str = "results"
    
    # ML Model Settings
    MODELS_DIR: str = "models"
    SEGMENTATION_MODEL_PATH: str = "models/tree_segmentation.pth"
    LEAF_CLASSIFIER_MODEL_PATH: str = "models/leaf_classifier.pth"
    
    # Processing Settings
    MAX_IMAGE_SIZE: tuple = (1024, 1024)
    MIN_IMAGE_SIZE: tuple = (256, 256)
    
    # Database Settings (if needed)
    DATABASE_URL: str = "sqlite:///./tree_calculator.db"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Create necessary directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESULTS_DIR, exist_ok=True)
os.makedirs(settings.MODELS_DIR, exist_ok=True)
