"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import {
  Sparkles,
  X,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Users,
  ChevronDown,
} from "lucide-react";
import {
  SavedAccount,
  getStoredAccounts,
  saveStoredAccount,
  findAccountByEmail,
  encodePassword,
} from "../accountsStorage";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  provider: "google" | "email" | "guest";
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  { label: "Default Owl", url: "/scholar_avatar.jpg" },
  { label: "Student 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { label: "Student 2", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" },
  { label: "Student 3", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { label: "Student 4", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolGrade, setSchoolGrade] = useState("Grade 11 (Junior)");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [registeredAccounts, setRegisteredAccounts] = useState<SavedAccount[]>([]);
  const [showAccountList, setShowAccountList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const accounts = getStoredAccounts();
      setRegisteredAccounts(accounts);
      setErrorMsg("");
      setSuccessMsg("");
      setShowAccountList(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (authMode === "signup") {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (cleanPassword.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      const existing = findAccountByEmail(cleanEmail);
      if (existing) {
        setErrorMsg("An account with this email already exists. Sign in instead!");
        return;
      }

      setIsLoading(true);
      sound.playClick();

      setTimeout(() => {
        const newAccount: SavedAccount = {
          id: `account-${Date.now()}`,
          name: fullName.trim(),
          email: cleanEmail,
          passwordHash: encodePassword(cleanPassword),
          avatar: selectedAvatar,
          role: schoolGrade,
          createdAt: new Date().toISOString(),
          provider: "email",
          lastLogin: new Date().toISOString(),
        };

        saveStoredAccount(newAccount);
        setRegisteredAccounts(getStoredAccounts());

        setIsLoading(false);
        sound.playSuccess();
        setSuccessMsg(`Welcome, ${newAccount.name}! Account registered.`);

        setTimeout(() => {
          const userProfile: UserProfile = {
            name: newAccount.name,
            email: newAccount.email,
            avatar: newAccount.avatar,
            role: newAccount.role,
            provider: "email",
          };
          onLoginSuccess(userProfile);
        }, 500);
      }, 650);
    } else {
      setIsLoading(true);
      sound.playClick();

      setTimeout(() => {
        const found = findAccountByEmail(cleanEmail);

        if (!found) {
          setIsLoading(false);
          setErrorMsg("Account not found. Create an account or check your email.");
          return;
        }

        const encodedInputPass = encodePassword(cleanPassword);
        if (found.passwordHash !== encodedInputPass) {
          setIsLoading(false);
          setErrorMsg("Incorrect password. Please try again.");
          return;
        }

        found.lastLogin = new Date().toISOString();
        saveStoredAccount(found);

        setIsLoading(false);
        sound.playSuccess();

        const userProfile: UserProfile = {
          name: found.name,
          email: found.email,
          avatar: found.avatar || "/scholar_avatar.jpg",
          role: found.role || "Scholar",
          provider: found.provider || "email",
        };
        onLoginSuccess(userProfile);
      }, 550);
    }
  };

  const handleSelectSavedAccount = (acc: SavedAccount) => {
    sound.playClick();
    setEmail(acc.email);
    try {
      setPassword(atob(acc.passwordHash));
    } catch {
      setPassword("");
    }
    setAuthMode("signin");
    setErrorMsg("");
    setShowAccountList(false);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMsg("");
    sound.playClick();

    setTimeout(() => {
      setIsLoading(false);
      sound.playSuccess();

      const googleUserEmail = "alex.chen@student.edu";
      let existing = findAccountByEmail(googleUserEmail);
      if (!existing) {
        existing = {
          id: `account-google-${Date.now()}`,
          name: "Alex Chen",
          email: googleUserEmail,
          passwordHash: encodePassword("google-oauth-token"),
          avatar: "/scholar_avatar.jpg",
          role: "AP Honor Student • Grade 11",
          createdAt: new Date().toISOString(),
          provider: "google",
          lastLogin: new Date().toISOString(),
        };
        saveStoredAccount(existing);
      }

      const googleUserProfile: UserProfile = {
        name: existing.name,
        email: existing.email,
        avatar: existing.avatar,
        role: existing.role,
        provider: "google",
      };
      onLoginSuccess(googleUserProfile);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Clean modern modal container */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
        className="relative w-full max-w-[420px] rounded-2xl border shadow-2xl p-6 sm:p-7 my-auto transition-all"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          style={{ color: "var(--text-muted)" }}
          className="absolute top-4 right-4 p-2 rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-5">
          <div
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.12)",
              borderColor: "rgba(99, 102, 241, 0.25)",
              color: "var(--accent)",
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold mb-2.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ScholarSync Portal</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {authMode === "signin" ? "Sign in to ScholarSync" : "Create your account"}
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {authMode === "signin"
              ? "Welcome back! Enter your student credentials"
              : "Set up your student profile in seconds"}
          </p>
        </div>

        {/* Tab Switcher (Segmented Control) */}
        <div
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border)",
          }}
          className="grid grid-cols-2 p-1 rounded-xl border mb-4"
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setErrorMsg("");
              setSuccessMsg("");
              sound.playClick();
            }}
            style={{
              backgroundColor: authMode === "signin" ? "var(--accent)" : "transparent",
              color: authMode === "signin" ? "#ffffff" : "var(--text-muted)",
            }}
            className="py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setErrorMsg("");
              setSuccessMsg("");
              sound.playClick();
            }}
            style={{
              backgroundColor: authMode === "signup" ? "var(--accent)" : "transparent",
              color: authMode === "signup" ? "#ffffff" : "var(--text-muted)",
            }}
            className="py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
          >
            Create Account
          </button>
        </div>

        {/* Quick Saved Account Selector */}
        {registeredAccounts.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowAccountList(!showAccountList)}
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer hover:opacity-90"
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span style={{ color: "var(--text)" }}>
                  {showAccountList ? "Choose account to autofill:" : `Saved accounts (${registeredAccounts.length})`}
                </span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
                {showAccountList ? "Close" : "Select"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAccountList ? "rotate-180" : ""}`} />
              </span>
            </button>

            {showAccountList && (
              <div
                style={{
                  backgroundColor: "var(--bg-card-hover)",
                  borderColor: "var(--border)",
                }}
                className="mt-2 p-1.5 rounded-xl border shadow-lg space-y-1 max-h-40 overflow-y-auto"
              >
                {registeredAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectSavedAccount(acc)}
                    style={{ borderColor: "var(--border)" }}
                    className="w-full text-left p-2 rounded-lg border hover:opacity-90 flex items-center gap-2.5 transition-colors cursor-pointer group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-7 h-7 rounded-full object-cover border shrink-0"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>
                        {acc.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                        {acc.email}
                      </p>
                    </div>
                    <span
                      style={{
                        backgroundColor: "rgba(99, 102, 241, 0.15)",
                        color: "var(--accent)",
                      }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    >
                      Fill
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border font-semibold text-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer mb-4 hover:opacity-90 shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Clean Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div style={{ borderColor: "var(--border)" }} className="border-t w-full" />
          <span
            style={{
              backgroundColor: "var(--bg-card)",
              color: "var(--text-subtle)",
            }}
            className="px-3 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap"
          >
            or with email
          </span>
          <div style={{ borderColor: "var(--border)" }} className="border-t w-full" />
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-fadeIn font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn font-medium">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Authentication Form — Clear hints & placeholders, zero icon overlap */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {authMode === "signup" && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    backgroundColor: "var(--bg-input)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                    padding: "10px 14px",
                  }}
                  className="w-full rounded-xl border text-xs sm:text-sm focus:outline-none transition-all placeholder:text-zinc-500"
                />
              </div>

              {/* Academic Grade */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>
                  Academic Grade
                </label>
                <div className="relative">
                  <select
                    value={schoolGrade}
                    onChange={(e) => setSchoolGrade(e.target.value)}
                    style={{
                      backgroundColor: "var(--bg-input)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      padding: "10px 36px 10px 14px",
                    }}
                    className="w-full rounded-xl border text-xs sm:text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Grade 9 (Freshman)">Grade 9 (Freshman)</option>
                    <option value="Grade 10 (Sophomore)">Grade 10 (Sophomore)</option>
                    <option value="Grade 11 (Junior)">Grade 11 (Junior)</option>
                    <option value="Grade 12 (Senior)">Grade 12 (Senior)</option>
                    <option value="Undergraduate College">Undergraduate College</option>
                    <option value="Graduate / Honors Scholar">Graduate / Honors Scholar</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-subtle)" }} />
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>
                  Select Avatar
                </label>
                <div className="flex items-center gap-2.5 py-1">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      style={{
                        borderColor: selectedAvatar === av.url ? "var(--accent)" : "transparent",
                      }}
                      className={`relative rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                        selectedAvatar === av.url ? "scale-110 shadow-sm" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={av.url}
                        alt={av.label}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Student Email */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>
              Student Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. student@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border)",
                color: "var(--text)",
                padding: "10px 14px",
              }}
              className="w-full rounded-xl border text-xs sm:text-sm focus:outline-none transition-all placeholder:text-zinc-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold" style={{ color: "var(--text)" }}>
                Password <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px]" style={{ color: "var(--text-subtle)" }}>
                Min 6 characters
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password (at least 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  padding: "10px 42px 10px 14px",
                }}
                className="w-full rounded-xl border text-xs sm:text-sm focus:outline-none transition-all placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: "var(--text-subtle)" }}
                className="absolute right-3.5 p-1 rounded-lg hover:opacity-80 cursor-pointer transition-opacity"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {authMode === "signup" && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  padding: "10px 14px",
                }}
                className="w-full rounded-xl border text-xs sm:text-sm focus:outline-none transition-all placeholder:text-zinc-500"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: "var(--accent)",
              color: "#ffffff",
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span>Please wait...</span>
            ) : (
              <>
                <span>{authMode === "signin" ? "Sign In to ScholarSync" : "Complete Registration"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Switcher */}
        <div
          style={{ borderColor: "var(--border)" }}
          className="mt-5 pt-4 border-t text-center text-xs"
        >
          {authMode === "signin" ? (
            <p style={{ color: "var(--text-muted)" }}>
              Don&apos;t have a student account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                  sound.playClick();
                }}
                style={{ color: "var(--accent)" }}
                className="font-bold hover:underline cursor-pointer ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>
              Already registered your account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                  sound.playClick();
                }}
                style={{ color: "var(--accent)" }}
                className="font-bold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
