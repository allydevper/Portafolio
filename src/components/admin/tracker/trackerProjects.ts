import {
	getMonthProjectIds,
	setMonthProjectIds,
	MONTH_PROJECTS_KEY,
} from "./monthProjects";

export const TRACKER_PROJECTS_KEY = "tracker-projects";

export type TrackerProject = {
	id: number;
	name: string;
};

function readCatalog(): TrackerProject[] {
	try {
		const raw = localStorage.getItem(TRACKER_PROJECTS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as TrackerProject[];
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(
				(p) =>
					p &&
					typeof p.id === "number" &&
					Number.isFinite(p.id) &&
					typeof p.name === "string",
			)
			.map((p) => ({ id: p.id, name: p.name.trim() }))
			.filter((p) => p.name.length > 0);
	} catch {
		return [];
	}
}

function writeCatalog(projects: TrackerProject[]) {
	try {
		localStorage.setItem(TRACKER_PROJECTS_KEY, JSON.stringify(projects));
	} catch {
		/* ignore */
	}
}

export function listTrackerProjects(): TrackerProject[] {
	return readCatalog().sort((a, b) => a.name.localeCompare(b.name));
}

function nextId(projects: TrackerProject[]): number {
	const max = projects.reduce((acc, p) => Math.max(acc, p.id), 0);
	return max + 1;
}

export function createTrackerProject(name: string): TrackerProject {
	const trimmed = name.trim();
	if (!trimmed) throw new Error("El nombre es obligatorio");
	const projects = readCatalog();
	const duplicate = projects.some(
		(p) => p.name.toLowerCase() === trimmed.toLowerCase(),
	);
	if (duplicate) throw new Error("Ya existe un proyecto con ese nombre");
	const created: TrackerProject = { id: nextId(projects), name: trimmed };
	writeCatalog([...projects, created]);
	return created;
}

export function renameTrackerProject(id: number, name: string): TrackerProject {
	const trimmed = name.trim();
	if (!trimmed) throw new Error("El nombre es obligatorio");
	const projects = readCatalog();
	const duplicate = projects.some(
		(p) => p.id !== id && p.name.toLowerCase() === trimmed.toLowerCase(),
	);
	if (duplicate) throw new Error("Ya existe un proyecto con ese nombre");
	const next = projects.map((p) =>
		p.id === id ? { ...p, name: trimmed } : p,
	);
	const updated = next.find((p) => p.id === id);
	if (!updated) throw new Error("Proyecto no encontrado");
	writeCatalog(next);
	return updated;
}

/** Removes from catalog and from all month assignments. */
export function deleteTrackerProject(id: number) {
	writeCatalog(readCatalog().filter((p) => p.id !== id));
	try {
		const raw = localStorage.getItem(MONTH_PROJECTS_KEY);
		if (!raw) return;
		const map = JSON.parse(raw) as Record<string, number[]>;
		if (map == null || typeof map !== "object") return;
		for (const key of Object.keys(map)) {
			const ids = Array.isArray(map[key]) ? map[key] : [];
			map[key] = ids.filter((pid) => pid !== id);
			if (map[key].length === 0) delete map[key];
		}
		localStorage.setItem(MONTH_PROJECTS_KEY, JSON.stringify(map));
	} catch {
		/* ignore */
	}
}

export function assignTrackerProjectToMonth(monthKey: string, projectId: number) {
	const ids = getMonthProjectIds(monthKey);
	if (!ids.includes(projectId)) {
		setMonthProjectIds(monthKey, [...ids, projectId]);
	}
	return getMonthProjectIds(monthKey);
}
