import { create } from 'zustand';
import { FantasyTeam, Lineup, LeagueRecord, PlatformConnection, User } from '../types';
import { unifiedApi } from '../services/unifiedApi';

interface AppState {
  // User data
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Teams
  teams: FantasyTeam[];
  setTeams: (teams: FantasyTeam[]) => void;
  addTeam: (team: FantasyTeam) => void;
  updateTeam: (teamId: string, updates: Partial<FantasyTeam>) => void;
  
  // Lineups
  lineups: Lineup[];
  setLineups: (lineups: Lineup[]) => void;
  updateLineup: (lineupId: string, updates: Partial<Lineup>) => void;
  
  // League records
  leagueRecords: LeagueRecord[];
  setLeagueRecords: (records: LeagueRecord[]) => void;
  
  // Platform connections
  connections: PlatformConnection[];
  setConnections: (connections: PlatformConnection[]) => void;
  updateConnection: (platform: string, updates: Partial<PlatformConnection>) => void;
  
  // UI state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  
  selectedTeam: string | null;
  setSelectedTeam: (teamId: string | null) => void;
  
  // Actions
  syncTeam: (teamId: string) => Promise<void>;
  updateLineupPlayer: (lineupId: string, position: string, player: any) => void;
  calculateWinLoss: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  teams: [],
  lineups: [],
  leagueRecords: [],
  connections: [],
  isLoading: false,
  error: null,
  selectedTeam: null,
  
  // User actions
  setUser: (user) => set({ user }),
  
  // Team actions
  setTeams: (teams) => set({ teams }),
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (teamId, updates) => set((state) => ({
    teams: state.teams.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    )
  })),
  
  // Lineup actions
  setLineups: (lineups) => set({ lineups }),
  updateLineup: (lineupId, updates) => set((state) => ({
    lineups: state.lineups.map(lineup => 
      lineup.id === lineupId ? { ...lineup, ...updates } : lineup
    )
  })),
  
  // League record actions
  setLeagueRecords: (leagueRecords) => set({ leagueRecords }),
  
  // Connection actions
  setConnections: (connections) => set({ connections }),
  updateConnection: (platform, updates) => set((state) => ({
    connections: state.connections.map(conn => 
      conn.platform === platform ? { ...conn, ...updates } : conn
    )
  })),
  
  // UI actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedTeam: (selectedTeam) => set({ selectedTeam }),
  
  // Complex actions
  syncTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const { teams } = get();
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        throw new Error('Team not found');
      }

      // Sync lineup data from the platform
      const lineup = await unifiedApi.getTeamLineup(team, 8); // Default to week 8
      
      // Update the team's last sync date
      set((state) => ({
        teams: state.teams.map(t => 
          t.id === teamId 
            ? { ...t, lastSyncDate: new Date() }
            : t
        )
      }));

      // Update lineup data in the store
      set((state) => ({
        lineups: [
          ...state.lineups.filter(l => l.id !== lineup.id),
          lineup
        ]
      }));

    } catch (error) {
      console.error('Failed to sync team:', error);
      set({ error: 'Failed to sync team' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateLineupPlayer: (lineupId, position, player) => {
    set((state) => ({
      lineups: state.lineups.map(lineup => {
        if (lineup.id === lineupId) {
          return {
            ...lineup,
            players: {
              ...lineup.players,
              [position]: player
            },
            lastUpdated: new Date()
          };
        }
        return lineup;
      })
    }));
  },
  
  calculateWinLoss: () => {
    const { teams } = get();
    const currentSeason = new Date().getFullYear();
    
    const totalWins = teams.reduce((sum, team) => sum + team.record.wins, 0);
    const totalLosses = teams.reduce((sum, team) => sum + team.record.losses, 0);
    const totalTies = teams.reduce((sum, team) => sum + team.record.ties, 0);
    
    const leagueRecord: LeagueRecord = {
      id: `record-${currentSeason}`,
      userId: get().user?.id || '',
      season: currentSeason,
      totalWins,
      totalLosses,
      totalTies,
      winPercentage: totalWins / (totalWins + totalLosses + totalTies) || 0,
      leagues: teams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        platform: team.platform,
        wins: team.record.wins,
        losses: team.record.losses,
        ties: team.record.ties
      }))
    };
    
    set((state) => ({
      leagueRecords: [
        ...state.leagueRecords.filter(record => record.season !== currentSeason),
        leagueRecord
      ]
    }));
  }
}));
