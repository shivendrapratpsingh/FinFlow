import { redirect } from "next/navigation";

/**
 * Root page — redirect to dashboard if logged in, else to login.
 * Auth check happens in middleware.tsx.
 */
export default function Home() {
  redirect("/dashboard");
}
