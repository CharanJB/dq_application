import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

function App() {
  const [file, setFile]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a6cee3'];

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:8000/upload/", formData);
    setProfile(res.data);
    setSelectedCol(res.data.columns[0]);
  };

  // Build dataset overview
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

  // Prepare histogram chart data
  const histogramData = () => {
    const { bins, counts } = profile.histogram[selectedCol];
    return bins.slice(0, -1).map((b, i) => ({
      bin: `${b.toFixed(1)}–${bins[i + 1].toFixed(1)}`,
      count: counts[i]
    }));
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">📊 Data Profiler</h1>

      <input type="file" accept=".csv,.parquet"
             onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}
              className="ml-2 p-2 bg-blue-500 text-white rounded">
        Profile
      </button>

      {profile && (
        <>
          {/* Dataset Summary */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-100 rounded">
              Rows: <strong>{profile.shape[0]}</strong>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              Columns: <strong>{profile.shape[1]}</strong>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              Total Nulls: <strong>{getTotalNulls()}</strong>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              Null %: <strong>
                {((getTotalNulls()/
                   (profile.shape[0]*profile.shape[1]))*100).toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Type Distribution */}
          <div className="h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={getTypeCounts()}
                     dataKey="count" nameKey="type"
                     cx="50%" cy="50%" outerRadius={80} label>
                  {getTypeCounts().map((e,i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Column Selection & Histogram */}
          <div className="mb-6">
            <label className="mr-2">Select column:</label>
            <select value={selectedCol}
                    onChange={e => setSelectedCol(e.target.value)}
                    className="border p-1">
              {profile.columns.map(col =>
                <option key={col} value={col}>{col}</option>
              )}
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData()}>
                <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Column Details Table */}
          <h2 className="text-xl font-semibold mt-8 mb-2">📃 Column Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Column</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Null %</th>
                  <th className="p-2 border">Null Rate</th>
                  <th className="p-2 border">Skewness</th>
                  <th className="p-2 border">Kurtosis</th>
                  <th className="p-2 border">Count</th>
                  <th className="p-2 border">Mean</th>
                  <th className="p-2 border">Std</th>
                </tr>
              </thead>
              <tbody>
                {profile.columns.map((col, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{col}</td>
                    <td className="p-2 border">{profile.data_types[col]}</td>
                    <td className="p-2 border">
                      {(profile.null_rate[col] * 100).toFixed(1)}%
                    </td>
                    <td className="p-2 border">
                      {profile.null_rate[col].toFixed(3)}
                    </td>
                    <td className="p-2 border">
                      {profile.skewness[col]?.toFixed(3) ?? '-'}
                    </td>
                    <td className="p-2 border">
                      {profile.kurtosis[col]?.toFixed(3) ?? '-'}
                    </td>
                    <td className="p-2 border">
                      {profile.basic_stats[col]?.count ?? '-'}
                    </td>
                    <td className="p-2 border">
                      {profile.basic_stats[col]?.mean?.toFixed(3) ?? '-'}
                    </td>
                    <td className="p-2 border">
                      {profile.basic_stats[col]?.std?.toFixed(3) ?? '-'}
                    </td>
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
