import crypto from "crypto";
import { sha256 } from "../utils/crypto.js";

export function generateServerSeed() {
  return crypto.randomBytes(32).toString("hex");
}

export function buildFairnessProof(serverSeed, clientSeed = "default") {
  const combinedHash = sha256(`${serverSeed}:${clientSeed}`);
  return { serverSeed, clientSeed, combinedHash };
}

export function rollFromHash(combinedHash, min = 0, max = 100) {
  const slice = combinedHash.slice(0, 8);
  const num = parseInt(slice, 16) / 0xffffffff;
  return min + num * (max - min);
}

export function flipFromHash(combinedHash) {
  const n = parseInt(combinedHash.slice(0, 2), 16);
  return n % 2 === 0 ? "heads" : "tails";
}
