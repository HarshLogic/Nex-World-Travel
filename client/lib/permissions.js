export const PERMISSION_OPTIONS = [
  {
    id: 'view_members',
    label: 'View members',
    description: 'Search and inspect member profiles and dossiers',
  },
  {
    id: 'create_member',
    label: 'Register New Member / Create Member',
    description: 'Register new membership accounts directly',
  },
  {
    id: 'create_member_change_request',
    label: 'Create member change requests',
    description: 'Submit change requests for Master Head review',
  },
  {
    id: 'edit_member_details',
    label: 'Edit member details',
    description: 'Directly edit member contact and profile details',
  },
  {
    id: 'update_membership_status',
    label: 'Update membership status',
    description: 'Modify membership status (Active, Open, Close, Deactive)',
  },
  {
    id: 'edit_membership_plans',
    label: 'Edit membership plans',
    description: 'Modify package tiers, nights pool, and tenure',
  },
  {
    id: 'update_financial_info',
    label: 'Update membership financial info',
    description: 'Record payments and modify financial balances',
  },
  {
    id: 'manage_bookings',
    label: 'Manage booking enquiries',
    description: 'Review guest bookings, append notes, and update statuses',
  },
  {
    id: 'manage_travel_availability',
    label: 'Manage travel availability',
    description: 'Manage trip calendar periods and open dates',
  },
  {
    id: 'add_destinations',
    label: 'Add destinations',
    description: 'Create and publish new travel destinations',
  },
  {
    id: 'edit_destinations',
    label: 'Edit destinations',
    description: 'Modify destination details, content, and images',
  },
  {
    id: 'delete_destinations',
    label: 'Delete destinations',
    description: 'Remove or archive destinations',
  },
  {
    id: 'view_reports',
    label: 'View reports',
    description: 'Access management reporting metrics and analytics',
  },
  {
    id: 'export_records',
    label: 'Export records',
    description: 'Export member, booking, and transaction CSV data',
  },
];

export const PERMISSION_ALIASES = {
  update_financial_info: ['update_financial_info', 'update_membership_financial'],
  update_membership_financial: ['update_financial_info', 'update_membership_financial'],
  create_member: ['create_member', 'register_member'],
  register_member: ['create_member', 'register_member'],
  edit_member_details: ['edit_member_details', 'update_member_details'],
  update_member_details: ['edit_member_details', 'update_member_details'],
  edit_membership_plans: ['edit_membership_plans', 'update_membership_plans'],
  update_membership_plans: ['edit_membership_plans', 'update_membership_plans'],
};

export function hasPermission(permissions, perm) {
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) return false;
  const acceptable = PERMISSION_ALIASES[perm] || [perm];
  return acceptable.some((p) => permissions.includes(p));
}

