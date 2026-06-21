---
name: codebase-ontology
description: 生成代码库 Ontology 五要素文档。用于分析一个 codebase，并在该 codebase 根目录创建或更新 .ontology 目录，分别生成 Object Types、Properties、Link Types、Action Types、Functions 五类 YAML 文件；当用户要求 ontology 抽取、codebase ontology、业务实体建模、ontology.yaml 生成或按五要素整理代码库业务语义时使用。
---

# Codebase Ontology

## 核心目标

使用本 skill 阅读目标 codebase，并在该 codebase 根目录生成 `.ontology/` 目录。输出必须按五要素拆分为五个子目录和五个 YAML 文件，而不是写成一个大文档。

强制目标结构：

```text
<codebase-root>/
  .ontology/
    README.md
    index.yaml
    object-types/object-types.yaml
    properties/properties.yaml
    link-types/link-types.yaml
    action-types/action-types.yaml
    functions/functions.yaml
```

不要把本 skill 的说明文件复制进目标 codebase。只生成目标 codebase 的 ontology 产物。

## 建模原则

- 建模真实业务世界，不机械复制数据库表、API schema、类图或目录结构。
- 使用代码、测试、数据库 migration、API 路由、文档作为证据。
- 没有证据不要臆造；不确定内容写入 `openQuestions`。
- 五要素为：`Object Type`、`Property`、`Link Type`、`Action Type`、`Function`。
- `Interface`、`Shared Property`、`Value Type` 只是扩展能力，可在相关 YAML 中作为辅助结构出现，不创建额外强制目录。
- 每个重要 item 都要有 `sourceEvidence` 和 `confidence`。
- 生成的 YAML 内容语言必须为中文；schema key、ID、代码路径、symbol、原始枚举值和外部系统名称可保持原文。

## 输出语言要求

生成到目标 codebase `.ontology/` 下的所有 YAML 文件，内容语言必须以中文为主。

必须使用中文的字段：

- `displayName`
- `description`
- `notes`
- `question`
- `suggestedResolution`
- `qualityChecks.*.notes`
- `guide.definition`
- `guide` 下所有解释性文字
- `.ontology/README.md` 中的人类可读内容
- object、property、link、action、function 的业务语义说明

可以保留原文的字段：

- YAML schema key，如 `metadata`、`items`、`sourceEvidence`
- 稳定机器 ID，如 `order`、`customerPlacesOrder`、`calculateOrderTotal`
- 代码路径，如 `src/domain/order/Order.ts`
- 代码 symbol，如 `OrderService.cancelOrder`
- API path，如 `POST /orders/{orderId}/cancel`
- 数据库表名、列名、外键名
- 源代码中的枚举值和状态值，如 `draft`、`placed`、`cancelled`
- 外部系统或第三方产品名称

如果原始 codebase 使用英文领域词，`id` 可以保持英文 lowerCamelCase，但 `displayName` 和 `description` 必须翻译成中文。原始英文名称写入 `aliases` 或 `sourceEvidence`，不要丢失。

## 工作流程

1. 定位 codebase 根目录，确认要写入 `<codebase-root>/.ontology/`。
2. 阅读 README、产品文档、API schema、路由、数据库 migration、ORM model、domain/service 层、测试。
3. 总结业务域、用户角色、核心流程，写入 `.ontology/index.yaml` 和 `.ontology/README.md`。
4. 抽取 Object Types：业务实体或业务事件。
5. 抽取 Properties：对象的业务特征。
6. 抽取 Link Types：对象之间的业务关系。
7. 抽取 Action Types：用户、系统、任务或 agent 可执行的业务变更。
8. 抽取 Functions：可复用业务逻辑，如计算、校验、权限、聚合、排序、推荐、风控。
9. 为每个要素写证据，记录不确定问题。
10. 运行质量检查，更新每个 YAML 的 `qualityChecks`。
11. 检查所有生成 YAML 的人类可读内容是否为中文。

## 文件写入规则

必须创建或更新：

