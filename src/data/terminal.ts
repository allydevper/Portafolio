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
		name: "Gestión y Migración emisión WildFly → Spring Boot",
		tagline: "Core de emisión en Java moderno",
		desc: "Responsable principal de la migración del proyecto de emisión de WildFly a Spring Boot.",
		stack: ["Java", "Spring Boot", "Maven"],
		year: "2025",
		role: "Tech Lead",
		metric: "Equipo 6 · mentoría 4 devs",
	},
	{
		id: "p2",
		name: "NDC Sabre y pago directo",
		tagline: "APIs NDC, checkout y touchless",
		desc: "Línea NDC: pago directo y touchless (en touchless más coordinación y entrega que desarrollo directo).",
		stack: ["Java", "Spring Boot", "Sabre NDC"],
		year: "2024",
		role: "Sr. Software Engineer",
		metric: "NDC + touchless",
	},
	{
		id: "p3",
		name: "Servicios de emisión Sabre y Amadeus",
		tagline: "Emisión, void y refund",
		desc: "Servicios de emisión tradicional y asociados: emisión, void, refund y flujos conexos sobre Sabre y Amadeus.",
		stack: ["Java", "Spring Boot", "Sabre 360", "Amadeus", "IATA BSP"],
		year: "2023",
		role: "Sr. Software Engineer",
		metric: "Emisión · void · refund",
	},
	{
		id: "p4",
		name: "Capa front emisión y Sabre 360",
		tagline: "TypeScript en el stack actual",
		desc: "Líneas TypeScript / React frente a Sabre 360 y APIs de emisión; mismo periodo que NDC, Maven y despliegues.",
		stack: ["TypeScript", "React", "Tailwind", "Sabre 360"],
		year: "2022",
		role: "Sr. Software Engineer",
		metric: "TypeScript · React · Tailwind",
	},
	{
		id: "p5",
		name: "Integraciones GDS y capa Angular",
		tagline: "Sabre 360 / Sabre, Amadeus y .NET",
		desc: "Sabre 360 / Sabre y Amadeus: disponibilidad, emisión y sync de PNR; vuelos, hoteles y autos. Angular consumiendo REST entre microservicios C# / .NET.",
		stack: ["Angular", "C#", ".NET", "REST", "Sabre 360", "Amadeus", "Kontrol"],
		year: "2020",
		role: "Software Engineer",
		metric: "SQL Server + APIs internas",
	},
	{
		id: "p6",
		name: "Tiempo real y portal de gestión",
		tagline: "WebSockets y back-office travel",
		desc: "WebSockets en servicios de mantenimiento y tiempo real. Portal web de gestión (back-office) en stack ASP.NET; años previos en legacy C# y soporte a operación.",
		stack: ["C#", ".NET", "SQL Server", "ASP.NET", "JavaScript"],
		year: "2018",
		role: "Software Developer",
		metric: "REST + WS en prod",
	},
];

export type SkillPrimary = { name: string; cat: string; level: number };

export const SKILLS_PRIMARY: SkillPrimary[] = [
	{ name: "Java", cat: "Backend", level: 4 },
	{ name: "C#", cat: "Backend", level: 5 },
	{ name: "TypeScript", cat: "Lenguaje", level: 4 },
	{ name: "React", cat: "Front", level: 4 },
	{ name: "PHP", cat: "Backend", level: 4 },
	{ name: "Spring Boot", cat: "Framework", level: 5 },
	{ name: ".NET", cat: "Framework", level: 5 },
	{ name: "Node.js", cat: "Runtime", level: 4 },
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