import { Todo } from '../types';

export const SHEETS_ID_KEY = '_google_sheets_spreadsheet_id_';
export const SHEETS_NAME_KEY = '_google_sheets_spreadsheet_name_';

export async function createSpreadsheet(
  accessToken: string,
  email: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const title = `Daily Planner Sync - ${email} (${dateStr})`;

  // 1. Create spreadsheet File
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json();
    throw new Error(errorData.error?.message || 'Failed to create Google Spreadsheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Initialize Header Row
  const headerRange = 'Sheet1!A1:I1';
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            'Task ID',
            'Task Description',
            'Category',
            'Priority',
            'Due Date',
            'Created At',
            'Status',
            'Assigned To',
            'Assigned Email',
          ],
        ],
      }),
    }
  );

  if (!appendRes.ok) {
    const errorData = await appendRes.json();
    console.warn('Google Sheets warning: Failed to initialize spreadsheet headers: ', errorData);
  }

  return { spreadsheetId, spreadsheetUrl };
}

export async function appendTasksToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  todos: Todo[]
): Promise<void> {
  if (!todos || todos.length === 0) return;

  const range = 'Sheet1!A1:I1';
  const values = todos.map((todo) => [
    todo.id,
    todo.text,
    todo.category,
    todo.priority,
    todo.dueDate || '',
    todo.createdAt,
    todo.completed ? 'Completed' : 'Active',
    todo.userName || '',
    todo.userEmail || '',
  ]);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to append tasks to Google Sheets');
  }
}

export async function appendTaskToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  todo: Todo
): Promise<void> {
  return appendTasksToSpreadsheet(accessToken, spreadsheetId, [todo]);
}
