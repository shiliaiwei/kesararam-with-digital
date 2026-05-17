import re

with open("src/components/admin/questions/question-form-modal.tsx", "r") as f:
    content = f.read()

# Replace parseQuickText
old_parse = """    const parseQuickText = (text: string) => {
        const lines = text.split("\\n").map(l => l.trim()).filter(Boolean);
        return lines.map(line => ({
            text: line.replace(/^[*✓✔►\\-•]\\s*/, "").trim(),
            correct: /^[*✓✔►]/.test(line),
        }));
    };"""

new_parse = """    const parseQuickText = (text: string, type: string) => {
        const lines = text.split("\\n").map(l => l.trim()).filter(Boolean);
        if (type === "MATCHING") {
            return lines.map(line => ({ text: line, correct: true }));
        } else if (type === "FILL_BLANK") {
            return lines.map(line => ({ text: line, correct: true }));
        } else if (type === "TRUE_FALSE") {
            // Usually we pre-fill, but if they paste, we can just take it
            return lines.map(line => ({
                text: line.replace(/^[*✓✔►\\-•]\\s*/, "").trim(),
                correct: /^[*✓✔►]/.test(line),
            }));
        } else {
            return lines.map(line => ({
                text: line.replace(/^[*✓✔►\\-•]\\s*/, "").trim(),
                correct: /^[*✓✔►]/.test(line),
            }));
        }
    };"""
content = content.replace(old_parse, new_parse)

# Update handleQuickPaste
old_paste = """    const handleQuickPaste = (text: string) => {
        setQuickText(text);
        setQuickAnswers(parseQuickText(text));
    };"""
new_paste = """    const handleQuickPaste = (text: string) => {
        setQuickText(text);
        setQuickAnswers(parseQuickText(text, qType));
    };"""
content = content.replace(old_paste, new_paste)

# Add type selector to quick mode
quick_mode_start = """                        {!isPreSelected && (
                            <div className="grid grid-cols-2 gap-3">"""
                            
type_selector = """                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Question Type *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {Q_TYPES.map(t => (
                                    <button key={t.value} type="button" onClick={() => { handleTypeChange(t.value); setQuickAnswers(parseQuickText(quickText, t.value)); }}
                                        className={`p-2 border-2 border-black text-left transition-all ${qType === t.value ? "bg-yellow-400 shadow-[2px_2px_0_#000]" : "bg-white hover:shadow-[2px_2px_0_#000]"}`}>
                                        <div className="font-black text-[10px]">{t.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!isPreSelected && ("""
content = content.replace(quick_mode_start, type_selector)

# Update UI instructions in quick mode
old_answers_label = """                            <label className="block text-xs font-black uppercase mb-1">
                                Answers — one per line
                                <span className="ml-2 text-zinc-400 font-medium normal-case text-xs">Start with * to mark correct answer</span>
                            </label>"""
new_answers_label = """                            <label className="block text-xs font-black uppercase mb-1">
                                Answers — one per line
                                <span className="ml-2 text-zinc-400 font-medium normal-case text-xs">
                                    {qType === "MATCHING" ? "Enter pairs separated by = (e.g. Red = Stop)" : 
                                     qType === "FILL_BLANK" ? "Enter the correct word(s)" : 
                                     "Start with * to mark correct answer"}
                                </span>
                            </label>"""
content = content.replace(old_answers_label, new_answers_label)

with open("src/components/admin/questions/question-form-modal.tsx", "w") as f:
    f.write(content)

print("Updated quick mode")
