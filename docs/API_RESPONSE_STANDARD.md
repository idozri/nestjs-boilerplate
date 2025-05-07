# 📦 API Response Standard

## 🎯 Goal

Ensure all responses returned by the Roei (WKT) backend follow a **consistent, typed, and documented structure**. This improves:

- ✅ Developer experience (DX)
- ✅ Frontend integration
- ✅ Swagger documentation clarity
- ✅ Error handling and debugging

---

## 🧱 Base DTO: `ApiResponseDto<T>`

All endpoints must return a response using the following generic DTO:

```ts
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels()
export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  isSuccess: boolean;

  @ApiProperty({
    description: 'The message of the response',
    example: 'The request was successful',
  })
  message: string;

  @ApiProperty({
    description: 'Optional returned data',
    required: false,
  })
  data?: T;
}
```

> 🧠 **Note:** This class should be used across **all controllers** in the app to maintain consistency.

---

## 🧪 Example Usage

### ✅ Controller

```ts
@Get()
@ApiOkResponse({ type: ApiResponseDto })
async getUsers(): Promise<ApiResponseDto<User[]>> {
  return {
    isSuccess: true,
    message: 'Users fetched successfully',
    data: await this.userService.findAll(),
  };
}
```

---

## ⚠️ Guidelines

| Rule              | Description                                              |
| ----------------- | -------------------------------------------------------- |
| ✅ Required       | All public endpoints must use `ApiResponseDto<T>`        |
| 🟡 Optional data  | `data` is optional and should be `undefined` for errors  |
| ❌ No raw objects | Never return raw data directly (like `res.send(users)`)  |
| ✅ Documented     | Swagger decorators (`@ApiOkResponse`) must wrap this DTO |

---

## 📂 Extended Response Types

### 🔁 `PaginatedApiResponseDto<T>`

Extends `ApiResponseDto<T[]>` to add pagination metadata.

```ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedApiResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty({ description: 'Total number of items available' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  pageSize: number;
})
```

### ❌ `ErrorResponseDto`

Use this format for consistent error responses.

```ts
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty()
  isSuccess: false;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  errorCode?: string;

  @ApiProperty({ required: false })
  details?: Record<string, any>;
}
```

> 📘 Use `ErrorResponseDto` when throwing or returning structured errors like validation failures, permissions, etc.

---

## 📌 Notes

- Keep `data` optional for better compatibility with error responses.
- This standard should be referenced in **onboarding docs**, **internal wikis**, and **contributor guides**.
- Future extensions (e.g., pagination, metadata) should wrap this base type.

---

> ✅ **This interface is now official and must be followed throughout the Roei backend app.**

Feel free to request variants like `PaginatedApiResponseDto<T>`.
