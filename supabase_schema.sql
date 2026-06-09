-- FASTLUCK CASINO PLATFORM - SUPABASE POSTGRESQL SCHEMA

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(255) DEFAULT '',
    profile_picture_url VARCHAR(255) DEFAULT '',
    email_verified BOOLEAN DEFAULT FALSE,
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    stats JSONB DEFAULT '{"totalBets": 0, "totalWagered": 0, "totalWins": 0, "totalLosses": 0, "gamesPlayed": 0, "biggestWin": 0, "profitLoss": 0}'::jsonb,
    vip_tier VARCHAR(30) DEFAULT 'bronze',
    vip_tier_updated_at TIMESTAMPTZ DEFAULT NULL,
    referral_code VARCHAR(50) UNIQUE,
    referred_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    affiliate_earnings NUMERIC DEFAULT 0,
    affiliate_commission_rate NUMERIC DEFAULT 0.05,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT DEFAULT NULL,
    backup_codes TEXT[] DEFAULT '{}',
    admin_role BOOLEAN DEFAULT FALSE,
    last_daily_claim_at TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    google_id TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WALLETS TABLE (Default balance = 1000)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 1000.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VIP LEVELS & USER VIP TABLES
CREATE TABLE IF NOT EXISTS public.vip_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    required_points NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.user_vip (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vip_level INTEGER NOT NULL REFERENCES public.vip_levels(id)
);

-- Seed VIP Levels
INSERT INTO public.vip_levels (name, required_points) VALUES
('Bronze', 0),
('Silver', 100),
('Gold', 500),
('Platinum', 2000)
ON CONFLICT (name) DO NOTHING;

-- 4. VIP TIERS TABLE (Config table for application logic)
CREATE TABLE IF NOT EXISTS public.vip_tiers (
    tier_key VARCHAR(30) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_wagered NUMERIC NOT NULL DEFAULT 0,
    daily_reward_bonus_pct NUMERIC DEFAULT 0,
    affiliate_commission_rate NUMERIC DEFAULT 0.05,
    benefits TEXT[] DEFAULT '{}',
    badge_icon VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed VIP Tiers config
INSERT INTO public.vip_tiers (tier_key, name, min_wagered, daily_reward_bonus_pct, affiliate_commission_rate, benefits) VALUES
('bronze', 'Bronze', 0, 1, 0.05, ARRAY['1% daily reward bonus', '5% affiliate commission']),
('silver', 'Silver', 100, 2, 0.07, ARRAY['2% daily bonus', 'Silver badge', '7% affiliate']),
('gold', 'Gold', 500, 5, 0.10, ARRAY['5% daily bonus', 'Exclusive missions', '10% affiliate']),
('platinum', 'Platinum', 2000, 10, 0.15, ARRAY['10% daily bonus', 'VIP support', '15% affiliate'])
ON CONFLICT (tier_key) DO NOTHING;

-- 5. MISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_type VARCHAR(30) NOT NULL, -- 'daily', 'weekly', 'special', 'vip'
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    progress NUMERIC DEFAULT 0,
    target NUMERIC NOT NULL,
    reward NUMERIC NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'completed', 'claimed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REWARDS TABLE
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LEADERBOARDS TABLE
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    points NUMERIC NOT NULL DEFAULT 0,
    rank INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GAME HISTORIES TABLE
CREATE TABLE IF NOT EXISTS public.game_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game VARCHAR(30) NOT NULL, -- 'dice', 'mines', 'coinflip'
    bet_amount NUMERIC NOT NULL,
    payout NUMERIC NOT NULL,
    profit NUMERIC NOT NULL,
    won BOOLEAN NOT NULL,
    multiplier NUMERIC DEFAULT 0,
    result JSONB NOT NULL,
    server_seed TEXT DEFAULT NULL,
    client_seed TEXT DEFAULT NULL,
    combined_hash TEXT DEFAULT NULL,
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MINES SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.mines_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bet_amount NUMERIC NOT NULL,
    mine_count INTEGER NOT NULL,
    grid_size INTEGER DEFAULT 25,
    mine_positions INTEGER[] NOT NULL,
    revealed_tiles INTEGER[] DEFAULT '{}',
    multiplier NUMERIC DEFAULT 1,
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'lost', 'cashed_out'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount NUMERIC NOT NULL,
    balance_before NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    game VARCHAR(30) DEFAULT NULL,
    reference_id UUID DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    commission_rate NUMERIC DEFAULT 0.05,
    total_commission NUMERIC DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AFFILIATE COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_history_id UUID DEFAULT NULL,
    loss_amount NUMERIC NOT NULL,
    commission_rate NUMERIC NOT NULL,
    commission_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SUPPORT CHATS & CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.support_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'open', -- 'open', 'closed'
    rating INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.support_chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXCHANGE RATES TABLE
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(10) DEFAULT 'USD',
    rates JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DAILY REWARDS TABLE
CREATE TABLE IF NOT EXISTS public.daily_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    streak_day INTEGER DEFAULT 1
);

