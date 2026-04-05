import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trophy, Bell, LayoutGrid, TrendingUp } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getActivities } from '@/api/activitiesApi';

const features = [
    { icon: Users, title: 'Join Clubs', description: 'Connect with like-minded students and join diverse clubs' },
    { icon: Trophy, title: 'Sports Activities', description: 'Participate in various sports and athletic events' },
    { icon: Calendar, title: 'Event Management', description: 'Stay updated with upcoming campus events and activities' },
    { icon: Bell, title: 'Notifications', description: 'Get real-time updates about your registered activities' },
];
// Silent Waters
const ICE = '#E8F4F8';
const LIGHT = '#B8D4DC';
const MID = '#8BAEBF';
const DARK = '#4A6572';
const DEEP = '#1C2B33';
const CARD = '#243542';

const categories = [
  { label: 'Tech & Coding', icon: LayoutGrid, pct: 0, color: '#8BAEBF' },
  { label: 'Sports & Fitness', icon: Trophy, pct: 0, color: '#B8D4DC' },
  { label: 'Academic Clubs', icon: TrendingUp, pct: 0, color: '#8BAEBF' },
  { label: 'Arts & Culture', icon: Users, pct: 0, color: '#4A6572' },
  { label: 'Events & Fests', icon: Calendar, pct: 0, color: '#B8D4DC' },
];

const liveEvents = [
  { dot: '#8BAEBF', text: 'Hackathon 2025 — Registration Open', tag: 'Tech' },
  { dot: '#B8D4DC', text: 'Inter-College Football League — Round 3', tag: 'Sports' },
  { dot: '#8BAEBF', text: 'Research Paper Symposium — 48 seats left', tag: 'Academic' },
  { dot: '#4A6572', text: 'Cultural Night — Performing Arts Fest', tag: 'Arts' },
  { dot: '#B8D4DC', text: 'Annual Tech Expo — Call for Projects', tag: 'Tech' },
];

const topStats = [
  { icon: Users, label: 'Students', val: '0' },
  { icon: Calendar, label: 'Events', val: '0' },
  { icon: Trophy, label: 'Clubs', val: '0' },
  { icon: Bell, label: 'Active Now', val: '0' },
];

