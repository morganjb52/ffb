export interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'FLEX';
  team: string;
  injuryStatus?: 'healthy' | 'questionable' | 'doubtful' | 'out';
  injuryDetails?: string;
  projectedPoints?: number;
  actualPoints?: number;
  isAvailable?: boolean;
}

export interface Lineup {
  id: string;
  teamId: string;
  week: number;
  season: number;
  players: {
    QB?: Player;
    RB1?: Player;
    RB2?: Player;
    WR1?: Player;
    WR2?: Player;
    TE?: Player;
    FLEX?: Player;
    K?: Player;
    DEF?: Player;
    BENCH?: Player[];
  };
  totalProjectedPoints?: number;
  totalActualPoints?: number;
  lastUpdated: Date;
}

export interface FantasyTeam {
  id: string;
  name: string;
  platform: 'ESPN' | 'Yahoo' | 'Sleeper' | 'CBS';
  leagueId: string;
  leagueName: string;
  ownerId: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  currentLineup?: Lineup;
  season: number;
  isActive: boolean;
  lastSyncDate?: Date;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  week: number;
  season: number;
  status: 'scheduled' | 'in_progress' | 'final';
  homeScore?: number;
  awayScore?: number;
}

export interface LeagueRecord {
  id: string;
  userId: string;
  season: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  winPercentage: number;
  leagues: {
    teamId: string;
    teamName: string;
    platform: string;
    wins: number;
    losses: number;
    ties: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  teams: FantasyTeam[];
  leagueRecords: LeagueRecord[];
  preferences: {
    notifications: boolean;
    defaultView: 'dashboard' | 'lineups' | 'stats';
  };
}

export interface PlatformConnection {
  id: string;
  platform: 'ESPN' | 'Yahoo' | 'Sleeper' | 'CBS';
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  lastSyncDate?: Date;
}

export interface SyncResult {
  success: boolean;
  teamId: string;
  platform: string;
  message: string;
  timestamp: Date;
}
