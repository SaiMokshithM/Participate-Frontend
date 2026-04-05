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
    ChevronRight, MoreHorizontal, CheckCheck, Trash2, Calendar, Trophy, AlertCircle, Info, Star
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import {
    getNotifications,
    markNotificationRead,
    markAllRead as markAllReadApi,
    deleteNotification,
} from '@/api/notificationsApi';

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
const ACCENT_BG = 'rgba(139,174,191,0.10)';
const TEXT = '#1C2B33';
const TEXT_SUB = '#4A6572';

// Keys match backend types (uppercase from entity)
const typeConfig = {
    SUCCESS:  { icon: Trophy,       color: '#34d399', label: 'Success' },
    INFO:     { icon: Info,         color: ACCENT,    label: 'Info' },
    ALERT:    { icon: AlertCircle,  color: '#f59e0b', label: 'Alert' },
    EVENT:    { icon: Calendar,     color: '#60a5fa', label: 'Event' },
    REMINDER: { icon: Star,         color: '#a78bfa', label: 'Reminder' },
    // Fallback for any other type
    DEFAULT:  { icon: Bell,         color: ACCENT,    label: 'Notice' },
};

const filters = ['All', 'Unread', 'Events', 'Alerts', 'Reminders'];

// ── Notifications loaded from API ────────────────────────────────

const navItems = [
    { label: 'Dashboard', icon: Home, to: '/student/dashboard' },
    { label: 'Activities', icon: LayoutGrid, to: '/activities' },
    { label: 'My Participation', icon: ClipboardList, to: '/student/participation' },
    { label: 'Notifications', icon: Bell, to: '/student/notifications', active: true },
];

export default function NotificationsPage() {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isAvatarMenuOpen, setAvatarMenu] = useState(false);
    const avatarMenuRef = useRef(null);

    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Student';
    const userInitial = userName.charAt(0).toUpperCase() || 'S';

    useEffect(() => {
        const h = (e) => { if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) setAvatarMenu(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        getNotifications()
            .then(data => setNotifications(Array.isArray(data) ? data : []))
            .catch(() => setNotifications([]))
            .finally(() => setLoading(false));
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllRead = async () => {
        try { await markAllReadApi(); } catch {}
        setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    };

    const markRead = async (id) => {
        try { await markNotificationRead(id); } catch {}
        setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    };

    const dismiss = async (id) => {
        try { await deleteNotification(id); } catch {}
        setNotifications(n => n.filter(x => x.id !== id));
    };

    const filtered = notifications.filter(n => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Unread') return !n.isRead;
        if (activeFilter === 'Events') return n.type === 'EVENT';
        if (activeFilter === 'Alerts') return n.type === 'ALERT';
        if (activeFilter === 'Reminders') return n.type === 'REMINDER';
        return true;
    });

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
                                                    {item.label === 'Notifications' && unreadCount > 0 && (
                                                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: SIDEBAR_MID, color: SIDEBAR_BG }}>{unreadCount}</span>
                                                    )}
                                                    {item.active && !unreadCount && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: SIDEBAR_SUB }} />}
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
                                    <h1 className="text-base font-bold leading-none" style={{ color: TEXT }}>
                                        Notifications {unreadCount > 0 && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: ACCENT, color: '#fff' }}>{unreadCount} new</span>}
                                    </h1>
                                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_SUB }}>Stay up to date with your activities</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border hover:bg-gray-50" style={{ borderColor: BORDER, color: TEXT_SUB }}>
                                        <CheckCheck className="w-3.5 h-3.5" style={{ color: ACCENT }} /> Mark all read
                                    </button>
                                )}
                                <div className="relative" ref={avatarMenuRef}>
                                    <button onClick={() => setAvatarMenu(p => !p)} className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-50">
                                        <Avatar className="w-8 h-8 border" style={{ borderColor: BORDER }}>
                                            <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: ACCENT_BG, color: ACCENT }}>{userInitial}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                    <AnimatePresence>
                                        {isAvatarMenuOpen && (
                                            <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-44 rounded-xl z-50 overflow-hidden border shadow-lg" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                                                <button onClick={() => setAvatarMenu(false)} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50" style={{ color: TEXT }}>
                                                    <User className="w-4 h-4" style={{ color: ACCENT }} /> Profile
                                                </button>
                                                <div className="h-px mx-3" style={{ backgroundColor: BORDER }} />
                                                <button onClick={() => { setAvatarMenu(false); logout(); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-red-50 text-red-500">
                                                    <LogOut className="w-4 h-4" /> Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 p-6 max-w-3xl w-full mx-auto space-y-5">
                        {/* Filter tabs */}
                        <div className="flex items-center gap-1 p-1 rounded-xl border shadow-sm" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                            {filters.map(f => (
                                <button key={f} onClick={() => setActiveFilter(f)}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style={{ backgroundColor: activeFilter === f ? ACCENT_BG : 'transparent', color: activeFilter === f ? TEXT : TEXT_SUB, border: activeFilter === f ? `1px solid ${BORDER}` : '1px solid transparent' }}>
                                    {f}
                                    {f === 'Unread' && unreadCount > 0 && (
                                        <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: ACCENT, color: '#fff' }}>{unreadCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Notifications list */}
                        <div className="space-y-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
                                </div>
                            ) : (
                            <AnimatePresence mode="popLayout">
                                {filtered.length > 0 ? filtered.map((notif, index) => {
                                    const cfg = typeConfig[notif.type] || typeConfig.DEFAULT;
                                    const IconComp = cfg.icon;
                                    const timeStr = notif.createdAt
                                        ? new Date(notif.createdAt).toLocaleString()
                                        : '';
                                    return (
                                        <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} transition={{ delay: index * 0.04 }}>
                                            <div className="flex items-start gap-4 p-4 rounded-2xl border shadow-sm transition-all duration-200 group bg-white"
                                                style={{ borderColor: notif.isRead ? BORDER : `${cfg.color}40`, borderLeft: `3px solid ${notif.isRead ? BORDER : cfg.color}` }}>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
                                                    <IconComp className="w-4 h-4" style={{ color: cfg.color }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-sm" style={{ color: TEXT }}>{notif.title}</p>
                                                            {!notif.isRead && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT }} />}
                                                        </div>
                                                        <p className="text-[11px] flex-shrink-0" style={{ color: TEXT_SUB }}>{timeStr}</p>
                                                    </div>
                                                    <p className="text-xs leading-relaxed mb-2" style={{ color: TEXT_SUB }}>{notif.message}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
                                                            style={{ color: cfg.color, borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}10` }}>{cfg.label}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notif.isRead && (
                                                        <button onClick={() => markRead(notif.id)} className="w-7 h-7 rounded-lg flex items-center justify-center border hover:bg-gray-50" style={{ borderColor: BORDER }} title="Mark as read">
                                                            <CheckCheck className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => dismiss(notif.id)} className="w-7 h-7 rounded-lg flex items-center justify-center border hover:bg-red-50" style={{ borderColor: BORDER }} title="Dismiss">
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                }) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                                            <Bell className="w-7 h-7" style={{ color: TEXT_SUB }} />
                                        </div>
                                        <p className="font-semibold text-sm" style={{ color: TEXT }}>No notifications</p>
                                        <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>
                                            {activeFilter === 'All' ? "You're all caught up!" : `No ${activeFilter.toLowerCase()} notifications`}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
