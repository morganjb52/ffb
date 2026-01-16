import axios from 'axios';
import { FantasyTeam, Lineup, Player, PlatformConnection, SyncResult } from '../types';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API service
export class ApiService {
  // Teams
  static async getTeams(): Promise<FantasyTeam[]> {
    const response = await api.get('/teams');
    return response.data;
  }

  static async addTeam(team: Omit<FantasyTeam, 'id'>): Promise<FantasyTeam> {
    const response = await api.post('/teams', team);
    return response.data;
  }

  static async updateTeam(teamId: string, updates: Partial<FantasyTeam>): Promise<FantasyTeam> {
    const response = await api.put(`/teams/${teamId}`, updates);
    return response.data;
  }

  static async deleteTeam(teamId: string): Promise<void> {
    await api.delete(`/teams/${teamId}`);
  }

  // Lineups
  static async getLineups(teamId?: string): Promise<Lineup[]> {
    const url = teamId ? `/lineups?teamId=${teamId}` : '/lineups';
    const response = await api.get(url);
    return response.data;
  }

  static async updateLineup(lineupId: string, updates: Partial<Lineup>): Promise<Lineup> {
    const response = await api.put(`/lineups/${lineupId}`, updates);
    return response.data;
  }

  // Platform connections
  static async getConnections(): Promise<PlatformConnection[]> {
    const response = await api.get('/connections');
    return response.data;
  }

  static async connectPlatform(platform: string, credentials: any): Promise<PlatformConnection> {
    const response = await api.post('/connections', { platform, credentials });
    return response.data;
  }

  static async disconnectPlatform(platform: string): Promise<void> {
    await api.delete(`/connections/${platform}`);
  }

  // Sync operations
  static async syncTeam(teamId: string): Promise<SyncResult> {
    const response = await api.post(`/sync/team/${teamId}`);
    return response.data;
  }

  static async syncAllTeams(): Promise<SyncResult[]> {
    const response = await api.post('/sync/all');
    return response.data;
  }
}

// Platform-specific services
export class ESPNService {
  private static readonly BASE_URL = 'https://fantasy.espn.com/apis/v3/games/ffl';

  static async authenticate(username: string, password: string): Promise<string> {
    // This would implement ESPN's authentication flow
    // For now, returning a mock token
    return 'mock-espn-token';
  }

  static async getTeams(leagueId: string, season: number): Promise<FantasyTeam[]> {
    // Mock implementation - in reality, this would call ESPN's API
    return [
      {
        id: 'espn-team-1',
        name: 'My ESPN Team',
        platform: 'ESPN',
        leagueId,
        leagueName: 'ESPN League',
        ownerId: 'user-1',
        record: { wins: 5, losses: 2, ties: 0 },
        season,
        isActive: true,
        lastSyncDate: new Date()
      }
    ];
  }

  static async getLineup(teamId: string, week: number): Promise<Lineup> {
    // Mock implementation
    return {
      id: `lineup-${teamId}-${week}`,
      teamId,
      week,
      season: new Date().getFullYear(),
      players: {
        QB: { id: 'qb-1', name: 'Josh Allen', position: 'QB', team: 'BUF' },
        RB1: { id: 'rb-1', name: 'Christian McCaffrey', position: 'RB', team: 'SF' },
        RB2: { id: 'rb-2', name: 'Derrick Henry', position: 'RB', team: 'TEN' },
        WR1: { id: 'wr-1', name: 'Cooper Kupp', position: 'WR', team: 'LAR' },
        WR2: { id: 'wr-2', name: 'Davante Adams', position: 'WR', team: 'LV' },
        TE: { id: 'te-1', name: 'Travis Kelce', position: 'TE', team: 'KC' },
        K: { id: 'k-1', name: 'Justin Tucker', position: 'K', team: 'BAL' },
        DEF: { id: 'def-1', name: 'Buffalo Bills', position: 'DEF', team: 'BUF' }
      },
      lastUpdated: new Date()
    };
  }

  static async updateLineup(lineupId: string, lineup: Partial<Lineup>): Promise<SyncResult> {
    // Mock implementation
    return {
      success: true,
      teamId: lineup.teamId || '',
      platform: 'ESPN',
      message: 'Lineup updated successfully',
      timestamp: new Date()
    };
  }
}

export class YahooService {
  private static readonly BASE_URL = 'https://fantasysports.yahooapis.com/fantasy/v2';

  static async authenticate(): Promise<string> {
    // Yahoo OAuth implementation
    return 'mock-yahoo-token';
  }

  static async getTeams(leagueId: string, season: number): Promise<FantasyTeam[]> {
    // Mock implementation
    return [
      {
        id: 'yahoo-team-1',
        name: 'My Yahoo Team',
        platform: 'Yahoo',
        leagueId,
        leagueName: 'Yahoo League',
        ownerId: 'user-1',
        record: { wins: 3, losses: 4, ties: 0 },
        season,
        isActive: true,
        lastSyncDate: new Date()
      }
    ];
  }

