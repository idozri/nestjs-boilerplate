# 🛡️ Alerting & Exception Handling System

## 🔍 Overview

This document defines the unified **alerting and exception logging system** for the Roei (WKT) backend platform. It is designed to:

- Catch all unhandled exceptions (automatically)
- Enable developers to report operational errors manually (without throwing)
- Classify and prioritize issues using `ErrorSeverity`
- Send **real-time alerts via Telegram** to developers and team leads
- Log every significant issue to MongoDB for future auditing and debugging

> 📌 **This system must be used consistently across the entire app to ensure visibility and traceability of all errors and warnings.**

The core function is `logAppEvent()` located in `common/utils/alert.util.ts`.

---

## ⚙️ Features

### ✅ Global Error Catching

#### 🔁 Smart Auto-Escalation

The system includes a safeguard to automatically raise the severity of unmarked errors that look serious. This is useful when developers forget to manually classify an error but it's clearly critical.

```ts
if (
  status >= 500 &&
  severity === ErrorSeverity.LOW &&
  (message.includes('Mongo') ||
    message.includes('UnhandledPromise') ||
    message.includes('TypeError') ||
    message.includes('ECONNREFUSED') ||
    message.includes('Redis') ||
    message.includes('Connection timeout'))
) {
  severity = ErrorSeverity.HIGH;
}
```

### ✅ What This Does

| Condition           | Reason                                                           |
| ------------------- | ---------------------------------------------------------------- |
| `status >= 500`     | Only server-side errors (not client errors like 400)             |
| `severity === LOW`  | Error wasn't manually classified as serious                      |
| Message contains... | Detects common signs of infrastructure or critical logic failure |

If matched, the severity is escalated to `HIGH`, ensuring it:

- Gets logged more prominently
- Triggers a real-time Telegram alert
- Gets saved to DB for follow-up

> This auto-escalation protects your team from missing silent but severe issues.

- Automatically catches and handles all unhandled exceptions using `AllExceptionsFilter`
- Extracts context, path, status, and inferred severity
- Sends alert (via Telegram)
- Persists to DB (`ExceptionLog` schema)

### ✅ Manual Alerting (Non-Crashing Errors)

Use the `logAppEvent()` utility to manually report unexpected behavior **without throwing**:

```ts
await logAppEvent(
  'External API failed to respond',
  'InvoiceService',
  ErrorSeverity.HIGH,
  { endpoint: '/pay', payload: data },
  { sendAlert: true, saveToDb: true },
  this.logService
);
```

### ✅ Custom Exception (for throwing with severity)

```ts
throw new AppException('Permission denied', 403, ErrorSeverity.MEDIUM);
```

---

## 🚨 Severity Levels

```ts
export enum ErrorSeverity {
  LOW = 'low', // Debug, non-urgent warnings
  MEDIUM = 'medium', // Recoverable but significant
  HIGH = 'high', // Needs attention, triggers alert
  CRITICAL = 'critical', // Blocks business flow, urgent!
}
```

- Severity affects: **log level**, **alerting**, **DB saving**
- `HIGH` or `CRITICAL` = always alert
- Use `LOW/MEDIUM` for logs that don't need human attention

Example Telegram alert:

```
⚠️ HIGH WARNING in InvoiceService
External API failed to respond

Details:
{
  "endpoint": "/pay",
  "payload": { ... }
}
```

---

## 🚀 Telegram Alerting Setup

We use a Telegram bot to deliver critical alerts in real time.

### 🔧 Bot Naming Convention

- All bots should follow the pattern:

  ```
  WKT [Purpose]
  wkt_[purpose]_bot
  ```

Example:

- Bot Display Name: `WKT Exceptions`
- Bot Username: `wkt_exceptions_bot`

### 🛠 Steps to Create a Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Set your bot name (e.g., `WKT Exceptions`)
4. Set username: must end in `_bot` (e.g., `wkt_exceptions_bot`)
5. Save the bot **token** (you’ll get a string like `123456789:ABCdEf...`)

