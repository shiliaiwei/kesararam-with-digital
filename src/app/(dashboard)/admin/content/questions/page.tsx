"use client";

import { Suspense } from "react";
import AdminQuestionsClient from "./questions-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 font-bold text-zinc-500">Loading...</div>}>
      <AdminQuestionsClient />
    </Suspense>
  );
}
