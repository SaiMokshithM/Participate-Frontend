import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, Users, MapPin, LayoutGrid, Home, ClipboardList, Bell, ChevronRight, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useActivities } from '@/hooks/useActivities';
import { enrollActivity } from '@/api/participationApi';

// ── Palette: light bg + white cards + Silent Waters accents ──────
const BG = '#EEF2F5';
const CARD = '#FFFFFF';
const BORDER = 'rgba(139,174,191,0.22)';
const ACCENT = '#8BAEBF';
const ACCENT_DEEP = '#4A6572';
const ACCENT_BG = 'rgba(139,174,191,0.10)';
const TEXT = '#1C2B33';
const TEXT_SUB = '#4A6572';

const HEADER_BG = '#1C2B33';   // dark header to match sidebar
const HEADER_TEXT = '#E8F4F8';
const HEADER_SUB = '#4A6572';
const HEADER_MID = '#8BAEBF';
const HEADER_BORDER = 'rgba(139,174,191,0.15)';

const categoryColors = {
  Technology: { bg: 'rgba(96,165,250,0.10)', text: '#2563eb', border: 'rgba(96,165,250,0.3)' },
  Sports: { bg: 'rgba(52,211,153,0.10)', text: '#059669', border: 'rgba(52,211,153,0.3)' },
  Academic: { bg: 'rgba(251,191,36,0.10)', text: '#b45309', border: 'rgba(251,191,36,0.35)' },
  Creative: { bg: 'rgba(167,139,250,0.10)', text: '#7c3aed', border: 'rgba(167,139,250,0.3)' },
  Business: { bg: 'rgba(251,146,60,0.10)', text: '#c2410c', border: 'rgba(251,146,60,0.3)' },
};

const navLinks = [
  { label: 'Dashboard', icon: Home, to: '/student/dashboard' },
  { label: 'Activities', icon: LayoutGrid, to: '/activities', active: true },
  { label: 'My Participation', icon: ClipboardList, to: '/student/participation' },
  { label: 'Notifications', icon: Bell, to: '/student/notifications' },
];