### 📥 Get Your Chat ID

#### Personal:

1. Open your bot and click **Start**
2. Go to:

   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

3. Copy the `chat.id` from the response

#### Group:

1. Create a Telegram group (e.g., `Roei Errors`)
2. Add your bot to the group
3. Send a message in the group
4. Run `/getUpdates` again
5. Copy the group `chat.id` (will start with `-`)

### 🧩 .env Configuration

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdEfGhIj
TELEGRAM_CHAT_ID=-987654321
```

---

## 🏗️ File Overview

| File                       | Description                                   |
| -------------------------- | --------------------------------------------- |
| `alert.util.ts`            | Unified alert and log utility (`logAppEvent`) |
| `telegram-alert.util.ts`   | Sends messages via Telegram bot               |
| `exception-log.schema.ts`  | MongoDB schema for structured error logs      |
| `exception-log.service.ts` | Service to save logs to DB                    |
| `app.exception.ts`         | Custom error class with severity              |
| `all-exceptions.filter.ts` | Global exception filter for NestJS            |
| `main.ts`                  | Registers the global filter                   |

---

## ✅ Best Practices

### 🧩 Using `AllExceptionsFilter` with a Custom Service

### 🔄 Using `logAppEvent()`

This function:

- Logs critical or non-critical events
- Saves to the database (if configured)
- Triggers alerts (Telegram)
- Is reusable across the app

Use this import:

```ts
import { logAppEvent } from '@/common/utils/alert.util';
```

### 🧩 Using Without Passing `ExceptionLogService` Each Time

You can avoid passing `ExceptionLogService` by creating a global wrapper or singleton pattern. For example:

#### Option A: **Use a Static Logger Provider**

Create a global `LoggerService` that stores a reference to the real `ExceptionLogService` during `onModuleInit()` and is used internally.

#### Option B: **NestJS Middleware or Interceptor**

Wrap `logAppEvent()` inside an interceptor or middleware so it's globally injectable.

#### Option C: **Attach Service to Global Scope**

Store the service on a global object (e.g., `globalThis.exceptionLogger = app.get(ExceptionLogService)`) and retrieve it internally in `logAppEvent()`.

> For now, using constructor injection is still preferred for testability and clarity unless real global injection is needed.

### ✅ Example Integration

```ts
import { ExceptionLogService } from '@/common/services/exception-log.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly logService: ExceptionLogService) {}

  async performTask() {
    try {
      // risky operation
    } catch (err) {
      await logAppEvent(
        'Failed payment task',
        'PaymentsService',
        ErrorSeverity.HIGH,
        { err },
        { sendAlert: true, saveToDb: true },
        this.logService
      );
    }
  }
}
```

### ✅ Register in Module

```ts
@Module({
  providers: [PaymentsService, ExceptionLogService],
  imports: [
    MongooseModule.forFeature([
      { name: ExceptionLog.name, schema: ExceptionLogSchema },
    ]),
  ],
})
export class PaymentsModule {}
```

### ✅ Tips

- Use `logAppEvent()` when **handling errors manually** that shouldn't crash
- Use `AppException` when throwing with known severity
- **Never use `console.log` or `console.error`** directly — route all important output through the logging system
- Always include `metadata` for clarity and debugging context

---

## 📈 Future Add-ons (Optional)

- Slack alerting integration
- Dashboard to view and search exceptions
- Throttle duplicate alerts

---

## 🧪 Sample Manual Alert

```ts
await logAppEvent(
  'Cache miss detected for user session',
  'AuthGuard',
  ErrorSeverity.MEDIUM,
  { userId: 'abc123' },
  { sendAlert: false, saveToDb: true },
  this.logService
);
```

---

For any improvements or to onboard new bots, coordinate with the infrastructure or DevOps lead.
