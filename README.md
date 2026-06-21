# Codebase Ontology Skill

这是一个 Codex 全局 skill，用于分析代码库并生成业务 Ontology 五要素文档。

它会指导 Codex 阅读目标 codebase，并在目标 codebase 根目录创建或更新 `.ontology/` 目录，把 Ontology 产物按五个核心要素拆分为独立 YAML 文件。

## 适用场景

当你希望 Codex 做下面这些事情时，可以使用这个 skill：

- 从一个 codebase 中抽取业务 Ontology。
- 根据代码、测试、API、数据库 schema 和文档生成 `.ontology/`。
- 识别业务实体、属性、关系、动作和可复用业务逻辑。
- 将代码库里的业务语义整理为 agent 可消费的 YAML 文件。
- 为后续 agent 理解、修改或自动化操作某个 codebase 提供业务语义地图。

## 五要素

本 skill 将 codebase ontology 拆成五类核心要素：

1. `Object Type`：业务实体或业务事件。
2. `Property`：对象的业务特征。
3. `Link Type`：对象之间的业务关系。
4. `Action Type`：可执行的业务变更。
5. `Function`：可复用的业务逻辑。

`Interface`、`Shared Property`、`Value Type` 可作为扩展概念出现在相关 YAML 中，但不是强制目录。

## 生成结果结构

使用本 skill 分析某个目标 codebase 时，Codex 应在目标 codebase 根目录生成：

```text
<codebase-root>/
  .ontology/
    README.md
    index.yaml
    object-types/
      object-types.yaml
    properties/
      properties.yaml
    link-types/
      link-types.yaml
    action-types/
      action-types.yaml
    functions/
      functions.yaml
```

每个五要素 YAML 文件都必须包含：

```yaml
metadata: {}
guide: {}
items: []
sourceEvidence: []
openQuestions: []
qualityChecks: {}
```

## 安装

将本仓库放入 Codex skills 目录：

```bash
mkdir -p ~/.codex/skills
git clone git@github.com:zhaiyeact/codebase_ontology.git ~/.codex/skills/codebase-ontology
```

安装后，重启或刷新 Codex 运行环境，使 skill 被重新发现。

## 使用方式

在目标代码库中向 Codex 发起类似请求：

```text
使用 $codebase-ontology 为当前代码库生成 .ontology 五要素 YAML 文档。
```

也可以直接描述任务：

```text
请分析这个 codebase，生成业务 ontology，并把五要素分别写到 .ontology 目录下。
```

## Skill 文件结构

```text
codebase-ontology/
  SKILL.md
  README.md
  agents/
    openai.yaml
  references/
    ontology-output-structure.md
```

文件说明：

- `SKILL.md`：Codex 读取的主 skill 指令，包含触发描述、建模原则、工作流程和质量检查。
- `references/ontology-output-structure.md`：详细输出结构、YAML 模板和示例。
- `agents/openai.yaml`：Codex UI metadata。
- `README.md`：仓库说明。

## 建模原则

- 建模真实业务世界，不机械复制数据库表、类图或目录结构。
- 以代码、测试、API、数据库 migration 和文档作为证据。
- 没有证据不要臆造；不确定内容写入 `openQuestions`。
- 每个重要 item 都要有 `sourceEvidence` 和 `confidence`。
- 输出必须拆分到五个要素目录，不要塞进一个大 YAML。

## 质量检查

交付前，Codex 应检查：

- Object Type 是否代表业务概念，而不是技术结构。
- 每个 Object Type 是否有稳定主键和标题属性。
- Property 是否有类型、必填性、空值语义、敏感性和证据。
- Link Type 是否有方向、基数和反向名称。
- Action Type 是否表达业务动作，而不是字段更新。
- Function 是否是可复用业务逻辑，而不是 helper。
- 每个重要判断是否有 source evidence。
- 不确定问题是否进入 `openQuestions`。
