// Mock user — replaces auth for MVP/demo.
// In production this would come from NextAuth or JWT session.

export interface MockUser {
  id: string;
  name: string;
  email: string;
  planType: "free" | "pro";
}

export const MOCK_USER: MockUser = {
  id: "mock-user-001",
  name: "Demo User",
  email: "demo@sarthi.ai",
  planType: "pro",
};
