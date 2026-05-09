export type HeroTemplateId =
  | "hero-out-whoami"
  | "hero-out-experience"
  | "hero-out-stack"
  | "hero-out-status"
  | "hero-out-pwd"
  | "hero-out-ls"
  | "hero-out-ls-l"
  | "hero-out-ls-la"
  | "hero-out-date"
  | "hero-out-uname"
  | "hero-out-uname-a"
  | "hero-out-hostname"
  | "hero-out-os-release"
  | "hero-out-uptime"
  | "hero-out-id"
  | "hero-out-which-bash"
  | "hero-out-which-sh"
  | "hero-out-alias"
  | "hero-out-env"
  | "hero-out-df"
  | "hero-out-free";

export interface HeroCommand {
  cmd: string;
  templateId: HeroTemplateId;
}

/** Líneas del arranque animado, <noscript> y orden inicial. */
export const HERO_BOOT_SEQUENCE: HeroCommand[] = [
  { cmd: "whoami", templateId: "hero-out-whoami" },
  { cmd: "cat experience.txt", templateId: "hero-out-experience" },
  { cmd: "ls stack/principal/", templateId: "hero-out-stack" },
  { cmd: "cat status.json", templateId: "hero-out-status" },
];

/** Comandos extra solo al escribir (no se “tipean” solos al cargar). */
export const HERO_EXTRA_COMMANDS: HeroCommand[] = [
  { cmd: "pwd", templateId: "hero-out-pwd" },
  { cmd: "ls", templateId: "hero-out-ls" },
  { cmd: "ls -l", templateId: "hero-out-ls-l" },
  { cmd: "ls -la", templateId: "hero-out-ls-la" },
  { cmd: "date", templateId: "hero-out-date" },
  { cmd: "uname", templateId: "hero-out-uname" },
  { cmd: "uname -a", templateId: "hero-out-uname-a" },
  { cmd: "hostname", templateId: "hero-out-hostname" },
  { cmd: "cat /etc/os-release", templateId: "hero-out-os-release" },
  { cmd: "uptime", templateId: "hero-out-uptime" },
  { cmd: "id", templateId: "hero-out-id" },
  { cmd: "which bash", templateId: "hero-out-which-bash" },
  { cmd: "which sh", templateId: "hero-out-which-sh" },
  { cmd: "alias", templateId: "hero-out-alias" },
  { cmd: "env", templateId: "hero-out-env" },
  { cmd: "df -h", templateId: "hero-out-df" },
  { cmd: "free -h", templateId: "hero-out-free" },
];

const HERO_ALL_COMMANDS = [...HERO_BOOT_SEQUENCE, ...HERO_EXTRA_COMMANDS];

/** Alias del boot; el script del hero usa esto para `runBoot`. */
export const HERO_SESSION = HERO_BOOT_SEQUENCE;

export const HERO_COMMANDS_MAP: Record<string, HeroTemplateId> =
  Object.fromEntries(
    HERO_ALL_COMMANDS.map(({ cmd, templateId }) => [cmd, templateId])
  );

/** Un `<template id>` por id (boot + extra sin duplicar). */
export const HERO_TEMPLATE_IDS: HeroTemplateId[] = [
  ...new Set(HERO_ALL_COMMANDS.map((c) => c.templateId)),
];
