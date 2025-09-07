import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Lineup, Player } from '../types';

const Lineups: React.FC = () => {
  const { teams, setLineups, updateLineup, selectedTeam, setSelectedTeam } = useStore();
  const [currentWeek, setCurrentWeek] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLineup, setEditingLineup] = useState<Lineup | null>(null);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, selectedTeam, setSelectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      loadLineup(selectedTeam, currentWeek);
    }
  }, [selectedTeam, currentWeek]);

  const loadLineup = async (teamId: string, week: number) => {
    setIsLoading(true);
    try {
      // Mock lineup data
      const mockLineup: Lineup = {
        id: `lineup-${teamId}-${week}`,
        teamId,
        week,
        season: new Date().getFullYear(),
        players: {
          QB: { id: 'qb-1', name: 'Josh Allen', position: 'QB', team: 'BUF', projectedPoints: 24.5 },
          RB1: { id: 'rb-1', name: 'Christian McCaffrey', position: 'RB', team: 'SF', projectedPoints: 18.2 },
          RB2: { id: 'rb-2', name: 'Derrick Henry', position: 'RB', team: 'TEN', projectedPoints: 15.8 },
          WR1: { id: 'wr-1', name: 'Cooper Kupp', position: 'WR', team: 'LAR', projectedPoints: 16.4 },
          WR2: { id: 'wr-2', name: 'Davante Adams', position: 'WR', team: 'LV', projectedPoints: 14.7 },
          TE: { id: 'te-1', name: 'Travis Kelce', position: 'TE', team: 'KC', projectedPoints: 12.3 },
          FLEX: { id: 'wr-3', name: 'Tyreek Hill', position: 'WR', team: 'MIA', projectedPoints: 13.9 },
          K: { id: 'k-1', name: 'Justin Tucker', position: 'K', team: 'BAL', projectedPoints: 8.5 },
          DEF: { id: 'def-1', name: 'Buffalo Bills', position: 'DEF', team: 'BUF', projectedPoints: 7.2 },
          BENCH: [
            { id: 'rb-3', name: 'Saquon Barkley', position: 'RB', team: 'NYG', projectedPoints: 12.1 },
            { id: 'wr-4', name: 'Stefon Diggs', position: 'WR', team: 'BUF', projectedPoints: 11.8 },
            { id: 'te-2', name: 'Mark Andrews', position: 'TE', team: 'BAL', projectedPoints: 9.4 }
          ]
        },
        totalProjectedPoints: 131.9,
        lastUpdated: new Date()
      };

      setLineups([mockLineup]);
      setEditingLineup(mockLineup);
    } catch (error) {
      console.error('Failed to load lineup:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSaveLineup = async () => {
    if (!editingLineup) return;

    setIsLoading(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateLineup(editingLineup.id, editingLineup);
      alert('Lineup saved successfully!');
    } catch (error) {
      console.error('Failed to save lineup:', error);
      alert('Failed to save lineup');
    } finally {
      setIsLoading(false);
    }
  };

  const getInjuryStatus = (player: Player) => {
    if (!player.injuryStatus || player.injuryStatus === 'healthy') return null;
    
    const statusColors = {
      questionable: 'text-yellow-600',
      doubtful: 'text-orange-600',
      out: 'text-red-600'
    };

    return (
      <span className={`text-xs ${statusColors[player.injuryStatus]} flex items-center`}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        {player.injuryStatus.toUpperCase()}
      </span>
    );
  };

  const selectedTeamData = teams.find(team => team.id === selectedTeam);

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No teams found</h2>
        <p className="text-gray-600">Add a team first to manage lineups</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lineups</h1>
          <p className="text-gray-600">Manage your starting lineups across all teams</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="input w-48"
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.platform})
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              className="btn btn-secondary"
              disabled={currentWeek <= 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700">Week {currentWeek}</span>
            <button
              onClick={() => setCurrentWeek(Math.min(18, currentWeek + 1))}
              className="btn btn-secondary"
              disabled={currentWeek >= 18}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : editingLineup ? (
        <div className="space-y-6">
          {/* Team Info */}
          {selectedTeamData && (
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedTeamData.name}</h2>
                  <p className="text-gray-600">{selectedTeamData.leagueName} • {selectedTeamData.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Projected Points</p>
                  <p className="text-2xl font-bold text-primary-600">{editingLineup.totalProjectedPoints}</p>
                </div>
              </div>
            </div>
          )}

          {/* Starting Lineup */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Starting Lineup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(editingLineup.players).map(([position, player]) => {
                if (position === 'BENCH' || !player || Array.isArray(player)) return null;
                
                return (
                  <div key={position} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">{position}</span>
                      {getInjuryStatus(player)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-600">{player.team}</p>
                      {player.projectedPoints && (
                        <p className="text-sm text-primary-600 font-medium">
                          {player.projectedPoints} pts
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bench */}
          {editingLineup.players.BENCH && editingLineup.players.BENCH.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bench</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editingLineup.players.BENCH.map((player) => (
                  <div key={player.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">{player.position}</span>
                      {getInjuryStatus(player)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-600">{player.team}</p>
                      {player.projectedPoints && (
                        <p className="text-sm text-primary-600 font-medium">
                          {player.projectedPoints} pts
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => loadLineup(selectedTeam!, currentWeek)}
              className="btn btn-secondary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleSaveLineup}
              className="btn btn-primary"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Lineup
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lineup found</h3>
          <p className="text-gray-500">Select a team and week to view lineup</p>
        </div>
      )}
    </div>
  );
};

export default Lineups;
