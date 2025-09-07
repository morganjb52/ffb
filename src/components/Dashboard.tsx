import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Settings,
  Trophy,
  Calendar,
  Activity,
  Edit3
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { FantasyTeam, Lineup, Player } from '../types';

const Dashboard: React.FC = () => {
  const { 
    teams, 
    isLoading, 
    setLoading, 
    syncTeam,
    calculateWinLoss 
  } = useStore();

  const [currentWeek, setCurrentWeek] = useState(8);
  const [teamLineups, setTeamLineups] = useState<{[teamId: string]: Lineup}>({});

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Mock teams data - simulating 10 teams across platforms
      const mockTeams: FantasyTeam[] = [
        {
          id: 'team-1',
          name: 'Championship Bound',
          platform: 'ESPN',
          leagueId: 'espn-league-1',
          leagueName: 'ESPN Dynasty League',
          ownerId: 'user-1',
          record: { wins: 6, losses: 1, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-2',
          name: 'Yahoo Warriors',
          platform: 'Yahoo',
          leagueId: 'yahoo-league-1',
          leagueName: 'Yahoo Redraft League',
          ownerId: 'user-1',
          record: { wins: 4, losses: 3, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-3',
          name: 'Sleeper Squad',
          platform: 'Sleeper',
          leagueId: 'sleeper-league-1',
          leagueName: 'Sleeper Best Ball',
          ownerId: 'user-1',
          record: { wins: 5, losses: 2, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-4',
          name: 'CBS Dynasty',
          platform: 'CBS',
          leagueId: 'cbs-league-1',
          leagueName: 'CBS Dynasty League',
          ownerId: 'user-1',
          record: { wins: 3, losses: 4, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-5',
          name: 'ESPN Redraft',
          platform: 'ESPN',
          leagueId: 'espn-league-2',
          leagueName: 'ESPN Redraft League',
          ownerId: 'user-1',
          record: { wins: 7, losses: 0, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-6',
          name: 'Yahoo Dynasty',
          platform: 'Yahoo',
          leagueId: 'yahoo-league-2',
          leagueName: 'Yahoo Dynasty League',
          ownerId: 'user-1',
          record: { wins: 2, losses: 5, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-7',
          name: 'Sleeper Redraft',
          platform: 'Sleeper',
          leagueId: 'sleeper-league-2',
          leagueName: 'Sleeper Redraft League',
          ownerId: 'user-1',
          record: { wins: 4, losses: 3, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-8',
          name: 'CBS Redraft',
          platform: 'CBS',
          leagueId: 'cbs-league-2',
          leagueName: 'CBS Redraft League',
          ownerId: 'user-1',
          record: { wins: 5, losses: 2, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-9',
          name: 'ESPN Best Ball',
          platform: 'ESPN',
          leagueId: 'espn-league-3',
          leagueName: 'ESPN Best Ball League',
          ownerId: 'user-1',
          record: { wins: 3, losses: 4, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        },
        {
          id: 'team-10',
          name: 'Yahoo Best Ball',
          platform: 'Yahoo',
          leagueId: 'yahoo-league-3',
          leagueName: 'Yahoo Best Ball League',
          ownerId: 'user-1',
          record: { wins: 6, losses: 1, ties: 0 },
          season: 2024,
          isActive: true,
          lastSyncDate: new Date()
        }
      ];

      useStore.getState().setTeams(mockTeams);
      calculateWinLoss();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, calculateWinLoss]);

  const loadAllLineups = useCallback(async () => {
    const lineups: {[teamId: string]: Lineup} = {};
    
    // Different lineup formats to show dynamic grid
    const lineupFormats = [
      // Standard format
      {
        QB: { id: 'qb-1', name: 'Josh Allen', position: 'QB' as const, team: 'BUF', projectedPoints: 24.5, injuryStatus: 'healthy' as const },
        RB1: { id: 'rb-1', name: 'Christian McCaffrey', position: 'RB' as const, team: 'SF', projectedPoints: 18.2, injuryStatus: 'healthy' as const },
        RB2: { id: 'rb-2', name: 'Derrick Henry', position: 'RB' as const, team: 'TEN', projectedPoints: 15.8, injuryStatus: 'questionable' as const },
        WR1: { id: 'wr-1', name: 'Cooper Kupp', position: 'WR' as const, team: 'LAR', projectedPoints: 16.4, injuryStatus: 'healthy' as const },
        WR2: { id: 'wr-2', name: 'Davante Adams', position: 'WR' as const, team: 'LV', projectedPoints: 14.7, injuryStatus: 'healthy' as const },
        TE: { id: 'te-1', name: 'Travis Kelce', position: 'TE' as const, team: 'KC', projectedPoints: 12.3, injuryStatus: 'healthy' as const },
        FLEX: { id: 'wr-3', name: 'Tyreek Hill', position: 'WR' as const, team: 'MIA', projectedPoints: 13.9, injuryStatus: 'healthy' as const },
        K: { id: 'k-1', name: 'Justin Tucker', position: 'K' as const, team: 'BAL', projectedPoints: 8.5, injuryStatus: 'healthy' as const },
        DEF: { id: 'def-1', name: 'Buffalo Bills', position: 'DEF' as const, team: 'BUF', projectedPoints: 7.2, injuryStatus: 'healthy' as const }
      },
      // Superflex format
      {
        QB: { id: 'qb-2', name: 'Patrick Mahomes', position: 'QB' as const, team: 'KC', projectedPoints: 26.1, injuryStatus: 'healthy' as const },
        RB1: { id: 'rb-3', name: 'Saquon Barkley', position: 'RB' as const, team: 'NYG', projectedPoints: 17.3, injuryStatus: 'healthy' as const },
        RB2: { id: 'rb-4', name: 'Nick Chubb', position: 'RB' as const, team: 'CLE', projectedPoints: 14.7, injuryStatus: 'healthy' as const },
        WR1: { id: 'wr-4', name: 'Stefon Diggs', position: 'WR' as const, team: 'BUF', projectedPoints: 15.2, injuryStatus: 'healthy' as const },
        WR2: { id: 'wr-5', name: 'Justin Jefferson', position: 'WR' as const, team: 'MIN', projectedPoints: 16.8, injuryStatus: 'healthy' as const },
        TE: { id: 'te-2', name: 'Mark Andrews', position: 'TE' as const, team: 'BAL', projectedPoints: 11.4, injuryStatus: 'healthy' as const },
        FLEX: { id: 'qb-3', name: 'Lamar Jackson', position: 'QB' as const, team: 'BAL', projectedPoints: 22.3, injuryStatus: 'healthy' as const },
        K: { id: 'k-2', name: 'Harrison Butker', position: 'K' as const, team: 'KC', projectedPoints: 9.1, injuryStatus: 'healthy' as const },
        DEF: { id: 'def-2', name: 'San Francisco 49ers', position: 'DEF' as const, team: 'SF', projectedPoints: 8.7, injuryStatus: 'healthy' as const }
      },
      // 3WR format
      {
        QB: { id: 'qb-4', name: 'Jalen Hurts', position: 'QB' as const, team: 'PHI', projectedPoints: 25.3, injuryStatus: 'healthy' as const },
        RB1: { id: 'rb-5', name: 'Austin Ekeler', position: 'RB' as const, team: 'LAC', projectedPoints: 16.9, injuryStatus: 'healthy' as const },
        RB2: { id: 'rb-6', name: 'Alvin Kamara', position: 'RB' as const, team: 'NO', projectedPoints: 15.4, injuryStatus: 'healthy' as const },
        WR1: { id: 'wr-6', name: 'Ja\'Marr Chase', position: 'WR' as const, team: 'CIN', projectedPoints: 17.1, injuryStatus: 'healthy' as const },
        WR2: { id: 'wr-7', name: 'A.J. Brown', position: 'WR' as const, team: 'PHI', projectedPoints: 14.6, injuryStatus: 'healthy' as const },
        WR3: { id: 'wr-8', name: 'CeeDee Lamb', position: 'WR' as const, team: 'DAL', projectedPoints: 13.8, injuryStatus: 'healthy' as const },
        TE: { id: 'te-3', name: 'George Kittle', position: 'TE' as const, team: 'SF', projectedPoints: 10.7, injuryStatus: 'healthy' as const },
        FLEX: { id: 'rb-7', name: 'Jonathan Taylor', position: 'RB' as const, team: 'IND', projectedPoints: 13.2, injuryStatus: 'healthy' as const },
        K: { id: 'k-3', name: 'Daniel Carlson', position: 'K' as const, team: 'LV', projectedPoints: 8.9, injuryStatus: 'healthy' as const },
        DEF: { id: 'def-3', name: 'Dallas Cowboys', position: 'DEF' as const, team: 'DAL', projectedPoints: 7.8, injuryStatus: 'healthy' as const }
      },
      // IDP format
      {
        QB: { id: 'qb-5', name: 'Dak Prescott', position: 'QB' as const, team: 'DAL', projectedPoints: 23.7, injuryStatus: 'healthy' as const },
        RB1: { id: 'rb-8', name: 'Joe Mixon', position: 'RB' as const, team: 'CIN', projectedPoints: 14.3, injuryStatus: 'healthy' as const },
        RB2: { id: 'rb-9', name: 'Aaron Jones', position: 'RB' as const, team: 'GB', projectedPoints: 12.8, injuryStatus: 'healthy' as const },
        WR1: { id: 'wr-9', name: 'Mike Evans', position: 'WR' as const, team: 'TB', projectedPoints: 13.5, injuryStatus: 'healthy' as const },
        WR2: { id: 'wr-10', name: 'DK Metcalf', position: 'WR' as const, team: 'SEA', projectedPoints: 12.9, injuryStatus: 'healthy' as const },
        TE: { id: 'te-4', name: 'Darren Waller', position: 'TE' as const, team: 'NYG', projectedPoints: 9.8, injuryStatus: 'healthy' as const },
        FLEX: { id: 'wr-11', name: 'DeAndre Hopkins', position: 'WR' as const, team: 'TEN', projectedPoints: 11.4, injuryStatus: 'healthy' as const },
        K: { id: 'k-4', name: 'Evan McPherson', position: 'K' as const, team: 'CIN', projectedPoints: 8.2, injuryStatus: 'healthy' as const },
        DEF: { id: 'def-4', name: 'Philadelphia Eagles', position: 'DEF' as const, team: 'PHI', projectedPoints: 7.5, injuryStatus: 'healthy' as const },
        IDP1: { id: 'idp-1', name: 'Micah Parsons', position: 'DEF' as const, team: 'DAL', projectedPoints: 12.3, injuryStatus: 'healthy' as const },
        IDP2: { id: 'idp-2', name: 'T.J. Watt', position: 'DEF' as const, team: 'PIT', projectedPoints: 11.7, injuryStatus: 'healthy' as const },
        IDP3: { id: 'idp-3', name: 'Aaron Donald', position: 'DEF' as const, team: 'LAR', projectedPoints: 10.9, injuryStatus: 'healthy' as const }
      }
    ];
    
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const formatIndex = i % lineupFormats.length;
      const format = lineupFormats[formatIndex];
      
      const mockLineup: Lineup = {
        id: `lineup-${team.id}-${currentWeek}`,
        teamId: team.id,
        week: currentWeek,
        season: new Date().getFullYear(),
        players: {
          ...format,
          BENCH: [
            { id: 'rb-bench', name: 'Bench RB', position: 'RB' as const, team: 'FA', projectedPoints: 0, injuryStatus: 'healthy' as const },
            { id: 'wr-bench', name: 'Bench WR', position: 'WR' as const, team: 'FA', projectedPoints: 0, injuryStatus: 'healthy' as const }
          ]
        } as any,
        totalProjectedPoints: Object.values(format).reduce((sum, player) => sum + (player.projectedPoints || 0), 0),
        lastUpdated: new Date()
      };
      
      lineups[team.id] = mockLineup;
    }
    
    setTeamLineups(lineups);
  }, [teams, currentWeek]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (teams.length > 0) {
      loadAllLineups();
    }
  }, [teams, currentWeek, loadAllLineups]);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ESPN': return 'bg-fantasy-espn';
      case 'Yahoo': return 'bg-fantasy-yahoo';
      case 'Sleeper': return 'bg-fantasy-sleeper';
      case 'CBS': return 'bg-fantasy-cbs';
      default: return 'bg-gray-600';
    }
  };

  const getAllPositions = () => {
    // Get all unique positions from all team lineups
    const allPositions = new Set<string>();
    
    Object.values(teamLineups).forEach(lineup => {
      if (lineup?.players) {
        Object.keys(lineup.players).forEach(position => {
          if (position !== 'BENCH') {
            allPositions.add(position);
          }
        });
      }
    });

    // Define the order we want positions to appear
    const positionOrder = ['QB', 'RB1', 'RB2', 'RB3', 'WR1', 'WR2', 'WR3', 'WR4', 'TE', 'FLEX', 'FLEX2', 'K', 'DEF', 'IDP1', 'IDP2', 'IDP3'];
    
    // Return positions in the defined order, but only include ones that exist
    return positionOrder.filter(position => allPositions.has(position));
  };

  const getInjuryStatus = (player: Player) => {
    if (!player.injuryStatus || player.injuryStatus === 'healthy') return null;
    
    const statusColors = {
      questionable: 'text-yellow-600 bg-yellow-100',
      doubtful: 'text-orange-600 bg-orange-100',
      out: 'text-red-600 bg-red-100'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[player.injuryStatus]}`}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        {player.injuryStatus.toUpperCase()}
      </span>
    );
  };

  const totalWins = teams.reduce((sum, team) => sum + team.record.wins, 0);
  const totalLosses = teams.reduce((sum, team) => sum + team.record.losses, 0);
  const totalTies = teams.reduce((sum, team) => sum + team.record.ties, 0);
  const winPercentage = totalWins / (totalWins + totalLosses + totalTies) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fantasy Central</h1>
          <p className="text-gray-600">All your fantasy teams in one place</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              className="btn btn-secondary"
              disabled={currentWeek <= 1}
            >
              <Calendar className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700">Week {currentWeek}</span>
            <button
              onClick={() => setCurrentWeek(Math.min(18, currentWeek + 1))}
              className="btn btn-secondary"
              disabled={currentWeek >= 18}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={loadDashboardData}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </button>
          <Link to="/settings" className="btn btn-primary flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Manage Teams
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Wins</p>
              <p className="text-2xl font-bold text-gray-900">{totalWins}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Losses</p>
              <p className="text-2xl font-bold text-gray-900">{totalLosses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(winPercentage * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid Table */}
      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-500 mb-4">Connect your fantasy platforms to get started</p>
          <Link to="/settings" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Team
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proj
                  </th>
                  {getAllPositions().map((position) => (
                    <th key={position} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      {position}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team) => {
                  const lineup = teamLineups[team.id];
                  const winRate = team.record.wins / (team.record.wins + team.record.losses + team.record.ties);
                  
                  return (
                    <tr key={team.id} className="hover:bg-gray-50">
                      {/* Team Info Column */}
                      <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getPlatformColor(team.platform)} mr-3 flex-shrink-0`}></div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{team.name}</div>
                            <div className="text-xs text-gray-500 truncate">{team.leagueName}</div>
                            <div className="text-xs text-gray-400">{team.platform}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Record Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-center">
                          <div className={`text-sm font-medium ${
                            winRate >= 0.6 ? 'text-green-600' : 
                            winRate >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {team.record.wins}-{team.record.losses}
                            {team.record.ties > 0 && `-${team.record.ties}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((winRate) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </td>
                      
                      {/* Projected Points Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-center">
                          <div className="text-sm font-bold text-primary-600">
                            {lineup?.totalProjectedPoints || '--'}
                          </div>
                        </div>
                      </td>
                      
                      {/* Position Columns */}
                      {getAllPositions().map((position) => {
                        const player = lineup?.players[position as keyof typeof lineup.players];
                        const isArray = Array.isArray(player);
                        const actualPlayer = isArray ? null : player;
                        
                        return (
                          <td key={position} className="px-3 py-4 whitespace-nowrap">
                            {actualPlayer ? (
                              <div className="text-center">
                                <div className="flex flex-col items-center space-y-1">
                                  {getInjuryStatus(actualPlayer)}
                                  <div className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
                                    {actualPlayer.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {actualPlayer.team}
                                  </div>
                                  {actualPlayer.projectedPoints && (
                                    <div className="text-xs font-medium text-primary-600">
                                      {actualPlayer.projectedPoints}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="text-xs text-gray-400">--</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      
                      {/* Actions Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex space-x-1 justify-center">
                          <button
                            onClick={() => syncTeam(team.id)}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={isLoading}
                            title="Sync team"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-primary-600"
                            title="Edit lineup"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Table Info */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Showing {teams.length} teams • Week {currentWeek}</span>
              <span>Scroll horizontally to see all positions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;