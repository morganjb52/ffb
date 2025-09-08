import React, { useState } from 'react';
import { unifiedApi } from '../services/unifiedApi';
import { useStore } from '../store/useStore';

const HTMLTest: React.FC = () => {
  const [html, setHtml] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { addTeam } = useStore();

  const handleTest = async () => {
    if (!html.trim()) return;
    
    setLoading(true);
    try {
      console.log('Testing HTML parsing...');
      const parsed = await unifiedApi.testParseESPNHTML(html);
      setResult(parsed);
      console.log('Parsed result:', parsed);
    } catch (error) {
      console.error('Error testing HTML:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDashboard = async () => {
    if (!html.trim()) return;
    
    setLoading(true);
    try {
      console.log('Adding team to dashboard...');
      const connectionResult = await unifiedApi.createESPNTeamFromHTML(html);
      
      if (connectionResult.success && connectionResult.teams.length > 0) {
        addTeam(connectionResult.teams[0]);
        setResult({ ...result, addedToDashboard: true });
        console.log('Team added to dashboard:', connectionResult.teams[0]);
      } else {
        setResult({ ...result, error: connectionResult.error || 'Failed to add team' });
      }
    } catch (error) {
      console.error('Error adding team:', error);
      setResult({ ...result, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestAuth = async () => {
    setLoading(true);
    try {
      console.log('Testing ESPN authentication...');
      const isAuthenticated = await unifiedApi.testESPNAuthentication();
      setResult({ ...result, authTest: isAuthenticated });
      console.log('Auth test result:', isAuthenticated);
    } catch (error) {
      console.error('Error testing auth:', error);
      setResult({ ...result, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">ESPN HTML Parser Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste ESPN Team Page HTML:
        </label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-xs"
          placeholder="Paste the entire page source here..."
        />
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleTestAuth}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
        
        <button
          onClick={handleTest}
          disabled={loading || !html.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test HTML Parsing'}
        </button>
        
        <button
          onClick={handleAddToDashboard}
          disabled={loading || !html.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Team to Dashboard'}
        </button>
      </div>
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default HTMLTest;
