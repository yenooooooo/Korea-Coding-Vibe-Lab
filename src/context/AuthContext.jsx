
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
        // onAuthStateChange가 INITIAL_SESSION으로 처리하므로 이것만으로 충분
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        })

        // Safety timeout: onAuthStateChange가 아예 안 오는 경우만 대비
        const safetyTimer = setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    console.warn('Auth timeout - rendering without session');
                    setUser(null);
                    setProfile(null);
                }
                return false;
            });
        }, 6000);

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
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('회원가입 요청 시간 초과 — 광고차단기가 Supabase를 차단하고 있을 수 있습니다.')), 10000)
        );
        return Promise.race([
            supabase.auth.signUp({ email, password }),
            timeout
        ]);
    }

    const signIn = async (email, password) => {
        // 네트워크 차단 시 무한 대기 방지 (10초 타임아웃)
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('로그인 요청 시간 초과 — 광고차단기가 Supabase를 차단하고 있을 수 있습니다. 시크릿 모드에서 시도하거나 광고차단기를 비활성화해주세요.')), 10000)
        );
        return Promise.race([
            supabase.auth.signInWithPassword({ email, password }),
            timeout
        ]);
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
        // 로컬 상태를 먼저 즉시 정리 (네트워크 차단되어도 UI 즉시 반영)
        setUser(null);
        setProfile(null);
        // 네트워크 없이 localStorage만 정리 (hang 방지)
        supabase.auth.signOut({ scope: 'local' }).catch(() => {});
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
