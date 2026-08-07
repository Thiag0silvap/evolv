import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * Loads AI/user-confirmed skill categories cached in the `skill_categories`
 * table, and lazily batch-requests categorization for any skill name not yet
 * cached. Callers should still compute a keyword-based provisional category
 * for every skill and only override it with the value returned here when
 * present — the cache is additive, never a hard dependency.
 */
export function useSkillCategories(skillNames: string[]): Record<string, string> {
  const [cachedCategories, setCachedCategories] = useState<Record<string, string>>({});
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const requestedRef = useRef<Set<string>>(new Set());

  // Load whatever is already cached for this user, once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from("skill_categories")
          .select("skill_name, category")
          .eq("user_id", userId);

        if (error) throw error;
        if (cancelled) return;

        const map: Record<string, string> = {};
        (data || []).forEach((row: { skill_name: string; category: string }) => {
          map[row.skill_name] = row.category;
        });
        setCachedCategories(map);
      } catch (err) {
        console.error("Erro ao carregar cache de categorias de habilidade:", err);
      } finally {
        if (!cancelled) setCacheLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Batch-categorize any skill name that isn't cached yet (and hasn't already
  // been requested this session), as a single call — never one per skill.
  useEffect(() => {
    if (!cacheLoaded) return;

    const uncached = skillNames.filter(
      name => !(name in cachedCategories) && !requestedRef.current.has(name)
    );
    if (uncached.length === 0) return;

    uncached.forEach(name => requestedRef.current.add(name));

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        if (!userId) return;

        const response = await fetch("/api/gemini/categorize-skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session!.access_token}`
          },
          body: JSON.stringify({ skillNames: uncached })
        });

        if (!response.ok) {
          throw new Error(`categorize-skills respondeu com status ${response.status}`);
        }

        const { categories } = await response.json();
        if (!categories || Object.keys(categories).length === 0) return;

        const rows = Object.entries(categories).map(([skill_name, category]) => ({
          user_id: userId,
          skill_name,
          category
        }));

        const { error: upsertError } = await supabase
          .from("skill_categories")
          .upsert(rows, { onConflict: "user_id,skill_name" });

        if (upsertError) {
          console.error("Erro ao salvar cache de categorias de habilidade:", upsertError);
        }

        setCachedCategories(prev => ({ ...prev, ...categories }));
      } catch (err) {
        // Non-blocking: the caller keeps using its keyword-based provisional
        // category for these names until a future render succeeds.
        console.error("Erro ao categorizar habilidades via IA:", err);
      }
    })();
  }, [skillNames, cachedCategories, cacheLoaded]);

  return cachedCategories;
}
