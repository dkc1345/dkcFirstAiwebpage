"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import {
  X,
  Check,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-20 blur-[120px]"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full opacity-15 blur-[100px]"
          style={{ backgroundColor: "var(--cyan)" }}
        />
      </div>

      {/* ═══ Main sliding-panel card ═══ */}
      <div
        className="relative z-10 w-full max-w-[820px] my-auto"
        style={{
          height: "580px",
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px var(--border)",
          background: "var(--bg-card)",
        }}
      >

        {/* ── SIGN IN FORM (permanently left half) ── */}
        <div
          className="absolute inset-y-0 left-0 flex flex-col justify-center px-10 py-8 overflow-y-auto"
          style={{
            width: "50%",
            opacity: authMode === "signin" ? 1 : 0,
            transform: authMode === "signin" ? "translateX(0)" : "translateX(-28px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            transitionDelay: authMode === "signin" ? "0.38s" : "0s",
            pointerEvents: authMode === "signin" ? "auto" : "none",
          }}
        >
          <h2 className="text-[26px] font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
            Sign In
          </h2>
          <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
            or use your email account
          </p>

          {/* Social buttons */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer hover:opacity-80 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
              title="Continue with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer hover:opacity-80 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
              title="Continue with Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
            <span className="text-[11px] font-medium" style={{ color: "var(--text-subtle)" }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
          </div>

          {/* Alerts */}
          {errorMsg && authMode === "signin" && (
            <div className="mb-3 p-2.5 rounded-xl flex items-center gap-2 text-[12px] font-medium"
              style={{ background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185" }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && authMode === "signin" && (
            <div className="mb-3 p-2.5 rounded-xl flex items-center gap-2 text-[12px] font-medium"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Saved accounts */}
          {registeredAccounts.length > 0 && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowAccountList(!showAccountList)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  <span style={{ color: "var(--text)" }}>
                    {showAccountList ? "Choose to autofill:" : `Saved (${registeredAccounts.length})`}
                  </span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showAccountList ? "rotate-180" : ""}`}
                  style={{ color: "var(--accent)" }}
                />
              </button>
              {showAccountList && (
                <div className="mt-1.5 p-1 rounded-xl max-h-28 overflow-y-auto"
                  style={{ backgroundColor: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
                  {registeredAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectSavedAccount(acc)}
                      className="w-full text-left p-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={acc.avatar} alt={acc.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate" style={{ color: "var(--text)" }}>{acc.name}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{acc.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-2.5">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl text-[13px] focus:outline-none transition-all placeholder:opacity-50"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 14px" }}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl text-[13px] focus:outline-none transition-all placeholder:opacity-50"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 40px 10px 14px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-subtle)" }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right -mt-1">
              <span className="text-[11px] cursor-pointer hover:underline" style={{ color: "var(--accent)" }}>
                Forgot your password?
              </span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-[13px] tracking-wide uppercase transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
            >
              {isLoading ? "Please wait…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* ── SIGN UP FORM (permanently right half) ── */}
        <div
          className="absolute inset-y-0 right-0 flex flex-col justify-center px-10 py-8 overflow-y-auto"
          style={{
            width: "50%",
            opacity: authMode === "signup" ? 1 : 0,
            transform: authMode === "signup" ? "translateX(0)" : "translateX(28px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            transitionDelay: authMode === "signup" ? "0.38s" : "0s",
            pointerEvents: authMode === "signup" ? "auto" : "none",
          }}
        >
          <h2 className="text-[26px] font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
            Create Account
          </h2>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
            or use your email for registration
          </p>

          {/* Alerts */}
          {errorMsg && authMode === "signup" && (
            <div className="mb-3 p-2.5 rounded-xl flex items-center gap-2 text-[12px] font-medium"
              style={{ background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185" }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && authMode === "signup" && (
            <div className="mb-3 p-2.5 rounded-xl flex items-center gap-2 text-[12px] font-medium"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-2.5">
            <input
              type="text"
              required
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl text-[13px] focus:outline-none transition-all placeholder:opacity-50"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 14px" }}
            />
            <div className="relative">
              <select
                value={schoolGrade}
                onChange={(e) => setSchoolGrade(e.target.value)}
                className="w-full rounded-xl text-[13px] focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 36px 10px 14px" }}
              >
                <option value="Grade 9 (Freshman)">Grade 9 (Freshman)</option>
                <option value="Grade 10 (Sophomore)">Grade 10 (Sophomore)</option>
                <option value="Grade 11 (Junior)">Grade 11 (Junior)</option>
                <option value="Grade 12 (Senior)">Grade 12 (Senior)</option>
                <option value="Undergraduate College">Undergraduate College</option>
                <option value="Graduate / Honors Scholar">Graduate / Honors Scholar</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-subtle)" }} />
            </div>

            {/* Avatar picker */}
            <div className="flex items-center gap-2">
              {AVATAR_OPTIONS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`rounded-full p-0.5 border-2 transition-all cursor-pointer ${selectedAvatar === av.url ? "scale-110" : "opacity-50 hover:opacity-90"}`}
                  style={{ borderColor: selectedAvatar === av.url ? "var(--accent)" : "transparent" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={av.url} alt={av.label} className="w-7 h-7 rounded-full object-cover" />
                </button>
              ))}
            </div>

            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl text-[13px] focus:outline-none transition-all placeholder:opacity-50"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 14px" }}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl text-[13px] focus:outline-none transition-all placeholder:opacity-50"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 40px 10px 14px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-subtle)" }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl text-[13px] focus:outline-none transition-all placeholder:opacity-50"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 14px" }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-[13px] tracking-wide uppercase transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
            >
              {isLoading ? "Please wait…" : "Sign Up"}
            </button>
          </form>
        </div>

        {/* ══════════════════════════════════════════
            SLIDING GRADIENT OVERLAY PANEL
            signin → panel sits on RIGHT (left: 50%)
            signup → panel slides to LEFT (left: 0%)
        ══════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "50%",
            left: authMode === "signin" ? "50%" : "0%",
            transition: "left 0.72s cubic-bezier(0.77, 0, 0.175, 1)",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: "rgba(255,255,255,0.85)" }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Decorative ring shapes */}
          <div style={{
            position: "absolute", width: "280px", height: "280px", borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.12)", top: "-90px", right: "-90px", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: "200px", height: "200px", borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.08)", bottom: "-70px", left: "-70px", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: "120px", height: "120px", borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.08)", bottom: "20%", right: "-30px", pointerEvents: "none",
          }} />

          {/* Panel content — fades between states */}
          {authMode === "signin" ? (
            <div key="panel-signin" style={{ animation: "fadeIn 0.5s ease 0.45s both" }}>
              <div className="text-5xl mb-5" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}>📖</div>
              <h3 className="text-[24px] font-bold text-white mb-3">Hello, Friend!</h3>
              <p className="text-white/75 text-[13px] leading-relaxed mb-8 max-w-[220px] mx-auto">
                Enter your personal details and start your journey with ScholarSync
              </p>
              <button
                type="button"
                onClick={() => { setAuthMode("signup"); setErrorMsg(""); setSuccessMsg(""); sound.playClick(); }}
                className="px-9 py-2.5 rounded-full font-bold text-[12px] uppercase tracking-widest transition-all duration-200 cursor-pointer active:scale-95"
                style={{ border: "2px solid rgba(255,255,255,0.9)", color: "white", backgroundColor: "transparent" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "white"; }}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div key="panel-signup" style={{ animation: "fadeIn 0.5s ease 0.45s both" }}>
              <div className="text-5xl mb-5" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}>🎓</div>
              <h3 className="text-[24px] font-bold text-white mb-3">Welcome Back!</h3>
              <p className="text-white/75 text-[13px] leading-relaxed mb-8 max-w-[220px] mx-auto">
                To stay connected please login with your personal info
              </p>
              <button
                type="button"
                onClick={() => { setAuthMode("signin"); setErrorMsg(""); setSuccessMsg(""); sound.playClick(); }}
                className="px-9 py-2.5 rounded-full font-bold text-[12px] uppercase tracking-widest transition-all duration-200 cursor-pointer active:scale-95"
                style={{ border: "2px solid rgba(255,255,255,0.9)", color: "white", backgroundColor: "transparent" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "white"; }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}