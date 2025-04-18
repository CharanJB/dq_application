import pandas as pd

def profile_data(filepath):
    if filepath.endswith(".csv"):
        df = pd.read_csv(filepath)
    elif filepath.endswith(".parquet"):
        df = pd.read_parquet(filepath)
    else:
        return {"error": "Unsupported file format"}

    profile = {
        "columns": list(df.columns),
        "shape": df.shape,
        "null_values": df.isnull().sum().to_dict(),
        "data_types": df.dtypes.apply(str).to_dict(),
        "basic_stats": df.describe(include='all').to_dict()
    }

    return profile
