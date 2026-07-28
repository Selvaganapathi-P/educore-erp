import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  GraduationCap, LayoutDashboard, Users, School, BookOpen, ClipboardList,
  Calendar, DollarSign, MessageSquare, BarChart2, Library, Bus, Home,
  Package, Heart, FileText, Settings, ChevronDown, ChevronRight, Bot,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

const NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: '/',              roles: [] },
  { label: 'Schools',       icon: School,           href: '/super-admin/schools', roles: ['super_admin'] },
  {
    label: 'Academics', icon: BookOpen, roles: ['school_admin','principal','vice_principal','teacher'],
    children: [
      { label: 'Academic Years', href: '/academics/years'      },
      { label: 'Classes',        href: '/academics/classes'    },
      { label: 'Subjects',       href: '/academics/subjects'   },
      { label: 'Timetable',      href: '/academics/timetable'  },
    ],
  },
  { label: 'Admissions',    icon: ClipboardList, href: '/admissions', roles: ['school_admin','principal','vice_principal','receptionist'] },
  { label: 'Students',      icon: Users,         href: '/students',   roles: ['school_admin','principal','vice_principal','teacher','hr'] },
  { label: 'Parents',       icon: Home,          href: '/parents',    roles: ['school_admin','principal','teacher'] },
  { label: 'Staff',         icon: Users,         href: '/staff',      roles: ['school_admin','principal','hr'] },
  {
    label: 'Users & Roles', icon: Users, roles: ['school_admin','principal','hr','it_administrator'],
    children: [
      { label: 'All Users', href: '/users'       },
      { label: 'Roles',     href: '/users/roles' },
    ],
  },
  {
    label: 'Attendance', icon: Calendar, roles: ['school_admin','principal','vice_principal','teacher','hr'],
    children: [
      { label: 'Mark Attendance',  href: '/attendance/mark'   },
      { label: 'Reports',          href: '/attendance/reports' },
      { label: 'Staff Attendance', href: '/attendance/staff'   },
    ],
  },
  { label: 'Homework',      icon: BookOpen, href: '/homework',         roles: ['school_admin','principal','vice_principal','teacher'] },
  { label: 'My Homework',   icon: BookOpen, href: '/homework/student', roles: ['student','parent'] },
  { label: 'Examinations', icon: FileText, href: '/exams', roles: ['school_admin','principal','vice_principal','teacher'] },
  {
    label: 'Fees', icon: DollarSign, roles: ['school_admin','principal','accountant'],
    children: [
      { label: 'Dashboard',     href: '/fees'             },
      { label: 'Fee Structures',href: '/fees/structures'  },
      { label: 'Collect Fee',   href: '/fees/collect'     },
      { label: 'Outstanding',   href: '/fees/outstanding' },
    ],
  },
  { label: 'My Fees', icon: DollarSign, href: '/fees/my-fees', roles: ['student','parent'] },
  {
    label: 'Library', icon: Library, roles: ['school_admin','principal','librarian','teacher','student'],
    children: [
      { label: 'Dashboard',    href: '/library'       },
      { label: 'Book Catalog', href: '/library/books' },
      { label: 'Issue/Return', href: '/library/issue' },
    ],
  },
  {
    label: 'Transport', icon: Bus, roles: ['school_admin','principal','transport_manager','teacher','student','parent'],
    children: [
      { label: 'Dashboard',       href: '/transport'          },
      { label: 'Vehicles',        href: '/transport/vehicles' },
      { label: 'Routes',          href: '/transport/routes'   },
      { label: 'Student Assign',  href: '/transport/students' },
    ],
  },
  {
    label: 'Hostel', icon: Home, roles: ['school_admin','principal','hostel_warden'],
    children: [
      { label: 'Dashboard',   href: '/hostel'             },
      { label: 'Hostels',     href: '/hostel/hostels'     },
      { label: 'Rooms',       href: '/hostel/rooms'       },
      { label: 'Allotments',  href: '/hostel/allotments'  },
    ],
  },
  {
    label: 'Inventory', icon: Package, roles: ['school_admin','principal','store_manager','accountant'],
    children: [
      { label: 'Dashboard',       href: '/inventory'            },
      { label: 'Item Catalog',    href: '/inventory/items'      },
      { label: 'Stock Movements', href: '/inventory/movements'  },
    ],
  },
  {
    label: 'Health', icon: Heart, roles: ['school_admin','principal','nurse','vice_principal'],
    children: [
      { label: 'Dashboard',       href: '/health'          },
      { label: 'Health Records',  href: '/health/records'  },
      { label: 'Medical Visits',  href: '/health/visits'   },
    ],
  },
  {
    label: 'Events', icon: Calendar, roles: ['school_admin','principal','vice_principal','teacher','student','parent','receptionist'],
    children: [
      { label: 'Dashboard',     href: '/events'              },
      { label: 'Event Calendar',href: '/events/list'         },
      { label: 'Certificates',  href: '/events/certificates' },
    ],
  },
  {
    label: 'Communication', icon: MessageSquare,
    roles: ['school_admin','principal','vice_principal','teacher','accountant','hr','librarian','nurse','receptionist','student','parent'],
    children: [
      { label: 'Announcements', href: '/communication/announcements' },
      { label: 'Messages',      href: '/communication/messages'      },
    ],
  },
  {
    label: 'Reports', icon: BarChart2, roles: ['school_admin','principal','vice_principal','accountant','hr'],
    children: [
      { label: 'Overview',         href: '/reports'             },
      { label: 'Attendance',       href: '/reports/attendance'  },
      { label: 'Fee Report',       href: '/reports/fees'        },
      { label: 'Academic Report',  href: '/reports/academic'    },
      { label: 'Student Report',   href: '/reports/students'    },
    ],
  },
  {
    label: 'AI Assistant', icon: Bot, roles: ['school_admin','principal','vice_principal','teacher','accountant','hr'],
    children: [
      { label: 'Overview',           href: '/ai'          },
      { label: 'AI Chat',            href: '/ai/chat'     },
      { label: 'School Insights',    href: '/ai/insights' },
      { label: 'Content Generator',  href: '/ai/content'  },
    ],
  },
  { label: 'Settings',      icon: Settings,      href: '/settings',   roles: ['school_admin','it_administrator'] },
];

const NavItem = ({ item }) => {
  const location  = useLocation();
  const [open, setOpen] = useState(() => item.children?.some((c) => location.pathname.startsWith(c.href)));

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="sidebar-link w-full"
        >
          <item.icon className="icon" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {open && (
          <div className="ml-7 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                className={({ isActive }) =>
                  clsx('block px-2 py-1.5 text-sm rounded-md transition-colors', isActive
                    ? 'text-primary-700 font-medium'
                    : 'text-slate-500 hover:text-slate-800')
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
    >
      <item.icon className="icon" />
      <span>{item.label}</span>
    </NavLink>
  );
};

export default function Sidebar({ collapsed, onToggle }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || '';

  const visible = NAV.filter((item) => !item.roles?.length || item.roles.includes(role));

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col z-30 transition-all duration-200',
        collapsed ? 'w-0 overflow-hidden lg:w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-slate-900 truncate">EduCore ERP</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-none">
        {visible.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      {/* User badge */}
      {!collapsed && user && (
        <div className="p-3 border-t border-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold flex-shrink-0">
            {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">{user.profile?.firstName} {user.profile?.lastName}</p>
            <p className="text-2xs text-slate-400 truncate capitalize">{role.replace(/_/g, ' ')}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
