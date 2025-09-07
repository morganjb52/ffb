import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import { useStore } from '../store/useStore';

interface ApiConnectionProps {
  platform: 'ESPN' | 'Yahoo' | 'Sleeper' | 'CBS';
  onSuccess: (teams: any[]) => void;
  onClose: () => void;
}

const ApiConnection: React.FC<ApiConnectionProps> = ({ platform, onSuccess, onClose }) => {
  const [step, setStep] = useState<'instructions' | 'credentials' | 'connecting' | 'success' | 'error'>('instructions');
  const [credentials, setCredentials] = useState<any>({});
  const [error, setError] = useState<string>('');
  const [showSecrets, setShowSecrets] = useState<boolean>(false);
  const { setTeams, teams } = useStore();

  const handleConnect = async () => {
    setStep('connecting');
    setError('');

    try {
      const result = await unifiedApi.connectPlatform(platform, credentials);
      
      if (result.success) {
        setTeams([...teams, ...result.teams]);
        setStep('success');
        setTimeout(() => {
          onSuccess(result.teams);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Connection failed');
        setStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getPlatformInstructions = () => {
    switch (platform) {
      case 'ESPN':
        return {
          title: 'Connect ESPN Fantasy',
          steps: [
            'Go to your ESPN Fantasy Football league',
            'Copy the League ID from the URL (e.g., 123456789)',
            'Find your Team ID in the league settings',
            'Enter both IDs below'
          ],
          example: 'League URL: https://fantasy.espn.com/football/league?leagueId=123456789',
          fields: [
            { key: 'leagueId', label: 'League ID', type: 'text', placeholder: '123456789' },
            { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '1' },
            { key: 'season', label: 'Season', type: 'number', placeholder: '2024', defaultValue: new Date().getFullYear() }
          ]
        };
      case 'Yahoo':
        return {
          title: 'Connect Yahoo Fantasy',
          steps: [
            'Click "Authorize with Yahoo" below',
            'Sign in to your Yahoo account',
            'Grant permissions to access your fantasy leagues',
            'Copy the authorization code',
            'Enter your league and team IDs'
          ],
          example: 'You\'ll need to get your League ID and Team ID from Yahoo Fantasy',
          fields: [
            { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Will be filled automatically' },
            { key: 'leagueId', label: 'League ID', type: 'text', placeholder: '123456' },
            { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '1' }
          ]
        };
      case 'Sleeper':
        return {
          title: 'Connect Sleeper',
          steps: [
            'Go to your Sleeper league',
            'Copy the League ID from the URL',
            'Find your Team ID in the league',
            'Enter both IDs below'
          ],
          example: 'League URL: https://sleeper.app/leagues/123456789',
          fields: [
            { key: 'leagueId', label: 'League ID', type: 'text', placeholder: '123456789' },
            { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '1' }
          ]
        };
      case 'CBS':
        return {
          title: 'Connect CBS Sports',
          steps: [
            'CBS Sports API integration coming soon',
            'For now, you can add teams manually'
          ],
          example: 'Manual setup required',
          fields: []
        };
      default:
        return { title: '', steps: [], example: '', fields: [] };
    }
  };

  const instructions = getPlatformInstructions();

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connected Successfully!</h3>
            <p className="text-gray-600">Your {platform} team has been added to your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('instructions')}
                className="flex-1 btn btn-secondary"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{instructions.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {step === 'instructions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Setup Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {instructions.example && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Example:</h4>
                <div className="flex items-center space-x-2">
                  <code className="text-sm text-gray-700 flex-1">{instructions.example}</code>
                  <button
                    onClick={() => copyToClipboard(instructions.example)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {platform === 'Yahoo' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">OAuth Setup Required</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Yahoo requires OAuth authentication. You'll need to set up OAuth credentials in your app.
                </p>
                <button
                  onClick={() => window.open('https://developer.yahoo.com/fantasysports/guide/', '_blank')}
                  className="btn btn-primary text-sm flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Yahoo Developer Guide
                </button>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('credentials')}
                className="flex-1 btn btn-primary"
                disabled={platform === 'CBS'}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'credentials' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Enter Your Credentials</h3>
              <div className="space-y-4">
                {instructions.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type === 'password' && !showSecrets ? 'password' : 'text'}
                        className="input pr-10"
                        placeholder={field.placeholder}
                        value={credentials[field.key] || field.defaultValue || ''}
                        onChange={(e) => setCredentials({
                          ...credentials,
                          [field.key]: e.target.value
                        })}
                        disabled={field.key === 'accessToken'}
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('instructions')}
                className="flex-1 btn btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleConnect}
                className="flex-1 btn btn-primary"
                disabled={!credentials.leagueId || !credentials.teamId}
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {step === 'connecting' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connecting...</h3>
            <p className="text-gray-600">Please wait while we connect to {platform}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiConnection;
