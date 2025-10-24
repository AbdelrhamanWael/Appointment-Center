export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  DOCTOR: 'doctor'
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['create:doctor', 'delete:doctor', 'update:doctor', 'view:patients', 'manage:appointments'],
  [ROLES.DOCTOR]: ['view:patients', 'manage:appointments'],
  [ROLES.USER]: ['view:appointments', 'book:appointment']
};
