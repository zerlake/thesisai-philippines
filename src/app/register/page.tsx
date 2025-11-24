import { RegisterPage } from "@/components/register-page";
import { BrandedLoader } from "@/components/branded-loader";
import { Suspense } from "react";

export const metadata = {
  title: "Sign Up | ThesisAI",
  description: "Create your ThesisAI account in 3 easy steps",
};

export default function Register() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <RegisterPage />
    </Suspense>
  );
}