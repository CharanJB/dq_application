import pandas as pd
import numpy as np
from pandas.api.types import is_numeric_dtype

def null_rate(series):
    return series.isna().mean()

def profile_dataframe(df: pd.DataFrame, hist_bins: int = 10) -> dict:
    """
    Build a profile dict with basic stats plus new metrics.
    """
    profile = {
        "shape": df.shape,
        "columns": df.columns.tolist(),
        "null_values": df.isna().sum().to_dict(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "null_rate": {},
        "histogram": {},
        "skewness": {},
        "kurtosis": {},
        "basic_stats": {}
    }

    for col in df.columns:
        series = df[col]
        profile["null_rate"][col]   = null_rate(series)
        # pandas provides skew() and kurtosis() directly
        profile["skewness"][col]    = float(series.skew()) if is_numeric_dtype(series) else None
        profile["kurtosis"][col]    = float(series.kurtosis()) if is_numeric_dtype(series) else None

        # retain your original basic stats (count, unique, top, freq) where applicable
        if is_numeric_dtype(series):
            profile["basic_stats"][col]  = {
                "count": int(series.count()),
                "mean": float(series.mean()),
                "std":   float(series.std()),
                "min":   float(series.min()),
                "max":   float(series.max()),
            }
        else:
            # Non‑numeric: skip histogram, keep only your “basic” object‑dtype stats
            profile["basic_stats"][col] = {
                "count":  int(series.count()),
                "unique": int(series.nunique()),
                "top":    series.mode().iat[0] if not series.mode().empty else None,
                "freq":   int(series.value_counts().iat[0]) if not series.value_counts().empty else None
            }


    return profile