import { supabase } from "../lib/supabase.js";
import { recordTransaction } from "../services/walletService.js";
import { emitToUser } from "../services/socket.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

const DEFAULT_MISSIONS = [
  { missionType: "daily", title: "Place 3 Bets", target: 3, reward: 50 },
  { missionType: "daily", title: "Win 2 Games", target: 2, reward: 75 },
  { missionType: "weekly", title: "Wager $500", target: 500, reward: 100 },
];

export async function ensureMissionsForUser(userId) {
  const { count, error } = await supabase
    .from("missions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", false);

  if (error || (count && count > 0)) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 1);

  const newMissions = DEFAULT_MISSIONS.map((m) => ({
    user_id: userId,
    mission_type: m.missionType,
    title: m.title,
    reward: m.reward,
    target: m.target,
    description: m.title,
    expires_at: expires.toISOString(),
    status: "active",
  }));

  await supabase.from("missions").insert(newMissions);
}

export const listMissions = asyncHandler(async (req, res) => {
  await ensureMissionsForUser(req.user._id);
  
  const { data: missions, error } = await supabase
    .from("missions")
    .select("*")
    .eq("user_id", req.user._id)
    .order("completed", { ascending: true })
    .order("mission_type", { ascending: true });

  if (error) throw new AppError("Failed to fetch missions", 500);

  const mappedMissions = (missions || []).map((m) => ({
    ...m,
    _id: m.id,
    userId: m.user_id,
    missionType: m.mission_type,
    expiresAt: m.expires_at,
  }));

  res.json({ success: true, missions: mappedMissions });
});

export const claimMission = asyncHandler(async (req, res) => {
  const missionId = req.params.id;

  const { data: mission, error } = await supabase
    .from("missions")
    .select("*")
    .eq("id", missionId)
    .eq("user_id", req.user._id)
    .eq("completed", true)
    .eq("claimed", false)
    .maybeSingle();

  if (error || !mission) throw new AppError("Mission not claimable", 400);

  // Update mission claimed status in DB
  const { error: claimErr } = await supabase
    .from("missions")
    .update({ claimed: true, status: "claimed" })
    .eq("id", missionId);

  if (claimErr) throw new AppError("Failed to claim mission", 500);

  const { balanceAfter } = await recordTransaction({
    userId: req.user._id,
    type: "mission_reward",
    amount: Number(mission.reward),
    metadata: { missionId: mission.id },
  });

  const legacyMissionFormat = {
    ...mission,
    _id: mission.id,
    userId: mission.user_id,
    missionType: m => mission.mission_type,
    claimed: true,
    status: "claimed",
  };

  emitToUser(req.user._id.toString(), "missionCompleted", {
    mission: legacyMissionFormat,
    balance: balanceAfter,
  });

  res.json({ success: true, reward: Number(mission.reward), balance: balanceAfter });
});
