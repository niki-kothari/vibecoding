/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Sparkles, Plus, Trash2, SlidersHorizontal, BookOpen, Clock, Heart, AlertTriangle, Mail, FileSpreadsheet, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo, TodoFilter, TodoSort, HydrationLog } from './types';
import { StatsCard } from './components/StatsCard';
import { TodoForm } from './components/TodoForm';
import { TodoFilters } from './components/TodoFilters';
import { TodoItem } from './components/TodoItem';
import { DoodleCanvas } from './components/DoodleCanvas';
import { WaterTracker } from './components/WaterTracker';
import { Top3Priorities } from './components/Top3Priorities';
import { Scheduler } from './components/Scheduler';
import { NotesArea } from './components/NotesArea';
import { ReminderModal } from './components/ReminderModal';

// Firebase Integrations
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch, deleteField } from 'firebase/firestore';
import { db, auth, signInWithGoogle, logOut, handleFirestoreError, OperationType, testConnection, ensureGmailToken, getCachedGmailToken } from './firebase';

// Google Sheets Sync
import { createSpreadsheet, appendTaskToSpreadsheet, appendTasksToSpreadsheet, SHEETS_ID_KEY, SHEETS_NAME_KEY } from './utils/sheetsSync';

// Expanded Workspace components
import { Sidebar } from './components/Sidebar';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { LoginPage } from './components/LoginPage';

const LOCAL_STORAGE_KEY = '_todo_app_tasks_v1_';
const HYDRATION_STORAGE_KEY = '_hydration_logs_v1_';


const getLocalDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowDateStr = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateStr(tomorrow);
};

