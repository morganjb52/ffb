import React, { useState } from 'react';
import { Plus, RefreshCw, Settings, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FantasyTeam } from '../types';

const Teams: React.FC = () => {
  const { teams, setTeams, syncTeam, isLoading, setLoading } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    platform: 'ESPN' as const,
    leagueId: '',
    leagueName: ''
  });

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const team: FantasyTeam = {
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
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add team:', error);
    } finally {
      setLoading(false);
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

  const getRecordColor = (wins: number, losses: number) => {
    const winRate = wins / (wins + losses);
    if (winRate >= 0.6) return 'text-green-600';
    if (winRate >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your fantasy football teams across all platforms</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </button>
      </div>

      {/* Add Team Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Team</h2>
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
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-500 mb-4">Add your first fantasy team to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            Add Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getPlatformColor(team.platform)} mr-3`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.leagueName}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => syncTeam(team.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Sync team"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete team"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Platform</span>
                  <span className="text-sm font-medium text-gray-900">{team.platform}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Record</span>
                  <span className={`text-sm font-medium ${getRecordColor(team.record.wins, team.record.losses)}`}>
                    {team.record.wins}-{team.record.losses}
                    {team.record.ties > 0 && `-${team.record.ties}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Season</span>
                  <span className="text-sm font-medium text-gray-900">{team.season}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Sync</span>
                  <span className="text-sm text-gray-500">
                    {team.lastSyncDate ? new Date(team.lastSyncDate).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => syncTeam(team.id)}
                    className="flex-1 btn btn-secondary text-sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sync
                  </button>
                  <button className="flex-1 btn btn-primary text-sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
