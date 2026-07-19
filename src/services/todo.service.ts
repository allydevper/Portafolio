import type { TodoFilters, TodoModel } from "../models/todo.model";

function buildQuery(filters: TodoFilters = {}): string {
	const params = new URLSearchParams();
	if (filters.project_id !== undefined) {
		params.set("project_id", String(filters.project_id));
	}
	if (filters.done !== undefined) {
		params.set("done", String(filters.done));
	}
	if (filters.standalone) {
		params.set("standalone", "1");
	}
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

export async function getTodos(filters: TodoFilters = {}): Promise<TodoModel[]> {
	const response = await fetch(
		`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/todos${buildQuery(filters)}`,
		{ method: "GET" },
	);

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP error! status: ${response.status} ${text}`);
	}

	return await response.json();
}

export async function createTodo(
	todo: Omit<TodoModel, "id" | "create_date" | "update_date">,
): Promise<TodoModel> {
	const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/todos`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(todo),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP error! status: ${response.status} ${text}`);
	}

	return await response.json();
}

export async function updateTodo(todo: TodoModel): Promise<TodoModel> {
	const { id, create_date, update_date, ...rest } = todo;
	const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/todos/${id}`, {
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

export async function deleteTodo(id: number): Promise<void> {
	const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/todos/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP error! status: ${response.status} ${text}`);
	}
}