  static async getLineup(teamId: string, week: number): Promise<Lineup> {
    // Mock implementation
    return {
      id: `lineup-${teamId}-${week}`,
      teamId,
      week,
      season: new Date().getFullYear(),
      players: {
        QB: { id: 'qb-2', name: 'Patrick Mahomes', position: 'QB', team: 'KC' },
        RB1: { id: 'rb-3', name: 'Saquon Barkley', position: 'RB', team: 'NYG' },
        RB2: { id: 'rb-4', name: 'Nick Chubb', position: 'RB', team: 'CLE' },
        WR1: { id: 'wr-3', name: 'Tyreek Hill', position: 'WR', team: 'MIA' },
        WR2: { id: 'wr-4', name: 'Stefon Diggs', position: 'WR', team: 'BUF' },
        TE: { id: 'te-2', name: 'Mark Andrews', position: 'TE', team: 'BAL' },
        K: { id: 'k-2', name: 'Harrison Butker', position: 'K', team: 'KC' },
        DEF: { id: 'def-2', name: 'San Francisco 49ers', position: 'DEF', team: 'SF' }
      },
      lastUpdated: new Date()
    };
  }

  static async updateLineup(lineupId: string, lineup: Partial<Lineup>): Promise<SyncResult> {
    return {
      success: true,
      teamId: lineup.teamId || '',
      platform: 'Yahoo',
      message: 'Lineup updated successfully',
      timestamp: new Date()
    };
  }
}

export class SleeperService {
  private static readonly BASE_URL = 'https://api.sleeper.app/v1';

  static async authenticate(): Promise<string> {
    return 'mock-sleeper-token';
  }

  static async getTeams(leagueId: string, season: number): Promise<FantasyTeam[]> {
    // Mock implementation
    return [
      {
        id: 'sleeper-team-1',
        name: 'My Sleeper Team',
        platform: 'Sleeper',
        leagueId,
        leagueName: 'Sleeper League',
        ownerId: 'user-1',
        record: { wins: 4, losses: 3, ties: 0 },
        season,
        isActive: true,
        lastSyncDate: new Date()
      }
    ];
  }

  static async getLineup(teamId: string, week: number): Promise<Lineup> {
    // Mock implementation
    return {
      id: `lineup-${teamId}-${week}`,
      teamId,
      week,
      season: new Date().getFullYear(),
      players: {
        QB: { id: 'qb-3', name: 'Lamar Jackson', position: 'QB', team: 'BAL' },
        RB1: { id: 'rb-5', name: 'Austin Ekeler', position: 'RB', team: 'LAC' },
        RB2: { id: 'rb-6', name: 'Alvin Kamara', position: 'RB', team: 'NO' },
        WR1: { id: 'wr-5', name: 'Justin Jefferson', position: 'WR', team: 'MIN' },
        WR2: { id: 'wr-6', name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN' },
        TE: { id: 'te-3', name: 'George Kittle', position: 'TE', team: 'SF' },
        K: { id: 'k-3', name: 'Daniel Carlson', position: 'K', team: 'LV' },
        DEF: { id: 'def-3', name: 'Dallas Cowboys', position: 'DEF', team: 'DAL' }
      },
      lastUpdated: new Date()
    };
  }

  static async updateLineup(lineupId: string, lineup: Partial<Lineup>): Promise<SyncResult> {
    return {
      success: true,
      teamId: lineup.teamId || '',
      platform: 'Sleeper',
      message: 'Lineup updated successfully',
      timestamp: new Date()
    };
  }
}

export class CBSService {
  private static readonly BASE_URL = 'https://api.cbssports.com/fantasy';

  static async authenticate(): Promise<string> {
    return 'mock-cbs-token';
  }

  static async getTeams(leagueId: string, season: number): Promise<FantasyTeam[]> {
    // Mock implementation
    return [
      {
        id: 'cbs-team-1',
        name: 'My CBS Team',
        platform: 'CBS',
        leagueId,
        leagueName: 'CBS League',
        ownerId: 'user-1',
        record: { wins: 6, losses: 1, ties: 0 },
        season,
        isActive: true,
        lastSyncDate: new Date()
      }
    ];
  }

  static async getLineup(teamId: string, week: number): Promise<Lineup> {
    // Mock implementation
    return {
      id: `lineup-${teamId}-${week}`,
      teamId,
      week,
      season: new Date().getFullYear(),
      players: {
        QB: { id: 'qb-4', name: 'Jalen Hurts', position: 'QB', team: 'PHI' },
        RB1: { id: 'rb-7', name: 'Jonathan Taylor', position: 'RB', team: 'IND' },
        RB2: { id: 'rb-8', name: 'Joe Mixon', position: 'RB', team: 'CIN' },
        WR1: { id: 'wr-7', name: 'A.J. Brown', position: 'WR', team: 'PHI' },
        WR2: { id: 'wr-8', name: 'CeeDee Lamb', position: 'WR', team: 'DAL' },
        TE: { id: 'te-4', name: 'Darren Waller', position: 'TE', team: 'NYG' },
        K: { id: 'k-4', name: 'Evan McPherson', position: 'K', team: 'CIN' },
        DEF: { id: 'def-4', name: 'Philadelphia Eagles', position: 'DEF', team: 'PHI' }
      },
      lastUpdated: new Date()
    };
  }

  static async updateLineup(lineupId: string, lineup: Partial<Lineup>): Promise<SyncResult> {
    return {
      success: true,
      teamId: lineup.teamId || '',
      platform: 'CBS',
      message: 'Lineup updated successfully',
      timestamp: new Date()
    };
  }
}

// Platform factory
export class PlatformServiceFactory {
  static getService(platform: 'ESPN' | 'Yahoo' | 'Sleeper' | 'CBS') {
    switch (platform) {
      case 'ESPN':
        return ESPNService;
      case 'Yahoo':
        return YahooService;
      case 'Sleeper':
        return SleeperService;
      case 'CBS':
        return CBSService;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