export default function ActivitiesPage() {
  const { activities, loading } = useActivities();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [enrolling, setEnrolling] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set(
    activities.filter(a => a.enrolledByCurrentUser).map(a => a.id)
  ));

  const handleEnroll = async (activityId) => {
    setEnrolling(activityId);
    try {
      await enrollActivity(activityId);
      setEnrolledIds(prev => new Set([...prev, activityId]));
    } catch (err) {
      console.error('Enrollment failed:', err);
    } finally {
      setEnrolling(null);
    }
  };

  const filteredActivities = activities.filter(a => {
    const matchSearch = (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = category === 'all' || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>

      {/* ── Header (dark, matches sidebar) ── */}
      <header className="sticky top-0 z-50 border-b px-6 py-3" style={{ backgroundColor: HEADER_BG, borderColor: HEADER_BORDER }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <div>
              <span className="font-bold text-sm" style={{ color: HEADER_TEXT }}>Participate+</span>
              <span className="hidden sm:inline ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: 'rgba(139,174,191,0.15)', color: HEADER_MID }}>Student Portal</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.label} to={link.to}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{
                  backgroundColor: link.active ? 'rgba(139,174,191,0.15)' : 'transparent',
                  color: link.active ? HEADER_TEXT : 'rgba(184,212,220,0.7)',
                  borderLeft: link.active ? `2px solid ${HEADER_MID}` : '2px solid transparent',
                }}>
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            ))}
          </nav>

          <Link to="/student/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors"
            style={{ borderColor: HEADER_BORDER, color: HEADER_TEXT }}>
            Dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center space-y-3">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
            style={{ color: ACCENT, borderColor: BORDER, backgroundColor: ACCENT_BG }}>
            Campus Activities
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: TEXT }}>
            Explore <span style={{ color: ACCENT }}>Activities</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: TEXT_SUB }}>
            Find clubs, sports, and events that match your campus interests.
          </p>
        </motion.div>

        {/* ── Search + Filter ── */}
        <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <div className="flex items-center gap-2 flex-1 rounded-xl px-4 h-10 border" style={{ backgroundColor: BG, borderColor: BORDER }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_SUB }} />
            <input className="bg-transparent text-sm outline-none w-full" placeholder="Search activities…"
              style={{ color: TEXT }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-52 h-10 rounded-xl border text-sm"
              style={{ backgroundColor: BG, borderColor: BORDER, color: TEXT }}>
              <Filter className="w-4 h-4 mr-2" style={{ color: TEXT_SUB }} />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border text-sm shadow-lg" style={{ backgroundColor: CARD, borderColor: BORDER, color: TEXT }}>
              {['all', 'Technology', 'Sports', 'Academic', 'Creative', 'Business'].map(v => (
                <SelectItem key={v} value={v} style={{ color: TEXT }}>{v === 'all' ? 'All Categories' : v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold" style={{ color: TEXT_SUB }}>
            {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} found
          </p>
          {category !== 'all' && (
            <button onClick={() => setCategory('all')}
              className="text-xs px-2 py-0.5 rounded-full border hover:bg-gray-50 transition-colors"
              style={{ color: ACCENT, borderColor: BORDER }}>
              Clear filter ×
            </button>
          )}
        </div>

        {/* ── Activity Cards Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredActivities.map((activity, index) => {
              const catColor = categoryColors[activity.category] || { bg: ACCENT_BG, text: ACCENT, border: BORDER };
              const pct = activity.capacity ? Math.round((activity.enrolled / activity.capacity) * 100) : 0;
              const isEnrolled = enrolledIds.has(activity.id) || activity.enrolledByCurrentUser;
              const isEnrolling = enrolling === activity.id;
              return (
                <motion.div key={activity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}>
                  <div className="rounded-2xl border shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300 group"
                    style={{ backgroundColor: CARD, borderColor: BORDER }}>
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      {activity.imageUrl ? (
                        <img src={activity.imageUrl} alt={activity.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
                          <LayoutGrid className="w-10 h-10" style={{ color: ACCENT }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-semibold border"
                        style={{ backgroundColor: catColor.bg, color: catColor.text, borderColor: catColor.border }}>
                        {activity.category}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-base mb-1 line-clamp-1" style={{ color: TEXT }}>{activity.name}</h2>
                      <p className="text-xs mb-4 line-clamp-2" style={{ color: TEXT_SUB }}>{activity.description}</p>

                      {/* Meta info */}
                      <div className="space-y-2 p-3 rounded-xl border mb-4" style={{ backgroundColor: BG, borderColor: BORDER }}>
                        {activity.schedule && (
                          <div className="flex items-center gap-2 text-xs" style={{ color: TEXT_SUB }}>
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                            {activity.schedule}
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center gap-2 text-xs" style={{ color: TEXT_SUB }}>
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                            {activity.location}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs" style={{ color: TEXT_SUB }}>
                          <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                          <span><strong style={{ color: TEXT }}>{activity.enrolled ?? 0}</strong> / {activity.capacity ?? '—'} enrolled</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#f59e0b' : ACCENT }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto">
                        <Link to={`/activity/${activity.id}`}
                          className="flex-1 text-center py-2 rounded-xl text-xs font-semibold border hover:bg-gray-50 transition-colors"
                          style={{ borderColor: BORDER, color: TEXT_SUB }}>
                          View Details
                        </Link>
                        <button
                          onClick={() => !isEnrolled && handleEnroll(activity.id)}
                          disabled={isEnrolled || isEnrolling}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: isEnrolled ? 'rgba(52,211,153,0.10)' : ACCENT,
                            color: isEnrolled ? '#059669' : '#fff',
                            border: isEnrolled ? '1px solid rgba(52,211,153,0.3)' : 'none',
                            opacity: isEnrolling ? 0.7 : 1,
                            cursor: isEnrolled ? 'default' : 'pointer',
                          }}>
                          {isEnrolling ? (
                            <span className="flex items-center gap-1"><span className="w-3 h-3 border border-white rounded-full animate-spin border-t-transparent" /> Joining…</span>
                          ) : isEnrolled ? '✓ Enrolled' : (<>Register <ArrowRight className="w-3 h-3" /></>)}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
              style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
              <LayoutGrid className="w-7 h-7" style={{ color: ACCENT_DEEP }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: TEXT }}>No activities found</p>
            <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>Try adjusting your search or filter</p>
            <button onClick={() => { setSearchQuery(''); setCategory('all'); }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: ACCENT, color: '#fff' }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
