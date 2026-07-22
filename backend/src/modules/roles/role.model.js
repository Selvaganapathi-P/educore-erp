const mongoose = require('mongoose');

const USER_ROLES = [
  'super_admin', 'school_admin', 'principal', 'vice_principal',
  'teacher', 'student', 'parent', 'hr', 'receptionist', 'accountant',
  'librarian', 'transport_manager', 'hostel_warden', 'store_manager',
  'nurse', 'counselor', 'security_guard', 'it_administrator',
];

const permissionSchema = new mongoose.Schema(
  {
    module:      { type: String, required: true },
    action:      { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);
permissionSchema.index({ module: 1, action: 1 }, { unique: true });

const roleSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, enum: USER_ROLES },
    displayName: { type: String, required: true },
    description: { type: String, default: '' },
    permissions: [{ type: String }],
    schoolId:    { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    isSystem:    { type: Boolean, default: false },
    isDeleted:   { type: Boolean, default: false },
  },
  { timestamps: true }
);
roleSchema.index({ name: 1, schoolId: 1 }, { unique: true });
roleSchema.index({ schoolId: 1 });

const Permission = mongoose.model('Permission', permissionSchema);
const Role       = mongoose.model('Role', roleSchema);
module.exports = { Role, Permission, USER_ROLES };
