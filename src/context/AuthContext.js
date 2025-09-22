import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

// Helper function to get Supabase project reference from URL
const getSupabaseProjectRef = () => {
  const url = process.env.REACT_APP_SUPABASE_URL;
  if (!url) return null;
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
};

// Helper function to read cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper function to set session from cookie
const setSessionFromCookie = async () => {
  const projectRef = getSupabaseProjectRef();
  if (!projectRef) return null;

  const cookieName = `sb-${projectRef}-auth-token`;
  const authCookie = getCookie(cookieName);

  if (authCookie) {
    try {
        const encoded = authCookie.startsWith('base64-') ? authCookie.slice(7) : authCookie;
        const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
        const sessionData = JSON.parse(decoded);
      if (sessionData.access_token && sessionData.refresh_token) {
        const { data } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token
        });
        return data.session;
      }
    } catch (error) {
      console.warn('Failed to parse auth cookie:', error);
    }
  }
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const getSession = async () => {
      // First try to get existing session
      let { data: { session } } = await supabase.auth.getSession();

      // If no session, try to restore from SSO cookie
      if (!session) {
        session = await setSessionFromCookie();
      }

      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);