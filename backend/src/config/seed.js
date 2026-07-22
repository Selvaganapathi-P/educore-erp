const { connectDB } = require('./database');
const { env }       = require('./env');
const { User }      = require('../modules/users/user.model');
const { Role }      = require('../modules/roles/role.model');
const { logger }    = require('../utils/logger');

const SYSTEM_ROLES = [
  { name: 'super_admin',       displayName: 'Super Admin',        permissions: ['*'],                                                             isSystem: true },
  { name: 'school_admin',      displayName: 'School Admin',       permissions: ['school.*'],                                                      isSystem: true },
  { name: 'principal',         displayName: 'Principal',          permissions: ['students.*','teachers.*','attendance.*','exams.*','reports.*'],   isSystem: true },
  { name: 'vice_principal',    displayName: 'Vice Principal',     permissions: ['students.read','teachers.read','attendance.*','exams.read'],      isSystem: true },
  { name: 'teacher',           displayName: 'Teacher',            permissions: ['attendance.mark','homework.*','exams.marks','students.read'],     isSystem: true },
  { name: 'student',           displayName: 'Student',            permissions: ['homework.read','exams.results','attendance.own','fees.own'],      isSystem: true },
  { name: 'parent',            displayName: 'Parent',             permissions: ['children.read','attendance.children','fees.children'],           isSystem: true },
  { name: 'hr',                displayName: 'HR Manager',         permissions: ['employees.*','payroll.*','leave.*'],                              isSystem: true },
  { name: 'receptionist',      displayName: 'Receptionist',       permissions: ['admissions.read','visitors.*','enquiries.*'],                    isSystem: true },
  { name: 'accountant',        displayName: 'Accountant',         permissions: ['fees.*','payments.*','ledger.*','reports.finance'],               isSystem: true },
  { name: 'librarian',         displayName: 'Librarian',          permissions: ['library.*'],                                                      isSystem: true },
  { name: 'transport_manager', displayName: 'Transport Manager',  permissions: ['transport.*'],                                                   isSystem: true },
  { name: 'hostel_warden',     displayName: 'Hostel Warden',      permissions: ['hostel.*'],                                                       isSystem: true },
  { name: 'store_manager',     displayName: 'Store Manager',      permissions: ['inventory.*'],                                                   isSystem: true },
  { name: 'nurse',             displayName: 'Nurse',              permissions: ['health.*'],                                                       isSystem: true },
  { name: 'counselor',         displayName: 'Counselor',          permissions: ['students.read','counseling.*'],                                  isSystem: true },
  { name: 'security_guard',    displayName: 'Security Guard',     permissions: ['visitors.read','gate.*'],                                        isSystem: true },
  { name: 'it_administrator',  displayName: 'IT Administrator',   permissions: ['settings.*','users.read'],                                       isSystem: true },
];

const seed = async () => {
  await connectDB();
  logger.info('Seeding database…');

  for (const role of SYSTEM_ROLES) {
    await Role.findOneAndUpdate(
      { name: role.name, schoolId: null },
      { ...role, schoolId: null },
      { upsert: true, new: true }
    );
  }
  logger.info(`✓ ${SYSTEM_ROLES.length} system roles seeded`);

  const existing = await User.findOne({ email: env.SUPER_ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      email:           env.SUPER_ADMIN_EMAIL,
      password:        env.SUPER_ADMIN_PASSWORD,
      role:            'super_admin',
      schoolId:        null,
      status:          'active',
      isEmailVerified: true,
      profile: { firstName: 'Super', lastName: 'Admin' },
    });
    logger.info(`✓ Super admin created: ${env.SUPER_ADMIN_EMAIL}`);
  } else {
    logger.info(`✓ Super admin already exists`);
  }

  logger.info('Seed complete ✓');
  process.exit(0);
};

seed().catch((err) => { logger.error(err); process.exit(1); });
