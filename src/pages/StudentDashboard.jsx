import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger
} from '@/components/ui/sidebar';
import {
  Home, LayoutGrid, ClipboardList, Bell, User, LogOut,
  ChevronRight, MoreHorizontal, Calendar, MapPin, Clock,
  TrendingUp, Activity, Star
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { getMyParticipations, getMyStats } from '@/api/participationApi';
import { ProfileDialog } from '@/components/ui/ProfileDialog';
import { AiChatWidget } from '@/components/ui/AiChatWidget';

// ── Palette: dark sidebar + white content + Silent Waters accents ──
const SIDEBAR_BG = '#1C2B33';
const SIDEBAR_TEXT = '#E8F4F8';
const SIDEBAR_SUB = '#4A6572';
const SIDEBAR_MID = '#8BAEBF';
const SIDEBAR_BORDER = 'rgba(139,174,191,0.15)';

const BG = '#EEF2F5';
const CARD_BG = '#FFFFFF';
const BORDER = 'rgba(139,174,191,0.22)';
const ACCENT = '#8BAEBF';
const ACCENT_DEEP = '#4A6572';
const ACCENT_BG = 'rgba(139,174,191,0.10)';
const TEXT = '#1C2B33';
const TEXT_SUB = '#4A6572';

const statAccents = ['#34d399', '#60a5fa', '#f59e0b', '#a78bfa'];

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/student/dashboard', active: true },
  { label: 'Activities', icon: LayoutGrid, to: '/activities' },
  { label: 'My Participation', icon: ClipboardList, to: '/student/participation' },
  { label: 'Notifications', icon: Bell, to: '/student/notifications' },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);
  const [participations, setParticipations] = useState([]);
  const [apiStats, setApiStats] = useState({ totalActivities: 0, activeActivities: 0, averageScore: 0 });
  const [userProfile, setUserProfile] = useState({
    role: 'student', name: '', email: '', phone: '',
    location: '', bio: '', avatar: '', joinedDate: 'Just now',
  });

  useEffect(() => {
    const h = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target))
        setIsAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (user) {
      setUserProfile(p => ({
        ...p,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
      }));
      getMyParticipations().then(setParticipations).catch(() => {});
      getMyStats().then(setApiStats).catch(() => {});
    }
  }, [user]);

  const stats = [
    { label: 'Activities Joined', icon: LayoutGrid, value: apiStats.totalActivities, sub: `${apiStats.activeActivities} currently active` },
    { label: 'Active Now', icon: Activity, value: apiStats.activeActivities, sub: 'This semester' },
    { label: 'Avg Score', icon: Star, value: apiStats.averageScore ? Number(apiStats.averageScore).toFixed(1) : '—', sub: 'Across all activities' },
    { label: 'Notifications', icon: Bell, value: '—', sub: 'Check notifications tab' },
  ];

  const initial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'S';

  const Card = ({ children, className = '', style = {} }) => (
    <div className={`rounded-2xl border shadow-sm ${className}`}
      style={{ backgroundColor: CARD_BG, borderColor: BORDER, ...style }}>
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

  return (
    <SidebarProvider style={{ '--sidebar-width': '288px' }}>
      <div className="flex min-h-screen w-full" style={{ backgroundColor: BG }}>

        {/* ════ SIDEBAR (dark, premium big) ════ */}
        <Sidebar className="border-r z-50 flex flex-col"
          style={{ backgroundColor: SIDEBAR_BG, borderColor: SIDEBAR_BORDER }}>

          {/* Teal accent strip */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${SIDEBAR_BG}, #8BAEBF, #4A6572)` }} />

          {/* Brand */}
          <SidebarHeader>
            <div className="flex items-center gap-3.5 px-6 py-5 border-b" style={{ borderColor: SIDEBAR_BORDER }}>
              <BrandLogo size="sm" />
              <div>
                <p className="font-extrabold text-base tracking-tight" style={{ color: SIDEBAR_TEXT }}>Participate+</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: SIDEBAR_MID }}>Student Portal</p>
              </div>
            </div>
          </SidebarHeader>

          {/* Nav */}
          <SidebarContent className="flex-1 pt-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] px-6 mb-2"
                style={{ color: SIDEBAR_SUB }}>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 px-3">
                  {navItems.map(item => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link to={item.to}
                          className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200"
                          style={{
                            backgroundColor: item.active ? 'rgba(139,174,191,0.18)' : 'transparent',
                            color: item.active ? SIDEBAR_TEXT : 'rgba(184,212,220,0.65)',
                          }}>
                          {/* Icon box */}
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              backgroundColor: item.active ? 'rgba(139,174,191,0.25)' : 'rgba(139,174,191,0.07)',
                              border: `1px solid ${item.active ? 'rgba(139,174,191,0.35)' : 'rgba(139,174,191,0.10)'}`,
                            }}>
                            <item.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: item.active ? '#8BAEBF' : '#4A6572' }} />
                          </div>
                          <span className={`font-${item.active ? 'bold' : 'medium'} text-sm`}>{item.label}</span>
                          {item.active && (
                            <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: '#8BAEBF' }} />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Profile strip - bigger & premium */}
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
                <p className="text-sm font-bold truncate" style={{ color: '#E8F4F8' }}>{userProfile.name || 'Student'}</p>
                <p className="text-xs mt-0.5" style={{ color: '#8BAEBF' }}>Student Account</p>
              </div>
              <MoreHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: '#4A6572' }} />
            </div>
          </div>
        </Sidebar>

        {/* ════ MAIN (white/light) ════ */}
        <main className="flex-1 overflow-y-auto h-screen flex flex-col" style={{ backgroundColor: BG }}>

          {/* Header — white */}
          <header className="sticky top-0 z-20 px-6 py-3 border-b flex-shrink-0 shadow-sm"
            style={{ backgroundColor: CARD_BG, borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger style={{ color: TEXT_SUB }} />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold leading-none" style={{ color: TEXT }}>Dashboard</h1>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: ACCENT_BG, color: ACCENT, border: `1px solid ${BORDER}` }}>Student</span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_SUB }}>
                    Welcome back{userProfile.name ? `, ${userProfile.name}` : ''}!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/student/notifications">
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: BORDER }}>
                    <Bell className="w-4 h-4" style={{ color: TEXT_SUB }} />
                  </button>
                </Link>

                <div className="relative" ref={avatarMenuRef}>
                  <button onClick={() => setIsAvatarMenuOpen(p => !p)}
                    className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-50 transition-all">
                    <Avatar className="w-8 h-8 border" style={{ borderColor: BORDER }}>
                      <AvatarImage src={userProfile.avatar || ''} />
                      <AvatarFallback className="text-xs font-bold"
                        style={{ backgroundColor: ACCENT_BG, color: ACCENT }}>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold leading-none" style={{ color: TEXT }}>{userProfile.name || 'Student'}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: TEXT_SUB }}>Student</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isAvatarMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-44 rounded-xl z-50 overflow-hidden border shadow-lg"
                        style={{ backgroundColor: CARD_BG, borderColor: BORDER }}>
                        <button
                          onClick={() => { setIsAvatarMenuOpen(false); setIsProfileOpen(true); }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: TEXT }}>
                          <User className="w-4 h-4" style={{ color: ACCENT }} /> Profile
                        </button>
                        <div className="h-px mx-3" style={{ backgroundColor: BORDER }} />
                        <button
                          onClick={() => { setIsAvatarMenuOpen(false); logout(); }}
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

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }} className="space-y-6">

              {/* Greeting Banner */}
              <Card>
                <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1"
                      style={{ color: ACCENT }}>
                      <Activity className="w-3.5 h-3.5" /> Student Portal
                    </p>
                    <h2 className="text-xl font-bold" style={{ color: TEXT }}>
                      {userProfile.name ? `Hello, ${userProfile.name}!` : 'Welcome to Participate+!'}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: TEXT_SUB }}>
                      Explore activities, track your participation, and stay updated.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/activities"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: ACCENT, color: '#fff' }}>
                      <LayoutGrid className="w-4 h-4" /> Browse Activities
                    </Link>
                    <Link to="/student/participation"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border hover:bg-gray-50 transition-colors"
                      style={{ borderColor: BORDER, color: TEXT_SUB }}>
                      <ClipboardList className="w-4 h-4" /> My Participation
                    </Link>
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
                        style={{ backgroundColor: CARD_BG, borderColor: BORDER }}>
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
                          <p className="text-3xl font-bold tracking-tight" style={{ color: TEXT }}>{stat.value}</p>
                          {stat.sub && <p className="text-xs mt-2" style={{ color: TEXT_SUB }}>{stat.sub}</p>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Activities + Events */}
              <div className="grid lg:grid-cols-3 gap-5">

                {/* Registered Activities */}
                <div className="lg:col-span-2">
                  <Card>
                    <SectionHeader icon={LayoutGrid} title="Registered Activities" sub="Activities you've joined"
                      action={
                        <Link to="/activities"
                          className="text-xs px-3 py-1.5 rounded-xl border hover:bg-gray-50 font-semibold flex items-center gap-1"
                          style={{ borderColor: BORDER, color: ACCENT }}>
                          Browse <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      } />
                    <div className="p-4 space-y-2">
                      {participations.length > 0 ? participations.map((p, i) => (
                        <div key={i}
                          className="flex items-center gap-4 p-3 rounded-xl border hover:bg-gray-50 transition-colors"
                          style={{ borderColor: BORDER }}>
                          <div className="w-10 h-10 rounded-xl flex-shrink-0 border overflow-hidden"
                            style={{ borderColor: BORDER }}>
                            {p.activityImageUrl ? (
                              <img src={p.activityImageUrl} alt={p.activityName}
                                className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
                                <LayoutGrid className="w-4 h-4" style={{ color: ACCENT }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: TEXT }}>{p.activityName}</p>
                            <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: TEXT_SUB }}>
                              <Calendar className="w-3 h-3" /> {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : 'Recently joined'}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border
                            ${p.status === 'ACTIVE'
                              ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                              : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                            {p.status === 'ACTIVE' ? 'Active' : p.status}
                          </span>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center py-12 text-center">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                            <LayoutGrid className="w-5 h-5" style={{ color: ACCENT_DEEP }} />
                          </div>
                          <p className="text-sm font-semibold" style={{ color: TEXT }}>No activities yet</p>
                          <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>Join your first activity to get started</p>
                          <Link to="/activities"
                            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold"
                            style={{ backgroundColor: ACCENT, color: '#fff' }}>
                            Browse Activities
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Upcoming Events */}
                <div>
                  <Card>
                    <SectionHeader icon={Calendar} title="Upcoming Events" sub="Your schedule" />
                    <div className="p-4 space-y-2">
                      {[].length > 0 ? [].map((event, i) => (
                        <div key={i}
                          className="flex items-start gap-3 p-3 rounded-xl border hover:bg-gray-50 transition-colors"
                          style={{ borderColor: BORDER }}>
                          {/* Date chip */}
                          <div className="flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center border"
                            style={{ backgroundColor: ACCENT_BG, borderColor: BORDER }}>
                            {(() => {
                              const [day, mon] = (event.date || '-- ---').split(' ');
                              return (
                                <>
                                  <span className="text-sm font-bold leading-none" style={{ color: ACCENT }}>
                                    {day}
                                  </span>
                                  <span className="text-[9px] uppercase font-bold leading-none mt-0.5" style={{ color: TEXT_SUB }}>
                                    {mon}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: TEXT }}>{event.name}</p>
                            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: TEXT_SUB }}>
                              <Clock className="w-3 h-3" /> {event.time}
                            </p>
                            {event.location && (
                              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: TEXT_SUB }}>
                                <MapPin className="w-3 h-3" /> {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center py-10 text-center">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                            <Calendar className="w-5 h-5" style={{ color: ACCENT_DEEP }} />
                          </div>
                          <p className="text-sm font-semibold" style={{ color: TEXT }}>No upcoming events</p>
                          <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>Register for activities to see events</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Quick Stats Strip */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: TrendingUp, label: 'Participation Rate', value: '—', color: '#34d399', note: 'Join activities to see' },
                  { icon: Star, label: 'Achievements Earned', value: '0', color: '#f59e0b', note: 'Complete activities' },
                  { icon: Calendar, label: 'Events This Month', value: participations.length, color: '#60a5fa', note: 'Based on enrollments' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border shadow-sm overflow-hidden"
                    style={{ backgroundColor: CARD_BG, borderColor: BORDER }}>
                    <div className="h-1" style={{ backgroundColor: s.color, opacity: 0.7 }} />
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: TEXT }}>{s.value}</p>
                        <p className="text-xs font-semibold" style={{ color: TEXT_SUB }}>{s.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(74,101,114,0.6)' }}>{s.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </main>
      </div>

      <ProfileDialog isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}
        user={userProfile} onUpdateProfile={setUserProfile} />

      {/* AI Chat Widget — floating bottom-right */}
      <AiChatWidget />
    </SidebarProvider>
  );
}
