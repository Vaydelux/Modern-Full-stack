import type { LessonContent } from "./types";

export const LESSON_CONTENT_P42: Record<string, LessonContent> = {
  "p42-m1": {
    id: "p42-m1",
    phaseId: "p42",
    title: "Milestone: Catalog, Suppliers & Warehouses",
    level: "Mastery",
    minutes: 120,
    summary:
      "Design the relational schema for an enterprise Inventory Management System (IMS). Model multi-warehouse inventory, SKU variants, suppliers, and enforce the Immutable Stock Movement Ledger pattern.",
    prerequisites: ["p13-l1 PostgreSQL Core", "p14-l1 Prisma Core"],
    objectives: [
      "Model hierarchical product catalogs, SKUs, barcode tracking, and multi-location warehouses.",
      "Implement the Immutable Movement Ledger rule: never mutate a stock quantity directly; append movement records.",
      "Author PostgreSQL triggers and constraints preventing negative warehouse stock balances.",
    ],
    simple:
      "In financial accounting and inventory systems, you never do `UPDATE products SET stock = stock - 1`. If an auditor asks 'Where did the 5 missing laptops go?', a simple number tells you nothing. In an enterprise system, stock balance is the sum of an Immutable Ledger of movements: Receipts (+50), Sales (-1), Transfers (-5 to Warehouse B), and Shrinkage (-2). Every single physical item movement is recorded with timestamp, operator ID, and reason.",
    why:
      "Immutable ledgers provide 100% auditability and make financial reconciliation mathematically watertight.",
    mentalModel: {
      title: "The Bank Account Transaction Ledger",
      body:
        "Your bank doesn't just store a single number for your money. They keep an immutable list of every single deposit and withdrawal since the day you opened the account. Your balance is simply the running sum.",
    },
    sections: [
      {
        heading: "1. The Immutable Stock Movement Schema",
        body: [
          "- `StockMovement`: `id`, `skuId`, `warehouseId`, `quantity` (+/-), `movementType` (RECEIPT, SALE, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT), `referenceId`, `createdAt`.",
          "- Current balance is calculated via indexed aggregate views or maintained transactionally.",
        ],
        code: [
          {
            file: "prisma/schema.prisma",
            lang: "prisma",
            code: [
              "enum MovementType {",
              "  RECEIPT",
              "  SALE",
              "  TRANSFER_IN",
              "  TRANSFER_OUT",
              "  ADJUSTMENT",
              "}",
              "",
              "model StockMovement {",
              "  id          String       @id @default(uuid())",
              "  skuId       String",
              "  warehouseId String",
              "  quantity    Int          // Positive for additions, negative for deductions",
              "  type        MovementType",
              "  referenceId String?      // Order ID or Transfer ID",
              "  reason      String?",
              "  createdById String",
              "  createdAt   DateTime     @default(now())",
              "",
              "  sku         ProductSku   @relation(fields: [skuId], references: [id])",
              "  warehouse   Warehouse    @relation(fields: [warehouseId], references: [id])",
              "",
              "  @@index([skuId, warehouseId])",
              "  @@index([createdAt])",
              "}",
            ].join("\n"),
            caption: "Immutable inventory movement ledger schema.",
          },
        ],
      },
    ],
    mistake: {
      title: "Overwriting Stock Quantities Directly with UPDATE Statements Without Audit Trails",
      wrong: [
        "// ❌ Directly mutating stock counter:\nUPDATE products SET quantity = 42 WHERE id = 'sku-123';",
        "// Destroys all historical audit trail; impossible to detect warehouse theft or counting errors!",
      ].join("\n"),
      right: [
        "// ✅ Insert a new `StockMovement` entry with quantity and reason; compute balance from ledger.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Implement Immutable Movement Ledger and Balance Aggregates",
      description:
        "Build a Prisma service that records stock receipts and transfers, and calculates live on-hand inventory across 3 warehouses.",
      tasks: [
        "Create product catalog and warehouse models.",
        "Implement `recordMovement()` service method.",
        "Write SQL view aggregating stock by warehouse.",
      ],
    },
    quiz: [
      {
        question: "Why do enterprise inventory and accounting systems use an 'Immutable Movement Ledger' rather than directly updating a single quantity column?",
        options: [
          "To provide a complete, tamper-proof historical audit trail of every addition, deduction, transfer, and adjustment for financial audits and discrepancy investigations.",
          "Because SQL does not support UPDATE.",
          "To save disk space.",
          "To format dates in UTC.",
        ],
        answer: 0,
        explanation:
          "Immutable ledgers guarantee full traceability and auditability of all inventory state changes over time.",
      },
    ],
  },

  "p42-m2": {
    id: "p42-m2",
    phaseId: "p42",
    title: "Milestone: Stock Movements & Transactional Integrity",
    level: "Mastery",
    minutes: 120,
    summary:
      "Execute multi-location inventory transfers with strict ACID transactions. Implement pessimistic row locking (`SELECT ... FOR UPDATE`) to prevent overselling race conditions.",
    prerequisites: ["p42-m1 Catalog & Schema", "p13-l1 PostgreSQL Core"],
    objectives: [
      "Implement warehouse-to-warehouse stock transfers with atomic dual-ledger movements (`TRANSFER_OUT` and `TRANSFER_IN`).",
      "Prevent overselling race conditions using PostgreSQL pessimistic row locks (`SELECT FOR UPDATE`).",
      "Author concurrent load tests simulating 50 customers buying the last available item simultaneously.",
    ],
    simple:
      "When there is only 1 PlayStation left in the warehouse and two customers click 'Buy Now' at the exact same millisecond: without locking, both requests read `stock = 1`, both succeed, and your company is forced to cancel an order and apologize. Using PostgreSQL `SELECT ... FOR UPDATE` locks the inventory row for 2 milliseconds, letting Customer A purchase it while Customer B is politely informed 'Out of Stock'.",
    why:
      "Pessimistic locking guarantees transactional correctness under high concurrent e-commerce load.",
    mentalModel: {
      title: "The Changing Room Lock",
      body:
        "When you enter a clothing store changing room, you lock the door. Other customers can see the room is occupied and wait outside for 30 seconds rather than barging in on you.",
    },
    sections: [
      {
        heading: "1. Atomic Inventory Reservation with Pessimistic Locking",
        body: [
          "- `SELECT ... FOR UPDATE` locks the inventory balance row until the transaction commits.",
          "- Guarantees zero negative stock and zero overselling race conditions.",
        ],
        code: [
          {
            file: "src/inventory/inventory.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, BadRequestException } from '@nestjs/common';",
              "import { PrismaService } from '../prisma.service';",
              "",
              "@Injectable()",
              "export class InventoryService {",
              "  constructor(private prisma: PrismaService) {}",
              "",
              "  async reserveStock(skuId: string, warehouseId: string, quantityToReserve: number) {",
              "    return this.prisma.$transaction(async (tx) => {",
              "      // 1. Lock the inventory balance row with pessimistic lock",
              "      const [currentStock]: any = await tx.$queryRaw`",
              "        SELECT id, on_hand, reserved",
              "        FROM inventory_items",
              "        WHERE sku_id = ${skuId}::uuid AND warehouse_id = ${warehouseId}::uuid",
              "        FOR UPDATE;",
              "      `;",
              "",
              "      if (!currentStock || (currentStock.on_hand - currentStock.reserved) < quantityToReserve) {",
              "        throw new BadRequestException('Insufficient available inventory to fulfill order');",
              "      }",
              "",
              "      // 2. Increment reserved count atomically",
              "      await tx.inventoryItem.update({",
              "        where: { id: currentStock.id },",
              "        data: { reserved: { increment: quantityToReserve } },",
              "      });",
              "",
              "      return { success: true };",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "Pessimistic row locking for atomic stock reservations.",
          },
        ],
      },
    ],
    mistake: {
      title: "Reading Balance and Updating in Two Separate Non-Locked Queries (Read-Modify-Write Race)",
      wrong: [
        "// ❌ Race condition flaw:\nconst item = await prisma.item.findUnique(...); // Both read stock = 1\nif (item.stock > 0) {\n  await prisma.item.update({ data: { stock: item.stock - 1 } }); // Both write stock = 0, selling 2 items!\n}",
      ].join("\n"),
      right: [
        "// ✅ Use `$transaction` with `FOR UPDATE` or atomic conditional updates: `WHERE stock >= requested`.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Concurrency Race Test on Stock Depletion",
      description:
        "Set an item's stock to 1, fire 20 concurrent HTTP purchase requests via `Promise.all()`, and assert that exactly 1 request succeeds (200 OK) and 19 fail with 400 Bad Request.",
      tasks: [
        "Implement pessimistic locking reservation endpoint.",
        "Author concurrent test script firing 20 parallel requests.",
        "Assert final database stock is exactly 0 and 1 order created.",
      ],
    },
    quiz: [
      {
        question: "What does the SQL clause 'SELECT ... FOR UPDATE' do inside a database transaction?",
        options: [
          "It places an exclusive row-level lock on the queried rows, forcing any other concurrent transactions attempting to read or modify those rows to wait until the current transaction commits or rolls back.",
          "It deletes the rows from disk.",
          "It converts the rows to JSON.",
          "It sends an email notification.",
        ],
        answer: 0,
        explanation:
          "FOR UPDATE serializes concurrent access to specific rows, eliminating race conditions during read-modify-write cycles.",
      },
    ],
  },

  "p42-m3": {
    id: "p42-m3",
    phaseId: "p42",
    title: "Milestone: Orders, Returns & Status Transitions",
    level: "Mastery",
    minutes: 120,
    summary:
      "Model complete Order Lifecycle State Machines (`PENDING` -> `ALLOCATED` -> `PACKED` -> `SHIPPED` -> `DELIVERED` / `CANCELLED` / `RETURNED`). Enforce valid state transitions in TypeScript.",
    prerequisites: ["p42-m2 Stock Movements"],
    objectives: [
      "Implement a strongly typed State Machine governing order and return lifecycles.",
      "Handle customer return merchandise authorizations (RMAs) and restocking ledger entries.",
      "Author integration tests validating that illegal state jumps (e.g. `DELIVERED` -> `PENDING`) are rejected.",
    ],
    simple:
      "An order cannot be 'Shipped' if it hasn't been 'Packed'. An order cannot be 'Cancelled' if it has already been 'Delivered' to the customer's front porch. A State Machine defines the strict mathematical rules of what status changes are legal, and triggers automatic side-effects (like releasing reserved stock when an order is cancelled).",
    why:
      "State machine discipline eliminates invalid business states and order fulfillment errors.",
    mentalModel: {
      title: "The Subway Turnstile",
      body:
        "A subway turnstile has two states: Locked and Unlocked. Inserting a token transitions it to Unlocked. Pushing the bar rotates it and transitions it back to Locked. You cannot push the bar when Locked.",
    },
    sections: [
      {
        heading: "1. Type-Safe Order State Machine",
        body: [
          "- Explicit transition map defines allowed `next` states for every current state.",
          "- Throws `InvalidStateTransitionException` if an illegal jump is requested.",
        ],
        code: [
          {
            file: "src/orders/order-state-machine.ts",
            lang: "ts",
            code: [
              "export type OrderStatus = 'PENDING' | 'ALLOCATED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';",
              "",
              "export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {",
              "  PENDING: ['ALLOCATED', 'CANCELLED'],",
              "  ALLOCATED: ['PACKED', 'CANCELLED'],",
              "  PACKED: ['SHIPPED', 'CANCELLED'],",
              "  SHIPPED: ['DELIVERED'],",
              "  DELIVERED: [], // Terminal state (must use RMA for returns)",
              "  CANCELLED: [], // Terminal state",
              "};",
              "",
              "export function validateOrderTransition(current: OrderStatus, next: OrderStatus): void {",
              "  const allowed = ALLOWED_TRANSITIONS[current];",
              "  if (!allowed.includes(next)) {",
              "    throw new Error(`Illegal state transition from ${current} to ${next}`);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Typed state transition validation matrix.",
          },
        ],
      },
    ],
    mistake: {
      title: "Allowing Arbitrary Status Updates via Generic PATCH /orders/:id Endpoints",
      wrong: [
        "// ❌ Unrestricted patch endpoint:\nawait prisma.order.update({ where: { id }, data: { status: req.body.status } });",
        "// Allows rogue clients to mark a cancelled order as 'DELIVERED' without inventory allocation!",
      ].join("\n"),
      right: [
        "// ✅ Create dedicated transition endpoints: `POST /orders/:id/pack`, `POST /orders/:id/ship` that enforce state rules.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build Complete Order and Return RMA State Machine",
      description:
        "Implement order fulfillment lifecycle and return RMA workflow, verifying that cancelling an allocated order restores reserved stock to available inventory.",
      tasks: [
        "Define order transition methods in service.",
        "Implement RMA return processing with restocking fee.",
        "Author unit test suite testing all valid and invalid state permutations.",
      ],
    },
    quiz: [
      {
        question: "Why should state transitions (e.g. Packing, Shipping, Cancelling) be modeled with explicit domain methods rather than generic PATCH status updates?",
        options: [
          "To enforce business invariant rules, validate allowed transition paths, and trigger mandatory side-effects (e.g. stock deduction, customer notifications) atomically.",
          "To reduce JSON payload sizes.",
          "Because PATCH is not supported in HTTP/2.",
          "To disable TypeScript checks.",
        ],
        answer: 0,
        explanation:
          "Explicit domain transition methods guard business invariants and guarantee associated side-effects execute reliably.",
      },
    ],
  },
};
