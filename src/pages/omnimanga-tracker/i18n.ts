export type Locale = "es" | "en";

export const LANG_STORAGE_KEY = "omnimanga-lang";
export const DEFAULT_LOCALE: Locale = "es";

export type FeatureItem = {
	title: string;
	description: string;
	icon: string;
};

export type FaqItem = {
	question: string;
	answer: string;
};

export type CaptionItem = {
	title: string;
	subtitle: string;
};

export type CaptureItem = {
	file?: string;
	title: string;
	caption: string;
	teaser?: boolean;
};

export type StepItem = {
	index: string;
	title: string;
	text: string;
	image: string;
	imageAlt: string;
};

export type PageMessages = {
	nav: {
		aria: string;
		features: string;
		captures: string;
		howItWorks: string;
		faq: string;
		privacy: string;
		menu: string;
	};
	lang: {
		aria: string;
		es: string;
		en: string;
	};
	hero: {
		eyebrow: string;
		titleAria: string;
		titleBefore: string;
		titleAfter: string;
		morph: [string, string, string, string];
		lead: string;
		install: string;
		seeFeatures: string;
		sitesMore: string;
		slidePrev: string;
		slideNext: string;
		slideAria: string;
		slideZoom: string;
		slideAlt: string;
	};
	trust: {
		eyebrow: string;
		problemTitle: string;
		problemText: string;
		solutionTitle: string;
		solutionText: string;
	};
	featuresSection: {
		eyebrow: string;
		title: string;
	};
	capturesSection: {
		eyebrow: string;
		title: string;
	};
	howSection: {
		eyebrow: string;
		title: string;
	};
	faqSection: {
		eyebrow: string;
		title: string;
	};
	cta: {
		eyebrow: string;
		title: string;
		text: string;
		install: string;
		seeCaptures: string;
	};
	lightbox: {
		aria: string;
		close: string;
	};
	footer: string;
	features: FeatureItem[];
	faqs: FaqItem[];
	sliderCaptions: CaptionItem[];
	featureCaptures: CaptureItem[];
	howItWorksSteps: StepItem[];
	privacy: {
		pageTitle: string;
		eyebrow: string;
		title: string;
		lead: string;
		responsible: string;
		s1Title: string;
		s1Li1: string;
		s1Li2: string;
		s2Title: string;
		s2Intro: string;
		s2Li1: string;
		s2Li2: string;
		s2Li3: string;
		s3Title: string;
		s3P1: string;
		s3P2: string;
		s4Title: string;
		s4P1: string;
		s4P2: string;
		s5Title: string;
		s5P: string;
		s6Title: string;
		s6P: string;
		s7Title: string;
		s7P: string;
		s8Title: string;
		s8P: string;
		meta: string;
		back: string;
	};
};

