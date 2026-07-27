import { badRequest } from '../../common/errors.js';
import type { ContestRecord } from './contests.types.js';

const REQUIRED_COLUMNS = ['contestname', 'date', 'rank'] as const;

function splitLine(line: string): string[] {
  return line.split(',').map((cell) => cell.trim());
}

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

function parseInteger(value: string, field: string): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    throw new Error(`Invalid ${field}: ${value}`);
  }
  return num;
}

function parseOptionalInteger(value: string, field: string): number | null {
  if (value === '' || value === undefined) {
    return null;
  }
  return parseInteger(value, field);
}

export function parseCodechefCsv(csv: string): ContestRecord[] {
  if (!csv || !csv.trim()) {
    throw badRequest('CSV is empty');
  }

  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw badRequest('CSV is empty');
  }

  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((col) => !header.includes(col));
  if (missing.length > 0) {
    throw badRequest(`Missing required CSV columns: ${missing.join(', ')}`);
  }

  const columnIndex: Record<string, number> = {};
  header.forEach((col, index) => {
    columnIndex[col] = index;
  });

  const records: ContestRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length === 0) continue;

    try {
      const get = (col: string) => cells[columnIndex[col]] ?? '';

      records.push({
        platform: 'CODECHEF',
        externalContestId: get('externalContestId') || get('contestname') || null,
        contestName: get('contestname'),
        date: parseDate(get('date')),
        rank: parseInteger(get('rank'), 'rank'),
        solved: get('solved') ? parseInteger(get('solved'), 'solved') : 0,
        ratingBefore: parseOptionalInteger(get('ratingbefore'), 'ratingBefore'),
        ratingAfter: parseOptionalInteger(get('ratingafter'), 'ratingAfter')
      });
    } catch (error) {
      throw badRequest(`Invalid row ${i + 1}: ${(error as Error).message}`);
    }
  }

  return records;
}
