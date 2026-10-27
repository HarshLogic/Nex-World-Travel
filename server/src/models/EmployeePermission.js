import mongoose from 'mongoose';

export const ALL_PERMISSIONS = [
  'view_members',
  'create_member',
  'create_member_change_request',
  'edit_member_details',
  'update_membership_status',
  'edit_membership_plans',
  'update_financial_info',
  'manage_bookings',
  'manage_travel_availability',
  'add_destinations',
  'edit_destinations',
  'delete_destinations',
  'view_reports',
  'export_records',
];

const employeePermissionSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.Mixed,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    permissions: [
      {
        type: String,
        enum: ALL_PERMISSIONS,
      },
    ],
    assignedBy: {
      type: String,
      default: 'system',
    },
  },
  { timestamps: true }
);

export const EmployeePermission = mongoose.model('EmployeePermission', employeePermissionSchema);

