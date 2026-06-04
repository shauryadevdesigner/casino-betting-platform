import { Mission } from "../models/Mission.js";
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
  const count = await Mission.countDocuments({ userId, completed: false });
  if (count > 0) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 1);

  await Mission.insertMany(
    DEFAULT_MISSIONS.map((m) => ({
      userId,
      ...m,
      description: m.title,
      expiresAt: expires,
    })),
  );
}

export const listMissions = asyncHandler(async (req, res) => {
  await ensureMissionsForUser(req.user._id);
  const missions = await Mission.find({ userId: req.user._id })
    .sort({ completed: 1, missionType: 1 })
    .lean();
  res.json({ success: true, missions });
});

export const claimMission = asyncHandler(async (req, res) => {
  const mission = await Mission.findOne({
    _id: req.params.id,
    userId: req.user._id,
    completed: true,
    claimed: false,
  });
  if (!mission) throw new AppError("Mission not claimable", 400);

  mission.claimed = true;
  await mission.save();

  const { balanceAfter } = await recordTransaction({
    userId: req.user._id,
    type: "mission_reward",
    amount: mission.reward,
    metadata: { missionId: mission._id },
  });

  emitToUser(req.user._id.toString(), "missionCompleted", { mission, balance: balanceAfter });

  res.json({ success: true, reward: mission.reward, balance: balanceAfter });
});
