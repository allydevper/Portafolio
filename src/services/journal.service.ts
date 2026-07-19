import type { JournalEntryModel, JournalFilters } from "../models/journal.model";

function buildQuery(filters: JournalFilters = {}): string {
	const params = new URLSearchParams();
	if (filters.month) {
		params.set("month", filters.month);
	}
	if (filters.project_id !== undefined) {
		params.set("project_id", String(filters.project_id));
	}
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

export async function getJournalEntries(
	filters: JournalFilters = {},
): Promise<JournalEntryModel[]> {
	const response = await fetch(
		`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/journal${buildQuery(filters)}`,
		{ method: "GET" },
	);

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP error! status: ${response.status} ${text}`);
	}

	return await response.json();
}

export async function createJournalEntry(
	entry: Omit<JournalEntryModel, "id" | "create_date">,
): Promise<JournalEntryModel> {
	const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/journal`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(entry),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP error! status: ${response.status} ${text}`);
	}

	return await response.json();
}

export async function updateJournalEntry(entry: JournalEntryModel): Promise<JournalEntryModel> {
	const { id, create_date, ...rest } = entry;
	const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/journal/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(rest),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP error! status: ${response.status} ${text}`);
	}

	return await response.json();
}

export async function deleteJournalEntry(id: number): Promise<void> {
	const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/journal/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP error! status: ${response.status} ${text}`);
	}
}
