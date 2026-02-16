# Testing Guide - Mini Habit Tracker Frontend

This document covers the testing strategy, setup, and guidelines for the Mini Habit Tracker frontend application.

## Table of Contents

- [Current State](#current-state)
- [Recommended Testing Setup](#recommended-testing-setup)
- [Installation](#installation)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Testing Strategy](#testing-strategy)
- [Writing Tests](#writing-tests)
- [Test Examples](#test-examples)
- [Mocking](#mocking)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Current State

The project is in early development and does **not yet have a testing framework configured**. This document provides a comprehensive guide for setting up and implementing tests.

## Recommended Testing Setup

| Tool                      | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| **Jest**                  | Test runner and assertion library         |
| **React Testing Library** | Component testing with DOM queries        |
| **jest-environment-jsdom**| Browser-like environment for tests        |
| **ts-jest**               | TypeScript support for Jest               |
| **MSW (Mock Service Worker)** | API mocking for integration tests    |

### Why Jest + React Testing Library?

- **Jest** is the most widely used JavaScript test runner with excellent TypeScript support, snapshot testing, and built-in mocking
- **React Testing Library** encourages testing components the way users interact with them, not implementation details
- **MSW** intercepts network requests at the service worker level, allowing realistic API mocking without modifying application code

## Installation

### Step 1: Install testing dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest @types/jest msw
```

### Step 2: Create Jest configuration

Create `jest.config.ts` in the project root:

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
  ],
};

export default createJestConfig(config);
```

### Step 3: Create test setup file

Create `jest.setup.ts` in the project root:

```typescript
import "@testing-library/jest-dom";
```

### Step 4: Add test scripts to package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default"
  }
}
```

### Step 5: Set up MSW for API mocking

Create `src/__mocks__/handlers.ts`:

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({ message: "Login successful" });
    }
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  http.post("/api/auth/signup", async () => {
    return HttpResponse.json({ message: "Signup successful" }, { status: 201 });
  }),

  http.get("/habits", () => {
    return HttpResponse.json([
      {
        _id: "habit1",
        name: "Read 10 pages",
        totalLogs: 15,
        streak: 3,
        loggedToday: false,
      },
      {
        _id: "habit2",
        name: "Meditate 5 minutes",
        totalLogs: 30,
        streak: 7,
        loggedToday: true,
      },
    ]);
  }),

  http.post("/api/habits/:id/log", () => {
    return HttpResponse.json({ message: "Logged" });
  }),

  http.post("/api/habits/:id/unlog", () => {
    return HttpResponse.json({ message: "Unlogged" });
  }),

  http.delete("/api/habits/:id", () => {
    return HttpResponse.json({ message: "Deleted" });
  }),
];
```

Create `src/__mocks__/server.ts`:

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

Update `jest.setup.ts`:

```typescript
import "@testing-library/jest-dom";
import { server } from "./src/__mocks__/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Test Structure

Organize tests alongside the source files they test:

```
src/
├── app/
│   ├── page.tsx
│   ├── page.test.tsx              # Home page tests
│   ├── login/
│   │   ├── page.tsx
│   │   └── page.test.tsx          # Login page tests
│   ├── signup/
│   │   ├── page.tsx
│   │   └── page.test.tsx          # Signup page tests
│   └── dashboard/
│       ├── page.tsx
│       └── page.test.tsx          # Dashboard page tests
├── components/
│   ├── Navbar.tsx
│   ├── Navbar.test.tsx            # Navbar tests
│   ├── HabitCard.tsx
│   └── HabitCard.test.tsx         # HabitCard tests
└── __mocks__/
    ├── handlers.ts                # MSW request handlers
    └── server.ts                  # MSW server setup
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npx jest src/components/HabitCard.test.tsx

# Run tests matching a pattern
npx jest --testPathPattern="login"
```

## Testing Strategy

### Testing Pyramid

```
         /  E2E  \          ← Few: Critical user flows
        /----------\
       / Integration \      ← Some: Page-level interactions
      /----------------\
     /   Unit (Component) \  ← Many: Individual components
    /______________________\
```

### What to Test

#### 1. Unit Tests (Components)

Test individual components in isolation with mocked props and dependencies.

| Component   | What to Test                                                    |
| ----------- | --------------------------------------------------------------- |
| `HabitCard` | Renders habit name, stats, log/unlog button, delete button      |
| `HabitCard` | Calls `onLog` when "Log Today" is clicked                       |
| `HabitCard` | Calls `onUnlog` when "Undo" is clicked                          |
| `HabitCard` | Calls `onDelete` when delete button is clicked                  |
| `HabitCard` | Shows correct button based on `loggedToday` status              |
| `Navbar`    | Renders navigation links                                        |
| `Navbar`    | Calls logout API and redirects on logout click                  |

#### 2. Integration Tests (Pages)

Test page-level behavior including form submissions and API calls.

| Page        | What to Test                                                    |
| ----------- | --------------------------------------------------------------- |
| Home        | Renders welcome message and signup/login links                  |
| Login       | Submits credentials and redirects on success                    |
| Login       | Displays error message on failed login                          |
| Login       | Disables form during submission                                 |
| Signup      | Submits registration and redirects to login                     |
| Signup      | Displays error message on failed signup                         |
| Dashboard   | Fetches and displays habit list                                 |
| Dashboard   | Redirects to login when unauthenticated                         |

#### 3. End-to-End Tests (Optional, with Playwright/Cypress)

Full user flow testing with a real browser:

- Complete signup → login → create habit → log habit → logout flow
- Authentication redirect behavior
- Error handling across the app

## Writing Tests

### Component Test Template

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComponentName from "./ComponentName";

describe("ComponentName", () => {
  it("renders correctly with required props", () => {
    render(<ComponentName prop1="value" />);
    expect(screen.getByText("expected text")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<ComponentName onClick={handleClick} />);
    await user.click(screen.getByRole("button", { name: /click me/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Page Test Template (Client Component)

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("LoginPage", () => {
  it("submits the login form", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      // Assert redirect or success behavior
    });
  });

  it("displays error on invalid credentials", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });
  });
});
```

## Test Examples

### HabitCard Component Test

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HabitCard from "./HabitCard";

const mockHabit = {
  _id: "habit1",
  name: "Read 10 pages",
  totalLogs: 15,
  streak: 3,
  loggedToday: false,
};

describe("HabitCard", () => {
  const defaultProps = {
    habit: mockHabit,
    onLog: jest.fn(),
    onUnlog: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the habit name", () => {
    render(<HabitCard {...defaultProps} />);
    expect(screen.getByText("Read 10 pages")).toBeInTheDocument();
  });

  it("displays total logs and streak", () => {
    render(<HabitCard {...defaultProps} />);
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("shows 'Log Today' button when not logged", () => {
    render(<HabitCard {...defaultProps} />);
    expect(screen.getByRole("button", { name: /log today/i })).toBeInTheDocument();
  });

  it("shows 'Undo' button when already logged", () => {
    const loggedHabit = { ...mockHabit, loggedToday: true };
    render(<HabitCard {...defaultProps} habit={loggedHabit} />);
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
  });

  it("calls onLog when 'Log Today' is clicked", async () => {
    const user = userEvent.setup();
    render(<HabitCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /log today/i }));
    expect(defaultProps.onLog).toHaveBeenCalledWith("habit1");
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<HabitCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(defaultProps.onDelete).toHaveBeenCalledWith("habit1");
  });
});
```

### Navbar Component Test

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Navbar", () => {
  it("renders the app title", () => {
    render(<Navbar />);
    expect(screen.getByText(/habit tracker/i)).toBeInTheDocument();
  });

  it("renders the logout button", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logout API when logout is clicked", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" })
    );
  });
});
```

## Mocking

### Mocking Next.js Router

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));
```

### Mocking fetch Calls

```typescript
// Simple mock
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ message: "Success" }),
});