-- 16. TOURNAMENTS & TOURNAMENT ENTRIES
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    prize_pool NUMERIC NOT NULL,
    status VARCHAR(30) DEFAULT 'upcoming', -- 'upcoming', 'active', 'ended'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tournament_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC DEFAULT 0,
    position INTEGER DEFAULT NULL,
    prize NUMERIC DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

-- 17. ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id TEXT DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ATOMIC WALLET TRANSACTION PL/pgSQL FUNCTION
CREATE OR REPLACE FUNCTION public.record_transaction_rpc(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_amount NUMERIC,
    p_game VARCHAR(30) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_balance_before NUMERIC;
    v_balance_after NUMERIC;
    v_tx_id UUID;
    v_result JSONB;
BEGIN
    -- Get current balance
    SELECT balance INTO v_balance_before
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock the row to prevent race conditions

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    -- Calculate balance after
    IF p_type IN ('deposit', 'win', 'daily_reward', 'affiliate_payout', 'mission_reward', 'tournament_prize') THEN
        v_balance_after := v_balance_before + p_amount;
    ELSIF p_type IN ('bet', 'withdraw') THEN
        IF v_balance_before < p_amount THEN
            RAISE EXCEPTION 'Insufficient balance';
        END IF;
        v_balance_after := v_balance_before - p_amount;
    ELSIF p_type = 'adjustment' THEN
        v_balance_after := v_balance_before + p_amount;
        IF v_balance_after < 0 THEN
            RAISE EXCEPTION 'Insufficient balance';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid transaction type';
    END IF;

    -- Update balance
    UPDATE public.wallets
    SET balance = v_balance_after, updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Insert transaction
    INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, game, reference_id, metadata)
    VALUES (p_user_id, p_type, p_amount, v_balance_before, v_balance_after, p_game, p_reference_id, p_metadata)
    RETURNING id INTO v_tx_id;

    -- Build return JSON
    v_result := jsonb_build_object(
        'transactionId', v_tx_id,
        'balanceBefore', v_balance_before,
        'balanceAfter', v_balance_after
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. AUTOMATIC PROFILE AND WALLET CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_val VARCHAR(50);
    display_name_val VARCHAR(100);
BEGIN
    username_val := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
    display_name_val := COALESCE(new.raw_user_meta_data->>'displayName', username_val);

    INSERT INTO public.profiles (id, username, email, display_name, avatar_url, vip_tier)
    VALUES (
        new.id,
        username_val,
        new.email,
        display_name_val,
        COALESCE(new.raw_user_meta_data->>'avatarUrl', ''),
        'bronze'
    );

    INSERT INTO public.wallets (user_id, balance)
    VALUES (new.id, 1000.00);

    -- Sync to user_vip
    INSERT INTO public.user_vip (user_id, vip_level)
    SELECT new.id, id FROM public.vip_levels WHERE name = 'Bronze' LIMIT 1;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 19. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vip ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mines_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 20. ROW LEVEL SECURITY POLICIES
-- Profiles Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profiles" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Wallets Policies
CREATE POLICY "Allow users to read their own wallets" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Missions Policies
CREATE POLICY "Allow users to read their own missions" ON public.missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own missions" ON public.missions
    FOR UPDATE USING (auth.uid() = user_id);

-- Rewards Policies
CREATE POLICY "Allow users to read their own rewards" ON public.rewards
    FOR SELECT USING (auth.uid() = user_id);

-- Leaderboards Policies
CREATE POLICY "Allow public read access to leaderboards" ON public.leaderboards
    FOR SELECT USING (true);

-- Support Chats Policies
CREATE POLICY "Allow users to manage their own chats" ON public.support_chats
    FOR ALL USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Allow users to read their own support chat messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_chats 
            WHERE id = chat_messages.chat_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to send messages in their own chats" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_chats 
            WHERE id = chat_messages.chat_id AND user_id = auth.uid()
        )
    );

-- Tournament Entries Policies
CREATE POLICY "Allow public read access to tournament entries" ON public.tournament_entries
    FOR SELECT USING (true);

CREATE POLICY "Allow users to join tournaments" ON public.tournament_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
