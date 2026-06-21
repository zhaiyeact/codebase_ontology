# Ontology 输出结构参考

当使用 `codebase-ontology` skill 写入实际 `.ontology/` 文件时，读取本文件。

本文件只定义输出结构、模板和示例，不包含外部参考资料。

## 0. 输出语言要求

生成到目标 codebase `.ontology/` 下的 YAML 文件，内容语言必须为中文。

必须写成中文的值：

- `displayName`
- `description`
- `notes`
- `question`
- `suggestedResolution`
- `qualityChecks.*.notes`
- `guide.definition`
- object、property、link、action、function 的业务语义描述
- `.ontology/README.md` 中的人类可读内容

允许保持原文的值：

- YAML schema key。
- 稳定机器 ID。
- 代码路径和 symbol。
- API path。
- 数据库表名、列名和外键名。
- 代码中已有的枚举值、状态值和常量值。
- 第三方系统名称。

示例：`id: calculateOrderTotal` 可以保持英文，但 `displayName` 应写成 `计算订单总额`，`description` 应写成中文。

## 1. 目录结构

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

## 2. index.yaml

```yaml
metadata:
  ontologyId: codebaseOntology
  name: 代码库 Ontology
  description: 从当前代码库抽取的业务 Ontology。
  generatedAt: "YYYY-MM-DD"
  generatedBy: "codex"
  codebase:
    name: ""
    rootPath: ""
    repositoryUrl: ""
    commit: ""
  scope:
    includedPaths: []
    excludedPaths: []
    assumptions: []

files:
  objectTypes: .ontology/object-types/object-types.yaml
  properties: .ontology/properties/properties.yaml
  linkTypes: .ontology/link-types/link-types.yaml
  actionTypes: .ontology/action-types/action-types.yaml
  functions: .ontology/functions/functions.yaml

summary:
  domains: []
  objectTypeCount: 0
  propertyCount: 0
  linkTypeCount: 0
  actionTypeCount: 0
  functionCount: 0
  openQuestionCount: 0

qualityStatus:
  passed: false
  blockingIssues: []
```

## 3. 通用证据格式

```yaml
sourceEvidence:
  - id: evidenceId
    kind: file | symbol | endpoint | database | test | documentation | inferred
    path: string
    symbol: string | null
    lines: string | null
    excerpt: string
    notes: string
```

要求：

- `path` 使用相对 codebase 根目录的路径。
- `excerpt` 只放短片段。
- 推断内容使用 `kind: inferred`，并在 `notes` 解释依据。

## 4. object-types/object-types.yaml

```yaml
metadata:
  fileType: objectTypes
  generatedAt: "YYYY-MM-DD"
  codebaseRoot: ""

guide:
  definition: Object Type 用于建模真实业务世界中的实体或事件。

items:
  - id: objectTypeId
    displayName: 对象类型名称
    pluralDisplayName: 对象类型复数名称
    category: entity | event | document | actor | configuration | metric
    description: 该对象类型的业务含义。
    aliases: []
    domain: domainId
    primaryKey: id
    titleProperty: name
    lifecycle:
      states: []
      stateProperty: null
      createdByActions: []
      modifiedByActions: []
      deletedByActions: []
    implements: []
    properties:
      - propertyId
    links:
      outgoing: []
      incoming: []
    actions: []
    functions: []
    excludedFields:
      - field: ""
        reason: ""
        sourceEvidence: []
    sourceEvidence: []
    confidence: high | medium | low

sourceEvidence: []
openQuestions: []
qualityChecks:
  objectTypesHavePrimaryKeys:
    passed: false
    notes: ""
```

示例：

```yaml
items:
  - id: order
    displayName: 订单
    pluralDisplayName: 订单
    category: entity
    description: 客户购买一个或多个商品时形成的商业请求。
    aliases:
      - OrderEntity
      - orders
    domain: ordering
    primaryKey: orderId
    titleProperty: orderNumber
    lifecycle:
      states:
        - draft
        - placed
        - paid
        - fulfilled
        - cancelled
      stateProperty: status
      createdByActions:
        - placeOrder
      modifiedByActions:
        - cancelOrder
        - capturePayment
      deletedByActions: []
    implements:
      - auditable
    properties:
      - orderId
      - orderNumber
      - status
      - totalAmount
    links:
      outgoing:
        - orderContainsOrderLine
        - orderHasPayment
      incoming:
        - customerPlacesOrder
    actions:
      - placeOrder
      - cancelOrder
      - capturePayment
    functions:
      - calculateOrderTotal
      - canCancelOrder
    excludedFields:
      - field: internalSyncVersion
        reason: 仅用于实现层同步的字段，不属于业务属性。
        sourceEvidence:
          - orderEntity
    sourceEvidence:
      - orderEntity
      - orderMigration
      - orderStateTransitionTests
    confidence: high
```

