// src/components/ResumeOptimizer.jsx
import { useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { DiffEditor } from '@monaco-editor/react';
import { Button } from '@mui/material';
import { RotateCw } from 'react-feather';

export default function ResumeOptimizer({ jobId }) {
  const { optimizeResume } = useSupabase();
  const [original, setOriginal] = useState('');
  const [optimized, setOptimized] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async () => {
    setIsLoading(true);
    try {
      const { optimized } = await optimizeResume(original);
      setOptimized(optimized);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Resume Optimizer</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[500px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Resume
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Paste your resume here..."
          />
        </div>

        <div className="h-[500px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optimized Version
          </label>
          <DiffEditor
            height="100%"
            original={original}
            modified={optimized}
            language="plaintext"
            theme="vs-light"
            options={{ readOnly: true }}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleOptimize}
          disabled={isLoading || !original}
          startIcon={<RotateCw size={18} />}
        >
          {isLoading ? 'Optimizing...' : 'Run AI Optimization'}
        </Button>
      </div>
    </div>
  );
}