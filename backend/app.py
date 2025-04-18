from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from profiling import profile_data
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_location = f"temp_files/{file.filename}"
    os.makedirs("temp_files", exist_ok=True)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    profile = profile_data(file_location)
    return profile
