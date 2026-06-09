import { supabase } from "../lib/supabase.js";
import { emitToUser } from "../services/socket.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const getActiveTournament = asyncHandler(async (req, res) => {
  const now = new Date().toISOString();

  // Find active tournament
  let { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("status", "active")
    .lte("start_time", now)
    .gte("end_time", now)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);

  if (!tournament) {
    // Fallback to upcoming tournament
    const { data: upcoming } = await supabase
      .from("tournaments")
      .select("*")
      .eq("status", "upcoming")
      .order("start_time", { ascending: true })
      .limit(1)
      .maybeSingle();

    tournament = upcoming;
  }

  if (!tournament) {
    return res.json({ success: true, tournament: null, leaderboard: [] });
  }

  // Fetch entries and join user profiles
  const { data: entries, error: entriesErr } = await supabase
    .from("tournament_entries")
    .select("*, profile:user_id(username, display_name, vip_tier, profile_picture_url, avatar_url)")
    .eq("tournament_id", tournament.id)
    .order("score", { ascending: false })
    .limit(50);

  if (entriesErr) throw new AppError(entriesErr.message, 500);

  const mappedEntries = (entries || []).map((e, i) => ({
    rank: i + 1,
    score: Number(e.score),
    user: e.profile ? {
      _id: e.user_id,
      id: e.user_id,
      username: e.profile.username,
      displayName: e.profile.display_name || e.profile.username,
      vipTier: e.profile.vip_tier,
      avatarUrl: e.profile.avatar_url || e.profile.profile_picture_url,
      profilePictureUrl: e.profile.profile_picture_url,
    } : null,
    prize: Number(e.prize || 0),
  }));

  const myEntryIndex = mappedEntries.findIndex(
    (e) => e.user?.id === req.user?._id?.toString(),
  );

  res.json({
    success: true,
    tournament: {
      ...tournament,
      _id: tournament.id,
    },
    leaderboard: mappedEntries,
    myRank: myEntryIndex !== -1 ? myEntryIndex + 1 : null,
  });
});

export const joinTournament = asyncHandler(async (req, res) => {
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !tournament || tournament.status !== "active") {
    throw new AppError("Tournament not active", 400);
  }

  // Upsert entry with score 0 if it doesn't exist
  const { data: entry, error: upsertErr } = await supabase
    .from("tournament_entries")
    .upsert(
      {
        tournament_id: tournament.id,
        user_id: req.user._id,
      },
      { onConflict: "tournament_id,user_id" },
    )
    .select()
    .single();

  if (upsertErr) throw new AppError("Failed to join tournament", 500);

  res.json({
    success: true,
    entry: {
      ...entry,
      _id: entry.id,
    },
  });
});
