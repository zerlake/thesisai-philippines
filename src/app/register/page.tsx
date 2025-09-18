import { RegisterPage } from "@/components/register-page";
import { BrandedLoader } from "@/components/branded-loader";
import { Suspense } from "react";

export default function Register() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <RegisterPage />
    </Suspense>
  );
}