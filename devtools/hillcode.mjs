#!/usr/bin/env node
/**
 * Hillcode · Citron CRM — dev TUI + CLI for the Frappe CRM workspace.
 * Zero npm deps for Hillcode itself. Interactive menu or: npm run hillcode -- --cmd <name>
 */
import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FRONTEND = join(ROOT, "frontend");
const DOCKER_DIR = join(ROOT, "docker");
const FRAPPE_DIR = join(ROOT, "..", "frappe");
const FRAPPE_UI = join(FRAPPE_DIR, "ui");
const FRAPPE_UI_REPO = "https://github.com/frappe/frappe.git";
const FRAPPE_UI_BRANCH = "develop";
const BACKEND_PORT = 8000;

const NO_COLOR =
  (process.env.NO_COLOR != null && process.env.NO_COLOR !== "") ||
  process.env.CLICOLOR === "0";

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  citron: "\x1b[38;2;217;188;88m",
  ok: "\x1b[38;2;74;140;70m",
  err: "\x1b[38;2;190;62;53m",
};

function style(text, key) {
  if (NO_COLOR) return text;
  const map = { brand: C.citron, muted: C.dim, ok: C.ok, err: C.err };
  return (map[key] ?? "") + text + C.reset;
}

/** @type {Record<string, { label: string; hint?: string; run: () => Promise<number> }>} */
const COMMANDS = {
  setup: {
    label: "Install dependencies (root + frontend)",
    run: cmdSetup,
  },
  dev: {
    label: "Start Vite frontend dev server",
    hint: "http://crm.localhost:8080/crm (with bench/docker)",
    run: cmdDev,
  },
  docker: {
    label: "Start Frappe stack (Docker Compose, detached)",
    hint: "MariaDB · Redis · bench → :8000",
    run: () => cmdDocker("up"),
  },
  "docker-logs": {
    label: "Tail Docker logs (frappe service)",
    run: () => cmdDocker("logs"),
  },
  "docker-down": {
    label: "Stop Docker stack",
    run: () => cmdDocker("down"),
  },
  doctor: {
    label: "Check environment",
    run: cmdDoctor,
  },
  test: {
    label: "Run frontend unit tests (vitest)",
    run: cmdTest,
  },
  "test:e2e": {
    label: "Run Playwright e2e tests",
    run: cmdTestE2e,
  },
};

const MENU = [
  ["0", "setup"],
  ["1", "dev"],
  ["2", "docker"],
  ["3", "docker-logs"],
  ["4", "doctor"],
  ["5", "test"],
  ["6", "test:e2e"],
  ["7", "docker-down"],
];

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd ?? ROOT,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, CRM_HILLCODE: "1", ...opts.env },
    });
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

function runCapture(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return { code: r.status ?? 1, out: (r.stdout || "") + (r.stderr || "") };
}

function ask(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(q, (a) => {
      rl.close();
      resolve(a);
    });
  });
}

function commandExists(name) {
  const check = process.platform === "win32" ? "where" : "which";
  return runCapture(check, [name]).code === 0;
}

function isFrappeUiPresent() {
  const marker = join(FRAPPE_UI, "package.json");
  if (!existsSync(marker)) return false;
  try {
    const pkg = JSON.parse(readFileSync(marker, "utf8"));
    return pkg.name === "@framework/ui";
  } catch {
    return false;
  }
}

function tcpPortOpen(port, host = "127.0.0.1") {
  const code = spawnSync(
    process.execPath,
    [
      "-e",
      `const n=require('net');const s=n.createConnection(${port},'${host}');s.on('connect',()=>{s.destroy();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),1200);`,
    ],
    { encoding: "utf8" },
  ).status;
  return code === 0;
}

