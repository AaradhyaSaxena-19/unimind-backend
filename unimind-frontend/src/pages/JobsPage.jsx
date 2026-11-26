import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoInput from '../components/common/NeoInput';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import NeoSelect from '../components/common/NeoSelect';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getJobsOverview,
  uploadResume,
  deleteResume,
  searchJobs,
  applyToJob,
  createOpening,
  deleteOpening,
  getStudentPlacement,
} from '../services/jobService';
import {
  Briefcase,
  Upload,
  FileText,
  Sparkles,
  MapPin,
  ExternalLink,
  Search,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Globe,
  Building2,
  Users,
  X,
  WifiOff,
  GraduationCap,
  Plus,
  Send,
} from 'lucide-react';

const matchTone = (match = 0) => {
  if (match >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  if (match >= 55) return 'bg-amber-50 text-amber-700 border-amber-200/60';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const MatchPill = ({ value = 0 }) => (
  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-bold ${matchTone(value)}`}>
    <Sparkles className="w-3 h-3" />
    {value}%
  </span>
);

const Chip = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200/70',
    blue: 'bg-blue-50 text-[#1E6BFF] border-blue-100',
    mint: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
};

export const JobsPage = () => {
  const { role, profile } = useAuth();
  const isStudent = role === 'student';
  const canPost = role === 'teacher' || role === 'admin';
  const fileRef = useRef(null);

  const [overview, setOverview] = useState(null);
  const [resume, setResume] = useState(null);
  const [applications, setApplications] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [sources, setSources] = useState([]);
  const [meta, setMeta] = useState(null);

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [targetRole, setTargetRole] = useState('');

  const [tab, setTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [studentDetail, setStudentDetail] = useState(null);

  const [openingForm, setOpeningForm] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'Full-time',
    salary: '',
    url: '',
    deadline: '',
    skills: '',
    description: '',
  });
  const [posting, setPosting] = useState(false);

  const appliedUrls = useMemo(
    () => new Set(applications.map((app) => app.url)),
    [applications]
  );

  const runSearch = async (searchQuery, searchLocation, searchRemote, skills = null) => {
    setScanning(true);
    setError('');
    try {
      const data = await searchJobs({
        query: searchQuery,
        location: searchLocation,
        remote: searchRemote,
        skills,
        limit: 30,
      });
      setJobs(data.jobs || []);
      setSources(data.sources || []);
      setMeta(data);
      setTab('matches');
    } catch (err) {
      setError(err.message || 'Could not reach the job boards. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getJobsOverview();
        if (!mounted) return;
        setOverview(data);
        setResume(data.resume || null);
        setApplications(data.applications || []);
        setOpenings(data.openings || []);

        const suggested =
          data.resume?.target_role ||
          data.resume?.profile?.suggested_roles?.[0] ||
          (data.role === 'student' ? 'Python developer' : 'Software developer');
        setQuery(suggested);
        setLocation(data.resume?.preferred_location || '');
        setTargetRole(data.resume?.target_role || '');

        if (data.role === 'student' && data.resume) {
          runSearch(suggested, data.resume.preferred_location || '', false, data.resume.skills);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load Job Finds.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    setNotice('');
    try {
      const res = await uploadResume({
        file,
        target_role: targetRole,
        preferred_location: location,
      });
      setResume(res.resume);
      setNotice(res.message || 'Resume parsed successfully.');
      const nextQuery = res.suggested_queries?.[0] || 'Software Developer';
      setQuery(nextQuery);
      await runSearch(nextQuery, location, false, res.profile?.skills || []);
    } catch (err) {
      setError(err.message || 'The resume could not be parsed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Remove your uploaded resume from Job Finds?')) return;
    try {
      await deleteResume();
      setResume(null);
      setNotice('Resume removed.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApply = async (job) => {
    // Open the employer page first so the browser never blocks the pop-up.
    const url = job.url || job.link;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    if (!isStudent) return;
    try {
      await applyToJob(job);
      setNotice(`Application tracked: ${job.title} at ${job.company || job.source}.`);
      const res = await getJobsOverview();
      setApplications(res.applications || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshOpenings = async () => {
    try {
      const res = await getJobsOverview();
      setOpenings(res.openings || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePostOpening = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError('');
    try {
      await createOpening({
        title: openingForm.title,
        company: openingForm.company,
        location: openingForm.location,
        job_type: openingForm.job_type,
        salary: openingForm.salary,
        url: openingForm.url,
        deadline: openingForm.deadline,
        description: openingForm.description,
        skills: openingForm.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setNotice('Campus opening published. Every student now sees it in Job Finds.');
      setOpeningForm({
        title: '',
        company: '',
        location: '',
        job_type: 'Full-time',
        salary: '',
        url: '',
        deadline: '',
        skills: '',
        description: '',
      });
      await refreshOpenings();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleRemoveOpening = async (openingId) => {
    try {
      await deleteOpening(openingId);
      setOpenings((rows) => rows.filter((row) => row.id !== openingId));
      setNotice('Opening closed.');
    } catch (err) {
      setError(err.message);
    }
  };

  const openStudentResume = async (studentId) => {
    setError('');
    try {
      const data = await getStudentPlacement(studentId);
      setStudentDetail(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner label="Loading Job Finds..." />;

  const stats = overview?.stats || {};
  const skills = resume?.skills || [];
  const sourceOk = (sources || []).filter((source) => source.status === 'ok' && source.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6 text-left">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white shadow-glow-blue">
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/15 border border-white/20 px-3 py-1 rounded-full">
              <Briefcase className="w-3.5 h-3.5" /> Training &amp; Placement Cell
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Job Finds
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Upload your resume once. UniMind reads your skills, scrapes live job boards and campus
              drives, ranks the openings for you and sends you straight to the employer&apos;s
              application page.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 py-2.5 text-center">
              <span className="block text-lg sm:text-xl font-extrabold">
                {isStudent ? (resume ? skills.length : 0) : stats.with_resume || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold">
                {isStudent ? 'Skills found' : 'Resumes'}
              </span>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 py-2.5 text-center">
              <span className="block text-lg sm:text-xl font-extrabold">
                {isStudent ? applications.length : stats.applications || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold">
                Applications
              </span>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 py-2.5 text-center">
              <span className="block text-lg sm:text-xl font-extrabold">{openings.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold">
                Campus drives
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <NeoAlert type="error" title="Job Finds" message={error} onClose={() => setError('')} />}
      {notice && <NeoAlert type="success" title="Done" message={notice} onClose={() => setNotice('')} />}

      {/* Student layout */}
      {isStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-4">
            <NeoCard
              title={resume ? 'Resume on file' : 'Upload your resume'}
              subtitle={resume ? resume.file_name : 'PDF, DOCX, TXT or MD up to 5 MB'}
              icon={FileText}
              badge={resume ? `${resume.profile?.strength || 0}% ready` : 'Required'}
              badgeColor={resume ? 'mint' : 'yellow'}
            >
              {resume ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block">Skills</span>
                      <span className="text-sm font-bold text-slate-800">{skills.length}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block">Updated</span>
                      <span className="text-xs font-bold text-slate-800">
                        {(resume.updated_at || '').slice(0, 10) || 'Today'}
                      </span>
                    </div>
                  </div>

                  {resume.profile?.suggested_roles?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested roles
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {resume.profile.suggested_roles.map((item) => (
                          <Chip key={item} tone="blue">{item}</Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Parsed skills
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-32 overflow-y-auto">
                      {skills.map((skill) => (
                        <Chip key={skill}>{skill}</Chip>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <NeoButton size="sm" variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>
                      Replace
                    </NeoButton>
                    <NeoButton size="sm" variant="white" icon={Trash2} onClick={handleDeleteResume}>
                      Remove
                    </NeoButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-colors p-6 flex flex-col items-center gap-2 cursor-pointer"
                    disabled={uploading}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white text-[#1E6BFF] border border-blue-100 flex items-center justify-center shadow-soft-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {uploading ? 'Reading your resume...' : 'Click to upload resume'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      We extract your skills and links locally on the campus server.
                    </span>
                  </button>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <div className="pt-3 mt-1 border-t border-slate-100 space-y-2">
                <NeoInput
                  label="Target role (used for matching)"
                  placeholder="e.g. Full Stack Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  {profile?.full_name || 'Student'} &bull; {profile?.roll_no || ''}
                </p>
              </div>
            </NeoCard>

            <NeoCard title="Live sources" subtitle="Scraped on this device" icon={Globe} badge={`${sourceOk.length} online`} badgeColor="blue">
              <div className="space-y-1.5">
                {(sources || []).map((source) => (
                  <div key={source.source} className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">{source.source}</span>
                    {source.status === 'ok' ? (
                      <span className="font-bold text-emerald-600">{source.count} jobs</span>
                    ) : (
                      <span className="font-semibold text-rose-500 flex items-center gap-1">
                        <WifiOff className="w-3 h-3" /> blocked
                      </span>
                    )}
                  </div>
                ))}
                {sources.length === 0 && (
                  <p className="text-[11px] text-slate-400">Run a search to see source status.</p>
                )}
              </div>
            </NeoCard>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-3.5 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5">
                  <NeoInput
                    label="Job title or skill"
                    icon={Search}
                    placeholder="python developer, data analyst..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch(query, location, remote)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <NeoInput
                    label="Location"
                    icon={MapPin}
                    placeholder="Bareilly, Bengaluru..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4 flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRemote((value) => !value)}
                    className={`h-[42px] px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      remote
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    Remote only
                  </button>
                  <NeoButton
                    variant="primary"
                    icon={scanning ? RefreshCw : Sparkles}
                    loading={scanning}
                    onClick={() => runSearch(query, location, remote)}
                    className="flex-1"
                  >
                    {scanning ? 'Scraping...' : 'Find jobs'}
                  </NeoButton>
                </div>
              </div>
              {meta?.fetched_at && (
                <p className="text-[10px] text-slate-400 mt-2">
                  {meta.total_found} openings scanned &bull; showing best {jobs.length} &bull;
                  refreshed {new Date(meta.fetched_at).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'matches', label: `Matched jobs${jobs.length ? ` (${jobs.length})` : ''}` },
                { id: 'openings', label: `Campus drives (${openings.length})` },
                { id: 'applications', label: `My applications (${applications.length})` },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    tab === item.id
                      ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === 'matches' && (
              <div className="space-y-3">
                {scanning && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-[#1E6BFF] animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-800">Scraping job boards...</p>
                    <p className="text-xs text-slate-500">
                      Internshala, Remotive, Arbeitnow, Jobicy, Himalayas, RemoteOK and the campus board.
                    </p>
                  </div>
                )}

                {!scanning && jobs.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
                    <Briefcase className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-800">No matches yet</p>
                    <p className="text-xs text-slate-500">
                      Upload a resume or change the role / location and run the search again.
                    </p>
                  </div>
                )}

                {!scanning &&
                  jobs.map((job) => {
                    const applied = appliedUrls.has(job.url);
                    const matched = new Set(job.matched_skills || []);
                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:border-blue-200 transition-all p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 leading-snug">{job.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {job.company || 'Company'}
                              <span className="text-slate-300">&bull;</span>
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {job.location || 'India'}
                            </p>
                          </div>
                          <MatchPill value={job.match} />
                        </div>

                        {job.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 8).map((skill) => (
                              <Chip key={skill} tone={matched.has(skill) ? 'mint' : 'slate'}>
                                {skill}
                              </Chip>
                            ))}
                          </div>
                        )}

                        {job.description && (
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold text-slate-400">
                            <span className="text-slate-500">{job.source}</span>
                            <span>&bull;</span>
                            <span>{job.type || 'Full-time'}</span>
                            {job.salary && <span className="text-emerald-600">&bull; {job.salary}</span>}
                            {job.posted && <span className="hidden sm:inline">&bull; {job.posted}</span>}
                          </div>
                          <NeoButton
                            size="sm"
                            variant={applied ? 'white' : 'primary'}
                            icon={applied ? CheckCircle2 : ExternalLink}
                            onClick={() => handleApply(job)}
                          >
                            {applied ? 'Applied' : 'Apply'}
                          </NeoButton>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {tab === 'openings' && (
              <div className="space-y-3">
                {openings.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                    <GraduationCap className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-800 mt-2">No campus drives posted yet</p>
                    <p className="text-xs text-slate-500">The T&amp;P cell will publish drives here.</p>
                  </div>
                )}
                {openings.map((opening) => (
                  <div key={opening.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{opening.title}</h3>
                        <p className="text-xs text-slate-500">
                          {opening.company || 'Campus drive'} &bull; {opening.location || 'Pan India'}
                        </p>
                      </div>
                      <NeoBadge color="mint" size="xs">{opening.job_type || 'Full-time'}</NeoBadge>
                    </div>
                    {opening.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {opening.skills.map((skill) => (
                          <Chip key={skill} tone="blue">{skill}</Chip>
                        ))}
                      </div>
                    )}
                    {opening.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">{opening.description}</p>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {opening.salary || 'CTC as per company'}
                        {opening.deadline ? ` &bull; apply by ${opening.deadline}` : ''}
                        {opening.posted_by ? ` &bull; posted by ${opening.posted_by}` : ''}
                      </span>
                      <NeoButton
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => handleApply({ ...opening, type: opening.job_type, match: 0 })}
                      >
                        Apply
                      </NeoButton>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'applications' && (
              <div className="space-y-3">
                {applications.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                    <Send className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-800 mt-2">No applications tracked</p>
                    <p className="text-xs text-slate-500">
                      Every Apply click is saved here so your mentor can follow up.
                    </p>
                  </div>
                )}
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{app.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {app.company || 'Company'} &bull; {app.source || 'Job board'} &bull;
                        applied {(app.applied_at || '').slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <NeoBadge color="mint" size="xs">{app.status || 'Applied'}</NeoBadge>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-[#1E6BFF] hover:border-blue-200"
                        title="Open employer page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Faculty / admin layout */}
      {!isStudent && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Students', value: stats.students || 0, tone: 'text-slate-900' },
              { label: 'Resumes uploaded', value: stats.with_resume || 0, tone: 'text-emerald-600' },
              { label: 'Applications', value: stats.applications || 0, tone: 'text-[#1E6BFF]' },
              { label: 'Active campus drives', value: openings.length, tone: 'text-amber-600' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {item.label}
                </span>
                <span className={`text-2xl font-extrabold block mt-1 ${item.tone}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'matches', label: 'Search job boards' },
              { id: 'students', label: `Student resumes (${stats.with_resume || 0})` },
              { id: 'openings', label: `Campus drives (${openings.length})` },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  tab === item.id
                    ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'matches' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-3.5 flex flex-col sm:flex-row gap-2.5 sm:items-end">
                <div className="flex-1">
                  <NeoInput
                    label="Role or skill to scan"
                    icon={Search}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="data analyst, react, java..."
                  />
                </div>
                <div className="sm:w-56">
                  <NeoInput
                    label="Location"
                    icon={MapPin}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="India, Bengaluru, remote..."
                  />
                </div>
                <NeoButton icon={Sparkles} loading={scanning} onClick={() => runSearch(query, location, remote)}>
                  Scrape now
                </NeoButton>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">{job.title}</h3>
                        <p className="text-xs text-slate-500 truncate">
                          {job.company || 'Company'} &bull; {job.location || 'India'}
                        </p>
                      </div>
                      <MatchPill value={job.match} />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {job.source} &bull; {job.type || 'Full-time'}
                        {job.salary ? ` &bull; ${job.salary}` : ''}
                      </span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#1E6BFF] hover:underline inline-flex items-center gap-1"
                      >
                        Open link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && !scanning && (
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs text-slate-500">
                    Run a scrape to see what students are being shown.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'students' && (
            <NeoCard
              title="Student placement records"
              subtitle="Resumes parsed by Job Finds and the jobs students applied to"
              icon={Users}
              badge={`${overview?.students?.length || 0} students`}
              badgeColor="blue"
            >
              <div className="space-y-2">
                {(overview?.students || []).map((student) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900">{student.name}</h4>
                        <Chip>{student.roll_no}</Chip>
                        {student.resume ? <Chip tone="mint">Resume ready</Chip> : <Chip tone="amber">No resume</Chip>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {student.resume?.skills?.slice(0, 6).join(', ') || 'Resume not uploaded yet'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500">
                        {student.applications} application{student.applications === 1 ? '' : 's'}
                      </span>
                      <NeoButton size="sm" variant="white" onClick={() => openStudentResume(student.id)}>
                        View resume
                      </NeoButton>
                    </div>
                  </div>
                ))}
              </div>
            </NeoCard>
          )}

          {tab === 'openings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {canPost && (
                <NeoCard title="Post a campus opening" subtitle="Visible to every student instantly" icon={Plus} badge="T&P" badgeColor="yellow">
                  <form onSubmit={handlePostOpening} className="space-y-2.5">
                    <NeoInput
                      label="Role title"
                      required
                      value={openingForm.title}
                      onChange={(e) => setOpeningForm({ ...openingForm, title: e.target.value })}
                      placeholder="Software Engineer Trainee"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <NeoInput
                        label="Company"
                        value={openingForm.company}
                        onChange={(e) => setOpeningForm({ ...openingForm, company: e.target.value })}
                        placeholder="TCS"
                      />
                      <NeoInput
                        label="Location"
                        value={openingForm.location}
                        onChange={(e) => setOpeningForm({ ...openingForm, location: e.target.value })}
                        placeholder="Bengaluru"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <NeoSelect
                        label="Type"
                        value={openingForm.job_type}
                        onChange={(e) => setOpeningForm({ ...openingForm, job_type: e.target.value })}
                        options={[
                          { value: 'Full-time', label: 'Full-time' },
                          { value: 'Internship', label: 'Internship' },
                          { value: 'Part-time', label: 'Part-time' },
                        ]}
                      />
                      <NeoInput
                        label="CTC / stipend"
                        value={openingForm.salary}
                        onChange={(e) => setOpeningForm({ ...openingForm, salary: e.target.value })}
                        placeholder="₹ 4.5 LPA"
                      />
                    </div>
                    <NeoInput
                      label="Application link"
                      type="url"
                      required
                      value={openingForm.url}
                      onChange={(e) => setOpeningForm({ ...openingForm, url: e.target.value })}
                      placeholder="https://careers.company.com/apply"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <NeoInput
                        label="Apply before"
                        type="date"
                        value={openingForm.deadline}
                        onChange={(e) => setOpeningForm({ ...openingForm, deadline: e.target.value })}
                      />
                      <NeoInput
                        label="Skills (comma separated)"
                        value={openingForm.skills}
                        onChange={(e) => setOpeningForm({ ...openingForm, skills: e.target.value })}
                        placeholder="Java, SQL, Aptitude"
                      />
                    </div>
                    <NeoInput
                      label="Short description"
                      value={openingForm.description}
                      onChange={(e) => setOpeningForm({ ...openingForm, description: e.target.value })}
                      placeholder="Eligibility, batch, rounds..."
                    />
                    <NeoButton type="submit" icon={Send} loading={posting} className="w-full">
                      Publish to Job Finds
                    </NeoButton>
                  </form>
                </NeoCard>
              )}

              <div className="space-y-3">
                {openings.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs text-slate-500">
                    No campus drives yet.
                  </div>
                )}
                {openings.map((opening) => (
                  <div key={opening.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{opening.title}</h3>
                        <p className="text-xs text-slate-500">
                          {opening.company || 'Campus drive'} &bull; {opening.location || 'Pan India'}
                        </p>
                      </div>
                      {canPost && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOpening(opening.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Close opening"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{opening.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {opening.posted_by ? `Posted by ${opening.posted_by}` : ''}
                        {opening.deadline ? ` &bull; by ${opening.deadline}` : ''}
                      </span>
                      <a
                        href={opening.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#1E6BFF] hover:underline inline-flex items-center gap-1"
                      >
                        Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student resume modal for faculty/admin */}
      {studentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 space-y-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {studentDetail.student?.name || 'Student'}
                </h3>
                <p className="text-xs text-slate-500">
                  {studentDetail.student?.roll_no} &bull; {studentDetail.student?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStudentDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentDetail.resume ? (
              <>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[11px] font-bold text-slate-700">{studentDetail.resume.file_name}</p>
                  <p className="text-[10px] text-slate-500">
                    Strength {studentDetail.resume.profile?.strength || 0}% &bull; updated{' '}
                    {(studentDetail.resume.updated_at || '').slice(0, 10)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(studentDetail.resume.skills || []).map((skill) => (
                      <Chip key={skill} tone="blue">{skill}</Chip>
                    ))}
                  </div>
                </div>
                {studentDetail.resume.profile?.suggested_roles?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Suggested roles
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {studentDetail.resume.profile.suggested_roles.map((roleName) => (
                        <Chip key={roleName} tone="mint">{roleName}</Chip>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Applications ({studentDetail.applications?.length || 0})
                  </span>
                  <div className="space-y-1.5 mt-1.5">
                    {(studentDetail.applications || []).map((app) => (
                      <a
                        key={app.id}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-100 hover:border-blue-200 text-[11px]"
                      >
                        <span className="font-semibold text-slate-700 truncate">{app.title}</span>
                        <span className="text-slate-400 shrink-0">{app.company}</span>
                      </a>
                    ))}
                    {(studentDetail.applications || []).length === 0 && (
                      <p className="text-[11px] text-slate-400">No applications yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                This student has not uploaded a resume yet. Ask them to open Job Finds.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
