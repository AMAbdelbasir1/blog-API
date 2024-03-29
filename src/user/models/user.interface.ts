export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  roles?: UserRole;
  profileImage?: string;
}
export enum UserRole {
  ADMIN = 'admin',
  CHIEFEDITOR = 'chiefeditor',
  EDITOR = 'editor',
  USER = 'user',
}
