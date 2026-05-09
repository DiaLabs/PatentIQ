import { Suspense } from "react";
import SubmitForm from "./submit-form";

export default function SubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SubmitForm />
    </Suspense>
  );
}
