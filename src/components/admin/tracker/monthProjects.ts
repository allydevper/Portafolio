import { currentMonthKey, formatMonthLabel } from "./exportText";

export const MONTH_PROJECTS_KEY = "tracker-month-projects";

type MonthProjectsMap = Record<string, number[]>;

function readMap(): MonthProjectsMap {
	try {
		const raw = localStorage.getItem(MONTH_PROJECTS_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as MonthProjectsMap;
		if (parsed == null || typeof parsed !== "object") return {};
		return parsed;
	} catch {
		return {};
	}
}

function writeMap(map: MonthProjectsMap) {
	try {
		localStorage.setItem(MONTH_PROJECTS_KEY, JSON.stringify(map));
	} catch {
		/* ignore quota / private mode */
	}
}

export function getMonthProjectIds(monthKey: string): number[] {
	const ids = readMap()[monthKey];
	if (!Array.isArray(ids)) return [];
	return ids.filter((id) => Number.isFinite(id));
}

export function setMonthProjectIds(monthKey: string, ids: number[]) {
	const map = readMap();
	const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))];
	if (unique.length === 0) {
		delete map[monthKey];
	} else {
		map[monthKey] = unique;
	}
	writeMap(map);
}

export function toggleMonthProject(monthKey: string, projectId: number): number[] {
	const current = getMonthProjectIds(monthKey);
	const next = current.includes(projectId)
		? current.filter((id) => id !== projectId)
		: [...current, projectId];
	setMonthProjectIds(monthKey, next);
	return next;
}

/** Previous calendar month as YYYY-MM. */
export function previousMonthKey(monthKey: string): string {
	const match = monthKey.match(/^(\d{4})-(\d{2})$/);
	if (!match) return monthKey;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const d = new Date(year, month - 2, 1);
	return currentMonthKey(d);
}

export function copyPreviousMonthProjects(monthKey: string): number[] {
	const prev = previousMonthKey(monthKey);
	const ids = getMonthProjectIds(prev);
	setMonthProjectIds(monthKey, ids);
	return ids;
}

/** Last `count` months ending at `from` (inclusive), newest first. */
export function buildMonthOptions(
	count = 18,
	from: Date = new Date(),
): { value: string; label: string }[] {
	const options: { value: string; label: string }[] = [];
	for (let i = 0; i < count; i++) {
		const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
		const value = currentMonthKey(d);
		options.push({ value, label: formatMonthLabel(value) });
	}
	return options;
}
