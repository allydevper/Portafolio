import React, { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { showToastFront } from "@/lib/customToast";
import type { TodoModel } from "../../../models/todo.model";
import type { JournalEntryModel } from "../../../models/journal.model";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../../../services/todo.service";
import {
	createJournalEntry,
	deleteJournalEntry,
	getJournalEntries,
	updateJournalEntry,
} from "../../../services/journal.service";
import { buildExportText, currentMonthKey, formatMonthLabel } from "./exportText";
import {
	buildMonthOptions,
	copyPreviousMonthProjects,
	getMonthProjectIds,
	setMonthProjectIds,
	toggleMonthProject,
} from "./monthProjects";
import {
	assignTrackerProjectToMonth,
	createTrackerProject,
	deleteTrackerProject,
	listTrackerProjects,
	renameTrackerProject,
	type TrackerProject,
} from "./trackerProjects";
import {
	moveJournalProjectLink,
	moveTodoProjectLink,
	removeJournalProjectLink,
	removeTodoProjectLink,
	setJournalProjectLink,
	setTodoProjectLink,
	withJournalProjectLink,
	withTodoProjectLink,
} from "./projectLinks";

type Tab = "todos" | "journal" | "projects";

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

let tempIdSeq = -1;
function nextTempId() {
	return tempIdSeq--;
}

const TrackerBase: React.FC = () => {
	const [tab, setTab] = useState<Tab>("todos");
	const [projects, setProjects] = useState<TrackerProject[]>(() =>
		typeof window !== "undefined" ? listTrackerProjects() : [],
	);
	const [todos, setTodos] = useState<TodoModel[]>([]);
	const [journal, setJournal] = useState<JournalEntryModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterProject, setFilterProject] = useState<string>("all");
	const [monthKey, setMonthKey] = useState(currentMonthKey());
	const [assignedIds, setAssignedIds] = useState<number[]>(() =>
		typeof window !== "undefined" ? getMonthProjectIds(currentMonthKey()) : [],
	);
	const [todoForm, setTodoForm] = useState(EMPTY_TODO);
	const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
	const [journalForm, setJournalForm] = useState(EMPTY_JOURNAL);
	const [editingJournalId, setEditingJournalId] = useState<number | null>(null);
	const [newProjectName, setNewProjectName] = useState("");
	const [renamingId, setRenamingId] = useState<number | null>(null);
	const [renameValue, setRenameValue] = useState("");

	const monthOptions = useMemo(() => buildMonthOptions(18), []);

	const assignedProjects = useMemo(
		() => projects.filter((p) => assignedIds.includes(p.id)),
		[projects, assignedIds],
	);

	const refreshProjects = () => {
		setProjects(listTrackerProjects());
		setAssignedIds(getMonthProjectIds(monthKey));
	};

	useEffect(() => {
		setAssignedIds(getMonthProjectIds(monthKey));
	}, [monthKey]);

	const loadAll = async () => {
		setLoading(true);
		try {
			setProjects(listTrackerProjects());
			const [todoList, journalList] = await Promise.all([
				getTodos(),
				getJournalEntries({ month: monthKey }),
			]);
			setTodos(todoList.map(withTodoProjectLink));
			setJournal(journalList.map(withJournalProjectLink));
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
				if (!cancelled) setJournal(journalList.map(withJournalProjectLink));
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

		const trackerProjectId = parseProjectId(todoForm.project_id);
		const apiPayload = {
			title: todoForm.title.trim(),
			description: todoForm.description.trim() || null,
			done: todoForm.done,
			project_id: null as number | null,
		};
		const uiPayload = { ...apiPayload, project_id: trackerProjectId };

		if (editingTodoId != null) {
			const id = editingTodoId;
			const previous = todos.find((t) => t.id === id);
			const optimistic: TodoModel = {
				...(previous ?? { id }),
				...uiPayload,
			};
			setTodos((prev) => prev.map((t) => (t.id === id ? optimistic : t)));
			setTodoProjectLink(id, trackerProjectId);
			resetTodoForm();
			try {
				const updated = await updateTodo({ id, ...apiPayload });
				setTodos((prev) =>
					prev.map((t) =>
						t.id === id ? { ...updated, project_id: trackerProjectId } : t,
					),
				);
				showToastFront("Todo actualizado", "success");
			} catch (error: Error | any) {
				if (previous) {
					setTodos((prev) => prev.map((t) => (t.id === id ? previous : t)));
					setTodoProjectLink(id, previous.project_id ?? null);
				}
				showToastFront(error?.message ?? "Error al guardar", "danger");
			}
			return;
		}

		const tempId = nextTempId();
		const optimistic: TodoModel = { id: tempId, ...uiPayload };
		setTodos((prev) => [optimistic, ...prev]);
		setTodoProjectLink(tempId, trackerProjectId);
		resetTodoForm();
		try {
			const created = await createTodo(apiPayload);
			moveTodoProjectLink(tempId, created.id);
			setTodoProjectLink(created.id, trackerProjectId);
			setTodos((prev) =>
				prev.map((t) =>
					t.id === tempId ? { ...created, project_id: trackerProjectId } : t,
				),
			);
			showToastFront("Todo creado", "success");
		} catch (error: Error | any) {
			removeTodoProjectLink(tempId);
			setTodos((prev) => prev.filter((t) => t.id !== tempId));
			showToastFront(error?.message ?? "Error al guardar", "danger");
		}
	};

	const handleToggleDone = async (todo: TodoModel) => {
		const previous = todo;
		const trackerProjectId = todo.project_id ?? null;
		const optimistic = { ...todo, done: !todo.done };
		setTodos((prev) => prev.map((t) => (t.id === todo.id ? optimistic : t)));
		try {
			const updated = await updateTodo({
				...todo,
				done: !todo.done,
				project_id: null,
			});
			setTodos((prev) =>
				prev.map((t) =>
					t.id === todo.id ? { ...updated, project_id: trackerProjectId } : t,
				),
			);
		} catch (error: Error | any) {
			setTodos((prev) => prev.map((t) => (t.id === todo.id ? previous : t)));
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
		const previous = todos.find((t) => t.id === id);
		setTodos((prev) => prev.filter((t) => t.id !== id));
		if (editingTodoId === id) resetTodoForm();
		try {
			await deleteTodo(id);
			removeTodoProjectLink(id);
			showToastFront("Todo eliminado", "success");
		} catch (error: Error | any) {
			if (previous) {
				setTodos((prev) => [previous, ...prev]);
			}
			showToastFront(error?.message ?? "Error al eliminar", "danger");
		}
	};

	const handleSaveJournal = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!journalForm.body.trim()) {
			showToastFront("La nota es obligatoria", "danger");
			return;
		}

		const trackerProjectId = parseProjectId(journalForm.project_id);
		const apiPayload = {
			title: journalForm.title.trim() || null,
			body: journalForm.body.trim(),
			entry_month: `${monthKey}-01`,
			project_id: null as number | null,
		};
		const uiPayload = { ...apiPayload, project_id: trackerProjectId };

		if (editingJournalId != null) {
			const id = editingJournalId;
			const previous = journal.find((j) => j.id === id);
			const optimistic: JournalEntryModel = {
				...(previous ?? { id, body: uiPayload.body, entry_month: uiPayload.entry_month }),
				...uiPayload,
			};
			setJournal((prev) => prev.map((j) => (j.id === id ? optimistic : j)));
			setJournalProjectLink(id, trackerProjectId);
			resetJournalForm();
			try {
				const updated = await updateJournalEntry({ id, ...apiPayload });
				setJournal((prev) =>
					prev.map((j) =>
						j.id === id ? { ...updated, project_id: trackerProjectId } : j,
					),
				);
				showToastFront("Nota actualizada", "success");
			} catch (error: Error | any) {
				if (previous) {
					setJournal((prev) => prev.map((j) => (j.id === id ? previous : j)));
					setJournalProjectLink(id, previous.project_id ?? null);
				}
				showToastFront(error?.message ?? "Error al guardar", "danger");
			}
			return;
		}

		const tempId = nextTempId();
		const optimistic: JournalEntryModel = { id: tempId, ...uiPayload };
		setJournal((prev) => [optimistic, ...prev]);
		setJournalProjectLink(tempId, trackerProjectId);
		resetJournalForm();
		try {
			const created = await createJournalEntry(apiPayload);
			moveJournalProjectLink(tempId, created.id);
			setJournalProjectLink(created.id, trackerProjectId);
			setJournal((prev) =>
				prev.map((j) =>
					j.id === tempId ? { ...created, project_id: trackerProjectId } : j,
				),
			);
			showToastFront("Nota creada", "success");
		} catch (error: Error | any) {
			removeJournalProjectLink(tempId);
			setJournal((prev) => prev.filter((j) => j.id !== tempId));
			showToastFront(error?.message ?? "Error al guardar", "danger");
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
		const previous = journal.find((j) => j.id === id);
		setJournal((prev) => prev.filter((j) => j.id !== id));
		if (editingJournalId === id) resetJournalForm();
		try {
			await deleteJournalEntry(id);
			removeJournalProjectLink(id);
			showToastFront("Nota eliminada", "success");
		} catch (error: Error | any) {
			if (previous) {
				setJournal((prev) => [previous, ...prev]);
			}
			showToastFront(error?.message ?? "Error al eliminar", "danger");
		}
	};

	const handleToggleAssigned = (projectId: number) => {
		const next = toggleMonthProject(monthKey, projectId);
		setAssignedIds(next);
	};

	const handleCopyPreviousMonth = () => {
		const next = copyPreviousMonthProjects(monthKey);
		setAssignedIds(next);
		showToastFront(
			next.length > 0
				? `Copiados ${next.length} proyecto(s) del mes anterior`
				: "El mes anterior no tenía proyectos asignados",
			next.length > 0 ? "success" : "normal",
		);
	};

	const handleClearAssigned = () => {
		setMonthProjectIds(monthKey, []);
		setAssignedIds([]);
	};

	const handleCreateProject = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const created = createTrackerProject(newProjectName);
			const next = assignTrackerProjectToMonth(monthKey, created.id);
			setNewProjectName("");
			refreshProjects();
			setAssignedIds(next);
			showToastFront("Proyecto creado y asignado al mes", "success");
		} catch (error: Error | any) {
			showToastFront(error?.message ?? "No se pudo crear", "danger");
		}
	};

	const handleStartRename = (project: TrackerProject) => {
		setRenamingId(project.id);
		setRenameValue(project.name);
	};

	const handleSaveRename = (id: number) => {
		try {
			renameTrackerProject(id, renameValue);
			setRenamingId(null);
			setRenameValue("");
			refreshProjects();
			showToastFront("Proyecto renombrado", "success");
		} catch (error: Error | any) {
			showToastFront(error?.message ?? "No se pudo renombrar", "danger");
		}
	};

	const handleDeleteProject = (id: number) => {
		if (!confirm("¿Eliminar este proyecto del tracker? Se quita de todos los meses."))
			return;
		deleteTrackerProject(id);
		refreshProjects();
		if (todoForm.project_id === id || todoForm.project_id === String(id)) {
			setTodoForm((f) => ({ ...f, project_id: "none" }));
		}
		if (journalForm.project_id === id || journalForm.project_id === String(id)) {
			setJournalForm((f) => ({ ...f, project_id: "none" }));
		}
		showToastFront("Proyecto eliminado", "success");
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
			{assignedProjects.map((p) => (
				<option key={p.id} value={p.id}>
					{p.name}
				</option>
			))}
		</>
	);

	const monthToolbar = (
		<div className="tracker-month-bar">
			<div className="tracker-field tracker-month-field">
				<label htmlFor="tracker-month">Mes</label>
				<select
					id="tracker-month"
					className="tracker-select"
					value={monthKey}
					onChange={(e) => setMonthKey(e.target.value)}
				>
					{monthOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>
			<span className="tracker-month-hint">
				{assignedIds.length} proyecto(s) asignado(s)
			</span>
		</div>
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
							← Admin portafolio
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

				{monthToolbar}

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
						Bitácora
					</button>
					<button
						type="button"
						role="tab"
						className={`tracker-tab${tab === "projects" ? " is-active" : ""}`}
						aria-selected={tab === "projects"}
						onClick={() => setTab("projects")}
					>
						Proyectos · {formatMonthLabel(monthKey)}
					</button>
				</div>

				{tab === "todos" && (
					<section>
						{assignedIds.length === 0 && (
							<div className="tracker-empty tracker-empty-hint">
								No hay proyectos asignados a {formatMonthLabel(monthKey)}.{" "}
								<button
									type="button"
									className="tracker-inline-link"
									onClick={() => setTab("projects")}
								>
									Asignar en el tab Proyectos
								</button>
							</div>
						)}
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
								<button type="submit" className="tracker-btn tracker-btn-primary">
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
									{assignedProjects.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name}
										</option>
									))}
								</select>
							</div>
							<span style={{ color: "#9a9aa3", fontSize: 12 }}>
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
						{assignedIds.length === 0 && (
							<div className="tracker-empty tracker-empty-hint">
								No hay proyectos asignados a {formatMonthLabel(monthKey)}.{" "}
								<button
									type="button"
									className="tracker-inline-link"
									onClick={() => setTab("projects")}
								>
									Asignar en el tab Proyectos
								</button>
							</div>
						)}
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
								<button type="submit" className="tracker-btn tracker-btn-primary">
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

				{tab === "projects" && (
					<section>
						<p className="tracker-projects-lead">
							Catálogo propio del tracker (no son los del portafolio). Crea
							proyectos y marca cuáles están activos en{" "}
							<strong>{formatMonthLabel(monthKey)}</strong> para los combos de
							Todos y Bitácora.
						</p>

						<form className="tracker-form" onSubmit={handleCreateProject}>
							<div className="tracker-form-row">
								<div className="tracker-field">
									<label htmlFor="tracker-project-name">Nuevo proyecto</label>
									<input
										id="tracker-project-name"
										className="tracker-input"
										value={newProjectName}
										onChange={(e) => setNewProjectName(e.target.value)}
										placeholder="ej. Cliente Acme / Soporte interno"
										required
									/>
								</div>
							</div>
							<div className="tracker-form-actions">
								<button type="submit" className="tracker-btn tracker-btn-primary">
									Crear y asignar al mes
								</button>
							</div>
						</form>

						<div className="tracker-toolbar">
							<button
								type="button"
								className="tracker-btn"
								onClick={handleCopyPreviousMonth}
							>
								Usar mismos que el mes anterior
							</button>
							<button
								type="button"
								className="tracker-btn tracker-btn-ghost"
								onClick={handleClearAssigned}
								disabled={assignedIds.length === 0}
							>
								Limpiar mes
							</button>
						</div>

						{projects.length === 0 ? (
							<div className="tracker-empty">
								Aún no hay proyectos del tracker. Crea el primero arriba.
							</div>
						) : (
							<ul className="tracker-project-assign-list">
								{projects.map((project) => {
									const checked = assignedIds.includes(project.id);
									const isRenaming = renamingId === project.id;
									return (
										<li key={project.id} className="tracker-project-assign-row">
											<label className="tracker-project-assign-item">
												<input
													type="checkbox"
													className="tracker-check"
													checked={checked}
													onChange={() => handleToggleAssigned(project.id)}
													title="Activo este mes"
												/>
												{isRenaming ? (
													<input
														className="tracker-input"
														value={renameValue}
														onChange={(e) => setRenameValue(e.target.value)}
														onKeyDown={(e) => {
															if (e.key === "Enter") {
																e.preventDefault();
																handleSaveRename(project.id);
															}
															if (e.key === "Escape") {
																setRenamingId(null);
															}
														}}
														autoFocus
													/>
												) : (
													<span>{project.name}</span>
												)}
											</label>
											<div className="tracker-item-actions">
												{isRenaming ? (
													<>
														<button
															type="button"
															onClick={() => handleSaveRename(project.id)}
														>
															guardar
														</button>
														<button
															type="button"
															onClick={() => setRenamingId(null)}
														>
															cancelar
														</button>
													</>
												) : (
													<>
														<button
															type="button"
															onClick={() => handleStartRename(project)}
														>
															renombrar
														</button>
														<button
															type="button"
															className="is-danger"
															onClick={() => handleDeleteProject(project.id)}
														>
															borrar
														</button>
													</>
												)}
											</div>
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
