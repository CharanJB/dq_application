import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

function App() {
  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a6cee3'];

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:8000/upload/", formData);
    setProfile(res.data);
    setSelectedCol(res.data.columns[0]);
  };

  const getTotalNulls = () =>
    Object.values(profile.null_values || {}).reduce((a, b) => a + b, 0);

  const getTypeCounts = () => {
    const counts = {};
    profile.columns.forEach(col => {
      const t = profile.data_types[col];
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  };

  const exportToCSV = () => {
    if (!profile) return;
  
    const headers = [
      "Column",
      "Type",
      "Null %",
      "Null Rate",
      "Skewness",
      "Kurtosis",
      "Count",
      "Mean",
      "Std"
    ];
  
    const rows = profile.columns.map((col) => [
      col,
      profile.data_types[col],
      (profile.null_rate[col] * 100).toFixed(1),
      profile.null_rate[col].toFixed(3),
      profile.skewness[col]?.toFixed(3) ?? '',
      profile.kurtosis[col]?.toFixed(3) ?? '',
      profile.basic_stats[col]?.count ?? '',
      profile.basic_stats[col]?.mean?.toFixed(3) ?? '',
      profile.basic_stats[col]?.std?.toFixed(3) ?? ''
    ]);
  
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "column_profile.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 font-sans max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">📊 Data Profiler</h1>

      {/* Upload Section */}
      <div className="flex items-center space-x-4 mb-6 justify-center">
        <input
          type="file"
          accept=".csv,.parquet"
          onChange={e => setFile(e.target.files[0])}
          className="border border-gray-300 rounded px-3 py-2 w-full max-w-sm"
        />
        <button
          onClick={handleUpload}
          disabled={!file}
          className={`px-4 py-2 rounded text-white transition ${
            file
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Profile
        </button>
      </div>

      {profile && (
        <>
          {/* Dataset Summary */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📈 Dataset Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-100 rounded">Rows: <strong>{profile.shape[0]}</strong></div>
              <div className="p-4 bg-gray-100 rounded">Columns: <strong>{profile.shape[1]}</strong></div>
              <div className="p-4 bg-gray-100 rounded">Total Nulls: <strong>{getTotalNulls()}</strong></div>
              <div className="p-4 bg-gray-100 rounded">Null %: <strong>{((getTotalNulls() / (profile.shape[0] * profile.shape[1])) * 100).toFixed(1)}%</strong></div>
            </div>
          </div>

          {profile && (
            <div className="flex justify-end mb-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                disabled={!profile}>  
                Export CSV
              </button>
            </div>
          )}

          {/* Column Details Table */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📃 Column Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-300 rounded overflow-hidden shadow-md">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3 border">Column</th>
                    <th className="p-3 border">Type</th>
                    <th className="p-3 border">Null %</th>
                    <th className="p-3 border">Null Rate</th>
                    <th className="p-3 border">Skew</th>
                    <th className="p-3 border">Kurt</th>
                    <th className="p-3 border">Count</th>
                    <th className="p-3 border">Mean</th>
                    <th className="p-3 border">Std</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.columns.map((col, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                      <td className="p-3 border">{col}</td>
                      <td className="p-3 border">{profile.data_types[col]}</td>
                      <td className="p-3 border">{(profile.null_rate[col] * 100).toFixed(1)}%</td>
                      <td className="p-3 border">{profile.null_rate[col].toFixed(3)}</td>
                      <td className="p-3 border">{profile.skewness[col]?.toFixed(3) ?? '-'}</td>
                      <td className="p-3 border">{profile.kurtosis[col]?.toFixed(3) ?? '-'}</td>
                      <td className="p-3 border">{profile.basic_stats[col]?.count ?? '-'}</td>
                      <td className="p-3 border">{profile.basic_stats[col]?.mean?.toFixed(3) ?? '-'}</td>
                      <td className="p-3 border">{profile.basic_stats[col]?.std?.toFixed(3) ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
