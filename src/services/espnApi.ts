import axios, { AxiosInstance } from 'axios';
import { Lineup, Player } from '../types';

export interface ESPNLeague {
  id: string;
  name: string;
  season: number;
  scoringPeriodId: number;
  teams: ESPNTeam[];
}

export interface ESPNTeam {
  id: string;
  name: string;
  owners: string[];
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  roster: ESPNPlayer[];
}

export interface ESPNPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  injuryStatus?: string;
  projectedPoints?: number;
  actualPoints?: number;
}

export class ESPNApiService {
  private api: AxiosInstance;
  private baseUrl = 'https://fantasy.espn.com/apis/v3/games/ffl';

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
   * Authenticate with ESPN (requires manual login for now)
   * In a real app, you'd implement OAuth flow
   */
  async authenticate(username: string, password: string): Promise<string> {
    // ESPN doesn't have a public API for authentication
    // Users need to manually get their league ID and team ID
    // This is a limitation of ESPN's API
    throw new Error('ESPN requires manual league/team ID setup. Please use the manual setup flow.');
  }

  /**
   * Get league information
   */
  async getLeague(leagueId: string, season: number = new Date().getFullYear()): Promise<ESPNLeague> {
    try {
      const response = await this.api.get(`/seasons/${season}/segments/0/leagues/${leagueId}`);
      const data = response.data;

      return {
        id: data.id.toString(),
        name: data.name,
        season: data.seasonId,
        scoringPeriodId: data.scoringPeriodId,
        teams: data.teams.map((team: any) => ({
          id: team.id.toString(),
          name: team.name,
          owners: team.owners.map((owner: any) => owner.displayName),
          record: {
            wins: team.record.overall.wins,
            losses: team.record.overall.losses,
            ties: team.record.overall.ties,
          },
          roster: team.roster.entries.map((entry: any) => ({
            id: entry.playerId.toString(),
            name: entry.playerPoolEntry.player.fullName,
            position: entry.playerPoolEntry.player.defaultPositionId,
            team: entry.playerPoolEntry.player.proTeamId,
            injuryStatus: entry.playerPoolEntry.player.injuryStatus,
            projectedPoints: entry.playerPoolEntry.player.stats?.find((stat: any) => 
              stat.statSourceId === 1 && stat.statSplitTypeId === 1
            )?.appliedTotal,
            actualPoints: entry.playerPoolEntry.player.stats?.find((stat: any) => 
              stat.statSourceId === 0 && stat.statSplitTypeId === 1
            )?.appliedTotal,
          })),
        })),
      };
    } catch (error) {
      console.error('Failed to fetch ESPN league:', error);
      throw new Error(`Failed to fetch league ${leagueId}: ${error}`);
    }
  }