## 5. properties/properties.yaml

```yaml
metadata:
  fileType: properties
  generatedAt: "YYYY-MM-DD"
  codebaseRoot: ""

guide:
  definition: Property 用于建模对象类型的业务特征。

items:
  - id: propertyId
    objectType: objectTypeId
    displayName: 属性名称
    description: 该属性的业务含义。
    type: string | integer | long | decimal | float | double | boolean | date | timestamp | enum | array | object | struct | geoPoint | geoShape | attachment | mediaReference | timeSeries
    required: false
    nullable: true
    unique: false
    source: stored | derived | computed | external | writeback
    sensitivity: public | internal | confidential | restricted
    constraints: {}
    derivation: null
    sourceEvidence: []
    confidence: high | medium | low

valueTypes: []
sharedProperties: []
sourceEvidence: []
openQuestions: []
qualityChecks:
  propertiesHaveTypes:
    passed: false
    notes: ""
```

示例：

```yaml
items:
  - id: status
    objectType: order
    displayName: 状态
    description: 订单当前所处的生命周期状态。
    type: enum
    required: true
    nullable: false
    unique: false
    source: stored
    sensitivity: internal
    constraints:
      allowedValues:
        - draft
        - placed
        - paid
        - fulfilled
        - cancelled
    derivation: null
    sourceEvidence:
      - orderStatusEnum
      - orderStateTransitionTests
    confidence: high

  - id: totalAmount
    objectType: order
    displayName: 订单总金额
    description: 所有订单明细在折扣后的总金额。
    type:
      valueType: money
    required: true
    nullable: false
    unique: false
    source: derived
    sensitivity: internal
    constraints:
      minimum: 0
    derivation:
      function: calculateOrderTotal
    sourceEvidence:
      - calculateOrderTotalFunction
    confidence: high
```

## 6. link-types/link-types.yaml

```yaml
metadata:
  fileType: linkTypes
  generatedAt: "YYYY-MM-DD"
  codebaseRoot: ""

guide:
  definition: Link Type 用于建模对象类型之间的业务关系。

items:
  - id: sourceRelatesToTarget
    displayName: 源对象关联目标对象
    description: 该关系的业务含义。
    fromObjectType: sourceObject
    toObjectType: targetObject
    reverseDisplayName: 目标对象被源对象关联
    cardinality: oneToOne | oneToMany | manyToOne | manyToMany
    directionality: directed | bidirectional
    required: false
    properties: []
    backing:
      kind: foreignKey | joinTable | objectReference | eventReference | inferred
      details: ""
    sourceEvidence: []
    confidence: high | medium | low

sourceEvidence: []
openQuestions: []
qualityChecks:
  linksHaveCardinality:
    passed: false
    notes: ""
```

示例：

```yaml
items:
  - id: customerPlacesOrder
    displayName: 客户下订单
    description: 一个客户创建或提交一个订单。
    fromObjectType: customer
    toObjectType: order
    reverseDisplayName: 订单由客户提交
    cardinality: oneToMany
    directionality: directed
    required: true
    properties: []
    backing:
      kind: foreignKey
      details: orders.customer_id references customers.id
    sourceEvidence:
      - orderMigration
      - orderEntity
    confidence: high
```

## 7. action-types/action-types.yaml