async function ensureFrappeUi() {
  if (isFrappeUiPresent()) {
    console.log(style("  @framework/ui already present", "ok"));
    return 0;
  }
  if (!commandExists("git")) {
    console.error(style("  git not found — cannot fetch @framework/ui", "err"));
    console.error(style("  Clone manually: sparse checkout ui/ from github.com/frappe/frappe → ../frappe/ui", "muted"));
    return 1;
  }

  console.log("  Fetching @framework/ui (sparse clone frappe/ui)…");
  mkdirSync(FRAPPE_DIR, { recursive: true });
  const tmp = join(FRAPPE_DIR, ".ui-clone-tmp");
  rmSync(tmp, { recursive: true, force: true });
  rmSync(FRAPPE_UI, { recursive: true, force: true });

  let code = await run("git", [
    "clone",
    "--depth",
    "1",
    "--filter=blob:none",
    "--sparse",
    "-b",
    FRAPPE_UI_BRANCH,
    FRAPPE_UI_REPO,
    tmp,
  ]);
  if (code !== 0) return code;

  code = await run("git", ["sparse-checkout", "set", "ui"], { cwd: tmp });
  if (code !== 0) return code;

  code = await run("mv", [join(tmp, "ui"), FRAPPE_UI], { cwd: FRAPPE_DIR });
  rmSync(tmp, { recursive: true, force: true });
  if (code !== 0 || !isFrappeUiPresent()) {
    console.error(style("  failed to install @framework/ui at ../frappe/ui", "err"));
    return 1;
  }

  console.log(style("  ✓ @framework/ui installed at ../frappe/ui", "ok"));
  return 0;
}

function dockerStackStatus() {
  if (!commandExists("docker")) return "missing";
  const { code, out } = runCapture("docker", [
    "ps",
    "--filter",
    "name=crm-frappe",
    "--format",
    "{{.Status}}",
  ]);
  if (code !== 0 || !out.trim()) return "stopped";
  if (/Up/i.test(out)) return tcpPortOpen(BACKEND_PORT) ? "ready" : "starting";
  return "stopped";
}

