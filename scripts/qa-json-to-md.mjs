// Convert a Q&A rewrite JSON file into a readable Markdown review doc.
// Usage: node scripts/qa-json-to-md.mjs docs/qa-rewrite/sample-v2.json docs/qa-rewrite/sample-v2.md
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node scripts/qa-json-to-md.mjs <in.json> <out.md>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(inPath, "utf-8"));
const items = data.items ?? [];

const out = [];
out.push(`# KWD Q&A Rewrite — ${data.meta?.version ?? "review"} (Markdown view)`);
out.push("");
out.push(`> Auto-generated from \`${inPath}\`. **${items.length} questions.** ${data.meta?.status ?? ""}`);
out.push("");

let lastTopic = null;
for (const q of items) {
  if (q.topicCode !== lastTopic) {
    lastTopic = q.topicCode;
    out.push("");
    out.push(`## Topic \`${q.topicCode}\` (topic_id ${q.topicId}) — ${q.categorySlug} · ${q.subGroup ?? ""}`);
    if (q.questionImageUrl) out.push(`Image: ${q.questionImageUrl}`);
    out.push("");
  }
  out.push(`**${q.id}** · ${q.difficulty} · ${q.questionType}${q.questionImageUrl ? " · 🖼 image" : ""}`);
  out.push(`- **KM:** ${q.questionKm}`);
  out.push(`- **EN:** ${q.questionEn}`);
  for (const a of q.answers ?? []) {
    const mark = a.isCorrect ? "✅" : "▫️";
    const img = a.imageUrl ? ` _(img: ${a.imageUrl})_` : "";
    out.push(`  - ${mark} ${a.answerKm} / ${a.answerEn}${img}`);
  }
  if (q.explanationKm || q.explanationEn) {
    out.push(`  - 💡 **KM:** ${q.explanationKm}`);
    out.push(`  - 💡 **EN:** ${q.explanationEn}`);
  }
  out.push("");
}

writeFileSync(outPath, out.join("\n"));
console.log(`Wrote ${outPath} (${items.length} questions)`);
