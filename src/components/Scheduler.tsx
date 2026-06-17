import { useState, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

const SCHEDULE_STORAGE_KEY = '_planner_hover_schedule_v1_';

const STANDARD_HOURS = [
  '8:00 AM',
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:00 PM',
  '6:00 PM',
  '8:00 PM',
];

const getLocalDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function Scheduler() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Authenticate user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization loader
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setIsLoading(true);
      const todayStr = getLocalDateStr(new Date());
      const docRef = doc(db, 'schedules', todayStr);

      const unsubscribeSnap = onSnapshot(
        docRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setSchedule(data?.slots || {});
          } else {
            // Document does not exist yet. Create one with blank data as requested.
            try {
              await setDoc(docRef, {
                date: todayStr,
                userId: user.uid,
                slots: {},
                updatedAt: new Date().toISOString()
              });
              setSchedule({});
            } catch (err) {
              console.error('Failed to initialize empty schedule document:', err);
            }
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Firestore schedule sync error:', error);
          setIsLoading(false);
        }
      );

      return () => unsubscribeSnap();
    } else {
      // Offline fallback
      try {
        const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
        if (saved) {
          setSchedule(JSON.parse(saved));
        } else {
          setSchedule({});
        }
      } catch (err) {
        console.error('Failed to parse local storage schedules:', err);
        setSchedule({});
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, authLoading]);

  const handleChangeSlot = async (hour: string, text: string) => {
    const updated = { ...schedule, [hour]: text };
    setSchedule(updated);

    if (user) {
      const todayStr = getLocalDateStr(new Date());
      const docRef = doc(db, 'schedules', todayStr);
      try {
        await setDoc(docRef, {
          date: todayStr,
          userId: user.uid,
          slots: updated,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving schedule slot change:', err);
        handleFirestoreError(err, OperationType.WRITE, `schedules/${todayStr}`);
      }
    } else {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleClear = async () => {
    setSchedule({});

    if (user) {
      const todayStr = getLocalDateStr(new Date());
      const docRef = doc(db, 'schedules', todayStr);
      try {
        await setDoc(docRef, {
          date: todayStr,
          userId: user.uid,
          slots: {},
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error clearing schedule:', err);
        handleFirestoreError(err, OperationType.WRITE, `schedules/${todayStr}`);
      }
    } else {
      localStorage.removeItem(SCHEDULE_STORAGE_KEY);
    }
  };

  return (
    <div className="bg-[#f5f3f7] border border-[#ded8e0] rounded-2xl p-4 flex flex-col justify-between h-full shadow-[0_2px_6px_rgba(0,0,0,0.02)]" id="planner-hourly-scheduler">
      <div>
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-[#d3cad6]" id="schedule-header">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#7b6182]" />
            <h3 className="text-sm font-architect text-[#7b6182] uppercase tracking-wider font-semibold flex items-center gap-1" id="schedule-title">
              Scheduled
              {isLoading && (
                <Loader2 className="w-3 h-3 text-[#7b6182] animate-spin" />
              )}
            </h3>
          </div>
          {Object.values(schedule).some(Boolean) && (
            <button
              onClick={handleClear}
              className="text-[10px] font-mono text-[#8b7a90] hover:text-[#cc5c65] bg-[#ece2ef] hover:bg-[#ebdce9] px-2 py-0.5 rounded transition-all cursor-pointer"
              id="schedule-clear-btn"
            >
              Clear Day
            </button>
          )}
        </div>

        {/* Schedule grid columns */}
        <div className="flex flex-col gap-2.5 mt-2" id="schedule-lines">
          {STANDARD_HOURS.map((hour) => (
            <div
              key={hour}
              className="flex items-center gap-3 border-b border-dashed border-[#e6e2e9] pb-1"
              id={`hour-line-${hour.replace(/ |:/g, '-')}`}
            >
              {/* Time Label */}
              <span className="text-[11px] font-mono font-medium text-[#7b6182] w-16 flex-shrink-0 select-none">
                {hour}
              </span>

              {/* Editable note line */}
              <input
                type="text"
                value={schedule[hour] || ''}
                onChange={(e) => handleChangeSlot(hour, e.target.value)}
                placeholder="--- ( tap to add event )"
                className="flex-1 bg-transparent border-none text-[#3a2f3d] placeholder-[#b7acbd]/60 font-hand text-sm focus:outline-none focus:placeholder-transparent py-0.5"
                maxLength={80}
                id={`hour-input-${hour.replace(/ |:/g, '-')}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-center border-t border-dashed border-[#d3cad6] pt-2" id="scheduler-footer">
        <span className="text-[10px] uppercase font-mono text-[#8b7a90]">
          Plan hours, master goals.
        </span>
      </div>
    </div>
  );
}