export const messages: Record<Locale, PageMessages> = {
	es: {
		nav: {
			aria: "Secciones",
			features: "Features",
			captures: "Capturas",
			howItWorks: "Como funciona",
			faq: "FAQ",
			privacy: "Privacidad",
			menu: "Menu de navegación",
		},
		lang: {
			aria: "Idioma",
			es: "ES",
			en: "EN",
		},
		hero: {
			eyebrow: "Chrome Extension",
			titleAria:
				"Centraliza tus mangas, manhwas, manhuas o novelas en un solo lugar.",
			titleBefore: "Centraliza tus",
			titleAfter: "en un solo lugar.",
			morph: ["mangas", "manhwas", "manhuas", "novelas"],
			lead: "OmniManga Tracker detecta lecturas en webs compatibles y las organiza en una biblioteca lateral con progreso, listas y actualizaciones en lote.",
			install: "Instalar extension",
			seeFeatures: "Ver funcionalidades",
			sitesMore: "+37 sitios",
			slidePrev: "Slide anterior",
			slideNext: "Slide siguiente",
			slideAria: "Captura {n}",
			slideZoom: "Ampliar captura {n}",
			slideAlt: "Captura de OmniManga Tracker {n}",
		},
		trust: {
			eyebrow: "Problema / Solucion",
			problemTitle: "Tus lecturas estan dispersas entre sitios",
			problemText:
				"El progreso se pierde entre pestanas, marcadores y listas no conectadas.",
			solutionTitle: "Unifica todo en un flujo simple",
			solutionText:
				"OmniManga concentra deteccion, organizacion y seguimiento en un solo panel lateral.",
		},
		featuresSection: {
			eyebrow: "Funcionalidades",
			title: "Todo lo necesario para gestionar tus lecturas",
		},
		capturesSection: {
			eyebrow: "Capacidades",
			title: "Funciones de la extensión en capturas reales",
		},
		howSection: {
			eyebrow: "Como funciona",
			title: "Tres pasos para empezar rapido",
		},
		faqSection: {
			eyebrow: "FAQ",
			title: "Preguntas frecuentes",
		},
		cta: {
			eyebrow: "Empieza hoy",
			title: "Organiza tu lectura sin friccion",
			text: "Pasa de pestanas dispersas a una biblioteca centralizada con progreso y listas claras.",
			install: "Instalar extension",
			seeCaptures: "Ver capturas",
		},
		lightbox: {
			aria: "Captura ampliada",
			close: "Cerrar",
		},
		footer: "OmniManga Tracker - MangaTracker v1.0.0",
		features: [
			{
				title: "Deteccion automatica",
				description:
					"Reconoce mangas en webs compatibles y prepara el registro sin pasos manuales.",
				icon: "✦",
			},
			{
				title: "Biblioteca inteligente",
				description:
					"Buscador, filtros por estado y orden por actividad para una gestion rapida.",
				icon: "▦",
			},
			{
				title: "Detalle por obra",
				description:
					"Edita metadata, portada, notas y progreso desde una sola vista clara.",
				icon: "✎",
			},
			{
				title: "Listas personalizadas",
				description:
					"Agrupa por objetivo, genero o prioridad sin duplicar obras en tu biblioteca.",
				icon: "◫",
			},
			{
				title: "Actualizacion masiva",
				description:
					"Ejecuta refresh por lotes y revisa el resumen final por resultado.",
				icon: "↻",
			},
			{
				title: "Export / Import JSON",
				description:
					"Haz respaldo completo y restaura datos cuando cambies de equipo o perfil.",
				icon: "◉",
			},
		],
		faqs: [
			{
				question: "Que sitios soporta OmniManga Tracker?",
				answer:
					"Incluye compatibilidad con MangaDex, Webtoon, Manga Plus y decenas de sitios integrados.",
			},
			{
				question: "Puedo migrar toda mi biblioteca?",
				answer:
					"Si. Puedes exportar un JSON de respaldo e importarlo en cualquier momento.",
			},
			{
				question: "Como evita duplicados?",
				answer:
					"Durante el agregado detecta coincidencias y permite fusionar, vincular o crear un registro nuevo.",
			},
		],
		sliderCaptions: [
			{
				title: "Biblioteca y listas",
				subtitle: "Gestiona y organiza tu lectura fácilmente.",
			},
			{
				title: "Vista de obra",
				subtitle: "Revisa detalles, estado y fuente de cada manga.",
			},
			{
				title: "Gestión de capítulos",
				subtitle: "Marca lecturas, ajusta estados, géneros y notas.",
			},
			{
				title: "Detección automática",
				subtitle: "Detecta lecturas compatibles al instante.",
			},
			{
				title: "Reconocimiento y fusión",
				subtitle:
					"Identifica lecturas ya agregados y fusiona registros.",
			},
		],
		featureCaptures: [
			{
				file: "con el boton actualizar puedes revisar si hay nuevos capitulos en tu lectura.png",
				title: "Actualizar novedades",
				caption:
					"Comprueba si hay capítulos nuevos con un solo botón.",
			},
			{
				file: "marca el capitulo en que te quedaste.png",
				title: "Progreso por capítulo",
				caption:
					"Marca dónde te quedaste y mantén el seguimiento al día.",
			},
			{
				file: "acceso a la fuente de tu lectura y actulizar el capitulo con un solo boton.png",
				title: "Fuente y capítulo",
				caption:
					"Abre la fuente de la lectura y actualiza el capítulo con un solo clic.",
			},
			{
				file: "grabaste un duplicado. puedes fusionar ambas y juntar tu obra.png",
				title: "Fusionar duplicados",
				caption:
					"Si registraste la misma obra dos veces, unifica registros sin perder datos.",
			},
			{
				file: "gestion_generos_de_obras.png",
				title: "Géneros en la biblioteca",
				caption:
					"Filtra, edita o fusiona etiquetas y ve cuántas obras usan cada género.",
			},
			{
				file: "organiza tu lectura en grupos para que puedas organizar mejor.png",
				title: "Grupos de lectura",
				caption:
					"Agrupa obras para ordenar listas largas con más claridad.",
			},
			{
				file: "anota referencias y detalles que puedas necesitar.png",
				title: "Notas y personajes",
				caption:
					"Guarda notas personales y referencias de personajes junto a cada obra.",
			},
			{
				file: "importar-exportar-config-json.png",
				title: "Copia de seguridad",
				caption:
					"Exporta o importa un JSON para respaldar datos y restaurarlos en otro perfil o equipo.",
			},
			{
				title: "Y muchas más opciones a descubrir",
				caption: "",
				teaser: true,
			},
		],
		howItWorksSteps: [
			{
				index: "01",
				title: "Registra o usa una web compatible",
				text: "Puede que necesites dar permisos a ciertos scans, si aun asi no se puede leer informanos para que las agreguemos.",
				image: "/omnimanga/features/addwebsecutity.png",
				imageAlt:
					"Sitios integrados (MangaDex, Webtoon, Manga Plus) y formulario para solicitar nuevas webs con indicador de sitio",
			},
			{
				index: "02",
				title: "Detecta una obra",
				text: "Visita una web compatible y deja que el sitio identifique la lectura.",
				image: "/omnimanga/features/quickAdd.png",
				imageAlt:
					"Vista rápida: resultado de búsqueda en MangaDex con opciones para ver o añadir la obra",
			},
			{
				index: "03",
				title: "Actualiza progreso",
				text: "Marca capitulos, ejecuta refresh por lotes y exporta respaldo.",
				image: "/omnimanga/features/marca el capitulo en que te quedastev2.png",
				imageAlt:
					"Sección Capítulos: barra de progreso, marcar o desmarcar todos y rejilla de capítulos leídos y pendientes",
			},
		],
		privacy: {
			pageTitle: "Politica de privacidad | OmniManga Tracker",
			eyebrow: "Legal",
			title: "Politica de privacidad",
			lead: "En OmniManga Tracker valoramos tu privacidad. Esta extension almacena principalmente la informacion de tu biblioteca de forma local en tu navegador para ofrecer funciones de seguimiento de lectura, listas y progreso.",
			responsible:
				"Responsable: Proyecto OmniManga Tracker (desarrollador independiente).",
			s1Title: "1. Informacion que recopilamos",
			s1Li1: "Datos de lectura que agregas manualmente (titulos, progreso, estados, notas y metadatos relacionados).",
			s1Li2: "Datos tecnicos minimos necesarios para el funcionamiento de la extension, como preferencias de configuracion.",
			s2Title: "2. Uso de la informacion",
			s2Intro: "Usamos la informacion exclusivamente para:",
			s2Li1: "organizar tu biblioteca;",
			s2Li2: "mostrar y actualizar tu progreso de lectura dentro de la extension;",
			s2Li3: "permitir exportacion e importacion mediante archivo JSON.",
			s3Title: "3. Comparticion de datos",
			s3P1: "No vendemos ni compartimos tus datos personales con terceros con fines comerciales.",
			s3P2: "La extension puede realizar solicitudes a servicios externos compatibles (por ejemplo, MangaDex, Manga Plus, AniList y Jikan) unicamente para obtener metadatos necesarios para las funciones de seguimiento y consulta.",
			s4Title: "4. Almacenamiento y control de datos",
			s4P1: "Tus datos se almacenan localmente en el navegador.",
			s4P2: "Puedes eliminar tus datos locales desinstalando la extension o limpiando el almacenamiento del navegador. Tambien puedes gestionar tus respaldos a traves de exportacion/importacion JSON.",
			s5Title: "5. Seguridad",
			s5P: "Aplicamos buenas practicas para reducir riesgos de acceso no autorizado, aunque ningun sistema es completamente infalible.",
			s6Title: "6. Menores de edad",
			s6P: "OmniManga Tracker no esta dirigida especificamente a menores de 13 anos.",
			s7Title: "7. Cambios en esta politica",
			s7P: "Podemos actualizar esta politica para reflejar mejoras del producto o cambios legales. La version vigente sera la publicada en esta pagina.",
			s8Title: "8. Contacto",
			s8P: "Si tienes preguntas sobre privacidad, contactanos en:",
			meta: "Ultima actualizacion: 29 de abril de 2026.",
			back: "Volver a OmniManga Tracker",
		},
	},
	en: {
		nav: {
			aria: "Sections",
			features: "Features",
			captures: "Screenshots",
			howItWorks: "How it works",
			faq: "FAQ",
			privacy: "Privacy",
			menu: "Navigation menu",
		},
		lang: {
			aria: "Language",
			es: "ES",
			en: "EN",
		},
		hero: {
			eyebrow: "Chrome Extension",
			titleAria:
				"Centralize your mangas, manhwas, manhuas or novels in one place.",
			titleBefore: "Centralize your",
			titleAfter: "in one place.",
			morph: ["mangas", "manhwas", "manhuas", "novels"],
			lead: "OmniManga Tracker detects reading on supported sites and organizes them in a side library with progress, lists, and batch updates.",
			install: "Install extension",
			seeFeatures: "See features",
			sitesMore: "+37 sites",
			slidePrev: "Previous slide",
			slideNext: "Next slide",
			slideAria: "Screenshot {n}",
			slideZoom: "Enlarge screenshot {n}",
			slideAlt: "OmniManga Tracker screenshot {n}",
		},
		trust: {
			eyebrow: "Problem / Solution",
			problemTitle: "Your reading is scattered across sites",
			problemText:
				"Progress gets lost between tabs, bookmarks, and disconnected lists.",
			solutionTitle: "Unify everything in a simple flow",
			solutionText:
				"OmniManga brings detection, organization, and tracking into one side panel.",
		},
		featuresSection: {
			eyebrow: "Features",
			title: "Everything you need to manage your reading",
		},
		capturesSection: {
			eyebrow: "Capabilities",
			title: "Extension features in real screenshots",
		},
		howSection: {
			eyebrow: "How it works",
			title: "Three steps to get started fast",
		},
		faqSection: {
			eyebrow: "FAQ",
			title: "Frequently asked questions",
		},
		cta: {
			eyebrow: "Start today",
			title: "Organize your reading without friction",
			text: "Move from scattered tabs to a centralized library with clear progress and lists.",
			install: "Install extension",
			seeCaptures: "See screenshots",
		},
		lightbox: {
			aria: "Enlarged screenshot",
			close: "Close",
		},
		footer: "OmniManga Tracker - MangaTracker v1.0.0",
		features: [
			{
				title: "Automatic detection",
				description:
					"Recognizes manga on supported sites and prepares the entry without manual steps.",
				icon: "✦",
			},
			{
				title: "Smart library",
				description:
					"Search, status filters, and activity sorting for fast management.",
				icon: "▦",
			},
			{
				title: "Per-title detail",
				description:
					"Edit metadata, cover, notes, and progress from one clear view.",
				icon: "✎",
			},
			{
				title: "Custom lists",
				description:
					"Group by goal, genre, or priority without duplicating titles in your library.",
				icon: "◫",
			},
			{
				title: "Bulk refresh",
				description:
					"Run batch refreshes and review the final summary by result.",
				icon: "↻",
			},
			{
				title: "Export / Import JSON",
				description:
					"Full backup and restore when you switch devices or profiles.",
				icon: "◉",
			},
		],
		faqs: [
			{
				question: "Which sites does OmniManga Tracker support?",
				answer:
					"It includes MangaDex, Webtoon, Manga Plus, and dozens of integrated sites.",
			},
			{
				question: "Can I migrate my whole library?",
				answer:
					"Yes. Export a JSON backup and import it whenever you need.",
			},
			{
				question: "How does it avoid duplicates?",
				answer:
					"When adding, it detects matches and lets you merge, link, or create a new entry.",
			},
		],
		sliderCaptions: [
			{
				title: "Library and lists",
				subtitle: "Manage and organize your reading easily.",
			},
			{
				title: "Title view",
				subtitle: "Check details, status, and source for each manga.",
			},
			{
				title: "Chapter management",
				subtitle: "Mark reading, adjust statuses, genres, and notes.",
			},
			{
				title: "Automatic detection",
				subtitle: "Detect compatible reading instantly.",
			},
			{
				title: "Recognition and merge",
				subtitle: "Identify already-added titles and merge records.",
			},
		],
		featureCaptures: [
			{
				file: "con el boton actualizar puedes revisar si hay nuevos capitulos en tu lectura.png",
				title: "Check for updates",
				caption: "See if there are new chapters with one button.",
			},
			{
				file: "marca el capitulo en que te quedaste.png",
				title: "Chapter progress",
				caption: "Mark where you left off and keep tracking up to date.",
			},
			{
				file: "acceso a la fuente de tu lectura y actulizar el capitulo con un solo boton.png",
				title: "Source and chapter",
				caption:
					"Open the reading source and update the chapter in one click.",
			},
			{
				file: "grabaste un duplicado. puedes fusionar ambas y juntar tu obra.png",
				title: "Merge duplicates",
				caption:
					"If you added the same title twice, merge records without losing data.",
			},
			{
				file: "gestion_generos_de_obras.png",
				title: "Genres in the library",
				caption:
					"Filter, edit, or merge tags and see how many titles use each genre.",
			},
			{
				file: "organiza tu lectura en grupos para que puedas organizar mejor.png",
				title: "Reading groups",
				caption: "Group titles to organize long lists more clearly.",
			},
			{
				file: "anota referencias y detalles que puedas necesitar.png",
				title: "Notes and characters",
				caption:
					"Save personal notes and character references with each title.",
			},
			{
				file: "importar-exportar-config-json.png",
				title: "Backup",
				caption:
					"Export or import JSON to back up data and restore it on another profile or device.",
			},
			{
				title: "And many more options to discover",
				caption: "",
				teaser: true,
			},
		],
		howItWorksSteps: [
			{
				index: "01",
				title: "Register or use a supported site",
				text: "You may need to grant permissions for some scan sites; if it still cannot read them, let us know so we can add them.",
				image: "/omnimanga/features/addwebsecutity.png",
				imageAlt:
					"Integrated sites (MangaDex, Webtoon, Manga Plus) and form to request new sites with a site indicator",
			},
			{
				index: "02",
				title: "Detect a title",
				text: "Visit a supported site and let it identify the reading.",
				image: "/omnimanga/features/quickAdd.png",
				imageAlt:
					"Quick view: MangaDex search result with options to view or add the title",
			},
			{
				index: "03",
				title: "Update progress",
				text: "Mark chapters, run batch refresh, and export a backup.",
				image: "/omnimanga/features/marca el capitulo en que te quedastev2.png",
				imageAlt:
					"Chapters section: progress bar, mark or unmark all, and grid of read and pending chapters",
			},
		],
		privacy: {
			pageTitle: "Privacy policy | OmniManga Tracker",
			eyebrow: "Legal",
			title: "Privacy policy",
			lead: "At OmniManga Tracker we value your privacy. This extension mainly stores your library information locally in your browser to provide reading tracking, lists, and progress features.",
			responsible:
				"Controller: OmniManga Tracker project (independent developer).",
			s1Title: "1. Information we collect",
			s1Li1: "Reading data you add manually (titles, progress, statuses, notes, and related metadata).",
			s1Li2: "Minimal technical data needed for the extension to work, such as configuration preferences.",
			s2Title: "2. How we use information",
			s2Intro: "We use the information exclusively to:",
			s2Li1: "organize your library;",
			s2Li2: "show and update your reading progress inside the extension;",
			s2Li3: "allow export and import via JSON file.",
			s3Title: "3. Data sharing",
			s3P1: "We do not sell or share your personal data with third parties for commercial purposes.",
			s3P2: "The extension may request compatible external services (for example MangaDex, Manga Plus, AniList, and Jikan) only to obtain metadata needed for tracking and lookup features.",
			s4Title: "4. Storage and data control",
			s4P1: "Your data is stored locally in the browser.",
			s4P2: "You can delete local data by uninstalling the extension or clearing browser storage. You can also manage backups through JSON export/import.",
			s5Title: "5. Security",
			s5P: "We apply good practices to reduce unauthorized access risks, although no system is completely infallible.",
			s6Title: "6. Children",
			s6P: "OmniManga Tracker is not specifically directed at children under 13.",
			s7Title: "7. Changes to this policy",
			s7P: "We may update this policy to reflect product improvements or legal changes. The current version is the one published on this page.",
			s8Title: "8. Contact",
			s8P: "If you have privacy questions, contact us at:",
			meta: "Last updated: April 29, 2026.",
			back: "Back to OmniManga Tracker",
		},
	},
};

