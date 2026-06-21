# Ontology 输出结构参考

当使用 `codebase-ontology` skill 写入实际 `.ontology/` 文件时，读取本文件。

本文件只定义输出结构、模板和示例，不包含外部参考资料。

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
  name: Codebase Ontology
  description: Business ontology extracted from this codebase.
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
  definition: Object Types model real-world business entities or events.

items:
  - id: objectTypeId
    displayName: Object Type Name
    pluralDisplayName: Object Type Names
    category: entity | event | document | actor | configuration | metric
    description: Business meaning of this object type.
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
    displayName: Order
    pluralDisplayName: Orders
    category: entity
    description: A commercial request by a customer to purchase one or more products.
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
        reason: Implementation-only synchronization field.
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
  definition: Properties model business characteristics of object types.

items:
  - id: propertyId
    objectType: objectTypeId
    displayName: Property Name
    description: Business meaning of this property.
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
    displayName: Status
    description: Current lifecycle state of the order.
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
    displayName: Total Amount
    description: Total monetary amount of all order lines after discounts.
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
  definition: Link Types model business relationships between object types.

items:
  - id: sourceRelatesToTarget
    displayName: Source Relates To Target
    description: Business meaning of this relationship.
    fromObjectType: sourceObject
    toObjectType: targetObject
    reverseDisplayName: Target Is Related To Source
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
    displayName: Customer Places Order
    description: A customer places an order.
    fromObjectType: customer
    toObjectType: order
    reverseDisplayName: Order Is Placed By Customer
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
  definition: Action Types model business operations that change objects, properties, or links.

items:
  - id: performBusinessAction
    displayName: Perform Business Action
    description: Business intent and outcome of the action.
    actors:
      - role: ""
        description: ""
    targets:
      - objectType: objectTypeId
        parameter: objectId
        cardinality: single | set
    inputParameters:
      - id: objectId
        displayName: Object ID
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
    displayName: Cancel Order
    description: Cancel an order that has not yet been fulfilled.
    actors:
      - role: customer
        description: Customer cancelling their own order.
      - role: supportAgent
        description: Support agent cancelling an order.
    targets:
      - objectType: order
        parameter: orderId
        cardinality: single
    inputParameters:
      - id: orderId
        displayName: Order ID
        type: string
        required: true
        nullable: false
        description: Order to cancel.
        constraints: {}
      - id: reason
        displayName: Reason
        type: string
        required: false
        nullable: true
        description: Optional cancellation reason.
        constraints:
          maxLength: 500
    rules:
      preconditions:
        - Order status must be draft, placed, or paid.
      validations:
        - Fulfilled orders cannot be cancelled.
      authorization:
        - Actor must own the order or have supportAgent role.
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
        - Send cancellation notification.
      webhooks: []
      externalCalls:
        - If payment has been captured, request refund from payment provider.
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
  definition: Functions model reusable business logic.

items:
  - id: calculateBusinessValue
    displayName: Calculate Business Value
    description: Reusable business logic.
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
    displayName: Calculate Order Total
    description: Calculate total amount for an order from its line items.
    inputs:
      - id: orderId
        type: string
        required: true
    outputs:
      type:
        valueType: money
      description: Total monetary amount for the order.
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
      - Returns validation error when an order has no line items.
    sourceEvidence:
      - calculateOrderTotalFunction
      - orderTotalTests
    confidence: high
```

## 9. README.md 摘要模板

```markdown
# Codebase Ontology

生成时间：YYYY-MM-DD  
Codebase：<name>

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

