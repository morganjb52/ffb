import { FantasyTeam, Lineup } from '../types';
import { espnApi, ESPNApiService } from './espnApi';
import { yahooApi, YahooApiService } from './yahooApi';
import { sleeperApi, SleeperApiService } from './sleeperApi';

export interface ApiCredentials {
  [key: string]: any;
}

export interface ConnectionResult {
  success: boolean;
  platform: string;
  teams: FantasyTeam[];
  error?: string;
}

export class UnifiedApiService {
  private espn: ESPNApiService;
  private yahoo: YahooApiService;
  private sleeper: SleeperApiService;

  constructor() {
    this.espn = espnApi;
    this.yahoo = yahooApi;
    this.sleeper = sleeperApi;
  }

  /**
   * Connect to a fantasy platform and discover teams
   */
  async connectPlatform(platform: string, credentials: ApiCredentials): Promise<ConnectionResult> {
    try {
      switch (platform.toLowerCase()) {
        case 'espn':
          return await this.connectESPN(credentials);
        case 'yahoo':
          return await this.connectYahoo(credentials);
        case 'sleeper':
          return await this.connectSleeper(credentials);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      return {
        success: false,
        platform,
        teams: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Connect to ESPN
   */
  private async connectESPN(credentials: ApiCredentials): Promise<ConnectionResult> {
    const { leagueId, teamId, season } = credentials;
    
    if (!leagueId || !teamId) {
      throw new Error('ESPN requires league ID and team ID');
    }

    try {
      const league = await this.espn.getLeague(leagueId, season);
      const team = league.teams.find(t => t.id === teamId);
      
      if (!team) {
        throw new Error(`Team ${teamId} not found in league ${leagueId}`);
      }

      const fantasyTeam: FantasyTeam = {
        id: `espn-${teamId}`,
        name: team.name,
        platform: 'ESPN',
        leagueId: leagueId,
        leagueName: league.name,
        ownerId: 'user-1', // Would be actual user ID
        record: team.record,
        season: league.season,
        isActive: true,
        lastSyncDate: new Date(),
      };

      return {
        success: true,
        platform: 'ESPN',
        teams: [fantasyTeam],
      };
    } catch (error) {
      throw new Error(`ESPN connection failed: ${error}`);
    }
  }

  /**
   * Connect to Yahoo
   */
  private async connectYahoo(credentials: ApiCredentials): Promise<ConnectionResult> {
    const { accessToken, leagueId, teamId } = credentials;
    
    if (!accessToken) {
      throw new Error('Yahoo requires access token');
    }

    try {
      this.yahoo.setAccessToken(accessToken);
      const leagues = await this.yahoo.getUserLeagues();
      const league = leagues.find(l => l.league_id === leagueId);
      
      if (!league) {
        throw new Error(`League ${leagueId} not found`);
      }

      const team = league.teams.find(t => t.team_id === teamId);
      if (!team) {
        throw new Error(`Team ${teamId} not found in league ${leagueId}`);
      }

      const fantasyTeam: FantasyTeam = {
        id: `yahoo-${teamId}`,
        name: team.name,
        platform: 'Yahoo',
        leagueId: leagueId,
        leagueName: league.name,
        ownerId: 'user-1',
        record: team.record,
        season: league.season,
        isActive: true,
        lastSyncDate: new Date(),
      };

      return {
        success: true,
        platform: 'Yahoo',
        teams: [fantasyTeam],
      };
    } catch (error) {
      throw new Error(`Yahoo connection failed: ${error}`);
    }
  }

  /**
   * Connect to Sleeper
   */
  private async connectSleeper(credentials: ApiCredentials): Promise<ConnectionResult> {
    const { leagueId, teamId } = credentials;
    
    if (!leagueId || !teamId) {
      throw new Error('Sleeper requires league ID and team ID');
    }

    try {
      const league = await this.sleeper.getLeague(leagueId);
      const team = league.teams.find(t => t.team_id === teamId);
      
      if (!team) {
        throw new Error(`Team ${teamId} not found in league ${leagueId}`);
      }

      const fantasyTeam: FantasyTeam = {
        id: `sleeper-${teamId}`,
        name: team.name,
        platform: 'Sleeper',
        leagueId: leagueId,
        leagueName: league.name,
        ownerId: 'user-1',
        record: team.record,
        season: parseInt(league.season),
        isActive: true,
        lastSyncDate: new Date(),
      };

      return {
        success: true,
        platform: 'Sleeper',
        teams: [fantasyTeam],
      };
    } catch (error) {
      throw new Error(`Sleeper connection failed: ${error}`);
    }
  }

  /**
   * Get lineup for a team
   */
  async getTeamLineup(team: FantasyTeam, week: number): Promise<Lineup> {
    switch (team.platform) {
      case 'ESPN':
        return await this.espn.getTeamLineup(team.leagueId, team.id.replace('espn-', ''), week, team.season);
      case 'Yahoo':
        return await this.yahoo.getTeamLineup(team.leagueId, team.id.replace('yahoo-', ''), week, team.season);
      case 'Sleeper':
        return await this.sleeper.getTeamLineup(team.leagueId, team.id.replace('sleeper-', ''), week);
      default:
        throw new Error(`Unsupported platform: ${team.platform}`);
    }
  }

  /**
   * Update lineup for a team
   */
  async updateTeamLineup(team: FantasyTeam, week: number, lineup: Partial<Lineup>): Promise<boolean> {
    switch (team.platform) {
      case 'ESPN':
        return await this.espn.updateLineup(team.leagueId, team.id.replace('espn-', ''), week, lineup);
      case 'Yahoo':
        return await this.yahoo.updateLineup(team.leagueId, team.id.replace('yahoo-', ''), week, lineup);
      case 'Sleeper':
        return await this.sleeper.updateLineup(team.leagueId, team.id.replace('sleeper-', ''), week, lineup);
      default:
        throw new Error(`Unsupported platform: ${team.platform}`);
    }
  }

  /**
   * Get OAuth URL for Yahoo
   */
  getYahooAuthUrl(clientId: string, redirectUri: string): string {
    return this.yahoo.getAuthUrl(clientId, redirectUri);
  }

  /**
   * Exchange Yahoo authorization code for token
   */
  async exchangeYahooCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<string> {
    return await this.yahoo.exchangeCodeForToken(code, clientId, clientSecret, redirectUri);
  }
}

// Export a singleton instance
export const unifiedApi = new UnifiedApiService();
