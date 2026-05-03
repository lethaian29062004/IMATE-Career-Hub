/**
 * Question related constants
 */

// Difficulty levels (number values for API)
export const LEVEL = {
  INTERN: 0,
  FRESHER: 1,
  JUNIOR: 2,
  MIDDLE: 3,
  SENIOR: 4,
  LEAD: 5,
  MANAGER: 6,
} as const;

// Difficulty mapping: number to display text
export const LEVEL_MAP = {
  0: 'Intern',
  1: 'Fresher',
  2: 'Junior',
  3: 'Middle',
  4: 'Senior',
  5: "Lead",
  6: "Manager",
} as const;
export type Level = typeof LEVEL[keyof typeof LEVEL];

export const DIFFICULTY_LEVEL = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
} as const;

// Difficulty mapping: number to display text
export const DIFFICULTY_MAP = {
  0: 'Easy',
  1: 'Medium',
  2: 'Hard',
} as const;


// Difficulty levels (legacy string values)
export const COMMON_CODE = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  NEWEST: 'newest',
} as const;

// Difficulty colors
export const COMMON_COLOR = {
  EASY_QUESTION: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  MEDIUM_QUESTION: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  HARD_QUESTION: "bg-red-500/10 text-red-500 border-red-500/20",
  DEFAULT_QUESTION: "bg-slate-500/10 text-slate-500 border-slate-500/20",
} as const;

// Date format constants
export const COMMON_DATE = {
  JUST_NOW: 'Vừa xong',
  HOURS_AGO: 'giờ trước',
  ONE_DAY_AGO: '1 ngày trước',
  DAYS_AGO: 'ngày trước',
} as const;

export const LAYOUT = {
  MANAGEMENT: "management",
  MAIN: "main",
  NONE: "none",
} as const;

/**
 * Account Status Constants (numeric values matching backend enum)
 */
export const ACCOUNT_STATUS = {
  ACTIVE: 0,
  SUSPENDED: 1,
  PENDING_VERIFICATION: 2,
} as const;

/**
 * Account Status String Constants (string values for API endpoints)
 */
export const ACCOUNT_STATUS_STRING = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
} as const;

/**
 * Role display labels (Vietnamese)
 */
export const ROLE_LABELS: Record<string, string> = {
  Candidate: "ỨNG VIÊN",
  Mentor: "MENTOR",
  Staff: "NHÂN VIÊN",
} as const;

/**
 * Role badge color configs
 */
export const ROLE_BADGE_COLORS: Record<string, string> = {
  Candidate: "bg-[#1e1b4b] text-indigo-400",
  Mentor: "bg-[#2e1065] text-purple-400",
  Staff: "bg-[#2e1c0c] text-amber-400",
} as const;

/**
 * Default badge color for unknown roles
 */
export const DEFAULT_BADGE_COLOR = "bg-[#2e1c0c] text-amber-400";

/**
 * CV Upload constraints
 */
export const CV_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ACCEPTED_EXTENSIONS: ".pdf,.doc,.docx",
  ACCEPTED_DISPLAY: "PDF, DOC, DOCX",
} as const;

