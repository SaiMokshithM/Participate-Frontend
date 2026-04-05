import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger
} from '@/components/ui/sidebar';
import {
  Home, LayoutGrid, Users, User, Calendar, Settings, LogOut,
  Plus, Edit, Trash2, BarChart2, Bell, Shield, Download,
  Key, TrendingUp, Activity, ChevronRight, ArrowUpRight,
  ArrowDownRight, Search, Filter, MoreHorizontal, RefreshCw
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { ProfileDialog } from '@/components/ui/ProfileDialog';
import { getDashboardStats, getAllStudents } from '@/api/adminApi';
import { getAllActivitiesAdmin, createActivity, deleteActivity as apiDeleteActivity } from '@/api/activitiesApi';

// Static enrollment trend (no per-month API yet)
const enrollmentData = [
  { month: 'Aug', students: 40 }, { month: 'Sep', students: 65 },
  { month: 'Oct', students: 85 }, { month: 'Nov', students: 72 },
  { month: 'Dec', students: 58 }, { month: 'Jan', students: 90 },
  { month: 'Feb', students: 110 }, { month: 'Mar', students: 98 },
];

// ── Palette ─────────────────────────────────────────────────────────
const SIDEBAR_BG = '#1C2B33';
const SIDEBAR_TEXT = '#E8F4F8';
const SIDEBAR_SUB = '#4A6572';
const SIDEBAR_MID = '#8BAEBF';
const SIDEBAR_BORDER = 'rgba(139,174,191,0.15)';
const BG = '#EEF2F5';
const CARD = '#FFFFFF';
const BORDER = 'rgba(139,174,191,0.22)';
const ACCENT = '#8BAEBF';
const ACCENT_DEEP = '#4A6572';
const ACCENT_BG = 'rgba(139,174,191,0.10)';
const TEXT = '#1C2B33';
const TEXT_SUB = '#4A6572';
const TEXT_MUTED = '#8BAEBF';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'activities', label: 'Manage Activities', icon: LayoutGrid },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const viewTitles = {
  dashboard: 'Overview', activities: 'Manage Activities',
  students: 'Students', events: 'Events', settings: 'Settings',
};

const statAccents = ['#34d399', '#60a5fa', '#f59e0b', '#a78bfa'];

const chartStyle = {
  backgroundColor: '#fff',
  border: `1px solid ${BORDER}`,
  borderRadius: '10px',
  color: TEXT,
  fontSize: 12,
};

