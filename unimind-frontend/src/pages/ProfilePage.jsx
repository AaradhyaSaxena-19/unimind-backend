import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  X,
  CheckCircle,
} from 'lucide-react';

export const ProfilePage = () => {
  const { role, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [showEdit, setShowEdit] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    try {
      const data = await getProfile(role, authProfile?.id);
      const activeProfile = data.profile || authProfile;
      setProfile(activeProfile);
      if (activeProfile) {
        setPhone(activeProfile.phone || '');
        setAddress(activeProfile.address || '');
        setParentPhone(activeProfile.parent_phone || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      if (authProfile) setProfile(authProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role, authProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      await updateProfile({ phone, address, parent_phone: parentPhone });
      setFeedback('Contact details successfully updated in student records.');
      setShowEdit(false);
      await loadData();
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Retrieving Institutional Profile..." />;

  const isParent = role === 'parent';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Profile Hero Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl shadow-glow-blue flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-[#1E6BFF] flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-soft shrink-0">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white">
                {role?.toUpperCase() || 'STUDENT'}
              </span>
              <span className="text-xs font-medium text-blue-100 truncate">
                {profile?.roll_no || profile?.child_roll || 'ID: 210161010001'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate">
              {profile?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5 truncate">
              {profile?.course || 'B.Tech Computer Science & Engineering'} &bull; {profile?.college || 'RBMI Group of Institutions'}
            </p>
          </div>
        </div>

        <NeoButton
          variant="white"
          size="sm"
          icon={Edit3}
          onClick={() => setShowEdit(true)}
          className="rounded-full w-full sm:w-auto justify-center"
        >
          Edit Contact Info
        </NeoButton>
      </div>

      {feedback && (
        <NeoAlert
          type="success"
          title="Profile Updated"
          message={feedback}
          onClose={() => setFeedback('')}
        />
      )}

      {/* Main Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details */}
        <NeoCard
          title="Academic Identification"
          subtitle="Enrolled programme & institutional credentials"
          icon={GraduationCap}
          badge="Verified"
          badgeColor="mint"
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Program</span>
              <span className="font-bold text-slate-800">{profile?.course}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Current Semester</span>
              <span className="font-bold text-slate-800">Semester {profile?.semester || 5}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">University Roll No</span>
              <span className="font-mono font-bold text-slate-800">{profile?.roll_no || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Camu ERP ID</span>
              <span className="font-mono font-bold text-slate-800">{profile?.camu_id || 'RBMI2021001'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 font-medium">Institution</span>
              <span className="font-bold text-slate-800">{profile?.college}</span>
            </div>
          </div>
        </NeoCard>

        {/* Contact & Address */}
        <NeoCard
          title="Contact & Residence"
          subtitle="Registered communication channels"
          icon={Mail}
          badge="Secure"
          badgeColor="purple"
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">College Email</span>
              <span className="font-bold text-slate-800 text-right">{profile?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Student Mobile</span>
              <span className="font-bold text-slate-800">{profile?.phone || '+91 98765 43210'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Parent Contact</span>
              <span className="font-bold text-slate-800">{profile?.parent_phone || '+91 91234 56789'}</span>
            </div>
            <div className="flex items-start justify-between py-2">
              <span className="text-slate-400 font-medium">Permanent Address</span>
              <span className="font-bold text-slate-800 text-right max-w-[200px]">
                {profile?.address || 'Civil Lines, Bareilly, Uttar Pradesh - 243001'}
              </span>
            </div>
          </div>
        </NeoCard>
      </div>

      {/* Edit Contact Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-6 max-w-md w-full space-y-4 text-left relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Update Contact Details</h3>
                <p className="text-xs text-slate-400">
                  Update your contact phone & home address
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Student Mobile Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Parent / Emergency Phone
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Residential Address
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <NeoButton
                  variant="white"
                  size="sm"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={saving}
                  className="rounded-full"
                >
                  Save Changes
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
