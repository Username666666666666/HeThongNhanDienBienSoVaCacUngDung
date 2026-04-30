import { supabase } from "../utils/supabase.ts";

/**
 * PIN Reset Request Type
 * Represents a PIN reset request from the yeu_cau_dat_lai_pin table
 */
export type PinResetRequest = {
  id: string;
  email: string | null;
  vai_tro: string | null;
  manguoidung: string | null;
  ma_otp_da_bam: string | null;
  het_han_luc: string | null;
  da_su_dung: boolean | null;
  so_lan_thu: number | null;
  thoi_diem_tao: string | null;
};

/**
 * User row from the nguoidung table
 */
type UserRow = {
  manguoidung: string;
  email: string | null;
  chucnang: string | null;
};

/**
 * Admin PIN row from the ctadmin table
 */
type AdminPinRow = {
  manguoidung: string;
  mapinadmin: string | null;
};

/**
 * User PIN row from the nguoidung table
 */
type UserPinRow = {
  manguoidung: string;
  mapinnguoidung: string | null;
};

/**
 * Normalize email by trimming and converting to lowercase
 * @private
 */
const normalizeEmail = (value: string) => value.trim().toLowerCase();

/**
 * Generate a random 8-digit PIN code
 * @returns {string} A random 8-digit PIN as a string
 * @example
 * const pin = generatePin(); // "82345691"
 */
export const generatePin = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

/**
 * Hash a PIN using SHA-256 algorithm
 * Used to securely store PINs in the database
 * @param {string} pin - The plain text PIN to hash
 * @returns {Promise<string>} The SHA-256 hash of the PIN
 * @example
 * const hash = await hashPin("12345678");
 * // "1f2b85f6a1e1d7e5c5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f"
 */
export const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Compare a PIN against a stored hash
 * @param {string} inputPin - The PIN entered by the user
 * @param {string} storedHash - The stored SHA-256 hash
 * @returns {Promise<boolean>} True if the PIN matches the hash, false otherwise
 * @example
 * const isValid = await comparePin("12345678", storedHash);
 */
export const comparePin = async (
  inputPin: string,
  storedHash: string
): Promise<boolean> => {
  const hashed = await hashPin(inputPin);
  return hashed === storedHash;
};

/**
 * Get user information by email address
 * @param {string} email - The user's email address
 * @returns {Promise<UserRow | null>} User data or null if not found
 * @throws {Error} If the database query fails
 * @example
 * const user = await getUserByEmail("user@example.com");
 */
export const getUserByEmail = async (email: string): Promise<UserRow | null> => {
  const normalized = normalizeEmail(email);

  const { data, error } = await supabase
    .from("nguoidung")
    .select("manguoidung, email, chucnang")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
};

/**
 * Get the admin PIN hash for a user
 * @param {string} userId - The user's ID (manguoidung)
 * @returns {Promise<AdminPinRow | null>} Admin PIN data or null if not found
 * @throws {Error} If the database query fails
 */
