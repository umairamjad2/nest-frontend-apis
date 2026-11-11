import { describe, expect, it } from 'vitest';
import { taskSchema } from './schemas';
import { formatDueDate, isOverdue, toDateInputValue } from './tasks';

const now = new Date('2026-11-11T12:00:00Z');

describe('isOverdue', () => {
  it.each([
    ['2026-11-10T00:00:00.000Z', 'TODO', true], // yesterday
    ['2026-11-11T00:00:00.000Z', 'TODO', false], // due today is not overdue yet
    ['2026-11-12T00:00:00.000Z', 'IN_PROGRESS', false],
    ['2026-11-01T00:00:00.000Z', 'DONE', false], // finished tasks are never overdue
    [null, 'TODO', false],
  ] as const)('due %s, %s -> %s', (dueDate, status, expected) => {
    expect(isOverdue({ dueDate, status }, now)).toBe(expected);
  });
});

describe('due date helpers', () => {
  it('keeps the calendar day in UTC for the date input', () => {
    expect(toDateInputValue('2026-12-01T00:00:00.000Z')).toBe('2026-12-01');
    expect(toDateInputValue(null)).toBe('');
  });

  it('shows the year only when it differs from now', () => {
    expect(formatDueDate('2026-12-01T00:00:00.000Z', now)).not.toMatch(/2026/);
    expect(formatDueDate('2027-01-05T00:00:00.000Z', now)).toMatch(/2027/);
  });
});

describe('taskSchema', () => {
  const valid = { title: 'Ship it', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' };

  it('accepts a minimal task and trims the title', () => {
    expect(taskSchema.parse({ ...valid, title: '  Ship it  ' }).title).toBe('Ship it');
  });

  it.each([
    [{ title: '   ' }, 'Title is required'],
    [{ dueDate: '12/01/2026' }, 'Enter a valid date'],
    [{ title: 'x'.repeat(201) }, 'Title must be at most 200 characters'],
  ])('rejects %o', (change, message) => {
    const result = taskSchema.safeParse({ ...valid, ...change });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(message);
  });

  it('accepts a real date', () => {
    expect(taskSchema.safeParse({ ...valid, dueDate: '2026-12-01' }).success).toBe(true);
  });
});
