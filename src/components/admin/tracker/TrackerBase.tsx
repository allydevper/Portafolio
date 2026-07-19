import React, { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { showToastFront } from "@/lib/customToast";
import type { ProjectModel } from "../../../models/project.model";
import type { TodoModel } from "../../../models/todo.model";
import type { JournalEntryModel } from "../../../models/journal.model";
import { getProjects } from "../../../services/project.service";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../../../services/todo.service";
import {
	createJournalEntry,
	deleteJournalEntry,
	getJournalEntries,
	updateJournalEntry,
} from "../../../services/journal.service";
import { buildExportText, currentMonthKey, formatMonthLabel } from "./exportText";

type Tab = "todos" | "journal";

const EMPTY_TODO = {
	title: "",
	description: "",
	project_id: "none" as string | number,
	done: false,
};

const EMPTY_JOURNAL = {
	title: "",
	body: "",
	project_id: "none" as string | number,
};

const TrackerBase: React.FC = () => {
	const [tab, setTab] = useState<Tab>("todos");
	const [projects, setProjects] = useState<ProjectModel[]>([]);
	const [todos, setTodos] = useState<TodoModel[]>([]);
	const [journal, setJournal] = useState<JournalEntryModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [filterProject, setFilterProject] = useState<string>("all");
	const [monthKey, setMonthKey] = useState(currentMonthKey());
	const [todoForm, setTodoForm] = useState(EMPTY_TODO);
	const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
	const [journalForm, setJournalForm] = useState(EMPTY_JOURNAL);
	const [editingJournalId, setEditingJournalId] = useState<number | null>(null);

	const loadAll = async () => {
		setLoading(true);
		try {
			const [projectList, todoList, journalList] = await Promise.all([
				getProjects(),
				getTodos(),
				getJournalEntries({ month: monthKey }),
			]);
			setProjects(projectList.sort((a, b) => a.name.localeCompare(b.name)));
			setTodos(todoList);
			setJournal(journalList);
		} catch (error: Error | any) {
			console.error(error);
			showToastFront(error?.message ?? "Error al cargar", "danger");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const journalList = await getJournalEntries({ month: monthKey });
				if (!cancelled) setJournal(journalList);
			} catch (error: Error | any) {
				if (!cancelled) {
					showToastFront(error?.message ?? "Error al cargar bitácora", "danger");
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [monthKey]);

	const filteredTodos = useMemo(() => {
		if (filterProject === "all") return todos;
		if (filterProject === "none") return todos.filter((t) => t.project_id == null);
		const id = Number(filterProject);
		return todos.filter((t) => t.project_id === id);
	}, [todos, filterProject]);

	const groupedTodos = useMemo(() => {
		const map = new Map<string, TodoModel[]>();
		for (const todo of filteredTodos) {
			const key =
				todo.project_id == null
					? "Sin proyecto"
					: (projects.find((p) => p.id === todo.project_id)?.name ??
						`Proyecto #${todo.project_id}`);
			const list = map.get(key) ?? [];
			list.push(todo);
			map.set(key, list);
		}
		return [...map.entries()];
	}, [filteredTodos, projects]);

	const parseProjectId = (value: string | number): number | null => {
		if (value === "" || value === "none") return null;
		return Number(value);
	};

	const resetTodoForm = () => {
		setTodoForm(EMPTY_TODO);
		setEditingTodoId(null);
	};

	const resetJournalForm = () => {
		setJournalForm(EMPTY_JOURNAL);
		setEditingJournalId(null);
	};

	const handleSaveTodo = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!todoForm.title.trim()) {
			showToastFront("El título es obligatorio", "danger");
			return;
		}
		setSaving(true);
		try {
			const payload = {
				title: todoForm.title.trim(),
				description: todoForm.description.trim() || null,
				done: todoForm.done,
				project_id: parseProjectId(todoForm.project_id),
			};
			if (editingTodoId != null) {
				const updated = await updateTodo({ id: editingTodoId, ...payload });
				setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
				showToastFront("Todo actualizado", "success");
			} else {
				const created = await createTodo(payload);
				setTodos((prev) => [created, ...prev]);
				showToastFront("Todo creado", "success");
			}
			resetTodoForm();
		} catch (error: Error | any) {
			showToastFront(error?.message ?? "Error al guardar", "danger");
		} finally {
			setSaving(false);
		}
	};

	const handleToggleDone = async (todo: TodoModel) => {
		try {
			const updated = await updateTodo({ ...todo, done: !todo.done });
			setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
		} catch (error: Error | any) {
			showToastFront(error?.message ?? "Error al actualizar", "danger");
		}
	};

	const handleEditTodo = (todo: TodoModel) => {
		setEditingTodoId(todo.id);
		setTodoForm({
			title: todo.title,
			description: todo.description ?? "",
			project_id: todo.project_id ?? "none",
			done: todo.done,
		});
		setTab("todos");
	};

	const handleDeleteTodo = async (id: number) => {
		if (!confirm("¿Eliminar este todo?")) return;
		try {
			await deleteTodo(id);
			setTodos((prev) => prev.filter((t) => t.id !== id));
			if (editingTodoId === id) resetTodoForm();
			showToastFront("Todo eliminado", "success");
		} catch (error: Error | any) {
			showToastFront(error?.message ?? "Error al eliminar", "danger");
		}
	};

	const handleSaveJournal = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!journalForm.body.trim()) {
			showToastFront("La nota es obligatoria", "danger");
			return;
		}
		setSaving(true);
		try {
			const payload = {
				title: journalForm.title.trim() || null,
				body: journalForm.body.trim(),
				entry_month: `${monthKey}-01`,
				project_id: parseProjectId(journalForm.project_id),
			};
			if (editingJournalId != null) {
				const updated = await updateJournalEntry({ id: editingJournalId, ...payload });
				setJournal((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
				showToastFront("Nota actualizada", "success");
			} else {
				const created = await createJournalEntry(payload);
				setJournal((prev) => [created, ...prev]);
				showToastFront("Nota creada", "success");
			}
			resetJournalForm();
		} catch (error: Error | any) {
			showToastFront(error?.message ?? "Error al guardar", "danger");
		} finally {
			setSaving(false);
		}
	};

	const handleEditJournal = (entry: JournalEntryModel) => {
		setEditingJournalId(entry.id);
		setJournalForm({
			title: entry.title ?? "",
			body: entry.body,
			project_id: entry.project_id ?? "none",
		});
		setTab("journal");
	};

	const handleDeleteJournal = async (id: number) => {
		if (!confirm("¿Eliminar esta nota?")) return;
		try {
			await deleteJournalEntry(id);
			setJournal((prev) => prev.filter((j) => j.id !== id));
			if (editingJournalId === id) resetJournalForm();
			showToastFront("Nota eliminada", "success");
		} catch (error: Error | any) {
			showToastFront(error?.message ?? "Error al eliminar", "danger");
		}
	};

	const handleExport = async (onlyDone: boolean) => {
		const text = buildExportText({
			todos: filteredTodos,
			journal,
			projects,
			monthKey,
			onlyDone,
		});
		try {
			await navigator.clipboard.writeText(text);
			showToastFront(onlyDone ? "Hechos copiados" : "Listado copiado", "success");
		} catch {
			showToastFront("No se pudo copiar al portapapeles", "danger");
		}
	};

	const projectOptions = (
		<>
			<option value="none">Sin proyecto (one-shot)</option>
			{projects.map((p) => (
				<option key={p.id} value={p.id}>
					{p.name}
				</option>
			))}
		</>
	);

	return (
		<>
			<Toaster />
			<div className="tracker-page terminal-layout-inner">
				<header className="tracker-header">
					<div>
						<div className="terminal-kicker">// admin · tracker.sh</div>
						<h1>
							Todo <span>Tracker</span>
						</h1>
						<p>
							Actividades por proyecto, one-shots y bitácora mensual. Exporta un
							listado listo para pegar.
						</p>
					</div>
					<nav className="tracker-nav-links">
						<a href="/admin" className="terminal-cta terminal-cta-outline">
							← Proyectos
						</a>
						<button
							type="button"
							className="tracker-btn"
							onClick={() => handleExport(false)}
							disabled={loading}
						>
							Copiar todo
						</button>
						<button
							type="button"
							className="tracker-btn tracker-btn-primary"
							onClick={() => handleExport(true)}
							disabled={loading}
						>
							Copiar hechos
						</button>
					</nav>
				</header>

				<div className="tracker-tabs" role="tablist">
					<button
						type="button"
						role="tab"
						className={`tracker-tab${tab === "todos" ? " is-active" : ""}`}
						aria-selected={tab === "todos"}
						onClick={() => setTab("todos")}
					>
						Todos
					</button>
					<button
						type="button"
						role="tab"
						className={`tracker-tab${tab === "journal" ? " is-active" : ""}`}
						aria-selected={tab === "journal"}
						onClick={() => setTab("journal")}
					>
						Bitácora · {formatMonthLabel(monthKey)}
					</button>
				</div>

				{tab === "todos" && (
					<section>
						<form className="tracker-form" onSubmit={handleSaveTodo}>
							<div className="tracker-form-row">
								<div className="tracker-field">
									<label htmlFor="todo-title">Título</label>
									<input
										id="todo-title"
										className="tracker-input"
										value={todoForm.title}
										onChange={(e) =>
											setTodoForm((f) => ({ ...f, title: e.target.value }))
										}
										placeholder="ej. Migración BD"
										required
									/>
								</div>
								<div className="tracker-field">
									<label htmlFor="todo-project">Proyecto</label>
									<select
										id="todo-project"
										className="tracker-select"
										value={todoForm.project_id}
										onChange={(e) =>
											setTodoForm((f) => ({ ...f, project_id: e.target.value }))
										}
									>
										{projectOptions}
									</select>
								</div>
							</div>
							<div className="tracker-field">
								<label htmlFor="todo-desc">Descripción</label>
								<textarea
									id="todo-desc"
									className="tracker-textarea"
									value={todoForm.description}
									onChange={(e) =>
										setTodoForm((f) => ({ ...f, description: e.target.value }))
									}
									placeholder="Detalle opcional"
								/>
							</div>
							<div className="tracker-form-actions">
								<button
									type="submit"
									className="tracker-btn tracker-btn-primary"
									disabled={saving}
								>
									{editingTodoId != null ? "Actualizar" : "Agregar"}
								</button>
								{editingTodoId != null && (
									<button
										type="button"
										className="tracker-btn tracker-btn-ghost"
										onClick={resetTodoForm}
									>
										Cancelar
									</button>
								)}
							</div>
						</form>

						<div className="tracker-toolbar">
							<div className="tracker-field" style={{ maxWidth: 280 }}>
								<label htmlFor="filter-project">Filtrar</label>
								<select
									id="filter-project"
									className="tracker-select"
									value={filterProject}
									onChange={(e) => setFilterProject(e.target.value)}
								>
									<option value="all">Todos los proyectos</option>
									<option value="none">Solo sin proyecto</option>
									{projects.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name}
										</option>
									))}
								</select>
							</div>
							<span style={{ color: "#555", fontSize: 12 }}>
								{filteredTodos.length} ítem(s)
								{filteredTodos.filter((t) => t.done).length > 0 &&
									` · ${filteredTodos.filter((t) => t.done).length} hechos`}
							</span>
						</div>

						{loading ? (
							<div className="tracker-empty">Cargando…</div>
						) : groupedTodos.length === 0 ? (
							<div className="tracker-empty">Sin actividades todavía.</div>
						) : (
							groupedTodos.map(([groupName, items]) => (
								<div key={groupName} className="tracker-group">
									<h3 className="tracker-group-title">### {groupName}</h3>
									<ul className="tracker-list">
										{items.map((todo) => (
											<li
												key={todo.id}
												className={`tracker-item${todo.done ? " is-done" : ""}`}
											>
												<input
													type="checkbox"
													className="tracker-check"
													checked={todo.done}
													onChange={() => handleToggleDone(todo)}
													aria-label={`Marcar ${todo.title}`}
												/>
												<div>
													<p className="tracker-item-title">{todo.title}</p>
													{todo.description ? (
														<p className="tracker-item-desc">{todo.description}</p>
													) : null}
												</div>
												<div className="tracker-item-actions">
													<button type="button" onClick={() => handleEditTodo(todo)}>
														editar
													</button>
													<button
														type="button"
														className="is-danger"
														onClick={() => handleDeleteTodo(todo.id)}
													>
														borrar
													</button>
												</div>
											</li>
										))}
									</ul>
								</div>
							))
						)}
					</section>
				)}

				{tab === "journal" && (
					<section>
						<div className="tracker-toolbar">
							<div className="tracker-field" style={{ maxWidth: 220 }}>
								<label htmlFor="journal-month">Mes</label>
								<input
									id="journal-month"
									type="month"
									className="tracker-input"
									value={monthKey}
									onChange={(e) => setMonthKey(e.target.value)}
								/>
							</div>
						</div>

						<form className="tracker-form" onSubmit={handleSaveJournal}>
							<div className="tracker-form-row">
								<div className="tracker-field">
									<label htmlFor="journal-title">Título (opcional)</label>
									<input
										id="journal-title"
										className="tracker-input"
										value={journalForm.title}
										onChange={(e) =>
											setJournalForm((f) => ({ ...f, title: e.target.value }))
										}
										placeholder="ej. Migración BD"
									/>
								</div>
								<div className="tracker-field">
									<label htmlFor="journal-project">Proyecto</label>
									<select
										id="journal-project"
										className="tracker-select"
										value={journalForm.project_id}
										onChange={(e) =>
											setJournalForm((f) => ({
												...f,
												project_id: e.target.value,
											}))
										}
									>
										{projectOptions}
									</select>
								</div>
							</div>
							<div className="tracker-field">
								<label htmlFor="journal-body">Nota de avance</label>
								<textarea
									id="journal-body"
									className="tracker-textarea"
									value={journalForm.body}
									onChange={(e) =>
										setJournalForm((f) => ({ ...f, body: e.target.value }))
									}
									placeholder="Qué avanzaste este mes…"
									required
								/>
							</div>
							<div className="tracker-form-actions">
								<button
									type="submit"
									className="tracker-btn tracker-btn-primary"
									disabled={saving}
								>
									{editingJournalId != null ? "Actualizar nota" : "Agregar nota"}
								</button>
								{editingJournalId != null && (
									<button
										type="button"
										className="tracker-btn tracker-btn-ghost"
										onClick={resetJournalForm}
									>
										Cancelar
									</button>
								)}
							</div>
						</form>

						{journal.length === 0 ? (
							<div className="tracker-empty">
								Sin notas para {formatMonthLabel(monthKey)}.
							</div>
						) : (
							<ul className="tracker-list">
								{journal.map((entry) => {
									const proj =
										entry.project_id == null
											? "Sin proyecto"
											: (projects.find((p) => p.id === entry.project_id)?.name ??
												`#${entry.project_id}`);
									return (
										<li key={entry.id} className="tracker-journal-item">
											<div className="tracker-journal-meta">
												<h3 className="tracker-journal-title">
													{entry.title?.trim() || "Nota"}
												</h3>
												<span className="terminal-tag">{proj}</span>
												<div className="tracker-item-actions">
													<button
														type="button"
														onClick={() => handleEditJournal(entry)}
													>
														editar
													</button>
													<button
														type="button"
														className="is-danger"
														onClick={() => handleDeleteJournal(entry.id)}
													>
														borrar
													</button>
												</div>
											</div>
											<p className="tracker-journal-body">{entry.body}</p>
										</li>
									);
								})}
							</ul>
						)}
					</section>
				)}
			</div>
		</>
	);
};

export default TrackerBase;