// With different responses per call
global.fetch = jest
  .fn()
  .mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "First call" }),
  })
  .mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({ error: "Unauthorized" }),
  });
```

### Mocking with MSW (Recommended for Integration Tests)

```typescript
import { http, HttpResponse } from "msw";
import { server } from "../__mocks__/server";

it("handles server error", async () => {
  // Override default handler for this specific test
  server.use(
    http.post("/api/auth/login", () => {
      return HttpResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    })
  );

  // ... test code that expects error handling
});
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Run linter
        working-directory: frontend
        run: npm run lint

      - name: Run tests
        working-directory: frontend
        run: npm run test:ci

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: frontend/coverage/
```

## Coverage Goals

| Metric     | Target  | Description                              |
| ---------- | ------- | ---------------------------------------- |
| Statements | > 80%   | Percentage of code statements executed   |
| Branches   | > 75%   | Percentage of conditional branches taken |
| Functions  | > 80%   | Percentage of functions called           |
| Lines      | > 80%   | Percentage of code lines executed        |

Add to `jest.config.ts` to enforce thresholds:

```typescript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
},
```

## Best Practices

1. **Test behavior, not implementation** - Query by role, label, or text, not by class names or test IDs
2. **Use `userEvent` over `fireEvent`** - `userEvent` simulates real browser interactions more accurately
3. **Avoid testing third-party code** - Don't test that Next.js routing works; test that your code calls it correctly
4. **Keep tests independent** - Each test should be able to run in isolation; use `beforeEach` for setup
5. **Use descriptive test names** - Name tests like `"displays error message when login fails"`, not `"test error"`
6. **Mock at the boundary** - Mock API calls, not internal functions; this keeps tests closer to real behavior
7. **Test error states** - Always test what happens when things go wrong (API errors, empty states, invalid input)
8. **Clean up after tests** - Reset mocks and handlers in `afterEach` to prevent test leakage
9. **Avoid snapshot overuse** - Use snapshots sparingly; prefer explicit assertions that describe expected behavior
10. **Run tests before pushing** - Make test runs part of your development workflow
