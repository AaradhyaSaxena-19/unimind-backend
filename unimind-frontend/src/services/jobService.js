import api from './api';

// Job Finds: resume upload, live job scraping, applications and campus openings.

export const getJobsOverview = async () => {
  const res = await api.get('/api/jobs/overview');
  return res.data;
};

export const uploadResume = async ({ file, target_role = '', preferred_location = '' }) => {
  const form = new FormData();
  form.append('file', file);
  form.append('target_role', target_role);
  form.append('preferred_location', preferred_location);
  const res = await api.post('/api/jobs/resume/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return res.data;
};

export const deleteResume = async () => {
  const res = await api.delete('/api/jobs/resume');
  return res.data;
};

export const searchJobs = async ({ query, location, remote, limit = 30, skills = null }) => {
  const res = await api.post(
    '/api/jobs/search',
    {
      query: query || '',
      location: location || '',
      remote: Boolean(remote),
      limit,
      ...(skills && skills.length ? { skills } : {}),
    },
    { timeout: 90000 }
  );
  return res.data;
};

export const applyToJob = async (job) => {
  const res = await api.post('/api/jobs/apply', {
    job_id: job.id,
    title: job.title,
    company: job.company,
    url: job.url,
    source: job.source,
    location: job.location,
    job_type: job.type,
    match: job.match,
  });
  return res.data;
};

export const getMyApplications = async () => {
  const res = await api.get('/api/jobs/applications');
  return res.data;
};

export const getOpenings = async () => {
  const res = await api.get('/api/jobs/openings');
  return res.data;
};

export const createOpening = async (opening) => {
  const res = await api.post('/api/jobs/openings', opening);
  return res.data;
};

export const deleteOpening = async (openingId) => {
  const res = await api.delete(`/api/jobs/openings/${openingId}`);
  return res.data;
};

export const getPlacementOverview = async () => {
  const res = await api.get('/api/jobs/placement/overview');
  return res.data;
};

export const getStudentPlacement = async (studentId) => {
  const res = await api.get(`/api/jobs/student/${studentId}`);
  return res.data;
};
