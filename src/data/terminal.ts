export const ACCENT = "#facc15";

export type TerminalProject = {
	id: string;
	name: string;
	tagline: string;
	desc: string;
	stack: string[];
	year: string;
	role: string;
	metric: string;
};

export const SHARED_PROJECTS: TerminalProject[] = [
	{
		id: "p1",
		name: "Motor de reservas Sabre",
		tagline: "Integración GDS para agencia mayorista",
		desc: "Conector NDC + caché distribuido para búsquedas de tarifas en <800 ms sobre 14 mercados.",
		stack: ["Java", "Spring Boot", "Redis", "Sabre NDC"],
		year: "2024",
		role: "Tech Lead",
		metric: "14 mercados · <800ms p95",
	},
	{
		id: "p2",
		name: "Sync Amadeus PNR",
		tagline: "Sincronización bidireccional de PNR",
		desc: "Workers en C# / .NET que reconcilian PNRs entre Amadeus, mid-office y back-office propio.",
		stack: ["C#", ".NET 8", "Amadeus"],
		year: "2024",
		role: "Backend",
		metric: "~2.4M PNRs / mes",
	},
	{
		id: "p3",
		name: "Sabre 360 Booking UI",
		tagline: "Front-end de venta multicanal",
		desc: "SPA con flujo de búsqueda, fareshop, seat-map y pago. Pruebas E2E en 6 idiomas.",
		stack: ["TypeScript", "React", "Tailwind", "Sabre 360"],
		year: "2023",
		role: "Front-end Lead",
		metric: "CR +18% vs legacy",
	},
	{
		id: "p4",
		name: "CMS de paquetes turísticos",
		tagline: "Editor visual de itinerarios",
		desc: "Workspace para que producto arme paquetes (vuelo+hotel+tour) con publicación instantánea.",
		stack: ["Astro", "PHP", "MySQL", "S3"],
		year: "2023",
		role: "Full-stack",
		metric: "40 productos / día",
	},
	{
		id: "p5",
		name: "Mid-office contable",
		tagline: "Conciliación de BSP y tarjetas",
		desc: "Pipeline que ingiere reportes BSP/IATA + extractos y genera asientos contables automáticos.",
		stack: ["Java", "Kafka", "PostgreSQL"],
		year: "2022",
		role: "Backend",
		metric: "99.7% match rate",
	},
	{
		id: "p6",
		name: "Portal B2B agencias",
		tagline: "Marketplace para sub-agentes",
		desc: "Portal whitelabel donde sub-agencias venden inventario propio + GDS con tarifa neta.",
		stack: ["React", "Node", "TypeScript", "GraphQL"],
		year: "2022",
		role: "Full-stack",
		metric: "120+ agencias activas",
	},
];

export type SkillPrimary = { name: string; cat: string };

export const SKILLS_PRIMARY: SkillPrimary[] = [
	{ name: "Java", cat: "Backend" },
	{ name: "C#", cat: "Backend" },
	{ name: "TypeScript", cat: "Lenguaje" },
	{ name: "React", cat: "Front" },
	{ name: "PHP", cat: "Backend" },
	{ name: "Spring Boot", cat: "Framework" },
	{ name: ".NET", cat: "Framework" },
	{ name: "Node.js", cat: "Runtime" },
];

export const SKILLS_SECONDARY: string[] = [
	"Astro",
	"Tailwind",
	"Next.js",
	"PostgreSQL",
	"MySQL",
	"Docker",
	"Kubernetes",
	"Git",
	"HTML",
	"CSS",
	"Sass",
	"Vite",
	"JIRA",
];

export const DOMAIN_SKILLS: string[] = [
	"Sabre NDC",
	"Amadeus",
	"Sabre 360",
	"Kontrol",
	"IATA BSP"
];

export type TerminalExperienceEntry = {
	period: string;
	role: string;
	company: string;
	summary: string;
	bullets: string[];
	stack: string[];
};

export const EXPERIENCE: TerminalExperienceEntry[] = [
	{
		period: "2022 — actual",
		role: "Sr. Software Engineer / Tech Lead",
		company: "Travel Tech · empresa actual",
		summary:
			"Dirijo 6 personas directamente; lideré la migración WildFly → Spring Boot y el stack de emisión Sabre/Amadeus con APIs NDC y pagos.",
		bullets: [
			"Responsable principal de la migración del proyecto de emisión de WildFly a Spring Boot",
			"Emisión Sabre y Amadeus: NDC, pago directo y touchless (en touchless poco desarrollo directo; más coordinación y entrega)",
			"Pases a producción; coordinación PCI con la empresa cliente; librerías Maven para consumo interno",
			"Mentor de 4 desarrolladores junior/mid: code reviews, pair, on-call",
		],
		stack: ["Java", "Spring Boot", "Maven", "TypeScript", "Sabre NDC", "Amadeus", "Sabre 360"],
	},
	{
		period: "2018 — 2022",
		role: "Software Engineer",
		company: "Travel Tech · agencia mayorista",
		summary:
			"Integraciones GDS (Sabre 360 / Sabre, Amadeus), Angular sobre APIs y microservicios .NET, y WS para mantenimiento y otros flujos.",
		bullets: [
			"Sabre 360 / Sabre y Amadeus: disponibilidad, emisión y sync de PNR; vuelos, hoteles y autos",
			"Angular consumiendo REST entre microservicios C# / .NET; WebSockets en servicios de mantenimiento y tiempo real",
		],
		stack: ["C#", ".NET", "SQL Server", "Angular", "REST", "Sabre 360", "Amadeus"],
	},
	{
		period: "2015 — 2018",
		role: "Software Developer",
		company: "Agencia · primer trabajo en travel",
		summary:
			"Primeros años en travel: casi todo en C#, mantenimiento de sistemas legacy, documentación, soporte a operación y un portal web de gestión interno.",
		bullets: [
			"Mantenimiento y correcciones en código legacy C# / .NET",
			"Documentación técnica y funcional; soporte a usuarios y a otros equipos",
			"Desarrollo y evolución del portal web de gestión (back-office / administración)",
		],
		stack: ["C#", ".NET", "SQL Server", "ASP.NET", "JavaScript", "jQuery"],
	},
];

export const MASCOT_SRC = "/images/wilmer-mascot.svg";