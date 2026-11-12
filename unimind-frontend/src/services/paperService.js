import api from './api';

export const previewPaper = async ({ file, subjectCode, examYear }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject_code', subjectCode);
  formData.append('exam_year', examYear);

  const response = await api.post('/api/papers/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // { subject: {...}, exam_year: number, scanned: boolean, questions: [...] }
};

export const savePaper = async ({ file, subjectCode, examYear, questions, replace = false }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject_code', subjectCode);
  formData.append('exam_year', examYear);
  formData.append('questions', typeof questions === 'string' ? questions : JSON.stringify(questions));
  formData.append('replace', replace ? 'true' : 'false');

  const response = await api.post('/api/papers/save', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // { saved: true, questions: number, pdf: string }
};
