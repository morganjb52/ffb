import axios, { AxiosInstance } from 'axios';
import { Lineup, Player } from '../types';

export interface YahooLeague {
  league_id: string;
  name: string;
  season: number;
  teams: YahooTeam[];
}

export interface YahooTeam {
  team_id: string;
  name: string;
  owners: string[];
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  roster: YahooPlayer[];
}

export interface YahooPlayer {
  player_id: string;
  name: string;
  position: string;
  team: string;
  injuryStatus?: string;
  projectedPoints?: number;
  actualPoints?: number;
}

export class YahooApiService {
  private api: AxiosInstance;
  private baseUrl = 'https://fantasysports.yahooapis.com/fantasy/v2';
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string) {
    this.accessToken = token;
    this.api.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'fspt-r',
    });
    
    return `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<string> {
    try {
      const response = await axios.post('https://api.login.yahoo.com/oauth2/get_token', {
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      this.setAccessToken(access_token);
      return access_token;
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      throw new Error('Failed to authenticate with Yahoo');
    }
  }

  /**
   * Get user's leagues
   */
  async getUserLeagues(season: number = new Date().getFullYear()): Promise<YahooLeague[]> {
    try {
      const response = await this.api.get(`/users;use_login=1/games;game_keys=nfl/leagues`);
      const data = response.data;

      return data.fantasy_content.users[0].user[1].games[0].game[1].leagues.map((league: any) => ({
        league_id: league.league[0].league_id,
        name: league.league[0].name,
        season: season,
        teams: league.league[1].teams.map((team: any) => ({
          team_id: team.team[0].team_id,
          name: team.team[0].name,
          owners: team.team[0].managers.map((manager: any) => manager.manager.nickname),
          record: {
            wins: parseInt(team.team[0].team_standings.team_standings.outcome_totals.wins),
            losses: parseInt(team.team[0].team_standings.team_standings.outcome_totals.losses),
            ties: parseInt(team.team[0].team_standings.team_standings.outcome_totals.ties),
          },
          roster: [], // Will be populated separately
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch Yahoo leagues:', error);
      throw new Error('Failed to fetch Yahoo leagues');
    }
  }

  /**
   * Get team lineup for a specific week
   */
  async getTeamLineup(leagueId: string, teamId: string, week: number, season: number = new Date().getFullYear()): Promise<Lineup> {
    try {
      const response = await this.api.get(`/league/${leagueId}/team/${teamId}/roster;week=${week}`);
      const data = response.data;

      const roster = data.fantasy_content.league[1].teams[0].team[1].roster[0].players;
      const players: any = {};

      // Map Yahoo roster to our lineup format
      roster.forEach((player: any) => {
        const playerData = player.player[0];
        const position = this.mapYahooPosition(playerData.display_position);
        const lineupPosition = this.mapYahooLineupPosition(playerData.selected_position);

        if (lineupPosition && lineupPosition !== 'BN') {
          players[lineupPosition] = {
            id: playerData.player_id,
            name: playerData.name.full,
            position: position,
            team: playerData.editorial_team_abbr,
            injuryStatus: this.mapYahooInjuryStatus(playerData.injury_status),
            projectedPoints: playerData.projected_points?.total,
            actualPoints: playerData.points?.total,
          };
        }
      });

      // Add bench players
      const benchPlayers = roster
        .filter((player: any) => player.player[0].selected_position === 'BN')
        .map((player: any) => {
          const playerData = player.player[0];
          return {
            id: playerData.player_id,
            name: playerData.name.full,
            position: this.mapYahooPosition(playerData.display_position),
            team: playerData.editorial_team_abbr,
            injuryStatus: this.mapYahooInjuryStatus(playerData.injury_status),
            projectedPoints: playerData.projected_points?.total,
            actualPoints: playerData.points?.total,
          };
        });

      if (benchPlayers.length > 0) {
        players.BENCH = benchPlayers;
      }

      const totalProjectedPoints = Object.values(players)
        .filter(player => !Array.isArray(player))
        .reduce((sum: number, player) => sum + ((player as Player).projectedPoints || 0), 0);

      return {
        id: `yahoo-${teamId}-${week}`,
        teamId: teamId,
        week: week,
        season: season,
        players: players,
        totalProjectedPoints: totalProjectedPoints as number,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch Yahoo lineup:', error);
      throw new Error(`Failed to fetch lineup for team ${teamId}: ${error}`);
    }
  }

  /**
   * Update team lineup
   */
  async updateLineup(leagueId: string, teamId: string, week: number, lineup: Partial<Lineup>): Promise<boolean> {
    try {
      // Yahoo's lineup update API requires specific formatting
      const rosterUpdates = Object.entries(lineup.players || {}).map(([position, player]) => {
        if (Array.isArray(player)) return null;
        return {
          player_id: player?.id,
          position: this.mapYahooLineupPositionReverse(position),
        };
      }).filter(Boolean);

      const response = await this.api.put(`/league/${leagueId}/team/${teamId}/roster`, {
        roster: rosterUpdates,
      });

      return response.status === 200;
    } catch (error) {
      console.error('Failed to update Yahoo lineup:', error);
      return false;
    }
  }

  /**
   * Map Yahoo position to our format
   */
  private mapYahooPosition(position: string): string {
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
   * Map Yahoo lineup position to our format
   */
  private mapYahooLineupPosition(position: string): string | null {
    const positionMap: { [key: string]: string } = {
      'QB': 'QB',
      'RB': 'RB1',
      'WR': 'WR1',
      'TE': 'TE',
      'K': 'K',
      'DEF': 'DEF',
      'W/R/T': 'FLEX',
      'BN': 'BENCH',
    };
    return positionMap[position] || null;
  }

  /**
   * Map our lineup position to Yahoo format
   */
  private mapYahooLineupPositionReverse(position: string): string {
    const positionMap: { [key: string]: string } = {
      'QB': 'QB',
      'RB1': 'RB',
      'RB2': 'RB',
      'WR1': 'WR',
      'WR2': 'WR',
      'TE': 'TE',
      'FLEX': 'W/R/T',
      'K': 'K',
      'DEF': 'DEF',
    };
    return positionMap[position] || position;
  }

  /**
   * Map Yahoo injury status to our format
   */
  private mapYahooInjuryStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      '': 'healthy',
      'Q': 'questionable',
      'D': 'doubtful',
      'O': 'out',
    };
    return statusMap[status] || 'healthy';
  }
}

// Export a singleton instance
export const yahooApi = new YahooApiService();
