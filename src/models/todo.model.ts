export interface TodoModel {
	id: number;
	title: string;
	description?: string | null;
	done: boolean;
	project_id?: number | null;
	create_date?: string;
	update_date?: string;
}

export interface TodoFilters {
	project_id?: number;
	done?: boolean;
	standalone?: boolean;
}
