import CryptoJS from "crypto-js";
import { env } from "../config/env.js";

export function encrypt(text) {
  return CryptoJS.AES.encrypt(text, env.encryptionKey).toString();
}

export function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, env.encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function sha256(input) {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}
