# 🛡️ Alerting & Exception Handling System

## 🔍 Overview

This document defines the unified **alerting and exception logging system** for the Roei (WKT) backend platform. It is designed to:

- Catch all unhandled exceptions (automatically)
- Enable developers to report operational errors manually (without throwing)
- Classify and prioritize issues using `ErrorSeverity`
- Send **real-time alerts via Telegram**
- Log every significant issue to MongoDB for auditing and debugging

> 📌 **All logs and alerts must now use the centralized `LoggerService`.**

The previous utility `logAppEvent()` has been deprecated in favor of a structured, class-based approach using `LoggerService`.

---

## ✅ How It Works

### 🔹 LoggerService

Use `LoggerService` in any service to log important messages, warnings, or errors.

```ts
this.logger.error({
  message: 'Failed to connect to Green Invoice',
  context: 'PaymentService',
  cause: error,
  metadata: { orderId: 'abc123' },
  data: { requestPayload: payload },
});
```

- Logs to console with proper severity (uses `nestjs/common/Logger`)
- Saves to MongoDB via `ExceptionLogService`
- Sends alert via Telegram (based on severity and config)

You get `.debug()`, `.info()`, `.warn()`, `.error()`, and `.fatal()` methods — each automatically infers severity.

---

## 🧠 When to Use

| Use Case                         | Method Example        |
| -------------------------------- | --------------------- |
| Informational flow               | `logger.info({...})`  |
| Unexpected but recoverable error | `logger.warn({...})`  |
| Severe crash or logic break      | `logger.error({...})` |
| Critical error                   | `logger.fatal({...})` |

---

## 🚨 Severity Levels

```ts
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}
```

Each level affects:

- Console log level
- Telegram alert trigger
- DB persistence

---

## 📥 Example Logger Usage

```ts
this.logger.warn({
  message: 'Slow response from 3rd party API',
  context: 'InvoiceService',
  metadata: { endpoint: '/pay', durationMs: 1200 },
  options: { sendAlert: true, saveToDb: true },
});
```

---

## 🧱 Setup Example in Service

```ts
@Injectable()
export class InvoiceService extends BaseService {
  constructor(logger: LoggerService) {
    super('InvoiceService', logger);
  }

  async issueInvoice() {
    try {
      // ...
    } catch (err) {
      this.logger.error({
        message: 'Invoice generation failed',
        context: 'InvoiceService',
        cause: err,
        metadata: { orderId: 'abc' },
        data: { input: payload },
        options: { sendAlert: true, saveToDb: true },
      });
    }
  }
}
```

---

## 🔧 No More `logAppEvent`

- ❌ Do not use `logAppEvent()` anymore
- ✅ Use `LoggerService` in all services and core flows

---
