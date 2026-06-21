#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const SKILL_NAME = "codebase-ontology";
const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SKILL_ENTRIES = ["SKILL.md", "references", "agents"];

function usage() {
  console.log(`codebase-ontology

Usage:
  codebase-ontology install [--agent codex|claude|all] [--scope global|project] [--target-dir DIR] [--project-dir DIR] [--dry-run] [--force]
  codebase-ontology uninstall [--agent codex|claude|all] [--scope global|project] [--target-dir DIR] [--project-dir DIR] [--dry-run] [--yes]
  codebase-ontology doctor [--project-dir DIR]
  codebase-ontology --help

Defaults:
  --agent all
  --scope global
  --project-dir current directory

Default destinations:
  Codex global:       ~/.codex/skills/codebase-ontology
  Codex project:      <project>/.codex/skills/codebase-ontology
  Claude Code global: ~/.claude/skills/codebase-ontology
  Claude Code project:<project>/.claude/skills/codebase-ontology
`);
}

function parseArgs(argv) {
  const opts = {
    command: "help",
    agent: "all",
    scope: "global",
    projectDir: process.cwd(),
    targetDir: null,
    dryRun: false,
    force: false,
    yes: false
  };

  if (argv.length > 0 && !argv[0].startsWith("-")) {
    opts.command = argv.shift();
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--agent":
        opts.agent = requireValue(argv, ++i, arg);
        break;
      case "--scope":
        opts.scope = requireValue(argv, ++i, arg);
        break;
      case "--target-dir":
        opts.targetDir = path.resolve(expandHome(requireValue(argv, ++i, arg)));
        break;
      case "--project-dir":
        opts.projectDir = path.resolve(expandHome(requireValue(argv, ++i, arg)));
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--force":
        opts.force = true;
        break;
      case "--yes":
      case "-y":
        opts.yes = true;
        break;
      case "--help":
      case "-h":
        opts.command = "help";
        break;
      default:
        fail(`Unknown option: ${arg}`);
    }
  }

  if (!["help", "install", "uninstall", "doctor"].includes(opts.command)) {
    fail(`Unknown command: ${opts.command}`);
  }
  if (!["codex", "claude", "all"].includes(opts.agent)) {
    fail(`Invalid --agent: ${opts.agent}`);
  }
  if (!["global", "project"].includes(opts.scope)) {
    fail(`Invalid --scope: ${opts.scope}`);
  }

  return opts;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    fail(`${flag} requires a value`);
  }
  return value;
}

function expandHome(p) {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

function selectedAgents(agent) {
  return agent === "all" ? ["codex", "claude"] : [agent];
}

function skillsRoot(agent, scope, projectDir) {
  if (scope === "global") {
    if (agent === "codex") return path.join(os.homedir(), ".codex", "skills");
    if (agent === "claude") return path.join(os.homedir(), ".claude", "skills");
  }
  if (agent === "codex") return path.join(projectDir, ".codex", "skills");
  if (agent === "claude") return path.join(projectDir, ".claude", "skills");
  fail(`Unsupported agent: ${agent}`);
}

function destinations(opts) {
  if (opts.targetDir) {
    return [{ agent: "custom", root: opts.targetDir, dest: path.join(opts.targetDir, SKILL_NAME) }];
  }
  return selectedAgents(opts.agent).map((agent) => {
    const root = skillsRoot(agent, opts.scope, opts.projectDir);
    return { agent, root, dest: path.join(root, SKILL_NAME) };
  });
}

function install(opts) {
  for (const target of destinations(opts)) {
    console.log(`${opts.dryRun ? "[dry-run] " : ""}Install ${SKILL_NAME} -> ${target.dest}`);
    if (opts.dryRun) continue;

    if (fs.existsSync(target.dest)) {
      if (!opts.force) {
        console.log(`  Exists; updating in place. Use --force to replace cleanly.`);
      } else {
        fs.rmSync(target.dest, { recursive: true, force: true });
      }
    }

    fs.mkdirSync(target.dest, { recursive: true });
    for (const entry of SKILL_ENTRIES) {
      copyRecursive(path.join(PACKAGE_ROOT, entry), path.join(target.dest, entry));
    }
  }
}

function uninstall(opts) {
  if (!opts.yes && !opts.dryRun) {
    fail("Refusing to uninstall without --yes. Re-run with --yes or --dry-run.");
  }
  for (const target of destinations(opts)) {
    console.log(`${opts.dryRun ? "[dry-run] " : ""}Remove ${target.dest}`);
    if (!opts.dryRun) {
      fs.rmSync(target.dest, { recursive: true, force: true });
    }
  }
}

function doctor(opts) {
  console.log(`Package root: ${PACKAGE_ROOT}`);
  for (const agent of ["codex", "claude"]) {
    for (const scope of ["global", "project"]) {
      const root = skillsRoot(agent, scope, opts.projectDir);
      const dest = path.join(root, SKILL_NAME);
      const status = fs.existsSync(path.join(dest, "SKILL.md")) ? "installed" : "missing";
      console.log(`${agent.padEnd(6)} ${scope.padEnd(7)} ${status.padEnd(9)} ${dest}`);
    }
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const opts = parseArgs(process.argv.slice(2));

if (opts.command === "help") {
  usage();
} else if (opts.command === "install") {
  install(opts);
} else if (opts.command === "uninstall") {
  uninstall(opts);
} else if (opts.command === "doctor") {
  doctor(opts);
}
