import { supabase } from "../supabaseClient";

// Every /api/gemini/* route now requires a valid Supabase session — this
// wraps fetch to attach the current JWT as a Bearer token so call sites
// don't each have to fetch the session and build the header by hand.
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