```yaml
metadata:
  fileType: actionTypes
  generatedAt: "YYYY-MM-DD"
  codebaseRoot: ""

guide:
  definition: Action Type 用于建模会改变对象、属性或链接的业务操作。

items:
  - id: performBusinessAction
    displayName: 执行业务动作
    description: 该动作的业务意图和结果。
    actors:
      - role: ""
        description: ""
    targets:
      - objectType: objectTypeId
        parameter: objectId
        cardinality: single | set
    inputParameters:
      - id: objectId
        displayName: 对象 ID
        type: string
        required: true
        nullable: false
        description: ""
        constraints: {}
    rules:
      preconditions: []
      validations: []
      authorization: []
    effects:
      creates: []
      updates: []
      deletes: []
      links: []
      unlinks: []
    sideEffects:
      notifications: []
      webhooks: []
      externalCalls: []
      scheduledJobs: []
    reversible: false
    usedFunctions: []
    sourceEvidence: []
    confidence: high | medium | low

sourceEvidence: []
openQuestions: []
qualityChecks:
  actionsDescribeBusinessIntent:
    passed: false
    notes: ""
```

示例：

```yaml
items:
  - id: cancelOrder
    displayName: 取消订单
    description: 取消一个尚未履约完成的订单。
    actors:
      - role: customer
        description: 客户取消自己的订单。
      - role: supportAgent
        description: 客服人员代客户取消订单。
    targets:
      - objectType: order
        parameter: orderId
        cardinality: single
    inputParameters:
      - id: orderId
        displayName: 订单 ID
        type: string
        required: true
        nullable: false
        description: 需要取消的订单。
        constraints: {}
      - id: reason
        displayName: 取消原因
        type: string
        required: false
        nullable: true
        description: 可选的取消原因。
        constraints:
          maxLength: 500
    rules:
      preconditions:
        - 订单状态必须是 draft、placed 或 paid。
      validations:
        - 已履约完成的订单不能取消。
      authorization:
        - 执行人必须拥有该订单，或具有 supportAgent 角色。
    effects:
      creates: []
      updates:
        - objectType: order
          property: status
          value: cancelled
      deletes: []
      links: []
      unlinks: []
    sideEffects:
      notifications:
        - 发送订单取消通知。
      webhooks: []
      externalCalls:
        - 如果订单已收款，向支付供应商请求退款。
      scheduledJobs: []
    reversible: false
    usedFunctions:
      - canCancelOrder
    sourceEvidence:
      - cancelOrderEndpoint
      - orderServiceCancelOrder
      - orderStateTransitionTests
    confidence: high
```

## 8. functions/functions.yaml

```yaml
metadata:
  fileType: functions
  generatedAt: "YYYY-MM-DD"
  codebaseRoot: ""

guide:
  definition: Function 用于建模可复用的业务逻辑。

items:
  - id: calculateBusinessValue
    displayName: 计算业务值
    description: 可复用的业务逻辑。
    inputs:
      - id: inputId
        type: string
        required: true
    outputs:
      type: string
      description: ""
    reads:
      objectTypes: []
      properties: []
      linkTypes: []
    writes:
      objectTypes: []
      properties: []
      linkTypes: []
    usedBy:
      actionTypes: []
      properties: []
      endpoints: []
      jobs: []
    determinism: deterministic | timeDependent | userDependent | externalDependent
    externalDependencies: []
    errorCases: []
    sourceEvidence: []
    confidence: high | medium | low

sourceEvidence: []
openQuestions: []
qualityChecks:
  functionsAreReusableBusinessLogic:
    passed: false
    notes: ""
```

示例：

```yaml
items:
  - id: calculateOrderTotal
    displayName: 计算订单总额
    description: 根据订单明细计算订单总金额。
    inputs:
      - id: orderId
        type: string
        required: true
    outputs:
      type:
        valueType: money
      description: 该订单的总金额。
    reads:
      objectTypes:
        - order
        - orderLine
      properties:
        - orderLine.quantity
        - orderLine.unitPrice
      linkTypes:
        - orderContainsOrderLine
    writes:
      objectTypes: []
      properties: []
      linkTypes: []
    usedBy:
      actionTypes:
        - placeOrder
        - capturePayment
      properties:
        - order.totalAmount
      endpoints: []
      jobs: []
    determinism: deterministic
    externalDependencies: []
    errorCases:
      - 当订单没有明细时返回校验错误。
    sourceEvidence:
      - calculateOrderTotalFunction
      - orderTotalTests
    confidence: high
```

## 9. README.md 摘要模板

```markdown
# 代码库 Ontology

生成时间：YYYY-MM-DD  
代码库：<name>

## 摘要

- Object Types: N
- Properties: N
- Link Types: N
- Action Types: N
- Functions: N
- Open Questions: N

## 核心业务域

...

## 主要未决问题

...
```
