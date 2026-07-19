export interface JournalEntryModel {
	id: number;
	title?: string | null;
	body: string;
	entry_month: string;
	project_id?: number | null;
	create_date?: string;
}

export interface JournalFilters {
	month?: string;
	project_id?: number;
}
