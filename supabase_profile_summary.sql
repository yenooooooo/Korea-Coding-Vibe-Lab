-- Function to fetch all profile summary data in a single call
-- Updated: Removed 'earnd_at' and 'id' as they don't exist in user_badges
-- Returns: { profile, badges, equipped_items_details }

CREATE OR REPLACE FUNCTION get_profile_summary(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile JSONB;
    v_badges JSONB;
    v_equipped_data JSONB;
    v_equipped_ids UUID[];
BEGIN
    -- 1. Fetch Profile
    SELECT to_jsonb(p) INTO v_profile
    FROM profiles p
    WHERE p.id = p_user_id;

    IF v_profile IS NULL THEN
        RETURN NULL;
    END IF;

    -- 2. Fetch User Badges (joined with badge info)
    -- Fixed: Removed 'id' and 'earned_at'
    SELECT jsonb_agg(
        jsonb_build_object(
            'badge_id', ub.badge_id,
            'badges', jsonb_build_object(
                'name', b.name,
                'icon', b.icon,
                'description', b.description
            )
        )
    ) INTO v_badges
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = p_user_id;

    -- 3. Fetch Equipped Items Details
    SELECT ARRAY(
        SELECT value::text::uuid
        FROM jsonb_each_text(v_profile->'equipped_items')
        WHERE value IS NOT NULL
    ) INTO v_equipped_ids;

    IF v_equipped_ids IS NOT NULL AND array_length(v_equipped_ids, 1) > 0 THEN
        SELECT jsonb_object_agg(
            si.category, 
            to_jsonb(si)
        ) INTO v_equipped_data
        FROM shop_items si
        WHERE si.id = ANY(v_equipped_ids);
    ELSE
        v_equipped_data := '{}'::jsonb;
    END IF;

    -- 4. Return Combined Object
    RETURN jsonb_build_object(
        'profile', v_profile,
        'badges', COALESCE(v_badges, '[]'::jsonb),
        'equipped_details', COALESCE(v_equipped_data, '{}'::jsonb)
    );
END;
$$;
