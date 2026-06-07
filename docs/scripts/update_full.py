import re

with open("src/components/admin/questions/question-form-modal.tsx", "r") as f:
    content = f.read()

# Update the answer rendering in Full Mode
old_answer_render = """                                            /* Text answers */
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" value={ans.answerEn} onChange={e => updateAnswer(ans.id, "answerEn", e.target.value)}
                                                    className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                    placeholder="English *" required
                                                    disabled={qType === "true-false"} />
                                                <input type="text" value={ans.answerKm} onChange={e => updateAnswer(ans.id, "answerKm", e.target.value)}
                                                    className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                    placeholder="ខ្មែរ"
                                                    disabled={qType === "true-false"} />
                                            </div>"""

new_answer_render = """                                            /* Text answers */
                                            qType === "MATCHING" ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" value={ans.answerEn} onChange={e => updateAnswer(ans.id, "answerEn", e.target.value)}
                                                        className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                        placeholder="Left Item *" required />
                                                    <input type="text" value={ans.answerKm} onChange={e => updateAnswer(ans.id, "answerKm", e.target.value)}
                                                        className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                        placeholder="Right Item *" required />
                                                </div>
                                            ) : qType === "FILL_BLANK" ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" value={ans.answerEn} onChange={e => updateAnswer(ans.id, "answerEn", e.target.value)}
                                                        className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                        placeholder="Accepted Word (English) *" required />
                                                    <input type="text" value={ans.answerKm} onChange={e => updateAnswer(ans.id, "answerKm", e.target.value)}
                                                        className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                        placeholder="Accepted Word (Khmer)" />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" value={ans.answerEn} onChange={e => updateAnswer(ans.id, "answerEn", e.target.value)}
                                                        className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                        placeholder="English *" required
                                                        disabled={qType === "TRUE_FALSE"} />
                                                    <input type="text" value={ans.answerKm} onChange={e => updateAnswer(ans.id, "answerKm", e.target.value)}
                                                        className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                        placeholder="ខ្មែរ"
                                                        disabled={qType === "TRUE_FALSE"} />
                                                </div>
                                            )"""
content = content.replace(old_answer_render, new_answer_render)

# Update the correct toggle button to be hidden or force-checked for MATCHING / FILL_BLANK
old_correct_toggle = """                                    {/* Correct toggle */}
                                    <button type="button" onClick={() => toggleCorrect(ans.id)}
                                        className={`mt-1 w-7 h-7 flex-shrink-0 border-2 border-black flex items-center justify-center transition-all ${ans.isCorrect ? "bg-green-500" : "bg-white hover:bg-gray-100"}`}>
                                        {ans.isCorrect ? <CheckCircle size={15} className="text-white" /> : <span className="text-xs font-black text-zinc-400">{String.fromCharCode(65 + i)}</span>}
                                    </button>"""
new_correct_toggle = """                                    {/* Correct toggle */}
                                    <button type="button" onClick={() => { if(qType !== "MATCHING" && qType !== "FILL_BLANK") toggleCorrect(ans.id); }}
                                        className={`mt-1 w-7 h-7 flex-shrink-0 border-2 border-black flex items-center justify-center transition-all ${(ans.isCorrect || qType === "MATCHING" || qType === "FILL_BLANK") ? "bg-green-500" : "bg-white hover:bg-gray-100"}`}>
                                        {(ans.isCorrect || qType === "MATCHING" || qType === "FILL_BLANK") ? <CheckCircle size={15} className="text-white" /> : <span className="text-xs font-black text-zinc-400">{String.fromCharCode(65 + i)}</span>}
                                    </button>"""
content = content.replace(old_correct_toggle, new_correct_toggle)

# Update the Tip message
old_tip = """                            <span className="text-xs font-bold text-blue-800">
                                {qType === "image-match"
                                    ? "Correct image is auto-linked from the topic. Add 3 distractor images from the same category."
                                    : qType === "multi-select"
                                        ? "Click the checkbox to mark multiple correct answers."
                                        : "Click the letter button to mark the correct answer."}
                            </span>"""
new_tip = """                            <span className="text-xs font-bold text-blue-800">
                                {qType === "IMAGE_BASED"
                                    ? "Correct image is auto-linked from the topic. Add 3 distractor images from the same category."
                                    : qType === "MCQ_MULTIPLE"
                                        ? "Click the checkbox to mark multiple correct answers."
                                        : qType === "MATCHING"
                                            ? "Enter matching pairs. Left and right sides will be shuffled automatically."
                                            : qType === "FILL_BLANK"
                                                ? "Enter all accepted valid words for the blank."
                                                : "Click the letter button to mark the correct answer."}
                            </span>"""
content = content.replace(old_tip, new_tip)

# Replace "true-false" -> "TRUE_FALSE" in conditionals
content = content.replace('qType === "true-false"', 'qType === "TRUE_FALSE"')
content = content.replace('qType !== "true-false"', 'qType !== "TRUE_FALSE"')
content = content.replace('qType === "image-match"', 'qType === "IMAGE_BASED"')
content = content.replace('qType !== "image-match"', 'qType !== "IMAGE_BASED"')

with open("src/components/admin/questions/question-form-modal.tsx", "w") as f:
    f.write(content)

print("Updated full mode")