  /**
   * Get team lineup for a specific week
   */
  async getTeamLineup(leagueId: string, teamId: string, week: number, season: number = new Date().getFullYear()): Promise<Lineup> {
    try {
      const response = await this.api.get(`/seasons/${season}/segments/0/leagues/${leagueId}`, {
        params: {
          view: 'mRoster',
          scoringPeriodId: week,
        },
      });

      const data = response.data;
      const team = data.teams.find((t: any) => t.id.toString() === teamId);
      
      if (!team) {
        throw new Error(`Team ${teamId} not found in league ${leagueId}`);
      }

      const roster = team.roster.entries;
      const players: any = {};

      // Map ESPN roster to our lineup format
      roster.forEach((entry: any) => {
        const player = entry.playerPoolEntry.player;
        const position = this.mapESPNPosition(player.defaultPositionId);
        const lineupPosition = this.mapESPNLineupPosition(entry.lineupSlotId);

        if (lineupPosition && lineupPosition !== 'BENCH') {
          players[lineupPosition] = {
            id: player.id.toString(),
            name: player.fullName,
            position: position,
            team: this.mapESPNTeam(player.proTeamId),
            injuryStatus: this.mapESPNInjuryStatus(player.injuryStatus),
            projectedPoints: entry.playerPoolEntry.player.stats?.find((stat: any) => 
              stat.statSourceId === 1 && stat.statSplitTypeId === 1
            )?.appliedTotal,
            actualPoints: entry.playerPoolEntry.player.stats?.find((stat: any) => 
              stat.statSourceId === 0 && stat.statSplitTypeId === 1
            )?.appliedTotal,
          };
        }
      });

      // Add bench players
      const benchPlayers = roster
        .filter((entry: any) => entry.lineupSlotId === 20) // 20 = Bench in ESPN
        .map((entry: any) => {
          const player = entry.playerPoolEntry.player;
          return {
            id: player.id.toString(),
            name: player.fullName,
            position: this.mapESPNPosition(player.defaultPositionId),
            team: this.mapESPNTeam(player.proTeamId),
            injuryStatus: this.mapESPNInjuryStatus(player.injuryStatus),
            projectedPoints: entry.playerPoolEntry.player.stats?.find((stat: any) => 
              stat.statSourceId === 1 && stat.statSplitTypeId === 1
            )?.appliedTotal,
            actualPoints: entry.playerPoolEntry.player.stats?.find((stat: any) => 
              stat.statSourceId === 0 && stat.statSplitTypeId === 1
            )?.appliedTotal,
          };
        });

      if (benchPlayers.length > 0) {
        players.BENCH = benchPlayers;
      }

      const totalProjectedPoints = Object.values(players)
        .filter(player => !Array.isArray(player))
        .reduce((sum: number, player) => sum + ((player as Player).projectedPoints || 0), 0);

      return {
        id: `espn-${teamId}-${week}`,
        teamId: teamId,
        week: week,
        season: season,
        players: players,
        totalProjectedPoints: totalProjectedPoints as number,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch ESPN lineup:', error);
      throw new Error(`Failed to fetch lineup for team ${teamId}: ${error}`);
    }
  }

  /**
   * Update team lineup (this would require ESPN's lineup API)
   */
  async updateLineup(leagueId: string, teamId: string, week: number, lineup: Partial<Lineup>): Promise<boolean> {
    // ESPN's lineup update API is complex and requires specific formatting
    // This would need to be implemented based on ESPN's specific requirements
    console.log('ESPN lineup update not implemented yet');
    return false;
  }

  /**
   * Map ESPN position IDs to our position format
   */
  private mapESPNPosition(positionId: number): string {
    const positionMap: { [key: number]: string } = {
      1: 'QB',
      2: 'RB',
      3: 'WR',
      4: 'TE',
      5: 'K',
      16: 'DEF',
    };
    return positionMap[positionId] || 'UNKNOWN';
  }

  /**
   * Map ESPN lineup slot IDs to our lineup positions
   */
  private mapESPNLineupPosition(slotId: number): string | null {
    const slotMap: { [key: number]: string } = {
      0: 'QB',
      1: 'RB1',
      2: 'RB2',
      3: 'WR1',
      4: 'WR2',
      5: 'TE',
      6: 'FLEX',
      7: 'K',
      8: 'DEF',
      20: 'BENCH',
    };
    return slotMap[slotId] || null;
  }

  /**
   * Map ESPN team IDs to team abbreviations
   */
  private mapESPNTeam(teamId: number): string {
    const teamMap: { [key: number]: string } = {
      1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
      9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN',
      17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC',
      25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WSH', 29: 'CAR', 30: 'JAX', 33: 'BAL', 34: 'HOU',
    };
    return teamMap[teamId] || 'UNK';
  }

  /**
   * Map ESPN injury status to our format
   */
  private mapESPNInjuryStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'healthy',
      'QUESTIONABLE': 'questionable',
      'DOUBTFUL': 'doubtful',
      'OUT': 'out',
    };
    return statusMap[status] || 'healthy';
  }
}

// Export a singleton instance
export const espnApi = new ESPNApiService();
