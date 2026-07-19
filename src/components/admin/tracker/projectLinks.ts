/** Links tracker project ids to API todo/journal rows (API FK only accepts portfolio projects). */

const TODO_LINKS_KEY = "tracker-todo-project-links";
const JOURNAL_LINKS_KEY = "tracker-journal-project-links";

type LinkMap = Record<string, number>;

function readLinks(key: string): LinkMap {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as LinkMap;
		if (parsed == null || typeof parsed !== "object") return {};
		return parsed;
	} catch {
		return {};
	}
}

function writeLinks(key: string, map: LinkMap) {
	try {
		localStorage.setItem(key, JSON.stringify(map));
	} catch {
		/* ignore */
	}
}

function setLink(storageKey: string, entityId: number, projectId: number | null) {
	const map = readLinks(storageKey);
	const key = String(entityId);
	if (projectId == null) {
		delete map[key];
	} else {
		map[key] = projectId;
	}
	writeLinks(storageKey, map);
}

function getLink(storageKey: string, entityId: number): number | null {
	const value = readLinks(storageKey)[String(entityId)];
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function moveLink(storageKey: string, fromId: number, toId: number) {
	const map = readLinks(storageKey);
	const fromKey = String(fromId);
	const toKey = String(toId);
	if (!(fromKey in map)) return;
	map[toKey] = map[fromKey];
	delete map[fromKey];
	writeLinks(storageKey, map);
}

function removeLink(storageKey: string, entityId: number) {
	setLink(storageKey, entityId, null);
}

export function setTodoProjectLink(todoId: number, projectId: number | null) {
	setLink(TODO_LINKS_KEY, todoId, projectId);
}

export function getTodoProjectLink(todoId: number): number | null {
	return getLink(TODO_LINKS_KEY, todoId);
}

export function moveTodoProjectLink(fromId: number, toId: number) {
	moveLink(TODO_LINKS_KEY, fromId, toId);
}

export function removeTodoProjectLink(todoId: number) {
	removeLink(TODO_LINKS_KEY, todoId);
}

export function setJournalProjectLink(entryId: number, projectId: number | null) {
	setLink(JOURNAL_LINKS_KEY, entryId, projectId);
}

export function getJournalProjectLink(entryId: number): number | null {
	return getLink(JOURNAL_LINKS_KEY, entryId);
}

export function moveJournalProjectLink(fromId: number, toId: number) {
	moveLink(JOURNAL_LINKS_KEY, fromId, toId);
}

export function removeJournalProjectLink(entryId: number) {
	removeLink(JOURNAL_LINKS_KEY, entryId);
}

export function withTodoProjectLink<T extends { id: number; project_id?: number | null }>(
	item: T,
): T {
	return { ...item, project_id: getTodoProjectLink(item.id) };
}

export function withJournalProjectLink<T extends { id: number; project_id?: number | null }>(
	item: T,
): T {
	return { ...item, project_id: getJournalProjectLink(item.id) };
}
