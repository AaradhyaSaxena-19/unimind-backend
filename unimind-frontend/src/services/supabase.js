import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lybvaakprmyqpwkslqvi.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL && SUPABASE_KEY && !SUPABASE_KEY.startsWith('paste-');
};

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Helper to fetch user's profile and role
export const fetchUserProfile = async (userId) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .table('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

// Helper for student academic data
export const fetchStudentAcademicData = async (user) => {
  if (!supabase || !user) return null;

  try {
    // 1. Fetch profile
    const profile = await fetchUserProfile(user.id);
    const semester = profile?.semester || 1;

    // 2. Fetch college rules
    const { data: rulesData } = await supabase.table('college_rules').select('rule_key, rule_value');
    const rules = {};
    (rulesData || []).forEach((r) => {
      rules[r.rule_key] = r.rule_value;
    });

    // 3. Fetch overall attendance
    const { data: overallData } = await supabase
      .table('attendance_overall')
      .select('*')
      .eq('semester', semester);

    // 4. Fetch monthly attendance
    const { data: monthlyData } = await supabase
      .table('attendance_monthly')
      .select('*')
      .eq('semester', semester)
      .order('month_start', { ascending: false })
      .limit(3);

    // 5. Fetch missed lectures
    const { data: missedData } = await supabase
      .table('missed_lectures')
      .select('subject_code, subject_name, attendance_date, lecture_time, lecture_end_time, lecture_number')
      .eq('semester', semester)
      .order('attendance_date', { ascending: false })
      .limit(10);

    // 6. Fetch subjects & attendance summary
    const { data: subjectsData } = await supabase
      .table('subjects')
      .select('id, code, name, semester');

    const { data: enrollmentsData } = await supabase
      .table('enrollments')
      .select('subject_id');

    const enrolledIds = new Set((enrollmentsData || []).map((e) => e.subject_id));
    const currentSubjects = (subjectsData || []).filter(
      (s) => enrolledIds.has(s.id) && s.semester === semester
    );

    const { data: summaryData } = await supabase
      .table('attendance_summary')
      .select('*');

    const summaryMap = {};
    (summaryData || []).forEach((row) => {
      summaryMap[row.subject_id] = row;
    });

    // 7. Fetch marks
    const subjectIds = currentSubjects.map((s) => s.id);
    let marksData = [];
    if (subjectIds.length > 0) {
      const { data: mData } = await supabase
        .table('marks')
        .select('subject_id, exam_type, marks_obtained, max_marks')
        .in('subject_id', subjectIds);
      marksData = mData || [];
    }

    // 8. Fetch fees
    const { data: feesData } = await supabase
      .table('fees')
      .select('description, total_amount, paid_amount, pending_amount, due_date')
      .order('due_date', { ascending: true });

    // 9. Fetch assignments
    const { data: assignmentsData } = await supabase
      .table('assignments')
      .select('id, subject_id, title, due_date')
      .order('due_date', { ascending: true });

    const { data: submissionsData } = await supabase
      .table('submissions')
      .select('assignment_id');
    const submittedIds = new Set((submissionsData || []).map((s) => s.assignment_id));

    return {
      profile,
      rules,
      overall: overallData?.[0] || null,
      monthly: monthlyData || [],
      missedLectures: missedData || [],
      subjects: currentSubjects,
      attendanceSummary: summaryMap,
      marks: marksData,
      fees: feesData || [],
      assignments: (assignmentsData || []).map((a) => ({
        ...a,
        isSubmitted: submittedIds.has(a.id),
      })),
    };
  } catch (err) {
    console.error('Error fetching student academic data from Supabase:', err);
    throw err;
  }
};

// Helper for teacher subjects
export const fetchTeacherSubjects = async (teacherId) => {
  if (!supabase || !teacherId) return [];
  const { data, error } = await supabase
    .table('subjects')
    .select('id, code, name, semester')
    .eq('teacher_id', teacherId);

  if (error) {
    console.error('Error fetching teacher subjects:', error);
    return [];
  }
  return data || [];
};