export function isLocale(value: unknown): value is Locale {
	return value === "es" || value === "en";
}

export function getStoredLocale(): Locale {
	try {
		const stored = localStorage.getItem(LANG_STORAGE_KEY);
		if (isLocale(stored)) return stored;
	} catch {
		/* ignore */
	}
	return DEFAULT_LOCALE;
}

export function setStoredLocale(locale: Locale) {
	try {
		localStorage.setItem(LANG_STORAGE_KEY, locale);
	} catch {
		/* ignore */
	}
}

function getByPath(obj: unknown, path: string): unknown {
	const parts = path.split(".");
	let cur: unknown = obj;
	for (const part of parts) {
		if (cur == null || typeof cur !== "object") return undefined;
		cur = (cur as Record<string, unknown>)[part];
	}
	return cur;
}

export function formatMessage(template: string, vars: Record<string, string | number>) {
	return template.replace(/\{(\w+)\}/g, (_, key: string) =>
		String(vars[key] ?? `{${key}}`),
	);
}

export function applyTranslations(locale: Locale, root: ParentNode = document) {
	const dict = messages[locale];

	root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n");
		if (!key) return;
		const value = getByPath(dict, key);
		if (typeof value !== "string") return;

		const attr = el.getAttribute("data-i18n-attr");
		if (attr) {
			el.setAttribute(attr, value);
			return;
		}
		el.textContent = value;
	});

	root.querySelectorAll<HTMLElement>("[data-i18n-template]").forEach((el) => {
		const key = el.getAttribute("data-i18n-template");
		const varsRaw = el.getAttribute("data-i18n-vars");
		if (!key || !varsRaw) return;
		const template = getByPath(dict, key);
		if (typeof template !== "string") return;
		let vars: Record<string, string | number> = {};
		try {
			vars = JSON.parse(varsRaw) as Record<string, string | number>;
		} catch {
			return;
		}
		const value = formatMessage(template, vars);
		const attr = el.getAttribute("data-i18n-attr");
		if (attr) {
			el.setAttribute(attr, value);
			return;
		}
		el.textContent = value;
	});

	document.documentElement.lang = locale;
	document.documentElement.dataset.locale = locale;
	document.documentElement.setAttribute("data-i18n-ready", "");

	document.querySelectorAll<HTMLButtonElement>("[data-lang-switch]").forEach((btn) => {
		const btnLocale = btn.getAttribute("data-lang-switch");
		const active = btnLocale === locale;
		btn.classList.toggle("is-active", active);
		btn.setAttribute("aria-pressed", String(active));
	});

	const titleEl = document.querySelector<HTMLElement>("[data-i18n-doc-title]");
	if (titleEl) {
		const titleKey = titleEl.getAttribute("data-i18n-doc-title");
		if (titleKey) {
			const title = getByPath(dict, titleKey);
			if (typeof title === "string") document.title = title;
		}
	}
}

export function initLangSwitcher(onChange?: (locale: Locale) => void) {
	const apply = (locale: Locale) => {
		setStoredLocale(locale);
		applyTranslations(locale);
		onChange?.(locale);
	};

	document.querySelectorAll<HTMLButtonElement>("[data-lang-switch]").forEach((btn) => {
		if (btn.dataset.langReady === "true") return;
		btn.dataset.langReady = "true";
		btn.addEventListener("click", () => {
			const next = btn.getAttribute("data-lang-switch");
			if (!isLocale(next)) return;
			apply(next);
		});
	});

	apply(getStoredLocale());
}
