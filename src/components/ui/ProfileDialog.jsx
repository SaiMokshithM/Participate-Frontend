import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, Calendar, Camera, Shield, User, Award, ShieldCheck, Edit2, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

// ── Same palette as all other pages ──────────────────────────────
const HEADER_BG = '#1C2B33';    // dark cover strip (matches sidebar)
const CARD = '#FFFFFF';
const BG = '#EEF2F5';
const BORDER = 'rgba(139,174,191,0.22)';
const ACCENT = '#8BAEBF';
const ACCENT_BG = 'rgba(139,174,191,0.10)';
const TEXT = '#1C2B33';
const TEXT_SUB = '#4A6572';

export function ProfileDialog({ isOpen, onClose, user, onUpdateProfile }) {
    const isStudent = user?.role === 'student';

    const [isEditing, setIsEditing] = useState(false);
    const [localAvatar, setLocalAvatar] = useState(user?.avatar || null);
    const [profileData, setProfileData] = useState({
        name: user?.name || '', email: user?.email || '',
        phone: user?.phone || '', location: user?.location || '', bio: user?.bio || ''
    });

    useEffect(() => {
        if (isOpen) {
            setIsEditing(false);
            setLocalAvatar(user?.avatar || null);
            setProfileData({
                name: user?.name || '', email: user?.email || '',
                phone: user?.phone || '', location: user?.location || '', bio: user?.bio || ''
            });
        }
    }, [isOpen, user]);

    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setLocalAvatar(URL.createObjectURL(file));
    };

    const handleSave = () => {
        setIsEditing(false);
        onUpdateProfile?.({ ...user, ...profileData, avatar: localAvatar });
    };

    const initial = profileData.name?.charAt(0)?.toUpperCase() || 'U';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl"
                        style={{ backgroundColor: CARD, borderColor: BORDER }}
                    >
                        {/* ── Cover Strip (dark, matches sidebar) ── */}
                        <div className="h-32 sm:h-40 w-full relative" style={{ backgroundColor: HEADER_BG }}>
                            {/* Subtle teal pattern overlay */}
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #8BAEBF 0%, transparent 60%), radial-gradient(circle at 80% 20%, #4A6572 0%, transparent 50%)' }} />

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                {isEditing ? (
                                    <button onClick={handleSave}
                                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: '#34d399' }}>
                                        <Check className="w-4 h-4" /> Save
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)}
                                        className="p-2 rounded-full text-white/80 hover:text-white transition-colors border"
                                        style={{ backgroundColor: 'rgba(139,174,191,0.15)', borderColor: 'rgba(139,174,191,0.25)' }}
                                        title="Edit Profile">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={onClose}
                                    className="p-2 rounded-full text-white/70 hover:text-white transition-colors border"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.20)', borderColor: 'rgba(255,255,255,0.10)' }}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* ── Profile Content ── */}
                        <div className="px-6 pb-8 sm:px-8 sm:pb-8" style={{ backgroundColor: CARD }}>
                            {/* Avatar + name row */}
                            <div className="flex flex-col sm:flex-row gap-5 -mt-14 sm:-mt-16 sm:items-end mb-7">
                                {/* Avatar */}
                                <div className="relative group flex-shrink-0">
                                    <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 shadow-xl"
                                        style={{ borderColor: CARD }}>
                                        <AvatarImage src={localAvatar || user?.avatar || ''} className="object-cover" />
                                        <AvatarFallback className="text-3xl font-bold"
                                            style={{ backgroundColor: ACCENT_BG, color: ACCENT }}>{initial}</AvatarFallback>
                                    </Avatar>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    <button onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-1 right-1 p-2 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity border-2"
                                        style={{ backgroundColor: ACCENT, borderColor: CARD }}
                                        title="Change Photo">
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Name & role */}
                                <div className="flex-1 pb-2 pt-4 sm:pt-0">
                                    {isEditing ? (
                                        <Input value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                            className="text-xl font-bold h-10 mb-2 max-w-xs border"
                                            style={{ borderColor: BORDER, color: TEXT, backgroundColor: BG }} />
                                    ) : (
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: TEXT }}>
                                            {profileData.name || 'Your Name'}
                                        </h2>
                                    )}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                                            style={{ backgroundColor: ACCENT_BG, color: ACCENT, borderColor: BORDER }}>
                                            {isStudent ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                            {isStudent ? 'Student' : 'Administrator'}
                                        </span>
                                        {(profileData.location || isEditing) && (
                                            <span className="flex items-center gap-1 text-xs" style={{ color: TEXT_SUB }}>
                                                <MapPin className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                                                {isEditing ? (
                                                    <input value={profileData.location}
                                                        onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                                                        className="bg-transparent border-none outline-none text-sm w-24"
                                                        placeholder="Location"
                                                        style={{ color: TEXT }} />
                                                ) : profileData.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Grid: Contact + Bio | Account ── */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Left — Contact + Bio */}
                                <div className="md:col-span-2 space-y-5">
                                    {/* Contact */}
                                    <div>
                                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: TEXT }}>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
                                                style={{ backgroundColor: ACCENT_BG, borderColor: BORDER }}>
                                                <User className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                                            </div>
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Email */}
                                            <div className="p-4 rounded-2xl border flex items-start gap-3 hover:bg-gray-50 transition-colors"
                                                style={{ borderColor: BORDER }}>
                                                <div className="p-2 rounded-xl flex-shrink-0"
                                                    style={{ backgroundColor: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.20)' }}>
                                                    <Mail className="w-4 h-4" style={{ color: '#60a5fa' }} />
                                                </div>
                                                <div className="w-full min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: TEXT_SUB }}>Email</p>
                                                    {isEditing ? (
                                                        <Input value={profileData.email}
                                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                            className="h-7 text-sm border" placeholder="your@email.com"
                                                            style={{ borderColor: BORDER, color: TEXT, backgroundColor: BG }} />
                                                    ) : (
                                                        <p className="text-sm font-semibold truncate" style={{ color: TEXT }}>
                                                            {profileData.email || '—'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Phone */}
                                            <div className="p-4 rounded-2xl border flex items-start gap-3 hover:bg-gray-50 transition-colors"
                                                style={{ borderColor: BORDER }}>
                                                <div className="p-2 rounded-xl flex-shrink-0"
                                                    style={{ backgroundColor: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }}>
                                                    <Phone className="w-4 h-4" style={{ color: '#34d399' }} />
                                                </div>
                                                <div className="w-full min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: TEXT_SUB }}>Phone</p>
                                                    {isEditing ? (
                                                        <Input value={profileData.phone}
                                                            onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                            className="h-7 text-sm border" placeholder="+91 00000 00000"
                                                            style={{ borderColor: BORDER, color: TEXT, backgroundColor: BG }} />
                                                    ) : (
                                                        <p className="text-sm font-semibold" style={{ color: TEXT }}>
                                                            {profileData.phone || '—'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: TEXT }}>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
                                                style={{ backgroundColor: ACCENT_BG, borderColor: BORDER }}>
                                                <Award className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                                            </div>
                                            Bio &amp; About
                                        </h3>
                                        <div className="p-4 rounded-2xl border" style={{ borderColor: BORDER }}>
                                            {isEditing ? (
                                                <textarea value={profileData.bio}
                                                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                                    placeholder="Tell us a bit about yourself…"
                                                    className="w-full text-sm min-h-[90px] outline-none resize-none rounded-xl p-2 border"
                                                    style={{ backgroundColor: BG, borderColor: BORDER, color: TEXT }} />
                                            ) : (
                                                <p className="text-sm leading-relaxed" style={{ color: profileData.bio ? TEXT_SUB : 'rgba(74,101,114,0.4)' }}>
                                                    {profileData.bio || 'No bio added yet.'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right — Account Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: TEXT }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
                                            style={{ backgroundColor: ACCENT_BG, borderColor: BORDER }}>
                                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
                                        </div>
                                        Account Details
                                    </h3>

                                    {/* Joined */}
                                    <div className="p-4 rounded-2xl border hover:bg-gray-50 transition-colors" style={{ borderColor: BORDER }}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl flex-shrink-0"
                                                style={{ backgroundColor: 'rgba(251,146,60,0.10)', border: '1px solid rgba(251,146,60,0.20)' }}>
                                                <Calendar className="w-4 h-4" style={{ color: '#fb923c' }} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_SUB }}>Joined</p>
                                                <p className="text-sm font-semibold mt-0.5" style={{ color: TEXT }}>
                                                    {user?.joinedDate || 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activities count for students */}
                                    {isStudent && (
                                        <div className="p-4 rounded-2xl border" style={{ borderColor: BORDER }}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_SUB }}>Activities</span>
                                                <span className="text-sm font-bold" style={{ color: ACCENT }}>{user?.activitiesCount || '0'}</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                                                <div className="h-full rounded-full" style={{ width: `${Math.min((user?.activitiesCount || 0) * 10, 100)}%`, backgroundColor: ACCENT }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