async function waitForBackend(maxMs = 300000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (tcpPortOpen(BACKEND_PORT)) return true;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

function yarnCmd() {
  return commandExists("yarn") ? "yarn" : null;
}

async function cmdSetup() {
  console.log(style("\n  setup · Citron CRM\n", "brand"));

  if (!commandExists("node")) {
    console.error(style("  node not found on PATH", "err"));
    return 1;
  }

  const yarn = yarnCmd();
  if (!yarn) {
    console.error(style("  yarn not found on PATH (required for frontend)", "err"));
    return 1;
  }

  console.log("  Installing root npm dependencies…");
  let code = await run("npm", ["install"], { cwd: ROOT });
  if (code !== 0) return code;

  console.log("  Installing frontend dependencies…");
  code = await run(yarn, ["install"], { cwd: FRONTEND });
  if (code !== 0) return code;

  code = await ensureFrappeUi();
  if (code !== 0) return code;

  console.log(style("\n  ✓ Setup complete.", "ok"));
  console.log(style("  Next: menu 2 (docker) for full stack, then menu 1 (dev) for frontend.", "muted"));
  console.log(style("  Docker default login: Administrator / admin\n", "muted"));
  return 0;
}

async function cmdDev() {
  const yarn = yarnCmd();
  if (!yarn) {
    console.error(style("  yarn not found on PATH", "err"));
    return 1;
  }
  if (!existsSync(join(FRONTEND, "node_modules"))) {
    console.error(style("  frontend/node_modules missing — run setup first (menu 0)", "err"));
    return 1;
  }

  console.log(style("\n  dev · Citron CRM frontend\n", "brand"));
  console.log(style("  Vite dev server (Ctrl+C to stop)", "muted"));

  if (!isFrappeUiPresent()) {
    console.log(style("  @framework/ui missing — run setup (menu 0) first.", "err"));
    return 1;
  }

  if (!tcpPortOpen(BACKEND_PORT)) {
    const stack = dockerStackStatus();
    console.log(style(`\n  ⚠ Nothing listening on :${BACKEND_PORT} (Frappe backend).`, "err"));
    if (stack === "starting") {
      console.log(style("  Docker stack is up but bench is still initializing (first boot: 5–10 min).", "muted"));
      console.log(style("  Watch progress: npm run hillcode -- --cmd docker-logs", "brand"));
    } else if (stack === "stopped" && commandExists("docker")) {
      console.log(style("  Docker is installed but the CRM stack is not running.", "muted"));
      console.log(style("  Start it first: npm run hillcode -- --cmd docker  (menu 2)", "brand"));
      console.log(style("  Wait until doctor shows Backend :8000 running, then run dev again.", "muted"));
    } else if (!commandExists("docker")) {
      console.log(style("  Install Docker Desktop, then: npm run hillcode -- --cmd docker", "muted"));
    }
    console.log(style("  Vite will start, but API proxy errors are expected until the backend is ready.\n", "muted"));
  } else {
    console.log(style(`  Backend detected on :${BACKEND_PORT}`, "ok"));
    console.log(style("  Open: http://crm.localhost:8080/crm  (not localhost — site name matters)", "brand"));
    console.log(style("  Login: Administrator / admin\n", "muted"));
  }

  return run(yarn, ["dev"], { cwd: FRONTEND });
}

async function cmdDocker(action) {
  if (!commandExists("docker")) {
    console.error(style("  docker not found on PATH", "err"));
    return 1;
  }
  if (!existsSync(join(DOCKER_DIR, "docker-compose.yml"))) {
    console.error(style("  docker/docker-compose.yml missing", "err"));
    return 1;
  }

  if (action === "up") {
    console.log(style("\n  docker · starting Frappe CRM stack…\n", "brand"));
    console.log(style("  First boot can take 5–10 minutes (bench init + site create).\n", "muted"));
    const code = await run("docker", ["compose", "up", "-d"], { cwd: DOCKER_DIR });
    if (code !== 0) return code;
    console.log(style("\n  Containers started. Waiting for backend on :8000…", "muted"));
    const ready = await waitForBackend(120000);
    if (ready) {
      console.log(style("\n  ✓ Backend ready.", "ok"));
    } else {
      console.log(style("\n  Backend not ready yet — still initializing.", "muted"));
      console.log(style("  Tail logs: npm run hillcode -- --cmd docker-logs", "brand"));
    }
    console.log(style("  App: http://crm.localhost:8000/crm", "brand"));
    console.log(style("  Frontend dev: npm run hillcode -- --cmd dev  →  http://crm.localhost:8080/crm", "muted"));
    console.log(style("  Login: Administrator / admin\n", "muted"));
    return 0;
  }
  if (action === "down") {
    return run("docker", ["compose", "down"], { cwd: DOCKER_DIR });
  }
  if (action === "logs") {
    return run("docker", ["compose", "logs", "-f", "--tail=120", "frappe"], { cwd: DOCKER_DIR });
  }
  return 1;
}

async function cmdTest() {
  const yarn = yarnCmd();
  if (!yarn) {
    console.error(style("  yarn not found on PATH", "err"));
    return 1;
  }
  return run(yarn, ["test:run"], { cwd: FRONTEND });
}

async function cmdTestE2e() {
  return run("npx", ["playwright", "test"], { cwd: ROOT });
}

function checkFrontendDeps() {
  if (!existsSync(join(FRONTEND, "node_modules"))) {
    return { ok: false, detail: "missing — run setup" };
  }
  const { code } = runCapture("node", ["-e", "require('vite')"], { cwd: FRONTEND });
  return { ok: code === 0, detail: code === 0 ? "vite OK" : "incomplete — run setup" };
}

function yarnVersion() {
  if (!yarnCmd()) return { ok: false, detail: "not on PATH" };
  const { code, out } = runCapture("yarn", ["--version"]);
  if (code !== 0) return { ok: false, detail: "not working" };
  const v = out.trim();
  const major = parseInt(v.split(".")[0], 10);
  return { ok: true, detail: `v${v}${major >= 2 ? " (Berry — OK)" : " (Classic)"}` };
}

async function cmdDoctor() {
  console.log(style("\n  doctor · Citron CRM\n", "brand"));
  const fe = checkFrontendDeps();
  const yv = yarnVersion();
  const backendUp = tcpPortOpen(BACKEND_PORT);
  const stack = dockerStackStatus();
  const stackLabel =
    stack === "ready"
      ? style("running", "ok")
      : stack === "starting"
        ? style("initializing (see docker-logs)", "muted")
        : stack === "stopped"
          ? style("not started — run menu 2", "err")
          : style("Docker not installed", "err");
  const rows = [
    ["Node", commandExists("node") ? style("OK", "ok") : style("missing", "err")],
    ["Yarn", yv.ok ? style(yv.detail, "ok") : style(yv.detail, "err")],
    ["frontend deps", fe.ok ? style(fe.detail, "ok") : style(fe.detail, "err")],
    ["@framework/ui", isFrappeUiPresent() ? style("present", "ok") : style("missing — run setup", "err")],
    ["Docker stack", stackLabel],
    ["Backend :8000", backendUp ? style("running", "ok") : style("not ready", "err")],
    ["App (docker)", style("http://crm.localhost:8000/crm", "brand")],
    ["Frontend dev", style("http://crm.localhost:8080/crm", "muted")],
  ];
  for (const [k, v] of rows) console.log(`  ${k.padEnd(16)} ${v}`);
  console.log("");
  return 0;
}

function needsSetup() {
  return !checkFrontendDeps().ok;
}

async function runCommand(name) {
  const spec = COMMANDS[name];
  if (!spec) {
    console.error(style(`hillcode: unknown cmd: ${name}`, "err"));
    return 1;
  }
  return spec.run();
}

async function tui() {
  console.clear();
  console.log("");
  console.log(style("  hillcode", "brand") + style(" · Citron CRM", "muted"));
  console.log(style("  Inkblot Studio · Frappe CRM frontend", "muted"));
  console.log(style("  ─────────────────────────────────────────", "muted"));
  if (needsSetup()) {
    console.log(style("\n  Tip: run 0 · setup first (frontend deps not ready)\n", "brand"));
  }
  console.log("");
  for (const [num, id] of MENU) {
    const spec = COMMANDS[id];
    const hint = spec.hint ? style(`  ${spec.hint}`, "muted") : "";
    console.log(`  ${num}  ${id.padEnd(12)} ${spec.label}${hint}`);
  }
  console.log(style("\n  q  exit\n", "muted"));
  const choice = (await ask("  > ")).trim().toLowerCase();
  if (choice === "q" || choice === "") return 0;
  const row = MENU.find(([n]) => n === choice);
  if (!row) {
    console.log(style("  unknown choice", "err"));
    await ask("  [Enter]");
    return tui();
  }
  const code = await runCommand(row[1]);
  if (code !== 0) console.log(style(`  exited ${code}`, "err"));
  const blocking = row[1] === "dev" || row[1] === "docker-logs";
  if (!blocking) {
    console.log("");
    await ask("  [Enter]");
    return tui();
  }
  return code;
}

function printHelp() {
  console.log(`hillcode · Citron CRM

  npm run hc
  npm run hillcode
  npm run hillcode -- --cmd dev
  npm run hillcode -- --cmd setup
  npm run hillcode -- --cmd docker
  npm run hillcode -- --cmd doctor

  --cmd   ${Object.keys(COMMANDS).join(" | ")}
  -h      this help
`);
}

function parseArgs(argv) {
  const out = { help: false, cmd: null, setup: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") out.help = true;
    else if (a === "--setup") {
      out.setup = true;
      out.cmd = "setup";
    } else if (a === "--cmd") out.cmd = argv[++i] ?? null;
    else if (a.startsWith("--cmd=")) out.cmd = a.slice(6) || null;
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return 0;
  }
  if (args.cmd) return runCommand(args.cmd);
  return tui();
}

main()
  .then((code) => process.exit(typeof code === "number" ? code : 0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
