/**
 * User Role Constants
 */
export const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
  MENTOR: "Mentor",
  CANDIDATE: "Candidate",
  RECRUITER: "Recruiter",
} as const;

/**
 * Type helper for roles
 */
export type UserRole = typeof ROLES;
