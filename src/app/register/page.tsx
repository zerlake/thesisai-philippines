import { RegisterPage } from "@/components/register-page";
import { RegisterPageSkeleton } from "@/components/register-page-skeleton";
import { Suspense } from "react";

export default function Register() {
  return (
    <Suspense fallback={<RegisterPageSkeleton />}>
      <RegisterPage />
    </Suspense>
  );
}