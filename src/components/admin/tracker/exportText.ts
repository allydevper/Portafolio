import type { JournalEntryModel } from "../../../models/journal.model";
import type { TodoModel } from "../../../models/todo.model";
import type { TrackerProject } from "./trackerProjects";

const MONTH_NAMES = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

export function formatMonthLabel(monthKey: string): string {
	const match = monthKey.match(/^(\d{4})-(\d{2})/);
	if (!match) return monthKey;
	const year = match[1];
	const monthIndex = Number(match[2]) - 1;
	return `${MONTH_NAMES[monthIndex] ?? match[2]} ${year}`;
}

export function currentMonthKey(date = new Date()): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

function projectName(
	projectId: number | null | undefined,
	projects: TrackerProject[],
): string {
	if (projectId == null) return "Sin proyecto";
	return projects.find((p) => p.id === projectId)?.name ?? `Proyecto #${projectId}`;
}

export function buildExportText(opts: {
	todos: TodoModel[];
	journal: JournalEntryModel[];
	projects: TrackerProject[];
	monthKey: string;
	onlyDone: boolean;
}): string {
	const { todos, journal, projects, monthKey, onlyDone } = opts;
	const filtered = onlyDone ? todos.filter((t) => t.done) : todos;

	const groups = new Map<string, TodoModel[]>();
	for (const todo of filtered) {
		const key = projectName(todo.project_id, projects);
		const list = groups.get(key) ?? [];
		list.push(todo);
		groups.set(key, list);
	}

	const lines: string[] = [`## ${formatMonthLabel(monthKey)}`, ""];

	if (groups.size === 0) {
		lines.push("_Sin actividades_", "");
	} else {
		for (const [name, items] of groups) {
			lines.push(`### ${name}`);
			for (const item of items) {
				const mark = item.done ? "x" : " ";
				lines.push(`- [${mark}] ${item.title}`);
				if (item.description?.trim()) {
					lines.push(`  ${item.description.trim()}`);
				}
			}
			lines.push("");
		}
	}

	if (journal.length > 0) {
		lines.push("### Bitácora");
		for (const entry of journal) {
			const proj = projectName(entry.project_id, projects);
			const title = entry.title?.trim() || "Nota";
			lines.push(`- ${title} (${proj}): ${entry.body.trim()}`);
		}
		lines.push("");
	}

	return lines.join("\n").trimEnd() + "\n";
}
