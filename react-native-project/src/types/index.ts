export type UserRole = 'owner' | 'admin' | 'supervisor' | 'support' | 'provider';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  virtualCoins: number;
}
