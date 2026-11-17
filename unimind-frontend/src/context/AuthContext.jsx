import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, fetchUserProfile, isSupabaseConfigured } from '../services/supabase';
import { loginAcademic } from '../services/academicService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('unimind_access_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            setToken(session.access_token);
            localStorage.setItem('unimind_access_token', session.access_token);
            const userProfile = await fetchUserProfile(session.user.id);
            if (mounted) setProfile(userProfile);
          }
        } else {
          // Check for cached demo session
          const cachedUser = localStorage.getItem('unimind_demo_user');
          const cachedProfile = localStorage.getItem('unimind_demo_profile');
          if (cachedUser && cachedProfile && mounted) {
            setUser(JSON.parse(cachedUser));
            setProfile(JSON.parse(cachedProfile));
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase auth state changes
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setToken(session.access_token);
          localStorage.setItem('unimind_access_token', session.access_token);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
          setToken(null);
          localStorage.removeItem('unimind_access_token');
          localStorage.removeItem('unimind_demo_user');
          localStorage.removeItem('unimind_demo_profile');
        }
      });

      return () => {
        mounted = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await loginAcademic({ identifier, password });
      if (res.success) {
        setUser(res.user);
        setProfile(res.profile);
        setToken(res.token);
        localStorage.setItem('unimind_access_token', res.token);
        localStorage.setItem('unimind_demo_user', JSON.stringify(res.user));
        localStorage.setItem('unimind_demo_profile', JSON.stringify(res.profile));
        return { user: res.user, profile: res.profile, role: res.role };
      }
    } catch (apiErr) {
      if (apiErr.response?.data?.detail) {
        throw new Error(apiErr.response.data.detail);
      }
      if (isSupabaseConfigured() && supabase) {
        return await loginWithSupabase(identifier, password);
      }
      throw new Error(apiErr.message || 'Login failed. Please check your credentials.');
    }
  };

  const loginWithSupabase = async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured yet. Please provide VITE_SUPABASE_ANON_KEY in your .env file or use Quick Demo Login.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    setUser(data.user);
    setToken(data.session.access_token);
    localStorage.setItem('unimind_access_token', data.session.access_token);

    const userProfile = await fetchUserProfile(data.user.id);
    setProfile(userProfile);
    return { user: data.user, profile: userProfile };
  };

  // Demo fallback for instant UI inspection when Supabase keys are pending
  const loginDemo = (role = 'student') => {
    const demoData = {
      student: {
        user: { id: 'demo-student-id', email: 'student1@example.com' },
        profile: {
          id: 'demo-student-id',
          full_name: 'Aaradhya Saxena',
          role: 'student',
          course: 'B.Tech CSE',
          year: 3,
          semester: 5,
          section: 'A',
          roll_no: '210161010001',
          camu_id: 'RBMI2021001',
          status: 'Active',
          college: 'RBMI Group of Institutions',
        },
      },
      teacher: {
        user: { id: 'demo-teacher-id', email: 'teacher1@example.com' },
        profile: {
          id: 'demo-teacher-id',
          full_name: 'Dr. Sharma',
          role: 'teacher',
          email: 'teacher1@example.com',
          department_id: 'dept-cse',
          status: 'Active',
          college: 'RBMI Group of Institutions',
        },
      },
      admin: {
        user: { id: 'demo-admin-id', email: 'admin1@example.com' },
        profile: {
          id: 'demo-admin-id',
          full_name: 'System Admin',
          role: 'admin',
          email: 'admin1@example.com',
          status: 'Active',
          college: 'RBMI Group of Institutions',
        },
      },
      parent: {
        user: { id: 'demo-parent-id', email: 'parent1@example.com' },
        profile: {
          id: 'demo-parent-id',
          full_name: 'Rajesh Saxena',
          role: 'parent',
          email: 'parent1@example.com',
          child_name: 'Aaradhya Saxena',
          child_roll: '210161010001',
          child_course: 'B.Tech CSE - Sem 5',
          status: 'Active',
          college: 'RBMI Group of Institutions',
        },
      },
    };

    const target = demoData[role] || demoData.student;
    setUser(target.user);
    setProfile(target.profile);
    const mockToken = `demo_token_${role}_${Date.now()}`;
    setToken(mockToken);
    localStorage.setItem('unimind_access_token', mockToken);
    localStorage.setItem('unimind_demo_user', JSON.stringify(target.user));
    localStorage.setItem('unimind_demo_profile', JSON.stringify(target.profile));
    return target;
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('unimind_access_token');
    localStorage.removeItem('unimind_demo_user');
    localStorage.removeItem('unimind_demo_profile');
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    }
    // Simulation
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  };

  const value = {
    user,
    profile,
    token,
    role: profile?.role || null,
    loading,
    isConfigured: isSupabaseConfigured(),
    login,
    loginWithSupabase,
    loginDemo,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
