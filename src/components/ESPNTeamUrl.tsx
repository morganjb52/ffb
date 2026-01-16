import React, { useState } from 'react';
import { espnApi } from '../services/espnApi';

interface ESPNTeamUrlProps {
  onSuccess: (teamData: any) => void;
  onCancel: () => void;
}

export const ESPNTeamUrl: React.FC<ESPNTeamUrlProps> = ({ onSuccess, onCancel }) => {
  const [teamUrl, setTeamUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const teamData = await espnApi.getTeamFromUrl(teamUrl);
      onSuccess(teamData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('espn.com') && 
             urlObj.pathname.includes('/football/team') &&
             urlObj.searchParams.has('leagueId') &&
             urlObj.searchParams.has('teamId');
    } catch {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Add ESPN Team
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="teamUrl" className="block text-sm font-medium text-gray-700 mb-1">
              ESPN Team URL
            </label>
            <input
              type="url"
              id="teamUrl"
              value={teamUrl}
              onChange={(e) => setTeamUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://fantasy.espn.com/football/team?leagueId=123456&teamId=1"
              required
            />
            {teamUrl && !isValidUrl(teamUrl) && (
              <p className="text-sm text-red-600 mt-1">
                Please enter a valid ESPN team URL
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !teamUrl || !isValidUrl(teamUrl)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fetching Team...' : 'Add Team'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to find your team URL:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Go to your ESPN fantasy team page</li>
            <li>2. Make sure you're logged in</li>
            <li>3. Copy the URL from your browser address bar</li>
            <li>4. Paste it above</li>
          </ol>
          <p className="text-xs text-blue-700 mt-2">
            Example: https://fantasy.espn.com/football/team?leagueId=123456&teamId=1
          </p>
        </div>
      </div>
    </div>
  );
};

