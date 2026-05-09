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
		stack: ["C#", ".NET 8", "RabbitMQ", "Amadeus EDIFACT"],
		year: "2024",
		role: "Backend",
		metric: "~2.4M PNRs / mes",
	},
	{
		id: "p3",
		name: "Travelport Booking UI",
		tagline: "Front-end de venta multicanal",
		desc: "SPA con flujo de búsqueda, fareshop, seat-map y pago. Pruebas E2E en 6 idiomas.",
		stack: ["TypeScript", "React", "Tailwind", "Travelport JSON"],
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
	"GraphQL",
	"PostgreSQL",
	"MySQL",
	"Redis",
	"Kafka",
	"RabbitMQ",
	"Docker",
	"Kubernetes",
	"AWS",
	"Git",
	"Jenkins",
	"Jest",
	"Playwright",
	"HTML",
	"CSS",
	"Sass",
	"Vite",
	"Webpack",
	"JIRA",
];

export const DOMAIN_SKILLS: string[] = [
	"Sabre NDC",
	"Amadeus",
	"Travelport",
	"IATA BSP",
	"PNR sync",
	"Fareshop",
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
			"Lidero un equipo de 5–8 ingenieros construyendo el motor de fareshop multi-GDS y el portal B2B para agencias.",
		bullets: [
			"Migré legacy SOAP → APIs REST + GraphQL, latencia p95 de 2.1s a 480ms",
			"Diseñé caché distribuido (Redis cluster) para tarifas, ahorro ~$18k/mes en llamadas a GDS",
			"Mentor de 4 desarrolladores junior/mid · code reviews, pair, on-call",
		],
		stack: ["Java", "Spring Boot", "TypeScript", "React", "Redis", "PostgreSQL", "AWS"],
	},
	{
		period: "2018 — 2022",
		role: "Software Engineer",
		company: "Travel Tech · agencia mayorista",
		summary: "Construí mid-office contable que reconcilia BSP IATA y workers de sincronización de PNR.",
		bullets: [
			"Conector Sabre + Travelport (NDC) para vuelos, hoteles y autos",
			"Workers de PNR sync con retries inteligentes — 99.94% uptime",
			"Mid-office contable con conciliación BSP automática · 12k tickets/mes",
		],
		stack: ["C#", ".NET", "SQL Server", "RabbitMQ", "Angular"],
	},
	{
		period: "2015 — 2018",
		role: "Full-stack Developer",
		company: "Agencia · primer trabajo en travel",
		summary:
			"Empecé escribiendo APIs PHP para una agencia mayorista. La caja negra de tarifas y disponibilidad me enganchó.",
		bullets: [
			"Primer conector Amadeus para tarifas y disponibilidad de vuelos",
			"Portal B2B con login multi-tenant para agencias afiliadas",
			"Migración de stored procedures → ORM, reducción de 60% del código",
		],
		stack: ["PHP", "MySQL", "JS", "jQuery", "Bootstrap"],
	},
];

export const MASCOT_SRC = "/images/wilmer-mascot.svg";

/** Para el formulario estático mailto: */
export const CONTACT_EMAIL = "hola@wilmeralama.com";
