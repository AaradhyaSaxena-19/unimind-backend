import api from './api';

// Cross-role campus endpoints: one roster shared by student, faculty and admin.

export const getMe = async () => {
  const res = await api.get('/api/academic/me');
  return res.data;
};

export const getFacultyOverview = async () => {
  const res = await api.get('/api/academic/faculty/overview');
  return res.data;
};

export const getAdminLinkage = async () => {
  const res = await api.get('/api/academic/admin/linkage');
  return res.data;
};

export const getFacultySubmissions = async (status = 'all') => {
  const res = await api.get('/api/academic/faculty/submissions', { params: { status } });
  return res.data;
};

export const gradeSubmission = async (submissionId, { marks, remarks = '' }) => {
  const res = await api.post(`/api/academic/faculty/submissions/${submissionId}/grade`, {
    marks,
    remarks,
  });
  return res.data;
};

export const createAssignment = async (assignment) => {
  const res = await api.post('/api/academic/faculty/assignments', assignment);
  return res.data;
};

export const createCircular = async (circular) => {
  const res = await api.post('/api/academic/announcements', circular);
  return res.data;
};

export const getFacultyStudentDetail = async (studentId) => {
  const res = await api.get(`/api/academic/faculty/students/${studentId}`);
  return res.data;
};

export const createFaculty = async (faculty) => {
  const res = await api.post('/api/academic/admin/faculty', faculty);
  return res.data;
};

export const getFacultyList = async () => {
  const res = await api.get('/api/academic/admin/faculty');
  return res.data;
};

export const getCampusActivity = async (limit = 25) => {
  const res = await api.get('/api/academic/linkage/activity', { params: { limit } });
  return res.data;
};
