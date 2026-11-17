import api from './api';

export const getProfile = async (role = 'student', studentId = null) => {
  const params = { role };
  if (studentId) params.student_id = studentId;
  const res = await api.get('/api/academic/profile', { params });
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.post('/api/academic/profile/update', data);
  return res.data;
};

export const getTimetable = async (day) => {
  const res = await api.get('/api/academic/timetable', { params: day ? { day } : {} });
  return res.data;
};

export const getAssignments = async (status = 'all', subject) => {
  const params = { status };
  if (subject) params.subject = subject;
  const res = await api.get('/api/academic/assignments', { params });
  return res.data;
};

export const submitAssignment = async ({ assignment_id, file_name, remarks }) => {
  const res = await api.post('/api/academic/assignments/submit', {
    assignment_id,
    file_name,
    remarks,
  });
  return res.data;
};

export const getAssessments = async () => {
  const res = await api.get('/api/academic/assessments');
  return res.data;
};

export const getAssessmentDetails = async (testId) => {
  const res = await api.get(`/api/academic/assessments/${testId}`);
  return res.data;
};

export const submitAssessment = async ({ assessment_id, answers }) => {
  const res = await api.post('/api/academic/assessments/submit', {
    assessment_id,
    answers,
  });
  return res.data;
};

export const getExams = async () => {
  const res = await api.get('/api/academic/exams');
  return res.data;
};

export const getResults = async () => {
  const res = await api.get('/api/academic/results');
  return res.data;
};

export const getFees = async () => {
  const res = await api.get('/api/academic/fees');
  return res.data;
};

export const payFee = async ({ amount, payment_mode, notes }) => {
  const res = await api.post('/api/academic/fees/pay', {
    amount,
    payment_mode,
    notes,
  });
  return res.data;
};

export const getAnnouncements = async () => {
  const res = await api.get('/api/academic/announcements');
  return res.data;
};

export const markAnnouncementRead = async (annId) => {
  const res = await api.post(`/api/academic/announcements/${annId}/read`);
  return res.data;
};

export const getNotifications = async () => {
  const res = await api.get('/api/academic/notifications');
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.post('/api/academic/notifications/read-all');
  return res.data;
};

export const clearNotification = async (notifId) => {
  const res = await api.delete(`/api/academic/notifications/${notifId}`);
  return res.data;
};

export const getEvents = async () => {
  const res = await api.get('/api/academic/events');
  return res.data;
};

export const getContent = async (subjectCode) => {
  const params = subjectCode ? { subject_code: subjectCode } : {};
  const res = await api.get('/api/academic/content', { params });
  return res.data;
};

export const getMessages = async () => {
  const res = await api.get('/api/academic/messages');
  return res.data;
};

export const sendMessage = async ({ faculty_name, subject, text }) => {
  const res = await api.post('/api/academic/messages/send', {
    faculty_name,
    subject,
    text,
  });
  return res.data;
};

export const getDocuments = async () => {
  const res = await api.get('/api/academic/documents');
  return res.data;
};

export const uploadDocument = async (formData) => {
  const res = await api.post('/api/academic/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const verifyQR = async ({ qr_data, verification_type = 'attendance' }) => {
  const res = await api.post('/api/academic/qr/verify', {
    qr_data,
    verification_type,
  });
  return res.data;
};

export const getParentChildData = async () => {
  const res = await api.get('/api/academic/parent/child');
  return res.data;
};

export const getAnalytics = async () => {
  const res = await api.get('/api/academic/analytics');
  return res.data;
};

export const getAdminSummary = async () => {
  const res = await api.get('/api/academic/admin/summary');
  return res.data;
};

export const createAdminStudent = async (studentData) => {
  const res = await api.post('/api/academic/admin/students', studentData);
  return res.data;
};
export const addStudent = createAdminStudent;

export const getStudentDetails = async (studentId) => {
  const res = await api.get(`/api/academic/admin/students/${studentId}`);
  return res.data;
};

export const updateStudent = async (studentId, studentData) => {
  const res = await api.put(`/api/academic/admin/students/${studentId}`, studentData);
  return res.data;
};

export const deleteAdminStudent = async (studentId) => {
  const res = await api.delete(`/api/academic/admin/students/${studentId}`);
  return res.data;
};
export const deleteStudent = deleteAdminStudent;

export const loginAcademic = async ({ identifier, password, role }) => {
  const res = await api.post('/api/academic/auth/login', {
    identifier,
    password,
    role,
  });
  return res.data;
};

