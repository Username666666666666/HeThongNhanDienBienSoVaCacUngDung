export interface CommunityType {
  id: string;
  name: string;
  description: string;
}

export const COMMUNITY_TYPES: CommunityType[] = [
  { id: 'general', name: 'Tổng quan', description: 'Thảo luận chung' },
  { id: 'theft_report', name: 'Báo cáo mất cắp', description: 'Báo cáo xe mất cắp' },
  { id: 'announcement', name: 'Thông báo', description: 'Thông báo từ quản lý' },
];