function PlatformPreview() {
  const [filled, setFilled] = useState(categories.map(() => 0));
  const [ticker, setTicker] = useState(0);

  // Animate bars on mount
  useEffect(() => {
    const t = setTimeout(() => setFilled(categories.map(c => c.pct)), 200);
    return () => clearTimeout(t);
  }, []);

  // Rotate live event ticker
  useEffect(() => {
    const id = setInterval(() => setTicker(p => (p + 1) % liveEvents.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: '100%', height: '480px',
      backgroundColor: '#1C2B33',
      borderRadius: '1rem',
      display: 'flex', flexDirection: 'column',
      padding: '28px 32px',
      boxSizing: 'border-box',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Subtle grid lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(139,174,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,174,191,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      {/* Top row — stats pills */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {topStats.map(s => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: topStats.indexOf(s) * 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(139,174,191,0.10)', border: '1px solid rgba(139,174,191,0.18)', borderRadius: '999px', padding: '6px 14px' }}
          >
            <s.icon size={13} style={{ color: '#8BAEBF' }} />
            <span style={{ color: '#E8F4F8', fontWeight: 700, fontSize: '13px' }}>{s.val}</span>
            <span style={{ color: '#4A6572', fontSize: '11px' }}>{s.label}</span>
          </motion.div>
        ))}
        {/* Live pulse badge */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(139,174,191,0.08)', border: '1px solid rgba(139,174,191,0.2)', borderRadius: '999px', padding: '6px 14px' }}>
          <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#8BAEBF' }} />
          <span style={{ color: '#8BAEBF', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }}>LIVE</span>
        </div>
      </div>

      {/* Middle — activity categories */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#4A6572', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0px' }}>Activity Participation</p>
        {categories.map((c, i) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <c.icon size={13} style={{ color: c.color, flexShrink: 0 }} />
            <span style={{ color: '#B8D4DC', fontSize: '12px', width: '130px', flexShrink: 0 }}>{c.label}</span>
            <div style={{ flex: 1, height: '5px', backgroundColor: 'rgba(139,174,191,0.12)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${filled[i]}%` }}
                transition={{ duration: 1.2, delay: i * 0.12, ease: 'easeOut' }}
                style={{ height: '100%', backgroundColor: c.color, borderRadius: '999px' }}
              />
            </div>
            <span style={{ color: '#8BAEBF', fontSize: '11px', fontWeight: 700, width: '30px', textAlign: 'right' }}>{filled[i]}%</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function LandingPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    getActivities()
      .then(res => {
        // Just take the first 4 for the landing page
        setUpcomingEvents(res.slice(0, 4));
      })
      .catch(err => console.error("Could not fetch events for landing page: ", err));
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ backgroundColor: DEEP, color: ICE }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: 'rgba(28,43,51,0.95)', borderColor: 'rgba(139,174,191,0.12)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <span className="text-xl font-bold tracking-tight" style={{ color: ICE }}>Participate+</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="rounded-xl px-5 text-sm font-medium" style={{ color: LIGHT }} asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button className="rounded-xl px-6 text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: MID, color: DEEP }} asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <div className="inline-block mb-6 px-5 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full border" style={{ color: MID, borderColor: 'rgba(139,174,191,0.25)', backgroundColor: 'rgba(139,174,191,0.08)' }}>
              The New Era of Campus Life
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]" style={{ color: ICE }}>
              Elevate Your<br />
              <span style={{ color: MID }}>University Legacy</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: LIGHT }}>
              Join exclusive clubs, dominate in elite sports, and build a network that lasts a lifetime. The premium standard for student engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="h-13 px-10 text-base font-semibold rounded-xl transition-all hover:opacity-90" style={{ backgroundColor: MID, color: DEEP }} asChild>
                <Link to="/activities">Explore the Platform</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-13 px-10 text-base rounded-xl transition-all hover:opacity-90" style={{ borderColor: 'rgba(139,174,191,0.28)', color: MID, background: 'transparent' }} asChild>
                <Link to="/signup">Request Access</Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero — Platform Preview */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className="mt-16">
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(139,174,191,0.18)' }}>
              <PlatformPreview />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: ICE }}>
              Platform <span style={{ color: MID }}>Excellence</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: LIGHT }}>Precision-engineered tools to manage your entire extracurricular journey.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <div className="h-full rounded-2xl p-6 flex flex-col border hover:border-[#8BAEBF]/30 transition-colors" style={{ backgroundColor: CARD, border: '1px solid rgba(139,174,191,0.12)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(139,174,191,0.12)', color: MID }}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: ICE }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: LIGHT }}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: ICE }}>
              Featured <span style={{ color: LIGHT }}>Events</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: LIGHT }}>Exclusive opportunities for our community members.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event, i) => (
              <motion.div key={event.id || event.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="rounded-2xl p-5 flex flex-col h-full border hover:border-[#8BAEBF]/30 transition-colors" style={{ backgroundColor: CARD, border: '1px solid rgba(139,174,191,0.12)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs px-3 py-1 rounded-full font-medium border" style={{ backgroundColor: 'rgba(139,174,191,0.10)', color: MID, borderColor: 'rgba(139,174,191,0.22)' }}>{event.category}</span>
                    <Calendar className="w-4 h-4" style={{ color: DARK }} />
                  </div>
                  <h3 className="text-base font-semibold mb-1" style={{ color: ICE }}>{event.name}</h3>
                  <p className="text-sm mb-6" style={{ color: LIGHT }}>{event.schedule || event.date}</p>
                  <div className="mt-auto pt-4 border-t flex flex-col gap-4" style={{ borderColor: 'rgba(139,174,191,0.10)' }}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: MID }} />
                      <p className="text-sm" style={{ color: LIGHT }}><span style={{ color: MID }}>{event.enrolled || 0}</span> / {event.capacity || 0} enrolled</p>
                    </div>
                    <Button className="w-full h-10 rounded-xl text-sm font-semibold border" style={{ backgroundColor: 'rgba(139,174,191,0.10)', color: ICE, borderColor: 'rgba(139,174,191,0.18)' }} asChild>
                       <Link to="/activities">View Details</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl p-12 border" style={{ backgroundColor: CARD, borderColor: 'rgba(139,174,191,0.15)' }}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: ICE }}>
              Ready for <span style={{ color: MID }}>Excellence?</span>
            </h2>
            <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: LIGHT }}>
              Join the most exclusive student networking and activity management platform.
            </p>
            <Button size="lg" className="h-12 px-12 text-base font-semibold rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: MID, color: DEEP }} asChild>
              <Link to="/signup">Apply Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 px-4 border-t" style={{ backgroundColor: DEEP, borderColor: 'rgba(139,174,191,0.10)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4"><BrandLogo size="md" /><span className="text-lg font-bold" style={{ color: ICE }}>Participate+</span></div>
              <p className="text-sm leading-relaxed max-w-sm mb-5" style={{ color: LIGHT }}>
                Elevating the student experience. Discover clubs, join events, and build your legacy.
              </p>
              <div className="flex max-w-sm">
                <input type="email" placeholder="Enter your email" className="text-sm w-full px-4 py-2.5 rounded-l-xl focus:outline-none transition-all" style={{ backgroundColor: CARD, border: '1px solid rgba(139,174,191,0.15)', borderRight: 'none', color: ICE }} />
                <button className="px-5 py-2.5 rounded-r-xl font-semibold text-sm" style={{ backgroundColor: MID, color: DEEP }}>Subscribe</button>
              </div>
            </div>
            {[['Platform', [['/activities', 'Activities'], ['/', 'Upcoming Events'], ['/', 'Organizations']]],
            ['Company', [['/', 'About Us'], ['/', 'Careers'], ['/', 'Contact']]],
            ['Legal', [['/', 'Privacy Policy'], ['/', 'Terms of Service'], ['/', 'Cookie Policy']]],
            ].map(([title, links]) => (
              <div key={title} className="lg:col-span-2">
                <h4 className="font-semibold mb-4 text-sm" style={{ color: ICE }}>{title}</h4>
                <ul className="space-y-3 text-sm">
                  {links.map(([href, label]) => <li key={label}><Link to={href} className="transition-colors hover:opacity-100" style={{ color: LIGHT }}>{label}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4 border-t" style={{ borderColor: 'rgba(139,174,191,0.08)' }}>
            <p className="text-xs" style={{ color: DARK }}>© {new Date().getFullYear()} Participate+. Designed for greatness.</p>
            <div className="flex gap-2">{['T', 'I', 'L', 'G'].map(s => <a key={s} href="#" className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all" style={{ backgroundColor: CARD, border: '1px solid rgba(139,174,191,0.12)', color: DARK }}>{s}</a>)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
