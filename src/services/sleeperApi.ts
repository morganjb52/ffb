import axios, { AxiosInstance } from 'axios';
import { Lineup, Player } from '../types';

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  teams: SleeperTeam[];
}

export interface SleeperTeam {
  team_id: string;
  name: string;
  owners: string[];
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  roster: SleeperPlayer[];
}

export interface SleeperPlayer {
  player_id: string;
  name: string;
  position: string;
  team: string;
  injuryStatus?: string;
  projectedPoints?: number;
  actualPoints?: number;
}

export class SleeperApiService {
  private api: AxiosInstance;
  private baseUrl = 'https://api.sleeper.app/v1';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get league information
   */
  async getLeague(leagueId: string): Promise<SleeperLeague> {
    try {
      const [leagueResponse, rostersResponse, usersResponse] = await Promise.all([
        this.api.get(`/league/${leagueId}`),
        this.api.get(`/league/${leagueId}/rosters`),
        this.api.get(`/league/${leagueId}/users`),
      ]);

      const league = leagueResponse.data;
      const rosters = rostersResponse.data;
      const users = usersResponse.data;

      // Get all players data
      const playersResponse = await this.api.get('/players/nfl');
      const allPlayers = playersResponse.data;

      const teams = rosters.map((roster: any) => {
        const user = users.find((u: any) => u.user_id === roster.owner_id);
        const teamName = user ? user.display_name || user.username : `Team ${roster.roster_id}`;

        return {
          team_id: roster.roster_id,
          name: teamName,
          owners: [user?.display_name || user?.username || 'Unknown'],
          record: {
            wins: roster.settings.wins || 0,
            losses: roster.settings.losses || 0,
            ties: roster.settings.ties || 0,
          },
          roster: roster.players.map((playerId: string) => {
            const player = allPlayers[playerId];
            if (!player) return null;

            return {
              player_id: playerId,
              name: player.full_name,
              position: this.mapSleeperPosition(player.position),
              team: player.team,
              injuryStatus: this.mapSleeperInjuryStatus(player.injury_status),
              projectedPoints: 0, // Sleeper doesn't provide projections in this endpoint
              actualPoints: 0, // Would need to fetch from stats endpoint
            };
          }).filter(Boolean),
        };
      });

      return {
        league_id: leagueId,
        name: league.name,
        season: league.season,
        teams: teams,
      };
    } catch (error) {
      console.error('Failed to fetch Sleeper league:', error);
      throw new Error(`Failed to fetch league ${leagueId}: ${error}`);
    }
  }

  /**
   * Get team lineup for a specific week
   */
  async getTeamLineup(leagueId: string, teamId: string, week: number): Promise<Lineup> {
    try {
      const [rosterResponse, leagueResponse] = await Promise.all([
        this.api.get(`/league/${leagueId}/rosters`),
        this.api.get(`/league/${leagueId}`),
      ]);

      const rosters = rosterResponse.data;
      const league = leagueResponse.data;
      const roster = rosters.find((r: any) => r.roster_id === teamId);

      if (!roster) {
        throw new Error(`Team ${teamId} not found in league ${leagueId}`);
      }

      // Get lineup for the week
      const lineupResponse = await this.api.get(`/league/${leagueId}/matchups/${week}`);
      const matchups = lineupResponse.data;
      const matchup = matchups.find((m: any) => m.roster_id === teamId);

      // Get all players data
      const playersResponse = await this.api.get('/players/nfl');
      const allPlayers = playersResponse.data;

      const players: any = {};

      // Map Sleeper roster to our lineup format
      if (matchup) {
        const lineupPositions = [
          'QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K', 'DEF'
        ];

        lineupPositions.forEach((position, index) => {
          const playerId = matchup.starters[index];
          if (playerId && playerId !== '0') {
            const player = allPlayers[playerId];
            if (player) {
              players[position] = {
                id: playerId,
                name: player.full_name,
                position: this.mapSleeperPosition(player.position),
                team: player.team,
                injuryStatus: this.mapSleeperInjuryStatus(player.injury_status),
                projectedPoints: 0, // Would need to fetch from projections endpoint
                actualPoints: matchup.starters_points[index] || 0,
              };
            }
          }
        });

        // Add bench players
        const benchPlayers = matchup.starters
          .slice(9) // Bench players start after the 9 starting positions
          .filter((playerId: string) => playerId && playerId !== '0')
          .map((playerId: string) => {
            const player = allPlayers[playerId];
            if (!player) return null;

            return {
              id: playerId,
              name: player.full_name,
              position: this.mapSleeperPosition(player.position),
              team: player.team,
              injuryStatus: this.mapSleeperInjuryStatus(player.injury_status),
              projectedPoints: 0,
              actualPoints: 0,
            };
          })
          .filter(Boolean);

        if (benchPlayers.length > 0) {
          players.BENCH = benchPlayers;
        }
      }

      const totalProjectedPoints = Object.values(players)
        .filter(player => !Array.isArray(player))
        .reduce((sum: number, player) => sum + ((player as Player).projectedPoints || 0), 0);

      return {
        id: `sleeper-${teamId}-${week}`,
        teamId: teamId,
        week: week,
        season: parseInt(league.season),
        players: players,
        totalProjectedPoints: totalProjectedPoints as number,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch Sleeper lineup:', error);
      throw new Error(`Failed to fetch lineup for team ${teamId}: ${error}`);
    }
  }

  /**
   * Update team lineup
   */
  async updateLineup(leagueId: string, teamId: string, week: number, lineup: Partial<Lineup>): Promise<boolean> {
    try {
      // Sleeper's lineup update API
      const starters = Object.entries(lineup.players || {})
        .filter(([position, player]) => position !== 'BENCH' && !Array.isArray(player))
        .map(([position, player]) => (player as Player)?.id)
        .filter(Boolean);

      const response = await this.api.put(`/league/${leagueId}/rosters/${teamId}`, {
        starters: starters,
      });

      return response.status === 200;
    } catch (error) {
      console.error('Failed to update Sleeper lineup:', error);
      return false;
    }
  }

  /**
   * Get user's leagues
   */
  async getUserLeagues(userId: string, season: string = new Date().getFullYear().toString()): Promise<SleeperLeague[]> {
    try {
      const response = await this.api.get(`/user/${userId}/leagues/nfl/${season}`);
      const leagues = response.data;

      const leaguePromises = leagues.map((league: any) => this.getLeague(league.league_id));
      return await Promise.all(leaguePromises);
    } catch (error) {
      console.error('Failed to fetch user leagues:', error);
      throw new Error('Failed to fetch user leagues');
    }
  }

  /**
   * Map Sleeper position to our format
   */
  private mapSleeperPosition(position: string): string {
    const positionMap: { [key: string]: string } = {
      'QB': 'QB',
      'RB': 'RB',
      'WR': 'WR',
      'TE': 'TE',
      'K': 'K',
      'DEF': 'DEF',
    };
    return positionMap[position] || position;
  }

  /**
   * Map Sleeper injury status to our format
   */
  private mapSleeperInjuryStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      '': 'healthy',
      'Questionable': 'questionable',
      'Doubtful': 'doubtful',
      'Out': 'out',
    };
    return statusMap[status] || 'healthy';
  }
}

// Export a singleton instance
export const sleeperApi = new SleeperApiService();