const DEFAULT_TODOS: Todo[] = [
  {
    id: 'starter-1',
    text: '👋 Welcome back, Niki! Double-tap any task to quick-edit its text inline.',
    completed: false,
    priority: 'high',
    category: 'Personal',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'starter-2',
    text: '🥛 Track your daily hydration by checking water glasses in the intake pad.',
    completed: false,
    priority: 'medium',
    category: 'Health',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'starter-3',
    text: '🎨 Create scribbles or doodle drawings with custom pens on the interactive doodle pad below!',
    completed: false,
    priority: 'medium',
    category: 'Other',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'starter-4',
    text: '📅 Tasks scheduled for today or tomorrow show up automatically in the "For Today & Tomorrow" side panel!',
    completed: false,
    priority: 'low',
    category: 'Work',
    dueDate: getTomorrowDateStr(),
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState<TodoSort>('created-desc');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'reports' | 'automations'>('dashboard');

  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  // Google Sheets Sync state
  const [sheetsSyncEnabled, setSheetsSyncEnabled] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [sheetsSuccess, setSheetsSuccess] = useState<string | null>(null);

  // Initialize Sheets Info
  useEffect(() => {
    const savedId = localStorage.getItem(SHEETS_ID_KEY);
    const savedUrl = localStorage.getItem(SHEETS_NAME_KEY);
    const savedEnabled = localStorage.getItem('_google_sheets_sync_enabled_');
    if (savedId) setSpreadsheetId(savedId);
    if (savedUrl) setSpreadsheetUrl(savedUrl);
    setSheetsSyncEnabled(savedEnabled === 'true');
  }, []);

  const handleCreateAndConnectSheet = async () => {
    setSheetsLoading(true);
    setSheetsError(null);
    setSheetsSuccess(null);
    try {
      const accessToken = await ensureGmailToken();
      if (!accessToken) {
        throw new Error('Google authentication failed. Please sign in and grant permissions.');
      }

      const email = user?.email || 'niki.bhogar_gmail.com';
      const result = await createSpreadsheet(accessToken, email);

      setSpreadsheetId(result.spreadsheetId);
      setSpreadsheetUrl(result.spreadsheetUrl);
      setSheetsSyncEnabled(true);

      localStorage.setItem(SHEETS_ID_KEY, result.spreadsheetId);
      localStorage.setItem(SHEETS_NAME_KEY, result.spreadsheetUrl);
      localStorage.setItem('_google_sheets_sync_enabled_', 'true');

      if (todos.length > 0) {
        await appendTasksToSpreadsheet(accessToken, result.spreadsheetId, todos);
        setSheetsSuccess(`Success! Created spreadsheet and synced ${todos.length} existing tasks.`);
      } else {
        setSheetsSuccess('Success! Created a new Planner Sync Spreadsheet in Google Drive.');
      }
      setTimeout(() => setSheetsSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSheetsError(err.message || String(err));
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleDisconnectSheet = () => {
    const confirmed = window.confirm('Disconnect this spreadsheet? Tasks added hereafter will not sync to Google Sheets.');
    if (!confirmed) return;

    setSpreadsheetId(null);
    setSpreadsheetUrl(null);
    setSheetsSyncEnabled(false);

    localStorage.removeItem(SHEETS_ID_KEY);
    localStorage.removeItem(SHEETS_NAME_KEY);
    localStorage.setItem('_google_sheets_sync_enabled_', 'false');
    setSheetsSuccess('Successfully disconnected Google Sheet.');
    setTimeout(() => setSheetsSuccess(null), 3000);
  };

  const handleSyncAllToSheet = async () => {
    if (!spreadsheetId) return;
    setSheetsLoading(true);
    setSheetsError(null);
    setSheetsSuccess(null);
    try {
      const token = await ensureGmailToken();
      if (!token) throw new Error('Authorization token unavailable.');

      if (todos.length > 0) {
        await appendTasksToSpreadsheet(token, spreadsheetId, todos);
      }
      setSheetsSuccess(`Successfully synchronized all ${todos.length} tasks to your Google Sheet!`);
      setTimeout(() => setSheetsSuccess(null), 6000);
    } catch (err: any) {
      console.error(err);
      setSheetsError(err.message || String(err));
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setSheetsSyncEnabled(enabled);
    localStorage.setItem('_google_sheets_sync_enabled_', enabled ? 'true' : 'false');
  };

  // Gmail Reminder Modal State
  const [reminderModal, setReminderModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    todo?: Todo;
    targetsCount?: number;
  }>({
    isOpen: false,
    type: 'single',
  });
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [reminderError, setReminderError] = useState<string>('');
  const [reminderSuccess, setReminderSuccess] = useState<string>('');

  // Connection testing and initial setup
  useEffect(() => {
    testConnection();
  }, []);

  // Helper to sync any local-only tasks to cloud Firestore on signup/signin
  const uploadUnsyncedLocalTasks = async (uid: string, localTodos: Todo[]) => {
    const unsynced = localTodos.filter((t) => !t.userId);
    if (unsynced.length === 0) return;
    try {
      const batch = writeBatch(db);
      unsynced.forEach((todo) => {
        const id = todo.id;
        // Don't sync the starter greetings if the user wants clean slate
        if (id.startsWith('starter-')) return;
        const todoRef = doc(db, 'tasks', id);
        batch.set(todoRef, {
          text: todo.text,
          completed: todo.completed,
          priority: todo.priority,
          category: todo.category,
          createdAt: todo.createdAt,
          userId: uid,
          ...(todo.dueDate ? { dueDate: todo.dueDate } : {}),
          ...(todo.userName ? { userName: todo.userName } : {}),
          ...(todo.userEmail ? { userEmail: todo.userEmail } : {}),
          ...(todo.notes ? { notes: todo.notes } : {}),
          ...(todo.completedAt ? { completedAt: todo.completedAt } : {}),
        });
      });
      await batch.commit();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'tasks-sync-batch');
    }
  };

  // Auth observer & real-time sync with database rules
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        sessionStorage.setItem('loggedInUserEmail', currentUser.email);
      } else {
        sessionStorage.removeItem('loggedInUserEmail');
      }
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore sync when authenticated, fallback to localStorage when not signed in
  useEffect(() => {
    if (authLoading) return;

    let unsubscribeTasks: () => void;
    let unsubscribeHydrations: () => void;

    if (user) {
      // Auto-migrate any offline/unsynced local tasks to cloud Firestore on authenticated session launch
      try {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedTasks) {
          const parsed = JSON.parse(storedTasks);
          if (Array.isArray(parsed)) {
            const unsynced = parsed.filter((t) => !t.userId);
            if (unsynced.length > 0) {
              uploadUnsyncedLocalTasks(user.uid, parsed);
            }
          }
        }
      } catch (e) {
        console.error('Failed to auto-migrate client tasks to cloud:', e);
      }

      // Real-time synchronization with active user tasks
      const qTasks = query(collection(db, 'tasks'));
      unsubscribeTasks = onSnapshot(
        qTasks,
        (snapshot) => {
          const cloudTodos: Todo[] = [];
          snapshot.forEach((snapDoc) => {
            const data = snapDoc.data();
            cloudTodos.push({
              id: snapDoc.id,
              text: data.text || '',
              completed: !!data.completed,
              priority: data.priority || 'medium',
              category: data.category || 'Other',
              dueDate: data.dueDate,
              createdAt: data.createdAt || new Date().toISOString(),
              userId: data.userId,
              userName: data.userName,
              userEmail: data.userEmail,
              notes: data.notes,
              completedAt: data.completedAt,
            } as Todo);
          });
          setTodos(cloudTodos);
          setIsLoaded(true);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'tasks');
        }
      );

      // Real-time synchronization with hydrations
      const qHydrations = query(collection(db, 'hydrations'), where('userId', '==', user.uid));
      unsubscribeHydrations = onSnapshot(
        qHydrations,
        (snapshot) => {
          const logs: HydrationLog[] = [];
          snapshot.forEach((snapDoc) => {
            const data = snapDoc.data();
            if (data.date && typeof data.count === 'number') {
              logs.push({ date: data.date, count: data.count });
            }
          });
          setHydrationLogs(logs);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'hydrations');
        }
      );

      return () => {
        if (unsubscribeTasks) unsubscribeTasks();
        if (unsubscribeHydrations) unsubscribeHydrations();
      };
    } else {
      // Default offline local storage fallback
      try {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedTasks) {
          setTodos(JSON.parse(storedTasks));
        } else {
          setTodos(DEFAULT_TODOS);
        }
      } catch (err) {
        console.error('Failed to parse local storage todos:', err);
        setTodos(DEFAULT_TODOS);
      } finally {
        setIsLoaded(true);
      }

      try {
        const storedHydrations = localStorage.getItem(HYDRATION_STORAGE_KEY);
        if (storedHydrations) {
          setHydrationLogs(JSON.parse(storedHydrations));
        }
      } catch (err) {
        console.error('Failed to parse hydration local storage:', err);
      }
    }
  }, [user, authLoading]);

  // Sync back to local storage ONLY if offline/not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded, user]);

  // Operations that intelligently toggle between Cloud and Local
  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    const resolvedDueDate = todoData.dueDate || (() => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      return getLocalDateStr(future);
    })();

    if (user) {
      const payload: any = {
        text: todoData.text,
        completed: false,
        priority: todoData.priority,
        category: todoData.category,
        createdAt,
        userId: user.uid,
        dueDate: resolvedDueDate,
      };
      if (todoData.userName) {
        payload.userName = todoData.userName;
      }
      if (todoData.userEmail) {
        payload.userEmail = todoData.userEmail;
      }
      if (todoData.notes) {
        payload.notes = todoData.notes;
      }
      try {
        await setDoc(doc(db, 'tasks', id), payload);

        // Google Sheets Sync
        if (sheetsSyncEnabled && spreadsheetId) {
          const token = await ensureGmailToken();
          if (token) {
            const taskObj: Todo = {
              id,
              text: todoData.text,
              completed: false,
              priority: todoData.priority,
              category: todoData.category,
              createdAt,
              dueDate: resolvedDueDate,
              userName: todoData.userName,
              userEmail: todoData.userEmail,
            };
            appendTaskToSpreadsheet(token, spreadsheetId, taskObj)
              .then(() => {
                setSheetsSuccess('Task details saved in Google Sheets also!');
                setTimeout(() => setSheetsSuccess(null), 4000);
              })
              .catch((err) => {
                console.error('Failed to sync to Google Sheets:', err);
                setSheetsError('Failed to append task to Google Sheet.');
                setTimeout(() => setSheetsError(null), 5000);
              });
          }
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `tasks/${id}`);
      }
    } else {
      const newTodo: Todo = {
        ...todoData,
        id,
        completed: false,
        createdAt,
        dueDate: resolvedDueDate,
      };
      setTodos((prev) => [newTodo, ...prev]);
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (user) {
      const target = todos.find((t) => t.id === id);
      if (target) {
        const isOwner = (() => {
          if (target.userEmail && user.email) {
            return target.userEmail.toLowerCase() === user.email.toLowerCase();
          }
          if (target.userId) {
            return target.userId === user.uid;
          }
          return true; // starter or local-only tasks
        })();
        if (!isOwner) {
          console.warn("Permission denied: You can only toggle task completion for tasks added by yourself.");
          return;
        }
        try {
          const nextCompleted = !target.completed;
          await updateDoc(doc(db, 'tasks', id), {
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : deleteField(),
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `tasks/${id}`);
        }
      }
    } else {
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === id) {
            const nextCompleted = !todo.completed;
            return {
              ...todo,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            };
          }
          return todo;
        })
      );
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (user) {
      const target = todos.find((t) => t.id === id);
      if (target) {
        const isOwner = (() => {
          if (target.userEmail && user.email) {
            return target.userEmail.toLowerCase() === user.email.toLowerCase();
          }
          if (target.userId) {
            return target.userId === user.uid;
          }
          return true; // starter or local-only tasks
        })();
        if (!isOwner) {
          console.warn("Permission denied: You can only delete tasks added by yourself.");
          return;
        }
      }
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `tasks/${id}`);
      }
    } else {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  const triggerSendReminder = (todo: Todo) => {
    setReminderModal({
      isOpen: true,
      type: 'single',
      todo,
    });
    setReminderStatus('idle');
    setReminderError('');
    setReminderSuccess('');
  };

  const triggerSendAllReminders = () => {
    const today = getLocalDateStr(new Date());
    const targets = todos.filter((todo) => todo.dueDate && todo.dueDate < today && !todo.completed && todo.userEmail);
    setReminderModal({
      isOpen: true,
      type: 'all',
      targetsCount: targets.length,
    });
    setReminderStatus('idle');
    setReminderError('');
    setReminderSuccess('');
  };

  const executeSendReminder = async () => {
    const todo = reminderModal.todo;
    if (!todo || !todo.userEmail) {
      setReminderStatus('error');
      setReminderError("This task does not have a user email stored in Firestore.");
      return;
    }

    try {
      // Obtain the Gmail OAuth token first synchronously during the user click event
      // to guarantee browsers do not block the popup window.
      const token = await ensureGmailToken();
      if (!token) {
        throw new Error("Failed to authenticate or retrieve Gmail access token.");
      }

      setReminderStatus('sending');
      setSendingEmailId(todo.id);

      const subject = `Overdue Task Reminder: ${todo.text}`;
      const emailBody = `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #be5a38; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">Overdue Task Reminder</h2>
          <p>Hello,</p>
          <p>This is a friendly reminder that your task is currently overdue and needs to be completed soon.</p>
          <div style="background-color: #fff5f2; border: 1px solid #f5c2b3; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Task Description:</strong> ${todo.text}</p>
            <p style="margin: 0;"><strong>Original Due Date:</strong> <span style="color: #be5a38; font-weight: bold;">${todo.dueDate}</span></p>
          </div>
          <p>Please log in and update or complete this task as soon as possible.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Sent automatically from Admin Account (${auth.currentUser?.email || 'niki.bhogar@gmail.com'})</p>
        </div>
      `;

      const fromName = auth.currentUser?.displayName || "Admin";
      const fromEmail = auth.currentUser?.email || "niki.bhogar@gmail.com";

      const emailLines = [
        `From: "${fromName}" <${fromEmail}>`,
        `To: ${todo.userEmail}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        emailBody
      ];
      const emailStr = emailLines.join('\r\n');
      const base64UrlEncoded = btoa(unescape(encodeURIComponent(emailStr)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: base64UrlEncoded
        })
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.error?.message || 'Gmail API request failed');
      }

      setReminderStatus('success');
      setReminderSuccess(`Successfully sent overdue email reminder to ${todo.userEmail}!`);
    } catch (error: any) {
      console.error("Error sending email:", error);
      setReminderStatus('error');
      setReminderError(error.message || String(error));
    } finally {
      setSendingEmailId(null);
    }
  };

  const executeSendAllReminders = async () => {
    const today = getLocalDateStr(new Date());
    const targets = todos.filter((todo) => todo.dueDate && todo.dueDate < today && !todo.completed && todo.userEmail);
    if (targets.length === 0) {
      setReminderStatus('error');
      setReminderError("No overdue tasks have user emails stored in Firestore.");
      return;
    }

    try {
      // Obtain the Gmail OAuth token first synchronously during the user click event
      // to guarantee browsers do not block the popup window.
      const token = await ensureGmailToken();
      if (!token) {
        throw new Error("Failed to authenticate or retrieve Gmail access token.");
      }

      setReminderStatus('sending');
      setSendingEmailId('all');
      let successCount = 0;

      for (const todo of targets) {
        try {
          const subject = `Overdue Task Reminder: ${todo.text}`;
          const emailBody = `
            <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
              <h2 style="color: #be5a38; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">Overdue Task Reminder</h2>
              <p>Hello,</p>
              <p>This is a friendly reminder that your task is currently overdue and needs to be completed soon.</p>
              <div style="background-color: #fff5f2; border: 1px solid #f5c2b3; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Task Description:</strong> ${todo.text}</p>
                <p style="margin: 0;"><strong>Original Due Date:</strong> <span style="color: #be5a38; font-weight: bold;">${todo.dueDate}</span></p>
              </div>
              <p>Please log in and update or complete this task as soon as possible.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #777;">Sent automatically from Admin Account (${auth.currentUser?.email || 'niki.bhogar@gmail.com'})</p>
            </div>
          `;

          const fromName = auth.currentUser?.displayName || "Admin";
          const fromEmail = auth.currentUser?.email || "niki.bhogar@gmail.com";

          const emailLines = [
            `From: "${fromName}" <${fromEmail}>`,
            `To: ${todo.userEmail}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            emailBody
          ];
          const emailStr = emailLines.join('\r\n');
          const base64UrlEncoded = btoa(unescape(encodeURIComponent(emailStr)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              raw: base64UrlEncoded
            })
          });

          if (response.ok) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to send reminder to ${todo.userEmail}:`, err);
        }
      }

      setReminderStatus('success');
      setReminderSuccess(`Successfully sent ${successCount} of ${targets.length} overdue task reminders!`);
    } catch (error: any) {
      console.error("Error sending emails:", error);
      setReminderStatus('error');
      setReminderError(error.message || String(error));
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleUpdateTodo = async (id: string, updatedFields: Partial<Todo>) => {
    if (user) {
      const target = todos.find((t) => t.id === id);
      if (target) {
        const isOwner = (() => {
          if (target.userEmail && user.email) {
            return target.userEmail.toLowerCase() === user.email.toLowerCase();
          }
          if (target.userId) {
            return target.userId === user.uid;
          }
          return true; // starter or local-only tasks
        })();
        if (!isOwner) {
          console.warn("Permission denied: You can only edit tasks added by yourself.");
          return;
        }
      }
      try {
        const fieldsToUpdate: Record<string, any> = {};
        if (updatedFields.text !== undefined) fieldsToUpdate.text = updatedFields.text;
        if (updatedFields.priority !== undefined) fieldsToUpdate.priority = updatedFields.priority;
        if (updatedFields.category !== undefined) fieldsToUpdate.category = updatedFields.category;
        
        if (updatedFields.dueDate !== undefined) {
          if (updatedFields.dueDate) {
            fieldsToUpdate.dueDate = updatedFields.dueDate;
          } else {
            fieldsToUpdate.dueDate = deleteField();
          }
        }

        if (updatedFields.userName !== undefined) {
          if (updatedFields.userName) {
            fieldsToUpdate.userName = updatedFields.userName;
          } else {
            fieldsToUpdate.userName = deleteField();
          }
        }

        if (updatedFields.userEmail !== undefined) {
          if (updatedFields.userEmail) {
            fieldsToUpdate.userEmail = updatedFields.userEmail;
          } else {
            fieldsToUpdate.userEmail = deleteField();
          }
        }

        if (updatedFields.notes !== undefined) {
          if (updatedFields.notes) {
            fieldsToUpdate.notes = updatedFields.notes;
          } else {
            fieldsToUpdate.notes = deleteField();
          }
        }
        
        await updateDoc(doc(db, 'tasks', id), fieldsToUpdate);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `tasks/${id}`);
      }
    } else {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, ...updatedFields } : todo))
      );
    }
  };

  const handleClearCompleted = async () => {
    if (user) {
      // Clear ONLY our own completed tasks
      const completed = todos.filter((t) => t.completed && (t.userId === user.uid || (t.userEmail && user.email && t.userEmail.toLowerCase() === user.email.toLowerCase())));
      try {
        const batch = writeBatch(db);
        completed.forEach((todo) => {
          batch.delete(doc(db, 'tasks', todo.id));
        });
        await batch.commit();
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, 'tasks-batch-clear');
      }
    } else {
      setTodos((prev) => prev.filter((todo) => !todo.completed));
    }
  };

  // Calculate dynamic strings for today and tomorrow in local YYYY-MM-DD format
  const todayStr = getLocalDateStr(new Date());

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrowDate);

  // 1. "overdue" section shows the list of tasks which have already passed the due date but still incomplete
  const overdueTodos = todos.filter((todo) => todo.dueDate && todo.dueDate < todayStr && !todo.completed);

  // 2. "for today and tomorrow" section shows the list of tasks which have due date as today and tomorrow but still incomplete
  const todayAndTomorrowTodos = todos.filter(
    (todo) => todo.dueDate && (todo.dueDate === todayStr || todo.dueDate === tomorrowStr) && !todo.completed
  );

  // Regular filtered list
  const filteredTodos = todos
    .filter((todo) => {
      // 1. Text Search matching
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status matching
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !todo.completed) ||
        (filter === 'completed' && todo.completed);

      // 3. Category matching
      const matchesCategory = selectedCategory === 'All' || todo.category === selectedCategory;

      return matchesSearch && matchesFilter && matchesCategory;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'priority': {
          const weights = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }

        case 'due-date': {
          if (!a.dueDate && !b.dueDate) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }

        case 'user': {
          const userA = (a.userName || a.userEmail || '').toLowerCase();
          const userB = (b.userName || b.userEmail || '').toLowerCase();
          if (!userA && !userB) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (!userA) return 1;
          if (!userB) return -1;
          return userA.localeCompare(userB);
        }

        default:
          return 0;
      }
    });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex flex-col items-center justify-center font-sans">
        <Sparkles className="w-8 h-8 text-[#a1927c] animate-pulse mb-4" />
        <p className="text-sm text-[#8a7f6e] font-mono uppercase tracking-wider">Starting Workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginComplete={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#edeae1] bg-gradient-to-br from-[#ebe6da] to-[#ded9cd] text-[#2c2c2a] antialiased selection:bg-[#cbd5e1] p-3 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center" id="app-desktop-canvas">
      
      {/* Absolute Decorative Leafy Branches overlapping background */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 text-[#6c8361]/20 pointer-events-none transition-opacity" id="deco-corner-leaves-left">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M0,0 C10,30 30,50 60,60 C40,50 30,30 0,0" />
          <circle cx="20" cy="15" r="5" className="fill-[#8ba180]/30" />
          <circle cx="35" cy="22" r="7" className="fill-[#6c8361]/35" />
          <circle cx="48" cy="35" r="6" className="fill-[#829977]/30" />
          <circle cx="55" cy="50" r="5" className="fill-[#7a936d]/25" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 text-[#6c8361]/20 pointer-events-none transition-opacity rotate-180" id="deco-corner-leaves-right">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M0,0 C10,30 30,50 60,60 C40,50 30,30 0,0" />
          <circle cx="20" cy="15" r="5" className="fill-[#8ba180]/30" />
          <circle cx="35" cy="22" r="7" className="fill-[#6c8361]/35" />
          <circle cx="48" cy="35" r="6" className="fill-[#829977]/30" />
          <circle cx="55" cy="50" r="5" className="fill-[#7a936d]/25" />
        </svg>
      </div>

      {/* Main Responsive Portfolio Binder holding Sidebar on Left and Paper Sheet on Right */}
      <div className="w-full max-w-7xl bg-[#faf8f4] border border-[#d2cbba] rounded-[32px] shadow-[0_25px_60px_-15px_rgba(58,54,44,0.18)] overflow-hidden flex flex-col lg:flex-row relative" id="portfolio-binder-container">
        
        {/* Left Side: Sidebar navigation rail */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onSignIn={async () => {
            try {
              const signedInUser = await signInWithGoogle();
              if (signedInUser) {
                await uploadUnsyncedLocalTasks(signedInUser.uid, todos);
              }
            } catch (err) {
              console.error('Failed to authenticate with Google:', err);
            }
          }}
          onSignOut={async () => {
            await logOut();
            setTodos([]);
          }}
        />

        {/* Right Side: Main Binder Paper Sheet Page (classic botanical planner) */}
        <div className="flex-1 bg-[#fdfcf9] relative p-5 sm:p-8 md:p-10 lg:pl-16 min-w-0" id="planner-paper-sheet">
          
          {/* Binder Holes detail row (Looks like classic planner ring binders) */}
          <div className="absolute top-0 bottom-0 left-4 hidden lg:flex flex-col justify-around py-16 pointer-events-none" id="planner-binder-rings">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5" id={`ring-hole-${i}`}>
                <div className="w-3.5 h-3.5 rounded-full bg-[#ede8dc] border border-[#d2cbba] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06)]" />
                <div className="w-6 h-1.5 rounded-full bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 opacity-60 border border-t-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] -ml-2" />
              </div>
            ))}
          </div>

          {/* Paper Corner Leaves vector illustration overlays inside paper */}
          <div className="absolute top-2 right-2 w-20 h-20 text-[#cbd9c4]/50 pointer-events-none" id="paper-inner-leaf-top">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M100,0 C80,30 50,40 20,40 C50,20 80,10 100,0" />
              <circle cx="70" cy="15" r="6" className="fill-[#8ea383]/40" />
              <circle cx="45" cy="30" r="4" className="fill-[#9eb292]/30" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-6 w-20 h-20 text-[#cbd9c4]/50 pointer-events-none rotate-90" id="paper-inner-leaf-bottom">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M100,0 C80,30 50,40 20,40 C50,20 80,10 100,0" />
              <circle cx="70" cy="15" r="6" className="fill-[#8ea383]/40" />
              <circle cx="45" cy="30" r="4" className="fill-[#9eb292]/30" />
            </svg>
          </div>

          {/* Paper page margin vertical lines */}
          <div className="absolute top-0 bottom-0 left-16 w-[1.5px] bg-[#fbdfdf]/70 hidden lg:block" id="notebook-margin-line" />

        {/* RENDERING HEADERS AND CONTENT ACCORDING TO ACTIVE TAB */}
        {activeTab === 'dashboard' && (
          <div className="lg:pl-8 flex flex-col gap-1.5" id="tab-dashboard-container">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center mt-3 mb-8" id="dashboard-tab-header">
              <div className="relative inline-block px-12 py-3.5 mb-2.5" id="brush-header-container">
                <div className="absolute inset-0 bg-[#e1ecd9]/80 rounded-[40px_10px_35px_15px] p-4 scale-y-95 scale-x-105 shadow-[inset_-2px_-4px_12px_rgba(255,255,255,0.4)]" />
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-amatic font-bold text-[#445a38] tracking-[0.08em] uppercase select-none" id="brush-header-text">
                  Workspace Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8c7e6c] font-mono border-b border-[#ebdcc9] pb-1 px-4">
                <span className="uppercase tracking-wider font-semibold">Workspace Focus Profile</span>
              </div>
            </div>

            {/* WorkspaceDashboard Core */}
            <WorkspaceDashboard
              todos={todos}
              onAddTodo={handleAddTodo}
              onToggleComplete={handleToggleComplete}
              onDeleteTodo={handleDeleteTodo}
              user={user}
              hydrationLogs={hydrationLogs}
              setHydrationLogs={setHydrationLogs}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <ReportsAnalytics 
            todos={todos} 
            hydrationLogs={hydrationLogs} 
          />
        )}

        {activeTab === 'planner' && (
          <div className="flex flex-col gap-1.5" id="tab-planner-header-group">
            {/* Planner Header */}
            <div className="flex flex-col items-center justify-center text-center mt-3 mb-8 lg:pl-8" id="planner-main-header">
              <div className="relative inline-block px-12 py-3.5 mb-2.5" id="brush-header-container">
                <div className="absolute inset-0 bg-[#add2ec]/50 rounded-[40px_10px_35px_15px] p-4 scale-y-95 scale-x-105 shadow-[inset_-2px_-4px_12px_rgba(255,255,255,0.4)]" />
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-amatic font-bold text-[#2d4b68] tracking-[0.08em] uppercase select-none" id="brush-header-text">
                  Daily To Do List
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8c7e6c] font-mono border-b border-[#ebdcc9] pb-1 px-4" id="planner-date-meta">
                <span className="uppercase tracking-wider font-semibold">Date:</span>
                <span className="font-hand text-lg text-[#334e68] font-bold px-1.5" id="date-label">
                  {getLocalDateStr(new Date())}
                </span>
              </div>
            </div>

            {/* Dynamic Greeting */}
            <div className="mb-6 lg:pl-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="greeting-lead">
              <div>
                <h2 className="text-xl sm:text-2xl font-architect font-bold text-[#564e43] tracking-tight flex items-center gap-2" id="niki-welcome-banner">
                  {user ? (
                    <>
                      <span>Welcome, {user.displayName || 'Niki'}</span>
                      <span className="text-[10px] bg-[#6c8361]/10 text-[#6c8361] font-mono px-2 py-0.5 rounded-full border border-[#6c8361]/20">Cloud Synced</span>
                    </>
                  ) : (
                    <>
                      <span>Welcome, Niki</span>
                      <span className="text-[10px] bg-[#897358]/10 text-[#897358] font-mono px-2 py-0.5 rounded-full border border-[#897358]/20">Local Saved</span>
                    </>
                  )}
                </h2>
                <p className="text-xs font-mono text-[#a1927c] mt-0.5" id="niki-welcome-subtitle">
                  {user 
                    ? '☁️ Secured in Google Firebase database. Synchronized across devices.' 
                    : '🍃 Craft your day. Sip water, scribble ideas. Sign in to back up tasks to the Cloud!'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'automations' && (
          <div className="lg:pl-8 flex flex-col gap-6" id="tab-automations-container">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center mt-3 mb-8" id="automations-tab-header">
              <div className="relative inline-block px-12 py-3.5 mb-2.5" id="brush-header-container">
                <div className="absolute inset-0 bg-[#ffdce0]/80 rounded-[40px_10px_35px_15px] p-4 scale-y-95 scale-x-105 shadow-[inset_-2px_-4px_12px_rgba(255,255,255,0.4)]" />
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-amatic font-bold text-[#803138] tracking-[0.08em] uppercase select-none" id="brush-header-text">
                  Automation Console
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8c7e6c] font-mono border-b border-[#ebdcc9] pb-1 px-4">
                <span className="uppercase tracking-wider font-semibold">Integrations & Workflows</span>
              </div>
            </div>

            {/* SECTION A: Google Sheets Live Sync Setup */}
            <div className="bg-white border border-[#eadeca] rounded-2xl p-5 shadow-sm flex flex-col gap-4 animate-fadeIn" id="sheets-config-card">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#f3ebde]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#439647]/10 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-[#439647]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-architect font-bold text-[#564e43] uppercase tracking-wider">
                      Google Sheets Spreadsheet Linker
                    </h3>
                    <p className="text-[11px] font-mono text-[#a1927c]">
                      Log checklist targets into dynamic cloud sheets in your personal Google Drive
                    </p>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  {spreadsheetId ? (
                    <span className="text-[10px] font-mono bg-[#edf7ee] text-[#1e4620] border border-[#cbe8ce] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 bg-[#439647] rounded-full animate-pulse" />
                      Activated
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-[#f1eeeb] text-[#847864] border border-[#dfdacc] px-2.5 py-0.5 rounded-full">
                      Unlinked
                    </span>
                  )}
                </div>
              </div>

              {/* Status message alerts */}
              {sheetsSuccess && (
                <div className="px-3.5 py-2.5 bg-[#edf7ee] border border-[#cbe8ce] rounded-xl text-xs font-mono text-[#1e4620]" id="sheets-success-alert">
                  🎉 {sheetsSuccess}
                </div>
              )}
              {sheetsError && (
                <div className="px-3.5 py-2.5 bg-[#feeef0] border border-[#fbc9cd] rounded-xl text-xs font-mono text-[#aa2d37]" id="sheets-error-alert">
                  ⚠️ {sheetsError}
                </div>
              )}

              {/* Interactive Linking controls */}
              {!user ? (
                <div className="bg-[#fcfaf5] border border-[#eedecb] p-4 rounded-xl text-center text-xs font-mono text-[#8a7f6e]" id="sheets-unauth-tip">
                  🔒 Sign in with Google inside the sidebar panel to unlock Google Sheets live integrations automatically.
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-xs font-mono" id="sheets-authed-controls">
                  {!spreadsheetId ? (
                    <div className="flex flex-col gap-3 py-2" id="sheets-link-actions-missing">
                      <p className="text-[#847864] text-xs leading-relaxed">
                        Your workspace doesn't have an active Google Spreadsheet linked. Clicking below creates an organized "Daily Planner Sync" spreadsheet right in your Google Drive, populated with your columns!
                      </p>
                      <button
                        type="button"
                        onClick={handleCreateAndConnectSheet}
                        disabled={sheetsLoading}
                        className="w-full bg-[#34a853] hover:bg-[#2c8f47] disabled:opacity-40 text-white text-xs font-mono font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        id="btn-link-action"
                      >
                        {sheetsLoading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4" />
                        )}
                        <span>{sheetsLoading ? 'Provisioning Google Spreadsheet...' : 'Auto-Generate & Live-Link Google Sheet'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4" id="sheets-link-actions-connected">
                      
                      <div className="bg-[#faf8f5] border border-[#eedecb]/70 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="sheet-preview-bar">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#34a853]/10 rounded-lg shrink-0">
                            <FileSpreadsheet className="w-4 h-4 text-[#34a853]" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] text-[#847864] uppercase font-bold tracking-wider">Spreadsheet Reference</div>
                            <a
                              href={spreadsheetUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#2b5c8f] hover:underline font-bold flex items-center gap-1.5 mt-0.5"
                            >
                              <span>Open Cloud Spreadsheet File</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto shrink-0" id="sync-disconnect-btn-row">
                          <button
                            type="button"
                            onClick={handleSyncAllToSheet}
                            disabled={sheetsLoading}
                            className="bg-[#34a853]/10 hover:bg-[#34a853]/20 border border-[#c1ebd0] text-[#1e5828] text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            title="Dump all current tasks into Google Sheets"
                          >
                            {sheetsLoading ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            <span>Bulk Sync Current</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDisconnectSheet}
                            className="bg-red-50 text-[#cc5c65] border border-red-200 hover:bg-red-100 text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            Disconnect Sheet
                          </button>
                        </div>
                      </div>

                      {/* Synchronization Toggle Options */}
                      <div className="border border-[#f3ebde] p-3 rounded-xl bg-white flex items-center justify-between" id="auto-sync-opt">
                        <div>
                          <span className="text-[11px] text-[#564e43] font-bold block">Auto Real-Time Appends</span>
                          <span className="text-[10px] text-[#a1927c]">Automatically sync new tasks to Google Sheets the second you capture them</span>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sheetsSyncEnabled}
                            onChange={(e) => handleToggleAutoSync(e.target.checked)}
                            className="sr-only peer"
                            id="toggle-sheets-cb"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#34a853]" />
                        </label>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION B: Gmail reminders & email scheduler details */}
            <div className="bg-white border border-[#eadeca] rounded-2xl p-5 shadow-sm flex flex-col gap-4 animate-fadeIn" id="gmail-alerts-card">
              <div className="pb-3 border-b border-[#f3ebde]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#db4437]/10 rounded-lg">
                    <Mail className="w-5 h-5 text-[#db4437]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-architect font-bold text-[#564e43] uppercase tracking-wider">
                      Gmail Alerts & Automation Center
                    </h3>
                    <p className="text-[11px] font-mono text-[#a1927c]">
                      Send structured warnings & notifications of overdue items automatically via OAuth email
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-[#564e43] leading-relaxed flex flex-col gap-3" id="gmail-alerts-details">
                <p>
                  Your tracker will analyze task due-dates in real-time. If they elapse beyond local UTC, you can trigger email schedules directly to listed delegates in the "Overdue" column.
                </p>

                <div className="bg-[#faf8f5] border border-[#eedecb]/70 p-3.5 rounded-xl flex items-center justify-between gap-3" id="gmail-token-indicator">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wide text-[#8a7f6e] font-bold">Overdue SMTP State</span>
                    <span className="text-xs font-semibold text-[#1c1c1a]" id="gmail-oauth-status">
                      {getCachedGmailToken() ? "🟢 Authorized • OAuth Access Token Cached" : "🔴 Unavailable • OAuth Token Unacquired"}
                    </span>
                  </div>

                  {!getCachedGmailToken() && user && (
                    <button
                      onClick={async () => {
                        try {
                          const token = await ensureGmailToken();
                          if (token) {
                            alert("OAuth Connection Succeeded! Gmail permissions are actively ready.");
                            window.location.reload();
                          }
                        } catch (err: any) {
                          alert(`Gmail connection failed: ${err.message || String(err)}`);
                        }
                      }}
                      className="bg-[#db4437] text-white hover:bg-[#c33a2e] text-[10px] px-3.5 py-1.5 rounded-xl border border-transparent shadow-sm transition-all font-mono font-bold cursor-pointer shrink-0"
                    >
                      Authorize Mail Scope
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-[11px] text-[#847864] pt-1" id="reminder-rules">
                  <span className="font-bold uppercase tracking-wider text-[9.5px]">Reminders Dispatch Rules:</span>
                  <span>1. Task must possess a valid due-date (Format: YYYY-MM-DD).</span>
                  <span>2. Task must not be completed.</span>
                  <span>3. A target delegate name and email address must be specified in the inline card parameters.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bento Board Worksheet Structure */}
        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start md:pl-10" id="worksheet-grid">
          
          {/* LEFT BLOCK (SPAN 8/12 DESKTOP): Agenda items, Top 3, and Notes */}
          <div className="lg:col-span-8 flex flex-col gap-6" id="worksheet-column-left">
            
            {/* Split Top-left: Top Priorities Card & Progress stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn" id="top-row-left-group">
              <Top3Priorities todos={todos} onToggleComplete={handleToggleComplete} user={user} />
              <StatsCard todos={todos} />
            </div>

            {/* Todo Adding Form */}
            <TodoForm onAddTodo={handleAddTodo} currentUser={user} />

            {/* Core To Do List Section card styled after dotted paper sheet */}
            <div className="bg-[#fdfbf6] border border-[#eddcc9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]" id="todo-core-section">
              <div className="flex items-center justify-between mb-4 border-b border-[#f2e7da] pb-2" id="todo-section-header">
                <span className="text-xs font-architect font-bold tracking-wider text-[#847864] uppercase flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tasks List ({filteredTodos.length})</span>
                </span>

                {todos.some((t) => t.completed) && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="text-[10px] font-mono text-[#cc5c65] hover:text-white bg-[#fff0f1] hover:bg-[#cc5c65] px-2 py-1 border border-[#fbdfe2] rounded-lg transition-all cursor-pointer"
                    id="clear-completed-btn"
                  >
                    Clear completed
                  </button>
                )}
              </div>

              {/* Filtering utilities */}
              <TodoFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sort={sort}
                setSort={setSort}
              />

              {/* Tasks viewport */}
              <div className="flex flex-col gap-2.5 mt-5 max-h-[440px] overflow-y-auto pr-1.5 custom-scrollbar" id="tasks-viewport">
                <AnimatePresence mode="popLayout">
                  {filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={handleToggleComplete}
                      onDeleteTodo={handleDeleteTodo}
                      onUpdateTodo={handleUpdateTodo}
                      currentUser={user}
                    />
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {filteredTodos.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 px-4 bg-white/50 border border-dashed border-[#e6d9ca] rounded-2xl text-center"
                    id="empty-list-card"
                  >
                    <SlidersHorizontal className="w-5 h-5 text-[#ad9e8d] mb-2" />
                    <h4 className="text-xs font-semibold text-[#564e43]" id="empty-title">
                      No matching tasks found
                    </h4>
                    <p className="text-[11px] text-[#a1927c] mt-0.5 max-w-xs" id="empty-body">
                      {todos.length === 0
                        ? 'Your list is clear. Add your next goal above.'
                        : 'Adjust search query or select tags to view other tasks.'}
                    </p>
                    {todos.length === 0 && (
                      <button
                        onClick={() => setTodos(DEFAULT_TODOS)}
                        className="mt-3.5 px-3 py-1 bg-white hover:bg-[#faf7f0] text-[10px] text-[#847864] font-mono border border-[#eddcc9] rounded-lg shadow-sm transition-all cursor-pointer"
                        id="reset-starters-app-btn"
                      >
                        Reset Starter Goals
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick Notes pad */}
            <NotesArea />
          </div>

          {/* RIGHT BLOCK (SPAN 4/12 DESKTOP): Side Panel Sections in specified order */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="worksheet-column-right">
            
            {/* 1. Already Due/Overdue Tasks Box Card (Highlighted warm peach/terracotta theme) */}
            <div className="bg-[#fff5f2] border-2 border-[#f5c2b3] rounded-2xl p-4 shadow-[0_3px_10px_rgba(190,90,56,0.04)] ring-1 ring-[#be5a38]/5" id="overdue-box-card">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-[#f2cfc4]" id="overdue-header">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#be5a38] animate-pulse" />
                  <h3 className="text-sm font-architect text-[#be5a38] uppercase tracking-wider font-bold" id="overdue-title">
                    Overdue
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {overdueTodos.some(t => t.userEmail) && (
                    <button
                      type="button"
                      onClick={triggerSendAllReminders}
                      disabled={sendingEmailId === 'all'}
                      className="flex items-center gap-1 text-[9px] font-mono font-bold bg-[#be5a38] text-white px-2 py-0.5 rounded-full hover:bg-[#a2492d] transition-colors cursor-pointer disabled:opacity-50"
                      title="Send reminder emails to all overdue users"
                      id="overdue-remind-all-btn"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{sendingEmailId === 'all' ? 'Sending...' : 'Remind All'}</span>
                    </button>
                  )}
                  <span className="text-[10px] font-mono font-bold bg-[#be5a38]/10 text-[#be5a38] px-2 py-0.5 rounded-full border border-[#be5a38]/20" id="overdue-count-badge">
                    {overdueTodos.length} Passed
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1 max-h-[290px] overflow-y-auto pr-1.5 custom-scrollbar" id="overdue-items">
                {overdueTodos.length > 0 ? (
                  overdueTodos.map((todo) => {
                    const isOwner = !user || (() => {
                      if (todo.userEmail && user.email) {
                        return todo.userEmail.toLowerCase() === user.email.toLowerCase();
                      }
                      if (todo.userId) {
                        return todo.userId === user.uid;
                      }
                      return true; // starter or local-only tasks
                    })();
                    return (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between gap-2.5 bg-white border border-[#f5c2b3]/80 p-2.5 rounded-xl shadow-[0_1px_3px_rgba(190,90,56,0.02)] hover:border-[#be5a38] transition-all"
                        id={`overdue-item-view-${todo.id}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {isOwner ? (
                            <button
                              type="button"
                              onClick={() => handleToggleComplete(todo.id)}
                              className="w-4.5 h-4.5 rounded-full border border-[#be5a38] flex items-center justify-center cursor-pointer hover:bg-[#fff5f2] shrink-0"
                              title="Mark complete"
                              id={`overdue-check-btn-${todo.id}`}
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-transparent hover:bg-[#be5a38]/30 transition-colors" />
                            </button>
                          ) : (
                            <div className="w-4.5 h-4.5 text-[#be5a38] flex items-center justify-center shrink-0 select-none animate-fadeIn" title="Read-only: Owned by another user">
                              🔒
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#5a2514] font-sans break-words whitespace-normal leading-relaxed" title={todo.text}>
                              {todo.text}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[9px] text-[#be5a38] font-bold">
                              <span>Due: {todo.dueDate}</span>
                              <span className="bg-[#be5a38]/10 px-1 py-0.5 rounded text-[8px] uppercase tracking-wide">Overdue</span>
                              {(todo.userName || todo.userEmail) && (
                                <span className="text-[#a26859]" title={`${todo.userName || ''} (${todo.userEmail || ''})`}>
                                  👤 {todo.userName || todo.userEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      {todo.userEmail && (
                        <button
                          type="button"
                          onClick={() => triggerSendReminder(todo)}
                          disabled={!!sendingEmailId}
                          className="p-1.5 rounded-lg text-[#be5a38] hover:bg-[#fff5f2] border border-transparent hover:border-[#fecaca] transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0"
                          title={`Send reminder email to ${todo.userEmail}`}
                          id={`overdue-remind-btn-${todo.id}`}
                        >
                          {sendingEmailId === todo.id ? (
                            <div className="w-4 h-4 rounded-full border-2 border-[#be5a38] border-t-transparent animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                  <div className="py-2 text-center" id="overdue-empty">
                    <p className="text-[11px] font-hand text-[#a28277] italic">
                      No overdue tasks. You've fully caught up! ✨
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Today & Tomorrow's tasks list card (Charming violet/lavender theme) */}
            <div className="bg-[#fcf8fd] border-2 border-[#eddbeb] rounded-2xl p-4 shadow-[0_3px_10px_rgba(139,97,131,0.04)] ring-1 ring-[#8b6183]/5" id="today-tomorrow-box-card">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-[#dfcadb]" id="today-tomorrow-header">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#8b6183]" />
                  <h3 className="text-sm font-architect text-[#8b6183] uppercase tracking-wider font-bold" id="today-tomorrow-title">
                    Today & Tomorrow
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#8b6183]/10 text-[#8b6183] px-2 py-0.5 rounded-full border border-[#8b6183]/20" id="today-tomorrow-count-badge">
                  {todayAndTomorrowTodos.length} Slated
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-1 max-h-[290px] overflow-y-auto pr-1.5 custom-scrollbar" id="today-tomorrow-items">
                {todayAndTomorrowTodos.length > 0 ? (
                  todayAndTomorrowTodos.map((todo) => {
                    const isToday = todo.dueDate === todayStr;
                    const isOwner = !user || (() => {
                      if (todo.userEmail && user.email) {
                        return todo.userEmail.toLowerCase() === user.email.toLowerCase();
                      }
                      if (todo.userId) {
                        return todo.userId === user.uid;
                      }
                      return true; // starter or local-only tasks
                    })();
                    return (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between gap-2.5 bg-white border border-[#eddbeb]/80 p-2.5 rounded-xl shadow-[0_1px_3px_rgba(139,97,131,0.02)] hover:border-[#8b6183] transition-all"
                        id={`today-tomorrow-item-view-${todo.id}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {isOwner ? (
                            <button
                              type="button"
                              onClick={() => handleToggleComplete(todo.id)}
                              className="w-4.5 h-4.5 rounded-full border border-[#8b6183] flex items-center justify-center cursor-pointer hover:bg-[#fbf4fa] shrink-0"
                              title="Mark complete"
                              id={`today-tomorrow-check-btn-${todo.id}`}
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-transparent hover:bg-[#8b6183]/30 transition-colors" />
                            </button>
                          ) : (
                            <div className="w-4.5 h-4.5 text-[#a890a3] flex items-center justify-center shrink-0 select-none animate-fadeIn" title="Read-only: Owned by another user">
                              🔒
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#4b3548] font-sans break-words whitespace-normal leading-relaxed" title={todo.text}>
                              {todo.text}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] font-bold">
                              <span className={isToday ? "text-[#bf4080]" : "text-[#8b6183]"}>
                                {isToday ? "Today" : "Tomorrow"} ({todo.dueDate})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2 text-center" id="today-tomorrow-empty">
                    <p className="text-[11px] font-hand text-[#a890a3] italic">
                      No tasks due for today or tomorrow. Enjoy! 🌸
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Hourly schedule */}
            <Scheduler />

            {/* 4. Water logger */}
            <WaterTracker />

            {/* 5. Canvas Drawer */}
            <DoodleCanvas />
          </div>

        </div>
        )}

        {/* Sheet Footer copyright */}
        <div className="mt-12 pt-6 border-t border-[#ebdcc9] text-center text-[10px] font-mono text-[#a1927c] md:pl-8 flex flex-col sm:flex-row items-center justify-between gap-3" id="sheet-footer">
          <span>Organize visually • Designed with botanical aesthetic • 2026</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-[#be6b73] fill-[#be6b73]/20" /> for Niki
          </span>
        </div>

        <ReminderModal
          isOpen={reminderModal.isOpen}
          onClose={() => setReminderModal(prev => ({ ...prev, isOpen: false }))}
          type={reminderModal.type}
          todo={reminderModal.todo}
          targetsCount={reminderModal.targetsCount}
          onConfirm={reminderModal.type === 'single' ? executeSendReminder : executeSendAllReminders}
          status={reminderStatus}
          errorMessage={reminderError}
          successMessage={reminderSuccess}
          hasGmailToken={!!getCachedGmailToken()}
        />

      </div>
    </div>
  </div>
  );
}
