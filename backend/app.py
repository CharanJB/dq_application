from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
from profiling import profile_dataframe
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_methods=["*"],
  allow_headers=["*"],
)

app = FastAPI()

def load_dataframe(file: UploadFile) -> pd.DataFrame:
    """Read CSV or Parquet into pandas."""
    if file.filename.endswith(".csv"):
        return pd.read_csv(file.file)
    elif file.filename.endswith(".parquet"):
        return pd.read_parquet(file.file)
    else:
        raise ValueError("Unsupported file type")

@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    df = load_dataframe(file)
    # pass e.g. hist_bins=20 if you want more granularity
    profile = profile_dataframe(df, hist_bins=20)
    return JSONResponse(content=profile)