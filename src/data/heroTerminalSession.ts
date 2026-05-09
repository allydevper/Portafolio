export type HeroTemplateId =
  | "hero-out-whoami"
  | "hero-out-experience"
  | "hero-out-stack"
  | "hero-out-status";

export interface HeroCommand {
  cmd: string;
  templateId: HeroTemplateId;
}

export const HERO_SESSION: HeroCommand[] = [
  { cmd: "whoami", templateId: "hero-out-whoami" },
  { cmd: "cat experience.txt", templateId: "hero-out-experience" },
  { cmd: "ls stack/principal/", templateId: "hero-out-stack" },
  { cmd: "cat status.json", templateId: "hero-out-status" },
];

export const HERO_COMMANDS_MAP: Record<string, HeroTemplateId> =
  Object.fromEntries(
    HERO_SESSION.map(({ cmd, templateId }) => [cmd, templateId])
  );
