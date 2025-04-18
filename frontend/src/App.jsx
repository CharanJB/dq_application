import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

function App() {
  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState(null);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a6cee3'];

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("http://localhost:8000/upload/", formData);
    setProfile(response.data);
  };

  const convertProfileToArray = (data) => {
    if (!data) return [];

    return data.columns.map((col) => ({
      column: col,
      null_values: data.null_values[col],
      null_pct: ((data.null_values[col] / data.shape[0]) * 100).toFixed(1),
      data_type: data.data_types[col],
      ...(data.basic_stats[col] || {})
    }));
  };

  const getTypeCounts = () => {
    const counts = {};
    profile?.columns.forEach((col) => {
      const type = profile.data_types[col];
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  };

  const getTotalNulls = () => {
    return Object.values(profile?.null_values || {}).reduce((a, b) => a + b, 0);
  };

  const profileRows = profile ? convertProfileToArray(profile) : [];
  const typeCounts = profile ? getTypeCounts() : [];

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">📊 Data Profiler</h1>

      <input type="file" accept=".csv,.parquet" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="ml-2 p-2 bg-blue-500 text-white rounded">Profile</button>

      {profile && (
        <>
          {/* Dataset-level Overview */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">📈 Dataset Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-100 rounded">Rows: <strong>{profile.shape[0]}</strong></div>
              <div className="p-4 bg-gray-100 rounded">Columns: <strong>{profile.shape[1]}</strong></div>
              <div className="p-4 bg-gray-100 rounded">Total Nulls: <strong>{getTotalNulls()}</strong></div>
              <div className="p-4 bg-gray-100 rounded">Null %: <strong>{((getTotalNulls() / (profile.shape[0] * profile.shape[1])) * 100).toFixed(1)}%</strong></div>
            </div>

            {/* Type Distribution Chart */}
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeCounts}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {typeCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-column Summary Table */}
          <h2 className="text-xl font-semibold mb-2">📃 Column Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Column</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Nulls</th>
                  <th className="p-2 border">Null %</th>
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
                    <td className="p-2 border">{row.data_type}</td>
                    <td className="p-2 border">{row.null_values}</td>
                    <td className="p-2 border">{row.null_pct}%</td>
                    <td className="p-2 border">{row.count ?? '-'}</td>
                    <td className="p-2 border">{row.unique ?? '-'}</td>
                    <td className="p-2 border">{row.top ?? '-'}</td>
                    <td className="p-2 border">{row.freq ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
