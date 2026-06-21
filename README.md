# Codebase Ontology Skill

一个给 AI agent 使用的 skill，用于阅读代码库，并在目标 codebase 中生成业务 Ontology 五要素 YAML 文档。

生成结果会写入目标 codebase 的 `.ontology/` 目录，并按五要素拆分：

```text
.ontology/
  README.md
  index.yaml
  object-types/object-types.yaml
  properties/properties.yaml
  link-types/link-types.yaml
  action-types/action-types.yaml
  functions/functions.yaml
```

## 安装

使用 npm 全局安装：

```bash
npm install -g @zhaiye/codebase-ontology
```

安装到 Codex 全局 skills：

```bash
codebase-ontology install --agent codex
```

安装到 Claude Code 全局 skills：

```bash
codebase-ontology install --agent claude
```

同时安装到 Codex 和 Claude Code：

```bash
codebase-ontology install --agent all
```

安装到当前项目：

```bash
codebase-ontology install --agent codex --scope project
codebase-ontology install --agent claude --scope project
```

项目级安装路径分别是：

```text
Codex:      .codex/skills/codebase-ontology/
Claude:     .claude/skills/codebase-ontology/
```

## 使用

在目标代码库中，让 agent 使用该 skill：

```text
使用 $codebase-ontology 为当前代码库生成 .ontology 五要素 YAML 文档。
```

也可以直接描述任务：

```text
请分析这个 codebase，生成业务 ontology，并把五要素分别写到 .ontology 目录下。
```

## CLI

查看将安装到哪里：

```bash
codebase-ontology doctor
```

预览安装但不写文件：

```bash
codebase-ontology install --agent all --dry-run
```

指定安装目录：

```bash
codebase-ontology install --target-dir ~/.codex/skills
```

卸载：

```bash
codebase-ontology uninstall --agent codex --yes
```

## 仓库结构

```text
SKILL.md
references/ontology-output-structure.md
agents/openai.yaml
bin/codebase-ontology.js
package.json
```
