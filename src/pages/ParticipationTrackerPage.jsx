import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger
} from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Home, LayoutGrid, ClipboardList, Bell, User, LogOut,
  ChevronRight, MoreHorizontal, Calendar, X, Clock, MapPin
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { getMyParticipations, unenrollActivity } from '@/api/participationApi';

// ── Palette ───────────────────────────────────────────────────────
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

const statAccents = ['#34d399', '#60a5fa', '#f59e0b'];

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/student/dashboard' },
  { label: 'Activities', icon: LayoutGrid, to: '/activities' },
  { label: 'My Participation', icon: ClipboardList, to: '/student/participation', active: true },
  { label: 'Notifications', icon: Bell, to: '/student/notifications' },
];

export default function ParticipationTrackerPage() {
  const { user, logout } = useAuth();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [participation, setParticipation] = useState([]);
  const [loading, setLoading] = useState(true);
  const avatarMenuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) setIsAvatarMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    getMyParticipations()
      .then(setParticipation)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Student';
  const userInitial = userName.charAt(0).toUpperCase() || 'S';

  const totalActivities = participation.length;
  const activeCount = participation.filter(p => p.status === 'ACTIVE').length;
  const completedCount = participation.filter(p => p.status === 'COMPLETED').length;

  const statCards = [
    { label: 'Total Activities', icon: LayoutGrid, value: totalActivities, sub: `${activeCount} active · ${completedCount} completed` },
    { label: 'Active Now', icon: Calendar, value: activeCount, sub: 'Currently enrolled' },
    { label: 'Completed', icon: Bell, value: completedCount, sub: 'Finished activities' },
  ];

  const handleUnenroll = async (activityId) => {
    try {
      await unenrollActivity(activityId);
      setParticipation(prev => prev.filter(p => p.activityId !== activityId));
    } catch (err) {
      console.error('Failed to unenroll:', err);
    }
  };

  const SectionCard = ({ children }) => (
    <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
      {children}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, sub }) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: BORDER }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
        <Icon className="w-4 h-4" style={{ color: ACCENT }} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: TEXT }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ backgroundColor: BG }}>

        {/* ════ SIDEBAR (dark) ════ */}
        <Sidebar className="border-r z-50 flex flex-col" style={{ backgroundColor: SIDEBAR_BG, borderColor: SIDEBAR_BORDER, width: 240 }}>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: SIDEBAR_BORDER }}>
              <BrandLogo size="sm" />
              <div>
                <p className="font-bold text-sm" style={{ color: SIDEBAR_TEXT }}>Participate+</p>
                <p className="text-[11px] mt-0.5" style={{ color: SIDEBAR_SUB }}>Student Portal</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 pt-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest px-5 mb-1" style={{ color: SIDEBAR_SUB }}>NAVIGATION</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5 px-3">
                  {navItems.map(item => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link to={item.to} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                          style={{ backgroundColor: item.active ? 'rgba(139,174,191,0.15)' : 'transparent', color: item.active ? SIDEBAR_TEXT : 'rgba(184,212,220,0.7)', borderLeft: item.active ? `3px solid ${SIDEBAR_MID}` : '3px solid transparent' }}>
                          <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: item.active ? SIDEBAR_MID : SIDEBAR_SUB }} />
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.active && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: SIDEBAR_SUB }} />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-3 border-t" style={{ borderColor: SIDEBAR_BORDER }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <Avatar className="w-8 h-8 border flex-shrink-0" style={{ borderColor: SIDEBAR_BORDER }}>
                <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: 'rgba(139,174,191,0.15)', color: SIDEBAR_MID }}>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: SIDEBAR_TEXT }}>{userName}</p>
                <p className="text-[10px]" style={{ color: SIDEBAR_SUB }}>Student Account</p>
              </div>
              <MoreHorizontal className="w-3.5 h-3.5" style={{ color: SIDEBAR_SUB }} />
            </div>
          </div>
        </Sidebar>

        {/* ════ MAIN (light) ════ */}
        <main className="flex-1 overflow-y-auto h-screen flex flex-col" style={{ backgroundColor: BG }}>
          <header className="sticky top-0 z-20 px-6 py-3 border-b flex-shrink-0 shadow-sm" style={{ backgroundColor: CARD, borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger style={{ color: TEXT_SUB }} />
                <div>
                  <h1 className="text-base font-bold leading-none" style={{ color: TEXT }}>My Participation</h1>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_SUB }}>Track your activities and events</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-gray-50" style={{ borderColor: BORDER }}>
                  <Bell className="w-4 h-4" style={{ color: TEXT_SUB }} />
                </button>
                <div className="relative" ref={avatarMenuRef}>
                  <button onClick={() => setIsAvatarMenuOpen(p => !p)} className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-50 transition-all">
                    <Avatar className="w-8 h-8 border" style={{ borderColor: BORDER }}>
                      <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: ACCENT_BG, color: ACCENT }}>{userInitial}</AvatarFallback>
                    </Avatar>
                  </button>
                  <AnimatePresence>
                    {isAvatarMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-44 rounded-xl z-50 overflow-hidden border shadow-lg" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                        <button onClick={() => setIsAvatarMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50" style={{ color: TEXT }}>
                          <User className="w-4 h-4" style={{ color: ACCENT }} /> Profile
                        </button>
                        <div className="h-px mx-3" style={{ backgroundColor: BORDER }} />
                        <button onClick={() => { setIsAvatarMenuOpen(false); logout(); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-red-50 text-red-500">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statCards.map((s, i) => {
                  const accent = statAccents[i];
                  return (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                        <div className="h-1 w-full" style={{ backgroundColor: accent, opacity: 0.8 }} />
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEXT_SUB }}>{s.label}</p>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}25` }}>
                              <s.icon className="w-4 h-4" style={{ color: accent }} />
                            </div>
                          </div>
                          <p className="text-3xl font-bold" style={{ color: TEXT }}>{s.value}</p>
                          <p className="text-xs mt-2" style={{ color: TEXT_SUB }}>{s.sub}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Activities Table */}
              <SectionCard>
                <SectionHeader icon={ClipboardList} title="My Activities" sub="All registered activities and participation" />
                {loading ? (
                  <div className="flex items-center justify-center py-14">
                    <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
                  </div>
                ) : participation.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: BORDER }}>
                        {['Activity', 'Joined', 'Status', 'Actions'].map(h => (
                          <TableHead key={h} className="text-[11px] font-bold uppercase tracking-wider px-5" style={{ color: TEXT_SUB }}>{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participation.map((item, i) => (
                        <TableRow key={item.id ?? i} className="hover:bg-gray-50 transition-colors"
                          style={{ borderColor: BORDER, backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                          <TableCell className="font-semibold px-5 text-sm" style={{ color: TEXT }}>{item.activityName}</TableCell>
                          <TableCell className="text-sm" style={{ color: TEXT_SUB }}>
                            {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            {item.status === 'ACTIVE'
                              ? <span className="text-xs px-2.5 py-0.5 rounded-full font-medium text-emerald-700 border border-emerald-200 bg-emerald-50">Active</span>
                              : <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border border-gray-200 bg-gray-50 text-gray-600">{item.status || 'Enrolled'}</span>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link to={`/activity/${item.activityId}`} className="px-3 py-1 rounded-lg text-xs font-medium border hover:bg-gray-50 transition-colors" style={{ borderColor: BORDER, color: TEXT_SUB }}>View</Link>
                              {item.status === 'ACTIVE' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-red-50" style={{ borderColor: BORDER }}>
                                      <X className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Cancel Registration</DialogTitle>
                                      <DialogDescription>Are you sure you want to cancel <strong>{item.activityName}</strong>?</DialogDescription>
                                    </DialogHeader>
                                    <div className="flex gap-3 justify-end mt-4">
                                      <button className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-50" style={{ borderColor: BORDER, color: TEXT_SUB }}>Keep</button>
                                      <button onClick={() => handleUnenroll(item.activityId)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600">Cancel Registration</button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center py-14 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                      <ClipboardList className="w-6 h-6" style={{ color: ACCENT_DEEP }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>No activities yet</p>
                    <p className="text-xs mt-1.5 mb-4" style={{ color: TEXT_SUB }}>Register for activities to see them here</p>
                    <Link to="/activities" className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: ACCENT, color: '#fff' }}>Browse Activities</Link>
                  </div>
                )}
              </SectionCard>

              {/* Upcoming Events */}
              <SectionCard>
                <SectionHeader icon={Calendar} title="Upcoming Events" sub="Your scheduled activity events" />
                <div className="p-4">
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                      <Calendar className="w-6 h-6" style={{ color: ACCENT_DEEP }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>No upcoming events</p>
                    <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>Event scheduling is coming soon</p>
                  </div>
                </div>
              </SectionCard>

            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
