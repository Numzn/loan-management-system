export const UserRoles = {
  CLIENT: 'CLIENT',
  BUSINESS: 'BUSINESS',
  LOAN_OFFICER: 'LOAN_OFFICER',
  MANAGER: 'MANAGER',
  DIRECTOR: 'DIRECTOR',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  ADMIN: 'ADMIN'
};

export const RoleAccess = {
  [UserRoles.CLIENT]: ['apply', 'view-own-applications', 'upload-documents'],
  [UserRoles.BUSINESS]: ['apply-business', 'view-own-applications', 'upload-documents'],
  [UserRoles.LOAN_OFFICER]: ['review-applications', 'request-documents'],
  [UserRoles.MANAGER]: ['approve-applications', 'view-reports'],
  [UserRoles.DIRECTOR]: ['final-approval', 'view-all-reports'],
  [UserRoles.FINANCE_OFFICER]: ['process-disbursement', 'track-payments'],
  [UserRoles.ADMIN]: ['manage-users', 'manage-roles', 'view-system-logs']
}; 