import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useAnalytics = () => {
    const { user } = useAuth();

    useEffect(() => {
        const logVisit = async () => {
            // Check if we already logged this session
            const hasLogged = sessionStorage.getItem('vibe_visit_logged');
            if (hasLogged) return;

            try {
                const { error } = await supabase
                    .from('visits')
                    .insert([
                        {
                            user_id: user?.id || null,
                            page_path: window.location.pathname,
                            metadata: {
                                user_agent: navigator.userAgent,
                                screen_width: window.innerWidth
                            }
                        }
                    ]);

                if (!error) {
                    sessionStorage.setItem('vibe_visit_logged', 'true');
                    console.log('Visit logged');
                }
            } catch (err) {
                console.error('Analytics Error:', err);
            }
        };

        logVisit();
    }, [user]); // Re-run if user logs in, but session check prevents double count
};
