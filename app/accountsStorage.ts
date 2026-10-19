// Account types and storage helpers for per-account persistent data
import { Task, CourseGrade, initialTasks, initialCourses } from "./schoolData";

export interface UserAccountData {
  tasks: Task[];
  courses: CourseGrade[];
  focusMinutes: number;
  notes: string;
}

export interface SavedAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Base64 / hashed representation for local credential verification
  avatar: string;
  role: string;
  createdAt: string;
  provider: "email" | "google";
  lastLogin?: string;
}

const STORAGE_KEY = "scholarsync_registered_accounts";

// Pre-seeded demo account so testing is immediate
const SEED_ACCOUNTS: SavedAccount[] = [
  {
    id: "account-demo-alex",
    name: "Alex Chen",
    email: "alex.chen@student.edu",
    passwordHash: btoa("scholar2026"),
    avatar: "/scholar_avatar.jpg",
    role: "AP Honor Student • Grade 11",
    createdAt: new Date().toISOString(),
    provider: "email",
  },
  {
    id: "account-demo-maria",
    name: "Maria Santos",
    email: "maria.santos@student.edu",
    passwordHash: btoa("student123"),
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "STEM Scholar • Grade 12",
    createdAt: new Date().toISOString(),
    provider: "email",
  },
];

export function getStoredAccounts(): SavedAccount[] {
  if (typeof window === "undefined") return SEED_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
    return SEED_ACCOUNTS;
  } catch (err) {
    console.error("Error reading stored accounts:", err);
    return SEED_ACCOUNTS;
  }
}

export function saveStoredAccount(newAccount: SavedAccount): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredAccounts();
    const filtered = existing.filter((acc) => acc.email.toLowerCase() !== newAccount.email.toLowerCase());
    const updated = [newAccount, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving account:", err);
  }
}

export function findAccountByEmail(email: string): SavedAccount | undefined {
  const accounts = getStoredAccounts();
  return accounts.find((acc) => acc.email.toLowerCase() === email.trim().toLowerCase());
}

export function encodePassword(pass: string): string {
  try {
    return btoa(pass);
  } catch {
    return pass;
  }
}

// ── Per-Account Data Persistence ──────────────────────────────────────────

const getAccountDataKey = (email: string) => `scholarsync_data_${email.trim().toLowerCase()}`;

/**
 * Returns clean fresh workspace data for a brand new registered user.
 */
export function getFreshAccountData(): UserAccountData {
  return {
    tasks: [],
    courses: [],
    focusMinutes: 0,
    notes: "# Student Notebook\n\nWelcome to your new ScholarSync workspace! Start adding your coursework and homework assignments.",
  };
}

/**
 * Retrieves the data specific to an account email.
 * If this is the demo user "alex.chen@student.edu" and nothing was saved yet,
 * seeds with default demo data so they have sample tasks/courses.
 * For new registrants, returns their saved state or fresh empty state.
 */
export function loadAccountData(email: string): UserAccountData {
  if (typeof window === "undefined") return getFreshAccountData();
  const key = getAccountDataKey(email);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        courses: Array.isArray(parsed.courses) ? parsed.courses : [],
        focusMinutes: typeof parsed.focusMinutes === "number" ? parsed.focusMinutes : 0,
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      };
    }

    // Default seed for demo Alex Chen
    if (email.toLowerCase().includes("alex.chen")) {
      const alexData: UserAccountData = {
        tasks: initialTasks,
        courses: initialCourses,
        focusMinutes: 75,
        notes: "",
      };
      localStorage.setItem(key, JSON.stringify(alexData));
      return alexData;
    }

    // Fresh blank slate for any other new user
    const fresh = getFreshAccountData();
    localStorage.setItem(key, JSON.stringify(fresh));
    return fresh;
  } catch (err) {
    console.error("Failed to load user account data:", err);
    return getFreshAccountData();
  }
}

/**
 * Saves tasks, courses, focus time, and notes for a specific account email.
 */
export function saveAccountData(email: string, data: Partial<UserAccountData>): void {
  if (typeof window === "undefined" || !email) return;
  const key = getAccountDataKey(email);
  try {
    const current = loadAccountData(email);
    const updated: UserAccountData = {
      ...current,
      ...data,
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save user account data:", err);
  }
}
