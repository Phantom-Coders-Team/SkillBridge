"use client";

import { useActionState, useState } from "react";
import { ShieldCheck, KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import { verify2faAction, cancel2faAction } from "./actions";

interface Props {
  email: string;
}

export function Verify2faForm({ email }: Props) {
  const [state, formAction, isPending] = useActionState(verify2faAction, null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header icon */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Two-Factor Authentication</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign-in code required for <span className="text-indigo-300 font-medium">{email}</span>
          </p>
        </div>
      </div>

      {state?.error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm text-center font-medium animate-in fade-in">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {useBackupCode ? "Emergency Backup Code" : "Authenticator App 6-Digit Code"}
          </label>
          <div className="relative">
            <input
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={useBackupCode ? "e.g. 8F2A9D1C" : "000000"}
              maxLength={useBackupCode ? 12 : 6}
              autoComplete="one-time-code"
              autoFocus
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-white placeholder-slate-600 transition-all outline-none"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {useBackupCode
              ? "Enter one of your 8-character single-use emergency backup codes."
              : "Open Google Authenticator or your TOTP app to view your verification code."}
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 text-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify & Log In</span>
          )}
        </button>
      </form>

      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={() => {
            setUseBackupCode(!useBackupCode);
            setCode("");
          }}
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          {useBackupCode ? "Use Authenticator App 6-digit code" : "Use Emergency Backup Code"}
        </button>

        <form action={cancel2faAction}>
          <button
            type="submit"
            className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </form>
      </div>
    </div>
  );
}
