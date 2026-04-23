import { supabase } from "../utils/supabase.ts";

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

type UserRow = {
  manguoidung: string;
  email: string | null;
  chucnang: string | null;
};

type AdminPinRow = {
  manguoidung: string;
  mapinadmin: string | null;
};

type UserPinRow = {
  manguoidung: string;
  mapinnguoidung: string | null;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const generatePin = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const comparePin = async (
  inputPin: string,
  storedHash: string
): Promise<boolean> => {
  const hashed = await hashPin(inputPin);
  return hashed === storedHash;
};

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

export const updateAdminPin = async (
  userId: string,
  newPin: string
): Promise<boolean> => {
  return createAdminPin(userId, newPin);
};

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

export const updateUserPin = async (
  userId: string,
  newPin: string
): Promise<boolean> => {
  return createUserPin(userId, newPin);
};

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
  if (recoveryError) throw recoveryError;

  return true;
};

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

export const markPinResetRequestUsed = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("yeu_cau_dat_lai_pin")
    .update({ da_su_dung: true })
    .eq("id", id);

  if (error) throw error;
  return true;
};