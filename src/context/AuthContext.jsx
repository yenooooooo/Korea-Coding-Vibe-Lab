
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchProfile = async (userId) => {
        try {
            setError(null);
            if (!userId) {
                setProfile(null);
                return;
            }
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError) throw fetchError;

            if (data) {
                if (data.is_banned) {
                    await supabase.auth.signOut();
                    setUser(null);
                    setProfile(null);
                    window.location.href = '/?banned=1';
                    return;
                }
                setProfile(data);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(err.message);
            // Optional: fallback profile or keep null
        }
    };

    useEffect(() => {
        let resolved = false;

        // Safety timeout: 8초 후에도 응답 없으면 세션 정리 후 로그인 화면으로
        const safetyTimer = setTimeout(async () => {
            if (resolved) return;
            resolved = true;
            console.warn('Auth loading timeout - clearing stale session');
            await supabase.auth.signOut().catch(() => {});
            setUser(null);
            setProfile(null);
            setLoading(false);
        }, 8000);

        // Check active session on mount
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (resolved) return; // 타이머가 이미 처리함
            resolved = true;
            clearTimeout(safetyTimer);
            setUser(session?.user ?? null);
            if (session?.user) await fetchProfile(session.user.id);
            setLoading(false);
        }).catch(async (err) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(safetyTimer);
            console.error('getSession failed:', err);
            await supabase.auth.signOut().catch(() => {});
            setUser(null);
            setProfile(null);
            setLoading(false);
        })

        // Listen for auth changes (로그인/로그아웃 이벤트)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false)
        })

        return () => {
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        }
    }, [])

    // Realtime Profile Sync
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`profile_sync_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Profile updated in real-time:', payload.new);
                    setProfile(payload.new);

                    // Immediate Ban Enforcement
                    if (payload.new.is_banned) {
                        supabase.auth.signOut();
                        window.location.href = '/?banned=1';
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const signUp = async (email, password) => {
        return supabase.auth.signUp({ email, password })
    }

    const signIn = async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password })
    }

    const signInWithOAuth = async (provider) => {
        return supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin
            }
        })
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.warn('signOut API failed, clearing locally:', err);
        }
        // 토큰 무효 상태에서도 확실히 로컬 세션 정리
        setUser(null);
        setProfile(null);
    }

    const value = {
        user,
        profile,
        refetchProfile: () => user && fetchProfile(user.id),
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        loading,
        error
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
