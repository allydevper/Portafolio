import { HERO_SESSION, HERO_COMMANDS_MAP } from "../data/heroTerminalSession";

const CHAR_DELAY = 40;
const POST_OUTPUT_DELAY = 200;

const HELP_HTML = `<div class="terminal-line-out">
  <span class="terminal-accent">comandos disponibles:</span><br />
  &nbsp;&nbsp;whoami &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— identidad<br />
  &nbsp;&nbsp;cat experience.txt — trayectoria<br />
  &nbsp;&nbsp;ls stack/principal/ — stack principal<br />
  &nbsp;&nbsp;cat status.json &nbsp;&nbsp;— disponibilidad<br />
  &nbsp;&nbsp;help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— esta ayuda<br />
  &nbsp;&nbsp;clear &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— limpiar pantalla
</div>`;

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function scrollToBottom(body: HTMLElement): void {
  body.scrollTop = body.scrollHeight;
}

function appendPromptLine(history: HTMLElement): HTMLSpanElement {
  const line = document.createElement("div");
  line.className = "terminal-line";

  const prompt = document.createElement("span");
  prompt.className = "terminal-line-prompt";
  prompt.textContent = "$";

  const space = document.createTextNode(" ");

  const cmdSpan = document.createElement("span");
  cmdSpan.className = "terminal-line-cmd";

  line.append(prompt, space, cmdSpan);
  history.appendChild(line);
  return cmdSpan;
}

async function typewrite(
  target: HTMLSpanElement,
  text: string,
  reduced: boolean,
  body: HTMLElement
): Promise<void> {
  if (reduced) {
    target.textContent = text;
    return;
  }
  for (const char of text) {
    target.textContent += char;
    scrollToBottom(body);
    await sleep(CHAR_DELAY);
  }
}

function appendOutputFromTemplate(history: HTMLElement, templateId: string): void {
  const tpl = document.getElementById(templateId) as HTMLTemplateElement | null;
  if (!tpl) return;
  const node = document.importNode(tpl.content, true);
  history.appendChild(node);
}

function appendOutputLiteral(history: HTMLElement, html: string): void {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  history.appendChild(wrapper);
}

export function initTerminalHeroShell(): void {
  const body = document.getElementById("terminal-hero-body");
  const historyEl = document.getElementById("terminal-hero-history");
  const inputRow = document.getElementById("terminal-hero-input-row");
  const input = document.getElementById("terminal-hero-input") as HTMLInputElement | null;

  if (!body || !historyEl || !inputRow || !input) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cmdHistory: string[] = [];
  let historyIndex = -1;

  async function runBoot(): Promise<void> {
    for (const { cmd, templateId } of HERO_SESSION) {
      const cmdSpan = appendPromptLine(historyEl!);
      await typewrite(cmdSpan, cmd, reduced, body!);
      appendOutputFromTemplate(historyEl!, templateId);
      scrollToBottom(body!);
      if (!reduced) await sleep(POST_OUTPUT_DELAY);
    }

    body!.setAttribute("aria-live", "off");
    inputRow!.hidden = false;
    input!.focus();
    scrollToBottom(body!);
  }

  function executeCommand(raw: string): void {
    const cmd = raw.trim();
    if (!cmd) return;

    cmdHistory.unshift(cmd);
    historyIndex = -1;

    appendPromptLine(historyEl!).textContent = cmd;

    if (cmd === "clear") {
      historyEl!.innerHTML = "";
      return;
    }

    if (cmd === "help") {
      appendOutputLiteral(historyEl!, HELP_HTML);
      scrollToBottom(body!);
      return;
    }

    const templateId = HERO_COMMANDS_MAP[cmd];
    if (templateId) {
      appendOutputFromTemplate(historyEl!, templateId);
    } else {
      appendOutputLiteral(
        historyEl!,
        `<div class="terminal-line-out terminal-dim">bash: ${escapeHtml(cmd)}: command not found</div>`
      );
    }
    scrollToBottom(body!);
  }

  input.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      const value = input.value;
      input.value = "";
      executeCommand(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        input.value = cmdHistory[historyIndex] ?? "";
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = cmdHistory[historyIndex] ?? "";
      } else {
        historyIndex = -1;
        input.value = "";
      }
    }
  });

  // Click anywhere in the terminal body refocuses the input
  body.addEventListener("click", () => input!.focus());

  runBoot();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
