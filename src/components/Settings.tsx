import React, { useState } from 'react';
import { Save, RefreshCw, Trash2, Plus, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import ApiConnection from './ApiConnection';
import { ESPNLogin } from './ESPNLogin';
import { ESPNTeamUrl } from './ESPNTeamUrl';
import { unifiedApi } from '../services/unifiedApi';

const Settings: React.FC = () => {
  const { user, teams, setTeams, connections, setConnections } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('connections');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showApiConnection, setShowApiConnection] = useState(false);
  const [showESPNLogin, setShowESPNLogin] = useState(false);
  const [showESPNTeamUrl, setShowESPNTeamUrl] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ESPN' | 'Yahoo' | 'Sleeper' | 'CBS'>('ESPN');
  const [newTeam, setNewTeam] = useState({
    name: '',
    platform: 'ESPN' as const,
    leagueId: '',
    leagueName: ''
  });

  const tabs = [
    { id: 'connections', name: 'Platform Connections', icon: '🔗' },
    { id: 'teams', name: 'Manage Teams', icon: '👥' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ];

  const platforms = [
    { 
      name: 'ESPN', 
      color: 'bg-fantasy-espn', 
      description: 'Connect your ESPN Fantasy Football leagues',
      authUrl: 'https://fantasy.espn.com/apis/v3/games/ffl'
    },
    { 
      name: 'Yahoo', 
      color: 'bg-fantasy-yahoo', 
      description: 'Connect your Yahoo Fantasy Football leagues',
      authUrl: 'https://fantasysports.yahooapis.com/fantasy/v2'
    },
    { 
      name: 'Sleeper', 
      color: 'bg-fantasy-sleeper', 
      description: 'Connect your Sleeper Fantasy Football leagues',
      authUrl: 'https://api.sleeper.app/v1'
    },
    { 
      name: 'CBS', 
      color: 'bg-fantasy-cbs', 
      description: 'Connect your CBS Fantasy Football leagues',
      authUrl: 'https://api.cbssports.com/fantasy'
    }
  ];

  const handleConnectPlatform = (platform: string) => {
    setSelectedPlatform(platform as any);
    
    if (platform === 'ESPN') {
      // Check if already authenticated
      if (unifiedApi.isESPNAuthenticated()) {
        setShowESPNTeamUrl(true);
      } else {
        setShowESPNLogin(true);
      }
    } else {
      setShowApiConnection(true);
    }
  };

  const handleApiConnectionSuccess = (teams: any[]) => {
    // Teams are already added to the store by the ApiConnection component
    setShowApiConnection(false);
  };

  const handleESPNLoginSuccess = (session: any) => {
    setShowESPNLogin(false);
    setShowESPNTeamUrl(true);
  };

  const handleESPNTeamUrlSuccess = async (teamData: any) => {
    try {
      // Add the team to the store
      const fantasyTeam = {
        id: `espn-${teamData.id}`,
        name: teamData.name,
        platform: 'ESPN' as const,
        leagueId: teamData.leagueId,
        leagueName: `ESPN League ${teamData.leagueId}`,
        ownerId: 'user-1',
        record: teamData.record,
        season: teamData.season,
        isActive: true,
        lastSyncDate: new Date(),
      };

      setTeams([...teams, fantasyTeam]);
      setShowESPNTeamUrl(false);
    } catch (error) {
      console.error('Failed to add ESPN team:', error);
    }
  };


  const handleDisconnectPlatform = (platform: string) => {
    if (window.confirm(`Are you sure you want to disconnect ${platform}? This will remove all associated teams.`)) {
      setConnections(connections.filter(conn => conn.platform !== platform));
      setTeams(teams.filter(team => team.platform !== platform));
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const team = {
        id: `team-${Date.now()}`,
        name: newTeam.name,
        platform: newTeam.platform,
        leagueId: newTeam.leagueId,
        leagueName: newTeam.leagueName,
        ownerId: 'user-1',
        record: { wins: 0, losses: 0, ties: 0 },
        season: new Date().getFullYear(),
        isActive: true,
        lastSyncDate: new Date()
      };

      setTeams([...teams, team]);
      setNewTeam({ name: '', platform: 'ESPN', leagueId: '', leagueName: '' });
      setShowAddTeam(false);
    } catch (error) {
      console.error('Failed to add team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(team => team.id !== teamId));
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ESPN': return 'bg-fantasy-espn';
      case 'Yahoo': return 'bg-fantasy-yahoo';
      case 'Sleeper': return 'bg-fantasy-sleeper';
      case 'CBS': return 'bg-fantasy-cbs';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your platform connections and teams</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Platform Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect Fantasy Platforms</h2>
              <p className="text-gray-600 mb-6">
                Connect your fantasy football accounts to automatically sync teams and lineups.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platforms.map((platform) => {
                  const connection = connections.find(conn => conn.platform === platform.name);
                  const isConnected = connection?.isConnected || false;
                  const teamCount = teams.filter(team => team.platform === platform.name).length;
                  
                  return (
                    <div key={platform.name} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full ${platform.color} mr-3`}></div>
                          <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        </div>
                        {isConnected ? (
                          <span className="badge badge-success flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                        ) : (
                          <span className="badge badge-warning flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Connected
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{platform.description}</p>
                      
                      {isConnected ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Teams Found</span>
                            <span className="font-medium text-gray-900">{teamCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Last Sync</span>
                            <span className="font-medium text-gray-900">
                              {connection?.lastSyncDate ? 
                                new Date(connection.lastSyncDate).toLocaleDateString() : 'Never'
                              }
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {/* Sync logic */}}
                              className="flex-1 btn btn-secondary text-sm"
                              disabled={isLoading}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Sync Now
                            </button>
                            <button
                              onClick={() => handleDisconnectPlatform(platform.name)}
                              className="flex-1 btn btn-danger text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnectPlatform(platform.name)}
                          className="w-full btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Connecting...' : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Connect {platform.name}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Teams Management Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Manage Teams</h2>
              <button
                onClick={() => setShowAddTeam(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team Manually
              </button>
            </div>

            {/* Add Team Form */}
            {showAddTeam && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Manually</h3>
                <form onSubmit={handleAddTeam} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="My Team Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platform
                      </label>
                      <select
                        className="input"
                        value={newTeam.platform}
                        onChange={(e) => setNewTeam({ ...newTeam, platform: e.target.value as any })}
                      >
                        <option value="ESPN">ESPN</option>
                        <option value="Yahoo">Yahoo</option>
                        <option value="Sleeper">Sleeper</option>
                        <option value="CBS">CBS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        League ID
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={newTeam.leagueId}
                        onChange={(e) => setNewTeam({ ...newTeam, leagueId: e.target.value })}
                        placeholder="League ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        League Name
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={newTeam.leagueName}
                        onChange={(e) => setNewTeam({ ...newTeam, leagueName: e.target.value })}
                        placeholder="League Name"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Team'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTeam(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Teams List */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Teams</h3>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No teams found. Connect a platform or add a team manually.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getPlatformColor(team.platform)} mr-3`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.leagueName} • {team.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {team.record.wins}-{team.record.losses}
                            {team.record.ties > 0 && `-${team.record.ties}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last sync: {team.lastSyncDate ? 
                              new Date(team.lastSyncDate).toLocaleDateString() : 'Never'
                            }
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="input"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive email updates about your teams</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Injury Alerts</h3>
                  <p className="text-sm text-gray-600">Get notified when your players are injured</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Lineup Reminders</h3>
                  <p className="text-sm text-gray-600">Reminders to set your lineup before games</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Connection Modal */}
      {showApiConnection && (
        <ApiConnection
          platform={selectedPlatform}
          onSuccess={handleApiConnectionSuccess}
          onClose={() => setShowApiConnection(false)}
        />
      )}

      {/* ESPN Login Modal */}
      {showESPNLogin && (
        <ESPNLogin
          onSuccess={handleESPNLoginSuccess}
          onCancel={() => setShowESPNLogin(false)}
        />
      )}

      {/* ESPN Team URL Modal */}
      {showESPNTeamUrl && (
        <ESPNTeamUrl
          onSuccess={handleESPNTeamUrlSuccess}
          onCancel={() => setShowESPNTeamUrl(false)}
        />
      )}
    </div>
  );
};

export default Settings;