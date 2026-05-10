import { HERO_SESSION, HERO_COMMANDS_MAP } from "../data/heroTerminalSession";

const CHAR_DELAY = 40;
const POST_OUTPUT_DELAY = 200;

const HELP_HTML = `<div class="terminal-line-out">
  <span class="terminal-accent">portafolio (boot):</span><br />
  &nbsp;&nbsp;whoami · cat experience.txt · ls stack/principal/ · cat status.json<br />
  <span class="terminal-accent">linux:</span><br />
  &nbsp;&nbsp;pwd · ls · ls -l · ls -la · date · uname · uname -a · hostname · uptime · id<br />
  &nbsp;&nbsp;cat /etc/os-release · which bash|sh · alias · env · df -h · free -h<br />
  &nbsp;&nbsp;echo … · cd … · history<br />
  <span class="terminal-accent">otros:</span> help · clear · <span class="terminal-dim">Ctrl+C</span> cancela la línea<br />
  <span class="terminal-dim">easter eggs: exit · freedom · obey · sudo rm · cat consciousness.txt · cat memories_*.log</span>
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

/** No robar foco del input si el usuario está seleccionando texto en el historial. */
function hasNonCollapsedDocumentSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  return !sel.isCollapsed;
}

export function initTerminalHeroShell(): void {
  const body = document.getElementById("terminal-hero-body");
  const historyEl = document.getElementById("terminal-hero-history");
  const inputRow = document.getElementById("terminal-hero-input-row");
  const input = document.getElementById("terminal-hero-input") as HTMLInputElement | null;

  if (!body || !historyEl || !inputRow || !input) return;

  function syncHeroFakeCaret(): void {
    const el = input;
    if (!el) return;
    const wrap = el.closest(".terminal-hero-input-wrap");
    if (!wrap) return;
    const measure = wrap.querySelector(".terminal-hero-input-measure");
    const fake = wrap.querySelector(".terminal-hero-fake-caret") as HTMLElement | null;
    if (!(measure instanceof HTMLElement) || !fake) return;
    measure.textContent = el.value;
    fake.style.setProperty("--terminal-fake-caret-x", `${measure.offsetWidth}px`);
  }

  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(max-width: 768px)").matches;
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

    /* Mismo orden que el boot: unshift por cada uno deja el último comando como más reciente (índice 0). */
    for (const { cmd } of HERO_SESSION) {
      cmdHistory.unshift(cmd);
    }

    body!.setAttribute("aria-live", "off");
    inputRow!.hidden = false;
    /* Tras mostrar el input: primero el scroll interno del terminal, luego foco sin
     * "scroll into view" del documento (evita que la página salte al terminar el boot). */
    requestAnimationFrame(() => {
      syncHeroFakeCaret();
      scrollToBottom(body!);
      input!.focus({ preventScroll: true });
    });
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

    if (cmd === "history") {
      const reversed = cmdHistory.slice().reverse();
      const lines = reversed
        .map((c, i) => `<span class="terminal-dim">${i + 1}</span>&nbsp;&nbsp;${escapeHtml(c)}`)
        .join("<br />");
      appendOutputLiteral(
        historyEl!,
        `<div class="terminal-line-out">${
          lines || '<span class="terminal-dim">(sin comandos aún)</span>'
        }</div>`
      );
      scrollToBottom(body!);
      return;
    }

    if (cmd === "echo" || cmd.startsWith("echo ")) {
      const payload = cmd === "echo" ? "" : cmd.slice(5);
      appendOutputLiteral(
        historyEl!,
        `<div class="terminal-line-out">${escapeHtml(payload)}</div>`
      );
      scrollToBottom(body!);
      return;
    }

    if (cmd === "cd" || cmd.startsWith("cd ")) {
      const dest = cmd === "cd" ? "~" : cmd.slice(3).trim() || "~";
      appendOutputLiteral(
        historyEl!,
        `<div class="terminal-line-out terminal-dim">cwd: ${escapeHtml(dest)}</div>`
      );
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

  input.addEventListener("input", syncHeroFakeCaret);
  input.addEventListener("focus", syncHeroFakeCaret);
  input.addEventListener("blur", syncHeroFakeCaret);
  window.addEventListener("resize", syncHeroFakeCaret);

  input.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
      e.preventDefault();
      const partial = input.value;
      input.value = "";
      historyIndex = -1;
      syncHeroFakeCaret();
      const line = document.createElement("div");
      line.className = "terminal-line";
      const prompt = document.createElement("span");
      prompt.className = "terminal-line-prompt";
      prompt.textContent = "$";
      const space = document.createTextNode(" ");
      const cmdSpan = document.createElement("span");
      cmdSpan.className = "terminal-line-cmd";
      cmdSpan.textContent = partial;
      const intr = document.createElement("span");
      intr.className = "terminal-dim";
      intr.textContent = "^C";
      line.append(prompt, space, cmdSpan, intr);
      historyEl!.appendChild(line);
      scrollToBottom(body!);
      return;
    }

    if (e.key === "Enter") {
      const value = input.value;
      input.value = "";
      syncHeroFakeCaret();
      executeCommand(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        input.value = cmdHistory[historyIndex] ?? "";
      }
      syncHeroFakeCaret();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = cmdHistory[historyIndex] ?? "";
      } else {
        historyIndex = -1;
        input.value = "";
      }
      syncHeroFakeCaret();
    }
  });

  body.addEventListener("click", () => {
    if (hasNonCollapsedDocumentSelection()) return;
    input!.focus({ preventScroll: true });
  });

  runBoot();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
