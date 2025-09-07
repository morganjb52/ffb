import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Trophy } from 'lucide-react';
import { useStore } from '../store/useStore';

const Stats: React.FC = () => {
  const { teams, leagueRecords, calculateWinLoss } = useStore();

  useEffect(() => {
    calculateWinLoss();
  }, [teams, calculateWinLoss]);

  const currentSeason = new Date().getFullYear();

  const totalWins = teams.reduce((sum, team) => sum + team.record.wins, 0);
  const totalLosses = teams.reduce((sum, team) => sum + team.record.losses, 0);
  const totalTies = teams.reduce((sum, team) => sum + team.record.ties, 0);
  const totalGames = totalWins + totalLosses + totalTies;
  const winPercentage = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  const getPlatformStats = () => {
    const platformStats: { [key: string]: { wins: number; losses: number; ties: number; teams: number } } = {};
    
    teams.forEach(team => {
      if (!platformStats[team.platform]) {
        platformStats[team.platform] = { wins: 0, losses: 0, ties: 0, teams: 0 };
      }
      platformStats[team.platform].wins += team.record.wins;
      platformStats[team.platform].losses += team.record.losses;
      platformStats[team.platform].ties += team.record.ties;
      platformStats[team.platform].teams += 1;
    });

    return platformStats;
  };

  const getBestTeam = () => {
    if (teams.length === 0) return null;
    
    return teams.reduce((best, current) => {
      const bestWinRate = best.record.wins / (best.record.wins + best.record.losses + best.record.ties);
      const currentWinRate = current.record.wins / (current.record.wins + current.record.losses + current.record.ties);
      return currentWinRate > bestWinRate ? current : best;
    });
  };

  const getWorstTeam = () => {
    if (teams.length === 0) return null;
    
    return teams.reduce((worst, current) => {
      const worstWinRate = worst.record.wins / (worst.record.wins + worst.record.losses + worst.record.ties);
      const currentWinRate = current.record.wins / (current.record.wins + current.record.losses + current.record.ties);
      return currentWinRate < worstWinRate ? current : worst;
    });
  };

  const platformStats = getPlatformStats();
  const bestTeam = getBestTeam();
  const worstTeam = getWorstTeam();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600">Track your performance across all fantasy leagues</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-yellow-600" />
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
              <TrendingDown className="h-8 w-8 text-red-600" />
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
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Win Percentage</p>
              <p className="text-2xl font-bold text-gray-900">{winPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Games</p>
              <p className="text-2xl font-bold text-gray-900">{totalGames}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Team */}
        {bestTeam && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
              Best Performing Team
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{bestTeam.name}</span>
                <span className="text-sm text-gray-500">{bestTeam.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Record</span>
                <span className="text-sm font-medium text-green-600">
                  {bestTeam.record.wins}-{bestTeam.record.losses}
                  {bestTeam.record.ties > 0 && `-${bestTeam.record.ties}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Win Rate</span>
                <span className="text-sm font-medium text-green-600">
                  {((bestTeam.record.wins / (bestTeam.record.wins + bestTeam.record.losses + bestTeam.record.ties)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Worst Team */}
        {worstTeam && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              Needs Improvement
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{worstTeam.name}</span>
                <span className="text-sm text-gray-500">{worstTeam.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Record</span>
                <span className="text-sm font-medium text-red-600">
                  {worstTeam.record.wins}-{worstTeam.record.losses}
                  {worstTeam.record.ties > 0 && `-${worstTeam.record.ties}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Win Rate</span>
                <span className="text-sm font-medium text-red-600">
                  {((worstTeam.record.wins / (worstTeam.record.wins + worstTeam.record.losses + worstTeam.record.ties)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Platform Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Platform</h3>
        <div className="space-y-4">
          {Object.entries(platformStats).map(([platform, stats]) => {
            const platformWinRate = (stats.wins / (stats.wins + stats.losses + stats.ties)) * 100;
            
            return (
              <div key={platform} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{platform}</h4>
                  <span className="text-sm text-gray-500">{stats.teams} team{stats.teams !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
                    <p className="text-sm text-gray-500">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.losses}</p>
                    <p className="text-sm text-gray-500">Losses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{platformWinRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Win Rate</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Teams</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  League
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => {
                const teamWinRate = (team.record.wins / (team.record.wins + team.record.losses + team.record.ties)) * 100;
                
                return (
                  <tr key={team.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{team.platform}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {team.record.wins}-{team.record.losses}
                        {team.record.ties > 0 && `-${team.record.ties}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        teamWinRate >= 60 ? 'text-green-600' : 
                        teamWinRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {teamWinRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{team.leagueName}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stats;