// ── Shared Sub-components ─────────────────────────────────────────
const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-2xl border shadow-sm ${className}`}
    style={{ backgroundColor: CARD, borderColor: BORDER, ...style }}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, sub, action }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: BORDER }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
        <Icon className="w-4 h-4" style={{ color: ACCENT }} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: TEXT }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{sub}</p>}
      </div>
    </div>
    {action}
  </div>
);

const Toggle = ({ keyName, label, desc, activeColor = ACCENT, settingsToggles, toggle }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border hover:bg-gray-50 transition-colors"
    style={{ borderColor: BORDER }}>
    <div>
      <p className="text-sm font-medium" style={{ color: TEXT }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{desc}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold" style={{ color: settingsToggles[keyName] ? '#34d399' : TEXT_SUB }}>
        {settingsToggles[keyName] ? 'On' : 'Off'}
      </span>
      <button onClick={() => toggle(keyName)}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
        style={{ backgroundColor: settingsToggles[keyName] ? activeColor : '#CBD5E1' }}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${settingsToggles[keyName] ? 'translate-x-4' : 'translate-x-1'}`} />
      </button>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
      <Icon className="w-6 h-6" style={{ color: ACCENT_DEEP }} />
    </div>
    <p className="text-sm font-semibold" style={{ color: TEXT }}>{title}</p>
    <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>{sub}</p>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 rounded-full animate-spin"
      style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  // ── Activity state (fetched directly for admin) ──────────────────
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);

  // ── Dashboard stats (from /api/admin/dashboard) ──────────────────
  const [dashStats, setDashStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Students (from /api/admin/users) ────────────────────────────
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  // ── UI state ─────────────────────────────────────────────────────
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', category: '', description: '', capacity: '', organizer: '', schedule: '', location: '', time: '', imageUrl: '', imageFile: null });
  const [activeView, setActiveView] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const avatarMenuRef = useRef(null);

  const [settingsToggles, setSettingsToggles] = useState({
    emailNotifications: true, pushNotifications: false,
    autoApprove: false, twoFactor: true,
  });
  const [userProfile, setUserProfile] = useState({
    role: 'admin', name: '', email: '', phone: '',
    location: '', bio: '', avatar: '', joinedDate: 'Just now',
  });

  // ── Sync admin name from auth ────────────────────────────────────
  useEffect(() => {
    if (user) {
      setUserProfile(p => ({
        ...p,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Admin',
        email: user.email || '',
      }));
    }
  }, [user]);

  // ── Click-outside for avatar menu ───────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target))
        setIsAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Fetch activities (admin full list) ───────────────────────────
  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const data = await getAllActivitiesAdmin();
      setActivities(data);
    } catch (err) {
      setActivitiesError(err?.response?.data?.message ?? 'Failed to load activities');
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  // ── Fetch dashboard stats ────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getDashboardStats();
      setDashStats(data);
    } catch {
      // silently fail — stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch students ───────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const data = await getAllStudents();
      setStudents(data.content ?? data);
    } catch (err) {
      setStudentsError(err?.response?.data?.message ?? 'Failed to load students');
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { fetchActivities(); fetchStats(); }, [fetchActivities, fetchStats]);

  // Load students when that view is first visited
  useEffect(() => {
    if (activeView === 'students' && students.length === 0 && !studentsLoading) {
      fetchStudents();
    }
  }, [activeView]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived stats ────────────────────────────────────────────────
  const totalActivities = activities.length;
  const activeActivities = activities.filter(a => a.status === 'ACTIVE').length;
  const totalEnrolled = activities.reduce((s, a) => s + (a.enrolled || 0), 0);
  const totalCapacity = activities.reduce((s, a) => s + (a.capacity || 0), 0);

  // Prefer real API stats where available, fall back to derived
  const stats = [
    {
      label: 'Total Activities',
      icon: LayoutGrid,
      value: totalActivities,
      sub: `${activeActivities} active`,
    },
    {
      label: 'Total Students',
      icon: Users,
      value: dashStats ? dashStats.totalStudents : '—',
      sub: dashStats ? `${dashStats.totalAdmins} admin(s)` : '',
    },
    {
      label: 'Total Enrolled',
      icon: Activity,
      value: dashStats ? dashStats.totalParticipations : totalEnrolled,
      sub: 'participations',
    },
    {
      label: 'Capacity Used',
      icon: BarChart2,
      value: totalCapacity > 0 ? `${Math.round((totalEnrolled / totalCapacity) * 100)}%` : '—',
      sub: `${totalEnrolled} / ${totalCapacity}`,
    },
  ];

  // Category distribution from real data
  const activityData = Object.entries(
    activities.reduce((acc, a) => {
      if (a.category) acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  // ── Filtered activities ──────────────────────────────────────────
  const filteredActivities = activities.filter(a =>
    !searchQuery || a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Create activity ──────────────────────────────────────────────
  const handleCreateActivity = async () => {
    // Validate all required fields (mirrors backend @NotBlank)
    const { name, category, description, organizer, schedule } = newActivity;
    if (!name || !category || !description || !organizer || !schedule) {
      setCreateError('Please fill in all required fields: Name, Category, Description, Organizer, and Schedule.');
      return;
    }
    if (creating) return;
    setCreateError('');
    setCreating(true);
    try {
      const formData = new FormData();
      const activityData = {
        name: newActivity.name,
        category: newActivity.category,
        description: newActivity.description,
        capacity: parseInt(newActivity.capacity) || 50,
        organizer: newActivity.organizer,
        schedule: newActivity.schedule,
        location: newActivity.location || 'TBD',
        imageUrl: newActivity.imageUrl || null,
      };
      
      formData.append('activity', new Blob([JSON.stringify(activityData)], { type: 'application/json' }));
      if (newActivity.imageFile) {
        formData.append('image', newActivity.imageFile);
      }

      const created = await createActivity(formData);
      setActivities(prev => [created, ...prev]);
      setNewActivity({ name: '', category: '', description: '', capacity: '', organizer: '', schedule: '', location: '', time: '', imageUrl: '', imageFile: null });
      setIsAddDialogOpen(false);
      setCreateError('');
    } catch (err) {
      console.error('Failed to create activity:', err);
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.error
        ?? 'Failed to create activity. Please check all fields and try again.';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  // ── Delete activity ──────────────────────────────────────────────
  const handleDeleteActivity = async (id) => {
    try {
      await apiDeleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  const initial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'A';
  const toggle = (key) => setSettingsToggles(p => ({ ...p, [key]: !p[key] }));

  // ── Sub-components removed from here ────────────────────────────────────────────────

  return (
    <SidebarProvider style={{ '--sidebar-width': '288px' }}>
      <div className="flex min-h-screen w-full" style={{ backgroundColor: BG }}>

        {/* ════ SIDEBAR ════ */}
        <Sidebar className="border-r z-50 flex flex-col"
          style={{ backgroundColor: SIDEBAR_BG, borderColor: SIDEBAR_BORDER }}>

          <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${SIDEBAR_BG}, #8BAEBF, #4A6572)` }} />

          <SidebarHeader>
            <div className="flex items-center gap-3.5 px-6 py-5 border-b" style={{ borderColor: SIDEBAR_BORDER }}>
              <BrandLogo size="sm" />
              <div>
                <p className="font-extrabold text-base tracking-tight" style={{ color: SIDEBAR_TEXT }}>Admin Panel</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: SIDEBAR_MID }}>Management Console</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 pt-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] px-6 mb-2"
                style={{ color: SIDEBAR_SUB }}>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 px-3">
                  {navItems.map(item => {
                    const isActive = activeView === item.key;
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton onClick={() => setActiveView(item.key)}
                          className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 cursor-pointer"
                          style={{
                            backgroundColor: isActive ? 'rgba(139,174,191,0.18)' : 'transparent',
                            color: isActive ? SIDEBAR_TEXT : 'rgba(184,212,220,0.65)',
                          }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              backgroundColor: isActive ? 'rgba(139,174,191,0.25)' : 'rgba(139,174,191,0.07)',
                              border: `1px solid ${isActive ? 'rgba(139,174,191,0.35)' : 'rgba(139,174,191,0.10)'}`,
                            }}>
                            <item.icon style={{ width: 18, height: 18, color: isActive ? '#8BAEBF' : '#4A6572' }} />
                          </div>
                          <span className={`font-${isActive ? 'bold' : 'medium'} text-sm`}>{item.label}</span>
                          {isActive && <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: '#8BAEBF' }} />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="p-4 border-t" style={{ borderColor: SIDEBAR_BORDER }}>
            <div className="rounded-2xl p-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
              style={{ backgroundColor: 'rgba(139,174,191,0.07)', border: '1px solid rgba(139,174,191,0.12)' }}
              onClick={() => setIsProfileOpen(true)}>
              <Avatar className="w-10 h-10 border-2 flex-shrink-0" style={{ borderColor: 'rgba(139,174,191,0.25)' }}>
                <AvatarImage src={userProfile.avatar || ''} />
                <AvatarFallback className="text-sm font-bold"
                  style={{ backgroundColor: 'rgba(139,174,191,0.20)', color: '#8BAEBF' }}>{initial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#E8F4F8' }}>{userProfile.name || 'Admin'}</p>
                <p className="text-xs mt-0.5" style={{ color: '#8BAEBF' }}>Administrator</p>
              </div>
              <MoreHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: '#4A6572' }} />
            </div>
          </div>
        </Sidebar>

        {/* ════ MAIN ════ */}
        <main className="flex-1 overflow-y-auto h-screen flex flex-col" style={{ backgroundColor: BG }}>

          {/* Header */}
          <header className="sticky top-0 z-20 px-6 py-3 border-b flex-shrink-0 shadow-sm"
            style={{ backgroundColor: CARD, borderColor: BORDER }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger style={{ color: TEXT_SUB }} />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold leading-none" style={{ color: TEXT }}>{viewTitles[activeView]}</h1>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: ACCENT_BG, color: ACCENT, border: `1px solid ${BORDER}` }}>Admin</span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_SUB }}>
                    Admin Dashboard › {viewTitles[activeView]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 rounded-xl px-3 h-8 border"
                  style={{ backgroundColor: BG, borderColor: BORDER }}>
                  <Search className="w-3.5 h-3.5" style={{ color: TEXT_SUB }} />
                  <input className="bg-transparent text-xs outline-none w-36" placeholder="Search…"
                    style={{ color: TEXT }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>

                <button onClick={() => { fetchActivities(); fetchStats(); }}
                  title="Refresh data"
                  className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: BORDER }}>
                  <RefreshCw className="w-4 h-4" style={{ color: TEXT_SUB }} />
                </button>

                <button className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: BORDER }}>
                  <Bell className="w-4 h-4" style={{ color: TEXT_SUB }} />
                </button>

                <div className="relative" ref={avatarMenuRef}>
                  <button onClick={() => setIsAvatarMenuOpen(p => !p)}
                    className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-50 transition-all">
                    <Avatar className="w-8 h-8 border" style={{ borderColor: BORDER }}>
                      <AvatarImage src={userProfile.avatar || ''} />
                      <AvatarFallback className="text-xs font-bold"
                        style={{ backgroundColor: ACCENT_BG, color: ACCENT }}>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold leading-none" style={{ color: TEXT }}>{userProfile.name || 'Admin'}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: TEXT_SUB }}>Administrator</p>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isAvatarMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-44 rounded-xl z-50 overflow-hidden border shadow-lg"
                        style={{ backgroundColor: CARD, borderColor: BORDER }}>
                        <button onClick={() => { setIsAvatarMenuOpen(false); setIsProfileOpen(true); }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: TEXT }}>
                          <User className="w-4 h-4" style={{ color: ACCENT }} /> Profile
                        </button>
                        <div className="h-px mx-3" style={{ backgroundColor: BORDER }} />
                        <button onClick={() => { setIsAvatarMenuOpen(false); logout(); }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-red-50 transition-colors text-red-500">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }} className="space-y-6">

              {/* ════ DASHBOARD ════ */}
              {activeView === 'dashboard' && (
                <div className="space-y-6">

                  {/* Welcome Banner */}
                  <Card>
                    <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1"
                          style={{ color: ACCENT }}>
                          <Activity className="w-3.5 h-3.5" /> Platform Overview
                        </p>
                        <h2 className="text-xl font-bold" style={{ color: TEXT }}>
                          Welcome back, {userProfile.name || 'Admin'}!
                        </h2>
                        <p className="text-sm mt-1" style={{ color: TEXT_SUB }}>
                          Here's what's happening on your platform today.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setActiveView('activities')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: ACCENT, color: '#fff' }}>
                          <Plus className="w-4 h-4" /> Add Activity
                        </button>
                        <button onClick={() => setActiveView('students')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border hover:bg-gray-50 transition-colors"
                          style={{ borderColor: BORDER, color: TEXT_SUB }}>
                          <Users className="w-4 h-4" /> Students
                        </button>
                      </div>
                    </div>
                  </Card>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => {
                      const accent = statAccents[i % statAccents.length];
                      return (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                          <div className="rounded-2xl border shadow-sm overflow-hidden"
                            style={{ backgroundColor: CARD, borderColor: BORDER }}>
                            <div className="h-1 w-full" style={{ backgroundColor: accent, opacity: 0.8 }} />
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEXT_SUB }}>
                                  {stat.label}
                                </p>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                  style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}25` }}>
                                  <stat.icon className="w-4 h-4" style={{ color: accent }} />
                                </div>
                              </div>
                              <p className="text-3xl font-bold tracking-tight" style={{ color: TEXT }}>
                                {statsLoading && stat.label !== 'Total Activities' && stat.label !== 'Capacity Used' ? '…' : stat.value}
                              </p>
                              {stat.sub && (
                                <p className="text-xs mt-1.5 font-medium" style={{ color: TEXT_SUB }}>{stat.sub}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-2 gap-5">
                    <Card>
                      <SectionHeader icon={TrendingUp} title="Student Enrollment" sub="Monthly active students"
                        action={<span className="text-xs px-2.5 py-1 rounded-full border font-medium"
                          style={{ color: ACCENT, borderColor: BORDER, backgroundColor: ACCENT_BG }}>Monthly</span>} />
                      <div className="p-5">
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={enrollmentData}>
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BORDER} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: TEXT_SUB, fontSize: 11 }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_SUB, fontSize: 11 }} dx={-8} />
                            <Tooltip contentStyle={chartStyle} cursor={{ stroke: BORDER }} />
                            <Area type="monotone" dataKey="students" stroke={ACCENT} strokeWidth={2}
                              fill="url(#areaGrad)" dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                              activeDot={{ r: 5, fill: ACCENT, stroke: '#fff' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card>
                      <SectionHeader icon={BarChart2} title="Activities by Category" sub="Distribution of all activities"
                        action={<span className="text-xs px-2.5 py-1 rounded-full border font-medium"
                          style={{ color: TEXT_SUB, borderColor: BORDER, backgroundColor: BG }}>All Time</span>} />
                      <div className="p-5">
                        {activitiesLoading ? <Spinner /> : (
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartsBarChart data={activityData} barSize={28}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BORDER} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: TEXT_SUB, fontSize: 11 }} dy={8} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_SUB, fontSize: 11 }} dx={-8} />
                              <Tooltip contentStyle={chartStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                              <Bar dataKey="count" fill={ACCENT} radius={[5, 5, 0, 0]} opacity={0.8} />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* ════ ACTIVITIES ════ */}
              {activeView === 'activities' && (
                <Card>
                  <SectionHeader icon={LayoutGrid} title="Manage Activities" sub="Add, edit, or remove extracurricular activities"
                    action={
                      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setCreateError(''); }}>
                        <DialogTrigger asChild>
                          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: ACCENT, color: '#fff' }}>
                            <Plus className="w-4 h-4" /> Add Activity
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add New Activity</DialogTitle>
                            <DialogDescription>Create a new extracurricular activity</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Activity Name</Label>
                                <Input placeholder="Tech Club" value={newActivity.name}
                                  onChange={e => setNewActivity(p => ({ ...p, name: e.target.value }))} />
                              </div>
                              <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={newActivity.category} onValueChange={v => setNewActivity(p => ({ ...p, category: v }))}>
                                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Sports">Sports</SelectItem>
                                    <SelectItem value="Academic">Academic</SelectItem>
                                    <SelectItem value="Creative">Creative</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input placeholder="Brief description" value={newActivity.description}
                                onChange={e => setNewActivity(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Capacity</Label>
                                <Input type="number" placeholder="50" value={newActivity.capacity}
                                  onChange={e => setNewActivity(p => ({ ...p, capacity: e.target.value }))} />
                              </div>
                              <div className="space-y-2">
                                <Label>Organizer</Label>
                                <Input placeholder="Department" value={newActivity.organizer}
                                  onChange={e => setNewActivity(p => ({ ...p, organizer: e.target.value }))} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Schedule</Label>
                                <Input placeholder="Every Friday" value={newActivity.schedule}
                                  onChange={e => setNewActivity(p => ({ ...p, schedule: e.target.value }))} />
                              </div>
                              <div className="space-y-2">
                                <Label>Time</Label>
                                <Input type="time" value={newActivity.time}
                                  onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Location</Label>
                                <Input placeholder="e.g. Room 101 / Main Hall / Online" value={newActivity.location}
                                  onChange={e => setNewActivity(p => ({ ...p, location: e.target.value }))} />
                              </div>
                              <div className="space-y-2">
                                <Label>Select Image File</Label>
                                <Input type="file" accept="image/*"
                                  onChange={e => setNewActivity(p => ({ ...p, imageFile: e.target.files[0] }))} />
                              </div>
                            </div>
                          </div>
                          {createError && (
                            <p className="text-xs text-red-500 px-1 -mt-2">{createError}</p>
                          )}
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAddDialogOpen(false)}
                              className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-50"
                              style={{ borderColor: BORDER, color: TEXT_SUB }}>Cancel</button>
                            <button onClick={handleCreateActivity} disabled={creating}
                              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                              style={{ backgroundColor: ACCENT, color: '#fff', opacity: creating ? 0.7 : 1 }}>
                              {creating
                                ? <><span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" /> Creating…</>
                                : 'Create Activity'}
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    }
                  />

                  {/* Search bar */}
                  <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: BORDER }}>
                    <div className="flex items-center gap-2 flex-1 rounded-xl px-3 h-8 border"
                      style={{ backgroundColor: BG, borderColor: BORDER }}>
                      <Search className="w-3.5 h-3.5" style={{ color: TEXT_SUB }} />
                      <input className="bg-transparent text-xs outline-none w-full" placeholder="Search activities…"
                        style={{ color: TEXT }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs hover:bg-gray-50"
                      style={{ borderColor: BORDER, color: TEXT_SUB }}>
                      <Filter className="w-3.5 h-3.5" /> Filter
                    </button>
                  </div>

                  {activitiesLoading ? <Spinner /> : activitiesError ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-red-500">{activitiesError}</p>
                      <button onClick={fetchActivities} className="mt-3 text-xs px-3 py-1.5 rounded-lg border"
                        style={{ borderColor: BORDER, color: TEXT_SUB }}>Retry</button>
                    </div>
                  ) : filteredActivities.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderColor: BORDER }}>
                          {['Activity', 'Category', 'Capacity', 'Organizer', 'Status', 'Actions'].map(h => (
                            <TableHead key={h} className="text-[11px] font-bold uppercase tracking-wider px-5"
                              style={{ color: TEXT_SUB }}>{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredActivities.map(a => (
                          <TableRow key={a.id} className="hover:bg-gray-50 transition-colors" style={{ borderColor: BORDER }}>
                            <TableCell className="px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: BORDER }}>
                                  {a.imageUrl
                                    ? <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
                                      <LayoutGrid className="w-4 h-4" style={{ color: ACCENT }} />
                                    </div>}
                                </div>
                                <span className="font-semibold text-sm" style={{ color: TEXT }}>{a.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                                style={{ color: ACCENT, borderColor: BORDER, backgroundColor: ACCENT_BG }}>
                                {a.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm" style={{ color: TEXT_SUB }}>{a.enrolled ?? 0}/{a.capacity}</span>
                                <div className="w-16 h-1.5 rounded-full overflow-hidden bg-gray-100">
                                  <div className="h-full rounded-full"
                                    style={{ width: `${Math.min(100, ((a.enrolled ?? 0) / (a.capacity || 1)) * 100)}%`, backgroundColor: ACCENT }} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm" style={{ color: TEXT_SUB }}>{a.organizer}</TableCell>
                            <TableCell>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${a.status === 'ACTIVE'
                                  ? 'text-emerald-700 border border-emerald-200 bg-emerald-50'
                                  : 'text-amber-700 border border-amber-200 bg-amber-50'
                                }`}>
                                {a.status ?? 'ACTIVE'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <button className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                                  style={{ borderColor: BORDER }}>
                                  <Edit className="w-3.5 h-3.5" style={{ color: TEXT_SUB }} />
                                </button>
                                <button onClick={() => handleDeleteActivity(a.id)}
                                  className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-red-50"
                                  style={{ borderColor: BORDER }}>
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState icon={LayoutGrid} title="No activities found"
                      sub={searchQuery ? 'Try a different search term' : 'Click "Add Activity" to create your first one'} />
                  )}
                </Card>
              )}

              {/* ════ STUDENTS ════ */}
              {activeView === 'students' && (
                <Card>
                  <SectionHeader icon={Users} title="Students" sub="All registered students"
                    action={
                      <button onClick={fetchStudents}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs hover:bg-gray-50"
                        style={{ borderColor: BORDER, color: TEXT_SUB }}>
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                    }
                  />
                  {studentsLoading ? <Spinner /> : studentsError ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-red-500">{studentsError}</p>
                      <button onClick={fetchStudents} className="mt-3 text-xs px-3 py-1.5 rounded-lg border"
                        style={{ borderColor: BORDER, color: TEXT_SUB }}>Retry</button>
                    </div>
                  ) : students.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderColor: BORDER }}>
                          {['Student', 'Email', 'Student ID', 'Activities Joined', 'Joined'].map(h => (
                            <TableHead key={h} className="text-[11px] font-bold uppercase tracking-wider px-5"
                              style={{ color: TEXT_SUB }}>{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(s => {
                          const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email;
                          const initials = name.slice(0, 2).toUpperCase();
                          return (
                            <TableRow key={s.id} className="hover:bg-gray-50 transition-colors" style={{ borderColor: BORDER }}>
                              <TableCell className="px-5">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8 border" style={{ borderColor: BORDER }}>
                                    <AvatarFallback className="text-xs font-bold"
                                      style={{ backgroundColor: ACCENT_BG, color: ACCENT }}>{initials}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-semibold text-sm" style={{ color: TEXT }}>{name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm" style={{ color: TEXT_SUB }}>{s.email}</TableCell>
                              <TableCell className="text-sm font-mono" style={{ color: TEXT_SUB }}>{s.studentId || '—'}</TableCell>
                              <TableCell>
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
                                  style={{ color: ACCENT, borderColor: BORDER, backgroundColor: ACCENT_BG }}>
                                  {s.activitiesJoined ?? 0}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs" style={{ color: TEXT_SUB }}>
                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState icon={Users} title="No students yet" sub="Students will appear here once they register" />
                  )}
                </Card>
              )}

              {activeView === 'events' && (
                <Card>
                  <SectionHeader icon={Calendar} title="Events" sub="Manage upcoming campus events" />
                  <EmptyState icon={Calendar} title="Event management coming soon" sub="This section is under development" />
                </Card>
              )}

              {activeView === 'settings' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: TEXT }}>Platform Settings</h2>
                    <p className="text-sm mt-0.5" style={{ color: TEXT_SUB }}>Manage preferences and system configurations.</p>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <Card>
                      <SectionHeader icon={Bell} title="Notifications" sub="Control how you receive alerts" />
                      <div className="p-4 space-y-3">
                        <Toggle keyName="emailNotifications" label="Email Notifications" desc="Receive daily summaries" settingsToggles={settingsToggles} toggle={toggle} />
                        <Toggle keyName="pushNotifications" label="Push Notifications" desc="Real-time alerts on dashboard" settingsToggles={settingsToggles} toggle={toggle} />
                      </div>
                    </Card>
                    <Card>
                      <SectionHeader icon={Shield} title="Security" sub="Password and authentication" />
                      <div className="p-4 space-y-3">
                        <Toggle keyName="twoFactor" label="Two-Factor Auth" desc="Require code on login" activeColor="#34d399" settingsToggles={settingsToggles} toggle={toggle} />
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm hover:bg-gray-50"
                          style={{ borderColor: BORDER, color: TEXT_SUB }}>
                          <Key className="w-4 h-4" style={{ color: ACCENT }} /> Change Admin Password
                        </button>
                      </div>
                    </Card>
                    <Card className="lg:col-span-2">
                      <SectionHeader icon={Settings} title="System Functions" sub="Advanced dashboard controls" />
                      <div className="p-4 grid md:grid-cols-2 gap-3">
                        <Toggle keyName="autoApprove" label="Auto-Approve Activities" desc="Skip manual admin review" activeColor="#f59e0b" settingsToggles={settingsToggles} toggle={toggle} />
                        <button className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm hover:bg-gray-50 text-left"
                          style={{ borderColor: BORDER, color: TEXT_SUB }}>
                          <Download className="w-4 h-4" style={{ color: ACCENT }} />
                          <div>
                            <p className="font-semibold text-sm" style={{ color: TEXT }}>Export All Data</p>
                            <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>Download CSV of users and events</p>
                          </div>
                        </button>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </main>
      </div>

      <ProfileDialog isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}
        user={userProfile} onUpdateProfile={setUserProfile} />
    </SidebarProvider>
  );
}