- `.ontology/index.yaml`：索引、元数据、统计摘要、跨文件引用。
- `.ontology/README.md`：人类可读摘要，简短说明核心对象、关系、动作、函数和未决问题。
- `.ontology/object-types/object-types.yaml`：只放 Object Type 结果。
- `.ontology/properties/properties.yaml`：只放 Property 结果，可包含 `valueTypes`、`sharedProperties`。
- `.ontology/link-types/link-types.yaml`：只放 Link Type 结果。
- `.ontology/action-types/action-types.yaml`：只放 Action Type 结果。
- `.ontology/functions/functions.yaml`：只放 Function 结果。

每个五要素 YAML 文件必须包含：

```yaml
metadata: {}
guide: {}
items: []
sourceEvidence: []
openQuestions: []
qualityChecks: {}
```

详细模板和示例见 `references/ontology-output-structure.md`。当需要写入实际 YAML 文件时，必须先读取该参考文件。

## 五要素抽取准则

### Object Type

创建条件：

- 代表业务人员会自然讨论的实体或事件。
- 有稳定身份，如 ID、编号、唯一键、事件 ID。
- 有生命周期、状态、权限、审计或业务规则。
- 会被多个功能读取、修改、关联或展示。

不要创建：

- Controller、Handler、Repository、Service、Client、Adapter。
- Request DTO、Response DTO、Form、ViewModel，除非它本身就是业务提交记录。
- 临时缓存、分页对象、排序条件、查询参数。
- 纯 join table，除非关系本身有业务属性或生命周期。

### Property

创建条件：

- 描述对象的身份、状态、分类、时间、数量、金额、位置、归属或业务含义。
- 被查询、筛选、排序、展示、校验或用于权限判断。
- 参与动作输入、动作结果、业务规则、关系或函数。

关键约束：

- 主键必须稳定、唯一，不应使用可变业务状态。
- 枚举必须列出允许值。
- 金额、邮箱、国家码、百分比等领域字段优先建 `valueTypes`。
- 派生字段必须说明 derivation 或引用 Function。
- 敏感字段必须标注 `sensitivity`。

### Link Type

创建条件：

- 两个 Object Types 之间存在业务关系。
- 关系会被查询、导航、展示、授权、动作或函数使用。
- 关系有方向、基数、生命周期或自身属性。

关键约束：

- Link Type 必须连接 Object Type，不连接裸 Property。
- 必须写 `cardinality`、`directionality`、`reverseDisplayName`。
- many-to-many 关系若有业务属性或生命周期，考虑提升为 Object Type。

### Action Type

创建条件：

- 创建、更新、删除对象，或建立/删除链接。
- 表达明确业务意图，如 approve、assign、cancel、capture、submit、close。
- 包含权限、校验、审批、通知或外部系统调用。

不要创建：

- 只读操作，如 get、list、search、export。
- 单纯 getter、setter、helper。
- 每个字段一个 action 的机械拆分。

### Function

创建条件：

- 可复用业务逻辑。
- 根据对象和关系计算、校验、聚合、评分、排序、推荐或授权。
- 支撑 Action Type、派生 Property、API、报表或 agent 工具能力。

不要创建：

- 简单 getter/setter。
- 纯 mapper、serializer、framework helper。
- 没有业务语义的一次性 glue code。

## 质量检查

交付前检查：

- Object Type 是否代表业务概念，而不是技术结构。
- 每个 Object Type 是否有稳定主键和标题属性。
- Property 是否有类型、必填性、空值语义、敏感性和证据。
- Link Type 是否有方向、基数和反向名称。
- Action Type 是否表达业务动作，而不是字段更新。
- Function 是否是可复用业务逻辑，而不是 helper。
- 每个重要判断是否有 source evidence。
- 不确定问题是否进入 `openQuestions`。
- YAML 中面向人类阅读的内容是否为中文。

常见反模式：

- `System Silo`：按系统/服务/数据库边界建模。
- `Department Silo`：不同团队重复创建同一业务对象。
- `Kitchen Sink`：把所有字段塞进一个对象。
- `God Object`：一个对象承担过多职责。
- `Action Sprawl`：为每个字段创建一个 action。

## 最终回复

完成后，最终回复只需说明：

- 目标 codebase 的 `.ontology/` 路径。
- 已生成或更新的文件列表。
- 核心对象、关系、动作、函数摘要。
- open questions 数量及最高优先级问题。
- 质量检查是否通过。

不要在最终回复中粘贴完整 YAML，除非用户明确要求。
