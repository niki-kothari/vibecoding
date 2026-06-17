import { useState, useEffect } from 'react';
import { GlassWater, Cloud, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

const WATER_STORAGE_KEY = '_planner_water_count_v1_';
const AUTO_SYNC_STORAGE_KEY = '_planner_water_autosync_v1_';

const getLocalDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function WaterTracker() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state
  const [autoSync, setAutoSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'error'>('synced');
  const [dbCount, setDbCount] = useState<number | null>(null);

  // Load autoSync setting from local storage
  useEffect(() => {
    const savedAutoSync = localStorage.getItem(AUTO_SYNC_STORAGE_KEY);
    if (savedAutoSync !== null) {
      setAutoSync(savedAutoSync === 'true');
    }
  }, []);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Synced counter loader
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setIsLoading(true);
      const todayStr = getLocalDateStr(new Date());
      const docRef = doc(db, 'hydrations', todayStr);

      const unsubscribeSnap = onSnapshot(
        docRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const cloudCount = data?.count || 0;
            setDbCount(cloudCount);
            setTarget(data?.target || 10);
            
            // If auto-sync is on, we take the cloud value. 
            // If offline/pending local changes exist and auto-sync is off, we keep the local state.
            if (autoSync) {
              setCount(cloudCount);
              setSyncStatus('synced');
            } else {
              // Compare local and cloud count
              setSyncStatus(count === cloudCount ? 'synced' : 'pending');
            }
          } else {
            // Document doesn't exist yet for today. We can store the current local count if custom,
            // or insert it blank (count 0) as requested.
            setDbCount(0);
            try {
              if (autoSync) {
                await setDoc(docRef, {
                  date: todayStr,
                  userId: user.uid,
                  count: count, // Sync current local state or 0
                  target: 10,
                  updatedAt: new Date().toISOString()
                });
                setDbCount(count);
                setSyncStatus('synced');
              } else {
                setSyncStatus('pending');
              }
            } catch (err) {
              console.error('Failed to init cloud hydration document:', err);
              setSyncStatus('error');
            }
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Firestore hydration sync error:', error);
          setSyncStatus('error');
          setIsLoading(false);
        }
      );

      return () => unsubscribeSnap();
    } else {
      // Offline fallback
      try {
        const saved = localStorage.getItem(WATER_STORAGE_KEY);
        if (saved) {
          setCount(parseInt(saved, 10));
        } else {
          setCount(0);
        }
      } catch (err) {
        console.error('Failed to parse local storage water log:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, authLoading, autoSync]);

  // Trigger manual save
  const handleSaveToCloud = async (overrideCount?: number) => {
    if (!user) return;
    const saveVal = overrideCount !== undefined ? overrideCount : count;
    setSyncStatus('syncing');
    const todayStr = getLocalDateStr(new Date());
    const docRef = doc(db, 'hydrations', todayStr);
    try {
      await setDoc(docRef, {
        date: todayStr,
        userId: user.uid,
        count: saveVal,
        target: target,
        updatedAt: new Date().toISOString()
      });
      setDbCount(saveVal);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error saving water count:', err);
      setSyncStatus('error');
      handleFirestoreError(err, OperationType.WRITE, `hydrations/${todayStr}`);
    }
  };

  const handleToggleAutoSync = (val: boolean) => {
    setAutoSync(val);
    localStorage.setItem(AUTO_SYNC_STORAGE_KEY, val.toString());
    if (val && user && count !== dbCount) {
      // Catch up live
      handleSaveToCloud(count);
    }
  };

  // Handle cup selection
  const selectCup = async (index: number) => {
    const newCount = index + 1;
    let targetCount = newCount;
    
    // Toggle last cup behavior
    if (count === newCount) {
      targetCount = newCount - 1;
    }

    setCount(targetCount);
    localStorage.setItem(WATER_STORAGE_KEY, targetCount.toString());

    if (user && autoSync) {
      setSyncStatus('syncing');
      const todayStr = getLocalDateStr(new Date());
      const docRef = doc(db, 'hydrations', todayStr);
      try {
        await setDoc(docRef, {
          date: todayStr,
          userId: user.uid,
          count: targetCount,
          target: target,
          updatedAt: new Date().toISOString()
        });
        setDbCount(targetCount);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        console.error('Failed auto-sync hydration:', err);
        handleFirestoreError(err, OperationType.WRITE, `hydrations/${todayStr}`);
      }
    } else if (user) {
      setSyncStatus('pending');
    }
  };

  // Handle reset
  const resetCount = async () => {
    setCount(0);
    localStorage.setItem(WATER_STORAGE_KEY, '0');

    if (user && autoSync) {
      setSyncStatus('syncing');
      const todayStr = getLocalDateStr(new Date());
      const docRef = doc(db, 'hydrations', todayStr);
      try {
        await setDoc(docRef, {
          date: todayStr,
          userId: user.uid,
          count: 0,
          target: target,
          updatedAt: new Date().toISOString()
        });
        setDbCount(0);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        console.error('Failed auto-sync reset:', err);
        handleFirestoreError(err, OperationType.WRITE, `hydrations/${todayStr}`);
      }
    } else if (user) {
      setSyncStatus('pending');
    }
  };

  // Automatically save to the cloud at end of day or when component unmounts/unloads
  useEffect(() => {
    const handleUnloadSave = () => {
      if (user && count !== dbCount && !autoSync) {
        const todayStr = getLocalDateStr(new Date());
        const data = {
          date: todayStr,
          userId: user.uid,
          count: count,
          target: target,
          updatedAt: new Date().toISOString()
        };
        // Use keepalive / sendBeacon equivalent if needed, but in single page apps we can ensure a firesafe update
        navigator.sendBeacon && navigator.sendBeacon(`/api/beacon-save`, JSON.stringify(data));
      }
    };
    window.addEventListener('beforeunload', handleUnloadSave);
    return () => window.removeEventListener('beforeunload', handleUnloadSave);
  }, [user, count, dbCount, autoSync, target]);

  // Build the glasses array (10 glass slots)
  const totalGlasses = 10;

  return (
    <div className="bg-[#fcfaf5] border border-[#e8dfcf] rounded-2xl p-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] flex flex-col gap-3 justify-between" id="planner-water-card">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#f0e7d5]" id="water-header">
          <div>
            <h3 className="text-sm font-architect text-[#847864] uppercase tracking-wider font-semibold flex items-center gap-1.5" id="water-card-title">
              <GlassWater className="w-4 h-4 text-[#587c9c]" />
              Hydration Tracker
            </h3>
            <p className="text-xs font-mono text-[#a1927c]">
              Drink 8-10 glasses daily for pristine health
            </p>
          </div>

          <div className="flex items-center gap-2" id="water-actions-panel">
            {/* Sync options / buttons next to reset */}
            <div className="flex items-center gap-1.5 bg-[#ebdcc9]/20 px-2 py-1 rounded-lg border border-[#ebdcc9]/40">
              {/* Reset button */}
              {count > 0 && (
                <button
                  onClick={resetCount}
                  className="text-[10px] font-mono text-[#a1927c] hover:text-[#cc5c65] bg-[#ebdcc9]/40 hover:bg-[#ebdcc9] px-2 py-0.5 rounded transition-all cursor-pointer"
                  id="water-reset-btn"
                >
                  Reset
                </button>
              )}

              {/* Cloud Save option near Reset */}
              {user && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSaveToCloud()}
                    disabled={syncStatus === 'synced' || syncStatus === 'syncing'}
                    className={`text-[10px] font-mono flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                      syncStatus === 'synced'
                        ? 'bg-[#edf7ee] text-[#439647] border border-[#cbe8ce]'
                        : syncStatus === 'syncing'
                        ? 'bg-[#fcf7ee] text-[#c08600] border border-[#f5e4bd] animate-pulse'
                        : syncStatus === 'pending'
                        ? 'bg-[#587c9c] text-white hover:bg-[#43617b]'
                        : 'bg-[#feeef0] text-[#cc5c65] border border-[#fbc9cd]'
                    }`}
                    title={
                      syncStatus === 'synced'
                        ? 'Data synced with Cloud'
                        : syncStatus === 'pending'
                        ? 'Click to Save Details manually to Cloud'
                        : syncStatus === 'syncing'
                        ? 'Saving...'
                        : 'Sync Error. Click to retry.'
                    }
                    id="water-cloud-save-btn"
                  >
                    {syncStatus === 'synced' && <Check className="w-2.5 h-2.5" />}
                    {syncStatus === 'syncing' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                    {syncStatus === 'pending' && <Cloud className="w-2.5 h-2.5" />}
                    {syncStatus === 'error' && <AlertCircle className="w-2.5 h-2.5" />}
                    <span>
                      {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Saving...' : 'Save ☁️'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sync Settings control */}
        {user && (
          <div className="flex items-center justify-between mb-3 px-2 py-1 bg-white/40 border border-[#f5efe4] rounded-lg text-[10px] font-mono text-[#8a7f6e]" id="sync-settings">
            <span className="flex items-center gap-1">
              <Cloud className="w-3 h-3 text-[#7b8fa1]" />
              Cloud Save Options:
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer hover:text-[#587c9c]" title="Automatically pushes changes to your Health log">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => handleToggleAutoSync(e.target.checked)}
                  className="rounded text-[#587c9c] focus:ring-[#587c9c] w-3 h-3 border-[#ebdcc9]"
                />
                <span>Auto-sync changes</span>
              </label>
            </div>
          </div>
        )}

        {/* Glasses layout grid - responsive 5x2 */}
        <div className="grid grid-cols-5 gap-3 justify-items-center py-2 bg-white border border-[#f0e7d5] rounded-xl p-3 shadow-inner" id="water-glasses-row">
          {Array.from({ length: totalGlasses }).map((_, i) => {
            const isFilled = i < count;
            return (
              <button
                key={i}
                type="button"
                onClick={() => selectCup(i)}
                className="relative group focus:outline-none cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105"
                id={`glass-slot-${i + 1}`}
                title={`Log glass ${i + 1}`}
              >
                <span className="sr-only">Cup {i + 1}</span>
                <div className="w-7 h-10 relative flex items-end overflow-hidden border-2 border-[#b5a796] rounded-b-lg rounded-t-sm bg-[#faf8f4] hover:border-[#587c9c] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                  {/* Water liquid filler */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: isFilled ? '100%' : '0%' }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className="absolute bottom-0 left-0 right-0 bg-[#add2ec] bg-gradient-to-t from-[#82afd2] to-[#bde2fc] rounded-b-md"
                    id={`water-fill-${i}`}
                  >
                    {/* Tiny wave/sparkle effect inside a filled glass */}
                    {isFilled && (
                      <div className="absolute top-0.5 left-0 right-0 h-1 bg-white/40 animate-pulse rounded-full" />
                    )}
                  </motion.div>
                  
                  {/* Subtle measurements on side */}
                  <div className="absolute left-0.5 top-2 w-[3px] h-[1px] bg-[#d7ccd3]/60" />
                  <div className="absolute left-0.5 top-5 w-[3px] h-[1px] bg-[#d7ccd3]/60" />
                </div>
                
                {/* Decorative index marker */}
                <span className="text-[9px] font-mono font-medium text-[#ad9e8d] mt-1 group-hover:text-[#587c9c]" id={`cup-label-${i + 1}`}>
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Motivational statement */}
      <div className="text-center py-1.5 bg-[#ebdcc9]/10 rounded-lg border border-dashed border-[#eadeca]" id="water-motivational-text">
        <span className="text-xs font-hand text-[#6b583e] font-semibold flex items-center justify-center gap-1.5">
          {count >= 10 ? (
            <span className="text-[#517c46] font-bold flex items-center gap-1">✨ Perfect Water Intake! Target Completed! 🎉</span>
          ) : count >= 8 ? (
            <span className="text-[#648459] font-semibold flex items-center gap-1">🌿 Full Hydration Achieved today! Excellent work!</span>
          ) : count > 4 ? (
            <span>💧 Good job, keep sipping! ({count}/10 glasses)</span>
          ) : count > 0 ? (
            <span>🍃 Wonderful, step by step you got this!</span>
          ) : (
            <span>🔋 Tap the glasses above as you drink!</span>
          )}
        </span>
      </div>
    </div>
  );
}
