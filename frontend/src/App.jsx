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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data Profiler</h1>
      <input type="file" accept=".csv,.parquet" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="ml-2 p-2 bg-blue-500 text-white rounded">Profile</button>

      {profile && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Profiling Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-scroll">{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