export const getAdminPinHash = async (
  userId: string
): Promise<AdminPinRow | null> => {
  const { data, error } = await supabase
    .from("ctadmin")
    .select("manguoidung, mapinadmin")
    .eq("manguoidung", userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
};

/**
 * Get the user PIN hash from the nguoidung table
 * @param {string} userId - The user's ID (manguoidung)
 * @returns {Promise<UserPinRow | null>} User PIN data or null if not found
 * @throws {Error} If the database query fails
 */
export const getUserPinHash = async (
  userId: string
): Promise<UserPinRow | null> => {
  const { data, error } = await supabase
    .from("nguoidung")
    .select("manguoidung, mapinnguoidung")
    .eq("manguoidung", userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
};

/**
 * Create or update an admin PIN
 * @param {string} userId - The admin user's ID
 * @param {string} newPin - The new PIN to set (will be hashed)
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If the database operation fails
 */
export const createAdminPin = async (
  userId: string,
  newPin: string
): Promise<boolean> => {
  const hash = await hashPin(newPin);

  const { error } = await supabase.from("ctadmin").upsert(
    {
      manguoidung: userId,
      mapinadmin: hash,
    },
    {
      onConflict: "manguoidung",
    }
  );

  if (error) throw error;
  return true;
};

/**
 * Update an admin PIN (alias for createAdminPin)
 * @param {string} userId - The admin user's ID
 * @param {string} newPin - The new PIN to set
 * @returns {Promise<boolean>} True if successful
 */
export const updateAdminPin = async (
  userId: string,
  newPin: string
): Promise<boolean> => {
  return createAdminPin(userId, newPin);
};

/**
 * Change admin PIN with verification of the old PIN
 * @param {string} userId - The admin user's ID
 * @param {string} oldPin - The current PIN (for verification)
 * @param {string} newPin - The new PIN to set
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If old PIN is incorrect or no PIN is set
 */
export const changeAdminPinWithOldPin = async (
  userId: string,
  oldPin: string,
  newPin: string
): Promise<boolean> => {
  const current = await getAdminPinHash(userId);

  if (!current?.mapinadmin) {
    throw new Error("Chưa có PIN admin");
  }

  const ok = await comparePin(oldPin, current.mapinadmin);
  if (!ok) {
    throw new Error("Mã PIN cũ không đúng");
  }

  return updateAdminPin(userId, newPin);
};

/**
 * Create or update a user PIN
 * @param {string} userId - The user's ID
 * @param {string} newPin - The new PIN to set (will be hashed)
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If the database operation fails
 */
export const createUserPin = async (
  userId: string,
  newPin: string
): Promise<boolean> => {
  const hash = await hashPin(newPin);

  const { error } = await supabase
    .from("nguoidung")
    .update({
      mapinnguoidung: hash,
      updated_at: new Date().toISOString(),
    })
    .eq("manguoidung", userId);

  if (error) throw error;
  return true;
};

/**
 * Update a user PIN (alias for createUserPin)
 * @param {string} userId - The user's ID
 * @param {string} newPin - The new PIN to set
 * @returns {Promise<boolean>} True if successful
 */
export const updateUserPin = async (
  userId: string,
  newPin: string
): Promise<boolean> => {
  return createUserPin(userId, newPin);
};

/**
 * Change user PIN with verification of the old PIN
 * @param {string} userId - The user's ID
 * @param {string} oldPin - The current PIN (for verification)
 * @param {string} newPin - The new PIN to set
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If old PIN is incorrect or no PIN is set
 */
export const changeUserPinWithOldPin = async (
  userId: string,
  oldPin: string,
  newPin: string
): Promise<boolean> => {
  const current = await getUserPinHash(userId);

  if (!current?.mapinnguoidung) {
    throw new Error("Chưa có PIN người dùng");
  }

  const ok = await comparePin(oldPin, current.mapinnguoidung);
  if (!ok) {
    throw new Error("Mã PIN cũ không đúng");
  }

  return updateUserPin(userId, newPin);
};

/**
 * Send a PIN reset OTP to the user's email via Supabase Auth
 * Creates a reset request entry in the yeu_cau_dat_lai_pin table
 * @param {string} email - The user's email address
 * @returns {Promise<boolean>} True if OTP email was sent successfully
 * @throws {Error} If email is invalid, user not found, or email sending fails
 */
export const sendPinResetOtp = async (email: string): Promise<boolean> => {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    throw new Error("Email không hợp lệ");
  }

  const user = await getUserByEmail(normalized);
  if (!user) {
    throw new Error("Không tìm thấy tài khoản theo email này");
  }

  const { error: insertError } = await supabase.from("yeu_cau_dat_lai_pin").insert({
    email: normalized,
    vai_tro: user.chucnang,
    manguoidung: user.manguoidung,
    ma_otp_da_bam: null,
    het_han_luc: null,
    da_su_dung: false,
    so_lan_thu: 0,
    thoi_diem_tao: new Date().toISOString(),
  });

  if (insertError) throw insertError;

  const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(normalized);
  if (recoveryError) {
    console.error("Recovery error:", recoveryError);
    throw recoveryError;
  }

  return true;
};

/**
 * Verify a PIN reset OTP token
 * @param {string} email - The user's email address
 * @param {string} otp - The OTP code to verify
 * @returns {Promise<PinResetRequest | null>} The reset request if valid, null if invalid
 */
export const verifyPinOtp = async (
  email: string,
  otp: string
): Promise<PinResetRequest | null> => {
  const normalized = normalizeEmail(email);

  const { error } = await supabase.auth.verifyOtp({
    email: normalized,
    token: otp.trim(),
    type: "recovery",
  });

  if (error) return null;

  const { data, error: reqError } = await supabase
    .from("yeu_cau_dat_lai_pin")
    .select(
      "id,email,vai_tro,manguoidung,ma_otp_da_bam,het_han_luc,da_su_dung,so_lan_thu,thoi_diem_tao"
    )
    .eq("email", normalized)
    .eq("da_su_dung", false)
    .order("thoi_diem_tao", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reqError || !data) return null;
  return data as PinResetRequest;
};

/**
 * Mark a PIN reset request as used
 * This prevents the same OTP from being used multiple times
 * @param {string} id - The reset request ID
 * @returns {Promise<boolean>} True if successfully marked as used
 * @throws {Error} If the database operation fails
 */
export const markPinResetRequestUsed = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("yeu_cau_dat_lai_pin")
    .update({ da_su_dung: true })
    .eq("id", id);

  if (error) throw error;
  return true;
};