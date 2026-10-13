import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="mb-8 text-2xl font-medium">Ingresar</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
