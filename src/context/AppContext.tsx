import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import { onIdTokenChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import type { DailyMetrics, TraineeProfile, MetricKey, NavTab } from '../types/index.ts';
import { createDefaultProfile, createNewUserProfile, createDefaultMetrics, getTodayDateString } from '../utils/reportGenerator.ts';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase.ts';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isCloudSynced: boolean;
  refreshCloudData: () => Promise<void>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentMetrics: DailyMetrics;
  allMetrics: Record<string, DailyMetrics>;
  profile: TraineeProfile;
  updateProfile: (updated: Partial<TraineeProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
  incrementMetric: (key: MetricKey) => void;
  decrementMetric: (key: MetricKey) => void;
  setMetricValue: (key: MetricKey, value: number) => void;
  updateRemarks: (remarks: string) => void;
  resetCurrentDay: () => void;
  clearAllData: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  quickEditMetric: MetricKey | null;
  setQuickEditMetric: (key: MetricKey | null) => void;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_METRICS = 'demo_metrics_prod_v1';
const STORAGE_KEY_PROFILE = 'demo_profile_prod_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Default to today's real date
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quickEditMetric, setQuickEditMetric] = useState<MetricKey | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clean production state without mock data
  const [allMetrics, setAllMetrics] = useState<Record<string, DailyMetrics>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_METRICS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Local state for profile
  const [profile, setProfile] = useState<TraineeProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return createDefaultProfile();
  });

  const userRef = useRef<User | null>(null);
  userRef.current = user;
  const previousUserRef = useRef<User | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 1. Validate connection to Firestore on initial boot
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Auth state & ID token listener (maintains live session even across token refreshes)
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      const wasLoggedOut = !previousUserRef.current;
      setUser(currentUser);
      userRef.current = currentUser;
      previousUserRef.current = currentUser;
      setAuthLoading(false);

      if (currentUser) {
        setIsCloudSynced(true);
        if (wasLoggedOut) {
          showToast(`Signed in as ${currentUser.displayName || currentUser.email}`);
        }

        // Sync or initialize user profile in Firestore
        const profilePath = `users/${currentUser.uid}`;
        try {
          const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setProfile({
              name: data.name || currentUser.displayName || 'Trainee',
              employeeId: data.employeeId || '',
              teamLead: data.teamLead || '',
              batch: data.batch || '',
              dailyTarget: data.dailyTarget ?? 10,
              phone: data.phone || '',
            });
          } else {
            // ALWAYS reset the user profile data for new user:
            const newUserName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Trainee');
            const cleanNewProfile = createNewUserProfile(newUserName, currentUser.email || undefined);

            setProfile(cleanNewProfile);
            setAllMetrics({}); // Start with zero metrics for brand new user

            const initialProfile = {
              userId: currentUser.uid,
              name: cleanNewProfile.name,
              email: currentUser.email || '',
              employeeId: '',
              teamLead: '',
              batch: '',
              dailyTarget: 10,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', currentUser.uid), initialProfile);
            showToast('New user profile initialized with fresh defaults');
          }
        } catch (err) {
          console.warn('Profile sync initialization notice:', err);
        }
      } else {
        setIsCloudSynced(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Proactive Session Keep-Alive Loop:
  // Firebase ID tokens expire every 60 minutes.
  // Proactively refresh tokens every 20 minutes and whenever the app wakes up from sleep
  // to ensure users are NEVER logged out automatically.
  useEffect(() => {
    if (!user) return;

    const keepAliveTimer = setInterval(async () => {
      try {
        if (auth.currentUser) {
          // true forces fresh token from Google Auth servers
          await auth.currentUser.getIdToken(true);
        }
      } catch (err) {
        console.warn('Proactive auth token refresh attempt:', err);
      }
    }, 20 * 60 * 1000); // 20 minutes

    // Wake-up handler: when user unlocks screen, returns from another app, or switches tabs
    const handleWakeUp = async () => {
      if (document.visibilityState === 'visible' && auth.currentUser) {
        try {
          await auth.currentUser.getIdToken(false);
          setIsCloudSynced(true);
        } catch (err) {
          console.warn('Wake-up token check notice:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleWakeUp);
    window.addEventListener('focus', handleWakeUp);

    return () => {
      clearInterval(keepAliveTimer);
      document.removeEventListener('visibilitychange', handleWakeUp);
      window.removeEventListener('focus', handleWakeUp);
    };
  }, [user]);

  // 4. Sync real user metrics and profile from Firestore in real-time across multiple devices
  useEffect(() => {
    if (!user) return;

    setIsCloudSynced(true);

    // A. Real-time listener for trainee metrics subcollection
    const metricsColPath = `users/${user.uid}/metrics`;
    const unsubscribeMetrics = onSnapshot(
      collection(db, 'users', user.uid, 'metrics'),
      (snapshot) => {
        const cloudData: Record<string, DailyMetrics> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          cloudData[docSnap.id] = {
            date: data.date || docSnap.id,
            totalBookings: Number(data.totalBookings) || 0,
            todayD0: Number(data.todayD0) || 0,
            tomorrowD1: Number(data.tomorrowD1) || 0,
            completions: Number(data.completions) || 0,
            cancellations: Number(data.cancellations) || 0,
            remarks: data.remarks || '',
            lastUpdated: data.updatedAt,
          };
        });

        // Live server data replaces local state so changes across multiple devices sync 1:1
        setAllMetrics(cloudData);
        try {
          localStorage.setItem(`${STORAGE_KEY_METRICS}_${user.uid}`, JSON.stringify(cloudData));
        } catch {
          // ignore
        }
      },
      (error) => {
        console.warn('Real-time metrics sync status notice:', error);
        setIsCloudSynced(false);
      }
    );

    // B. Real-time listener for trainee profile document
    const profilePath = `users/${user.uid}`;
    const unsubscribeProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile((prev) => ({
            ...prev,
            name: data.name || user.displayName || prev.name,
            employeeId: data.employeeId ?? prev.employeeId,
            teamLead: data.teamLead ?? prev.teamLead,
            batch: data.batch ?? prev.batch,
            dailyTarget: Number(data.dailyTarget) || prev.dailyTarget || 10,
            phone: data.phone ?? prev.phone ?? '',
          }));
        }
      },
      (error) => {
        console.warn('Real-time profile sync status notice:', error);
      }
    );

    return () => {
      unsubscribeMetrics();
      unsubscribeProfile();
    };
  }, [user]);

  // Persist metrics to localStorage for offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(allMetrics));
    } catch {
      // ignore
    }
  }, [allMetrics]);

  // Persist profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      showToast('Sign-in cancelled or failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      const fresh = createNewUserProfile();
      setProfile(fresh);
      setAllMetrics({});
      try {
        localStorage.removeItem(STORAGE_KEY_METRICS);
        localStorage.removeItem(STORAGE_KEY_PROFILE);
      } catch {
        // ignore
      }
      showToast('Signed out & user profile data reset');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const resetProfile = async () => {
    const cleanProfile = createNewUserProfile(
      user?.displayName || undefined,
      user?.email || undefined
    );
    setProfile(cleanProfile);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            userId: user.uid,
            name: cleanProfile.name,
            employeeId: '',
            teamLead: '',
            batch: '',
            dailyTarget: 10,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
    showToast('Trainee profile data has been reset to defaults');
  };

  const updateProfile = async (updated: Partial<TraineeProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            userId: user.uid,
            name: newProfile.name,
            employeeId: newProfile.employeeId,
            teamLead: newProfile.teamLead,
            batch: newProfile.batch,
            dailyTarget: newProfile.dailyTarget,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
    showToast('Profile updated successfully');
  };

  // If no metric exists yet for selectedDate, dynamically generate clean zero metrics
  const currentMetrics = allMetrics[selectedDate] || createDefaultMetrics(selectedDate);

  const saveMetricsToFirestore = async (dateStr: string, metrics: DailyMetrics, uid?: string) => {
    const targetUid = uid || auth.currentUser?.uid || userRef.current?.uid;
    if (!targetUid) return;
    const docPath = `users/${targetUid}/metrics/${dateStr}`;
    try {
      await setDoc(
        doc(db, 'users', targetUid, 'metrics', dateStr),
        {
          userId: targetUid,
          date: dateStr,
          totalBookings: Number(metrics.totalBookings) || 0,
          todayD0: Number(metrics.todayD0) || 0,
          tomorrowD1: Number(metrics.tomorrowD1) || 0,
          completions: Number(metrics.completions) || 0,
          cancellations: Number(metrics.cancellations) || 0,
          remarks: String(metrics.remarks || ''),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to sync metric to Firestore (offline or transient):', err);
      setIsCloudSynced(false);
    }
  };

  const updateCurrentMetrics = (updater: (prev: DailyMetrics) => DailyMetrics) => {
    const current = allMetrics[selectedDate] || createDefaultMetrics(selectedDate);
    const updated = updater(current);
    const withTimestamp = {
      ...updated,
      lastUpdated: new Date().toISOString(),
    };

    setAllMetrics((prev) => ({
      ...prev,
      [selectedDate]: withTimestamp,
    }));

    const activeUser = auth.currentUser || userRef.current;
    if (activeUser) {
      saveMetricsToFirestore(selectedDate, withTimestamp, activeUser.uid);
    }
  };

  const refreshCloudData = async () => {
    const activeUser = auth.currentUser || userRef.current;
    if (!activeUser) {
      showToast('Please sign in with Google to sync data from the cloud.');
      return;
    }

    try {
      const metricsColRef = collection(db, 'users', activeUser.uid, 'metrics');
      const snapshot = await getDocs(metricsColRef);
      const cloudData: Record<string, DailyMetrics> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        cloudData[docSnap.id] = {
          date: data.date || docSnap.id,
          totalBookings: Number(data.totalBookings) || 0,
          todayD0: Number(data.todayD0) || 0,
          tomorrowD1: Number(data.tomorrowD1) || 0,
          completions: Number(data.completions) || 0,
          cancellations: Number(data.cancellations) || 0,
          remarks: data.remarks || '',
          lastUpdated: data.updatedAt,
        };
      });

      setAllMetrics(cloudData);

      const profileDoc = await getDoc(doc(db, 'users', activeUser.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setProfile((prev) => ({
          ...prev,
          name: data.name || activeUser.displayName || prev.name,
          employeeId: data.employeeId ?? prev.employeeId,
          teamLead: data.teamLead ?? prev.teamLead,
          batch: data.batch ?? prev.batch,
          dailyTarget: Number(data.dailyTarget) || prev.dailyTarget || 10,
        }));
      }

      setIsCloudSynced(true);
      showToast('All devices synchronized with live Firestore data!');
    } catch (err) {
      console.error('Manual refresh error:', err);
      showToast('Sync check failed. Please verify internet connection.');
    }
  };

  const incrementMetric = (key: MetricKey) => {
    updateCurrentMetrics((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const decrementMetric = (key: MetricKey) => {
    updateCurrentMetrics((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1),
    }));
  };

  const setMetricValue = (key: MetricKey, value: number) => {
    const safeVal = Math.max(0, Math.floor(value));
    updateCurrentMetrics((prev) => ({
      ...prev,
      [key]: safeVal,
    }));
  };

  const updateRemarks = (remarks: string) => {
    updateCurrentMetrics((prev) => ({
      ...prev,
      remarks,
    }));
  };

  const resetCurrentDay = () => {
    updateCurrentMetrics((prev) => ({
      ...prev,
      totalBookings: 0,
      todayD0: 0,
      tomorrowD1: 0,
      completions: 0,
      cancellations: 0,
      remarks: '',
    }));
    showToast('Reset counts for current date to 0');
  };

  const clearAllData = () => {
    setAllMetrics({});
    try {
      localStorage.removeItem(STORAGE_KEY_METRICS);
    } catch {
      // ignore
    }
    showToast('Cleared all local demo records');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        signInWithGoogle,
        logout,
        isCloudSynced,
        refreshCloudData,
        selectedDate,
        setSelectedDate,
        currentMetrics,
        allMetrics,
        profile,
        updateProfile,
        resetProfile,
        incrementMetric,
        decrementMetric,
        setMetricValue,
        updateRemarks,
        resetCurrentDay,
        clearAllData,
        activeTab,
        setActiveTab,
        isReportModalOpen,
        setIsReportModalOpen,
        isDrawerOpen,
        setIsDrawerOpen,
        quickEditMetric,
        setQuickEditMetric,
        isDatePickerOpen,
        setIsDatePickerOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
