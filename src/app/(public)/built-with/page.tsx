import type { Metadata } from "next";
import { BuiltWithClient } from "./built-with-client";

export const metadata: Metadata = {
  title: "Bibliography — Kesararam With Digital",
  description: "Tools, technologies, and references used to build Kesararam With Digital — Kesararam With Digital.",
};

export default function BuiltWithPage() {
  return <BuiltWithClient />;
}
