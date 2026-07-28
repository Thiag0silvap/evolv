import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Sparkles, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

type Mode = "login" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setInfoMessage(null);
  };

  const handleToggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    resetMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, title: title || null },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session === null) {
          setInfoMessage("Conta criada! Verifique seu e-mail para confirmar a conta antes de entrar.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-blue rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            E
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">EVOLV</span>
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              {mode === "login" ? "Entrar na sua conta" : "Criar conta"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Nome
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-blue"
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" /> Título (opcional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-blue"
                  placeholder="Ex: Analista de TI & Automações"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-blue"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-blue"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-950/30 border border-red-900/40 rounded-lg text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-brand-violet/30 border border-brand-violet/40 rounded-lg text-xs text-brand-cyan">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}</span>
          </button>
        </form>

        <button
          onClick={handleToggleMode}
          className="w-full text-center text-[11px] text-slate-500 hover:text-brand-cyan font-medium transition-colors"
        >
          {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </motion.div>
    </div>
  );
}
