import type { Metadata } from "next";
import { BuiltWithClient } from "./built-with-client";

export const metadata: Metadata = {
  title: "Bibliography — KWD",
  description: "Tools, technologies, and references used to build KWD — Kesararam With Digital.",
};

export default function BuiltWithPage() {
  return <BuiltWithClient />;
}
