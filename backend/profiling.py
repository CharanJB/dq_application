import pandas as pd
import numpy as np

def null_rate(series):
    return series.isna().mean()

def histogram_buckets(series: pd.Series, bins: int = 10) -> dict:
    """
    Return counts and bin edges for front‑end bar charts.
    Uses NumPy under the hood.
    """
    counts, edges = np.histogram(series.dropna(), bins=bins)
    return {"counts": counts.tolist(), "bins": edges.tolist()}

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
        profile["histogram"][col]   = histogram_buckets(series, bins=hist_bins)
        # pandas provides skew() and kurtosis() directly
        profile["skewness"][col]    = float(series.skew()) if series.dtype != object else None
        profile["kurtosis"][col]    = float(series.kurtosis()) if series.dtype != object else None

        # retain your original basic stats (count, unique, top, freq) where applicable
        if pd.api.types.is_numeric_dtype(series):
            profile["basic_stats"][col] = {
                "count": int(series.count()),
                "mean": float(series.mean()),
                "std": float(series.std()),
                "min": float(series.min()),
                "max": float(series.max())
            }
        else:
            profile["basic_stats"][col] = {
                "count": int(series.count()),
                "unique": int(series.nunique()),
                "top": series.mode().iat[0] if not series.mode().empty else None,
                "freq": int(series.value_counts().iat[0]) if not series.value_counts().empty else None
            }

    return profile