import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("http://localhost:8000/upload/", formData);
    setProfile(response.data);
  };

  const handleExport = () => {
    const exportData = convertProfileToArray(profile);
    const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "profile.json";
    link.click();
  };

  const convertProfileToArray = (data) => {
    if (!data) return [];

    return data.columns.map((col) => ({
      column: col,
      null_values: data.null_values[col],
      data_type: data.data_types[col],
      ...(data.basic_stats[col] || {})
    }));
  };

  const profileRows = profile ? convertProfileToArray(profile) : [];

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">📊 Data Profiler</h1>

      <input type="file" accept=".csv,.parquet" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="ml-2 p-2 bg-blue-500 text-white rounded">Profile</button>

      {profile && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Summary Table</h2>
          <button onClick={handleExport} className="mb-4 p-2 bg-green-500 text-white rounded">Export Results</button>
          <table className="min-w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Column</th>
                <th className="p-2 border">Nulls</th>
                <th className="p-2 border">Data Type</th>
                <th className="p-2 border">Count</th>
                <th className="p-2 border">Unique</th>
                <th className="p-2 border">Top</th>
                <th className="p-2 border">Freq</th>
              </tr>
            </thead>
            <tbody>
              {profileRows.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">{row.column}</td>
                  <td className="p-2 border">{row.null_values}</td>
                  <td className="p-2 border">{row.data_type}</td>
                  <td className="p-2 border">{row.count ?? '-'}</td>
                  <td className="p-2 border">{row.unique ?? '-'}</td>
                  <td className="p-2 border">{row.top ?? '-'}</td>
                  <td className="p-2 border">{row.freq ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
