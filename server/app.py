from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import shutil
from datetime import datetime
from fastapi.staticfiles import StaticFiles

# Initialized FastAPI app
app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Database setup
DATABASE_URL = "sqlite:///./image_inpainting.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

# File storage setup
UPLOAD_DIR = "uploads"
ORIGINAL_DIR = os.path.join(UPLOAD_DIR, "originals")
MASK_DIR = os.path.join(UPLOAD_DIR, "masks")
os.makedirs(ORIGINAL_DIR, exist_ok=True)
os.makedirs(MASK_DIR, exist_ok=True)

# Models
class ImageMetadata(Base):
    __tablename__ = "image_metadata"

    id = Column(Integer, primary_key=True, index=True)
    original_image_path = Column(String, nullable=False)
    mask_image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# To Create database tables
Base.metadata.create_all(bind=engine)

# Pydantic schema for API response
class ImageMetadataSchema(BaseModel):
    id: int
    original_image_path: str
    mask_image_path: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# Routes
@app.post("/upload-image", response_model=ImageMetadataSchema)
def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are allowed.")

    file_path = os.path.join(ORIGINAL_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    normalized_path = file_path.replace("\\", "/")

    image_metadata = ImageMetadata(original_image_path=normalized_path)
    session.add(image_metadata)
    session.commit()
    session.refresh(image_metadata)

    return image_metadata


@app.post("/upload-mask/{image_id}", response_model=ImageMetadataSchema)
def upload_mask(image_id: int, file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are allowed.")

    image_metadata = session.query(ImageMetadata).filter(ImageMetadata.id == image_id).first()
    if not image_metadata:
        raise HTTPException(status_code=404, detail="Image not found.")

    file_path = os.path.join(MASK_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    normalized_path = file_path.replace("\\", "/")

    image_metadata.mask_image_path = normalized_path
    session.commit()
    session.refresh(image_metadata)

    return image_metadata

@app.get("/images", response_model=List[ImageMetadataSchema])
def get_images():
    images = session.query(ImageMetadata).all()
    return images

@app.get("/image/{image_id}", response_model=ImageMetadataSchema)
def get_image(image_id: int):
    image_metadata = session.query(ImageMetadata).filter(ImageMetadata.id == image_id).first()
    if not image_metadata:
        raise HTTPException(status_code=404, detail="Image not found.")
    return image_metadata

@app.exception_handler(HTTPException)
def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)