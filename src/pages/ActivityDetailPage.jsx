import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, MapPin, Clock, Trophy, ArrowLeft, Check, ChevronRight, Star } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getActivityById } from '@/api/activitiesApi';
import { enrollActivity } from '@/api/participationApi';

// ── Palette ───────────────────────────────────────────────────────
const HEADER_BG = '#1C2B33';
const HEADER_TEXT = '#E8F4F8';
const HEADER_MID = '#8BAEBF';
const HEADER_BORDER = 'rgba(139,174,191,0.15)';
const BG = '#EEF2F5';
const CARD = '#FFFFFF';
const BORDER = 'rgba(139,174,191,0.22)';
const ACCENT = '#8BAEBF';
const ACCENT_BG = 'rgba(139,174,191,0.10)';
const TEXT = '#1C2B33';
const TEXT_SUB = '#4A6572';

export default function ActivityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getActivityById(id)
      .then(data => {
        setActivity(data);
        setIsRegistered(data.enrolledByCurrentUser ?? false);
      })
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (isRegistered || enrolling) return;
    setEnrolling(true);
    try {
      await enrollActivity(id);
      setIsRegistered(true);
      // Optimistically update spots remaining
      setActivity(prev => prev
        ? { ...prev, enrolled: (prev.enrolled ?? 0) + 1 }
        : prev
      );
      setDialogOpen(false);  // close dialog on success
    } catch (err) {
      console.error('Enrollment failed:', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (notFound || !activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <p className="text-base font-semibold mb-4" style={{ color: TEXT }}>Activity not found</p>
        <Link to="/activities" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: ACCENT, color: '#fff' }}>Back to Activities</Link>
      </div>
    );
  }

  const spotsLeft = Math.max(0, (activity.capacity ?? 0) - (activity.enrolled ?? 0));
  const pct = activity.capacity ? Math.min(100, Math.round((activity.enrolled / activity.capacity) * 100)) : 0;
  const isFull = spotsLeft === 0;

  const DetailRow = ({ icon: Icon, label, value, color = '#60a5fa' }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 transition-colors" style={{ borderColor: BORDER }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TEXT_SUB }}>{label}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: TEXT }}>{value}</p>
      </div>
    </div>
  );

  const SectionCard = ({ icon: Icon, title, children, accentColor = '#60a5fa' }) => (
    <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: BORDER }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}12`, border: `1px solid ${accentColor}25` }}>
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <h3 className="font-bold text-sm" style={{ color: TEXT }}>{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: BG }}>

      {/* ── Header (dark, matches sidebar) ── */}
      <header className="sticky top-0 z-50 border-b px-6 py-3" style={{ backgroundColor: HEADER_BG, borderColor: HEADER_BORDER }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/activities" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: HEADER_TEXT }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ borderColor: HEADER_BORDER, backgroundColor: 'rgba(139,174,191,0.10)' }}>
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: HEADER_MID }} />
            </div>
            Back to Activities
          </Link>
          <Link to="/"><BrandLogo size="sm" /></Link>
          <Link to="/student/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border hover:bg-white/5 transition-colors"
            style={{ borderColor: HEADER_BORDER, color: HEADER_TEXT }}>
            Dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── Hero Image ── */}
          <div className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 border shadow-md"
            style={{ borderColor: BORDER }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
            {activity.imageUrl ? (
              <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
                <Trophy className="w-16 h-16" style={{ color: ACCENT }} />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-3 py-1 rounded-full font-semibold border text-white border-white/30 backdrop-blur-sm bg-white/10">
                  {activity.category}
                </span>
                {isRegistered && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold border border-emerald-400/40 text-emerald-300 bg-emerald-500/15 backdrop-blur-sm">
                    <Check className="w-3 h-3 inline mr-1" />Registered
                  </span>
                )}
                {isFull && !isRegistered && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold border border-red-400/40 text-red-300 bg-red-500/15 backdrop-blur-sm">
                    Full
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-white">{activity.name}</h1>
              <p className="text-sm md:text-base max-w-2xl text-white/80">{activity.description}</p>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left — Details */}
            <div className="lg:col-span-2 space-y-5">
              <SectionCard icon={Users} title="About This Activity" accentColor="#60a5fa">
                <p className="text-sm leading-relaxed" style={{ color: TEXT_SUB }}>{activity.longDescription}</p>
              </SectionCard>

              <SectionCard icon={Trophy} title="Benefits" accentColor="#059669">
                <ul className="space-y-2">
                  {activity.benefits?.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: BORDER }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 text-emerald-600 border border-emerald-200 bg-emerald-50">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm" style={{ color: TEXT_SUB }}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard icon={Star} title="Requirements" accentColor="#7c3aed">
                <ul className="space-y-2">
                  {activity.requirements?.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: BORDER }}>
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#7c3aed' }} />
                      <span className="text-sm" style={{ color: TEXT_SUB }}>{req}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard icon={Calendar} title="Upcoming Events" accentColor={ACCENT}>
                <div className="space-y-2">
                  {activity.upcomingEvents?.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 transition-colors" style={{ borderColor: BORDER }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: ACCENT_BG, borderColor: BORDER }}>
                        <Calendar className="w-4 h-4" style={{ color: ACCENT }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: TEXT }}>{event.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Right — Sidebar */}
            <div className="space-y-5">
              {/* Registration Card */}
              <div className="rounded-2xl border shadow-sm sticky top-24" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <div className="p-5 border-b" style={{ borderColor: BORDER }}>
                  <h3 className="font-bold text-base" style={{ color: TEXT }}>Registration</h3>
                  <p className="text-xs mt-1" style={{ color: TEXT_SUB }}>
                    {isFull
                      ? <span className="font-bold text-red-500">Activity is full</span>
                      : <><span className="font-bold" style={{ color: ACCENT }}>{spotsLeft}</span> spot{spotsLeft !== 1 ? 's' : ''} remaining</>
                    }
                  </p>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: TEXT_SUB }}>Capacity filled</span>
                      <span className="text-xs font-bold" style={{ color: pct > 80 ? '#f59e0b' : ACCENT }}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : ACCENT }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>{activity.enrolled ?? 0} / {activity.capacity ?? '—'} enrolled</p>
                  </div>

                  {/* Controlled dialog so we can close it programmatically */}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        disabled={isRegistered || isFull}
                        onClick={() => !isRegistered && !isFull && setDialogOpen(true)}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: isRegistered
                            ? 'rgba(52,211,153,0.10)'
                            : isFull
                              ? 'rgba(239,68,68,0.08)'
                              : ACCENT,
                          color: isRegistered ? '#059669' : isFull ? '#ef4444' : '#fff',
                          border: isRegistered
                            ? '1px solid rgba(52,211,153,0.3)'
                            : isFull
                              ? '1px solid rgba(239,68,68,0.25)'
                              : 'none',
                        }}>
                        {isRegistered ? '✓ Successfully Registered' : isFull ? 'Activity Full' : 'Register Now'}
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Registration</DialogTitle>
                        <DialogDescription>Register for <strong>{activity.name}</strong>?</DialogDescription>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground py-2">By registering, you commit to regular attendance and active participation.</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setDialogOpen(false)}
                          className="flex-1 py-2.5 rounded-xl text-sm border"
                          style={{ borderColor: BORDER, color: TEXT_SUB }}>
                          Cancel
                        </button>
                        <button
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                          style={{ backgroundColor: ACCENT, color: '#fff', opacity: enrolling ? 0.7 : 1 }}
                          onClick={handleRegister}
                          disabled={enrolling}>
                          {enrolling ? (
                            <><span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent inline-block" /> Enrolling…</>
                          ) : 'Confirm Registration'}
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Details Card */}
              <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: BORDER }}>
                  <h3 className="font-bold text-sm" style={{ color: TEXT }}>Details</h3>
                </div>
                <div className="p-4 space-y-2">
                  <DetailRow icon={Calendar} label="Schedule" value={activity.schedule || '—'} color="#60a5fa" />
                  <DetailRow icon={MapPin} label="Location" value={activity.location || '—'} color="#059669" />
                  <DetailRow icon={Users} label="Enrolled" value={`${activity.enrolled ?? 0} / ${activity.capacity ?? '—'}`} color="#7c3aed" />
                </div>
              </div>

              {/* Contact Card */}
              <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: BORDER }}>
                  <h3 className="font-bold text-sm" style={{ color: TEXT }}>Contact</h3>
                </div>
                <div className="p-5 space-y-4">
                  {[{ label: 'Organizer', value: activity.organizer }].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[11px] uppercase font-bold tracking-wider" style={{ color: TEXT_SUB }}>{label}</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: TEXT }}>{value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
