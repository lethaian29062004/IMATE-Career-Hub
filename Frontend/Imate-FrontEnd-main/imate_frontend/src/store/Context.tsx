import { createContext, useState, type ReactNode } from "react";

interface AppContextType {
  user: string;
  badgeCountsForStaff: {
    reports: number;
    applications: number;
    payouts: number;
    questions: number;
  };
  fetchBadgeCounts: () => Promise<void>;
  fetchMentorData: (page: number, debouncedSearchTerm: string) => Promise<any>;

  confirmMentor: number;
  setConfirmMentor: React.Dispatch<React.SetStateAction<number>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const user = "guest";

  const [badgeCountsForStaff] = useState({
    reports: 0,
    applications: 0,
    payouts: 0,
    questions: 0,
  });
  const [confirmMentor, setConfirmMentor] = useState<number>(0);
  const fetchBadgeCounts = async () => {
    try {

    } catch (error) {
      console.error("Error fetching badge counts:", error);
    }
  };

  const fetchMentorData = async () => {
  };
  return <AppContext.Provider value={{ user, fetchBadgeCounts, badgeCountsForStaff, fetchMentorData, confirmMentor, setConfirmMentor }}>{children}</AppContext.Provider>;
}
