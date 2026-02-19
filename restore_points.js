import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const FREE_REWARDS = [
    { tier: 1, type: 'points', amount: 100 },
    { tier: 2, type: 'points', amount: 150 },
    { tier: 3, type: 'points', amount: 200 },
    { tier: 4, type: 'points', amount: 250 },
    { tier: 5, type: 'badge', amount: 0, badgeId: 'season_1_free' },
    { tier: 6, type: 'points', amount: 300 },
    { tier: 7, type: 'points', amount: 400 },
    { tier: 8, type: 'points', amount: 500 },
    { tier: 9, type: 'points', amount: 600 },
    { tier: 10, type: 'title', amount: 0, titleId: 'rookie_pilot' },
];

const PREMIUM_REWARDS = [
    { tier: 1, type: 'points', amount: 300 },
    { tier: 2, type: 'points', amount: 400 },
    { tier: 3, type: 'points', amount: 500 },
    { tier: 4, type: 'points', amount: 600 },
    { tier: 5, type: 'effect', amount: 0, effectId: 'neon_glow' },
    { tier: 6, type: 'points', amount: 800 },
    { tier: 7, type: 'points', amount: 1000 },
    { tier: 8, type: 'points', amount: 1200 },
    { tier: 9, type: 'points', amount: 1500 },
    { tier: 10, type: 'skin', amount: 0, skinId: 'cyber_hacker' },
];

async function recoverPoints() {
    console.log("Fetching user progress...");
    const { data: progressList, error } = await supabase
        .from('user_season_progress')
        .select('user_id, claimed_tiers, premium_claimed_tiers');

    if (error || !progressList) {
        console.error("Failed to fetch progress", error);
        return;
    }

    console.log(`Found ${progressList.length} users. Calculating missing points...`);

    for (const progress of progressList) {
        let missingPoints = 0;

        // Calculate free tier points
        const freeTiers = progress.claimed_tiers || [];
        for (const tier of freeTiers) {
            const reward = FREE_REWARDS.find(r => r.tier === tier);
            if (reward && reward.type === 'points') {
                missingPoints += reward.amount;
            }
        }

        // Calculate premium tier points
        const premiumTiers = progress.premium_claimed_tiers || [];
        for (const tier of premiumTiers) {
            const reward = PREMIUM_REWARDS.find(r => r.tier === tier);
            if (reward && reward.type === 'points') {
                missingPoints += reward.amount;
            }
        }

        if (missingPoints > 0) {
            // Add missing points to profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_points')
                .eq('id', progress.user_id)
                .single();

            const currentPoints = profile ? (profile.total_points || 0) : 0;
            console.log(`User ${progress.user_id}: Adding ${missingPoints} points (Current: ${currentPoints})`);

            await supabase
                .from('profiles')
                .update({ total_points: currentPoints + missingPoints })
                .eq('id', progress.user_id);
        }
    }

    console.log("Done restoring points!");
}

recoverPoints();
