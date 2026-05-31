import re

with open("src/components/admin/questions/question-form-modal.tsx", "r") as f:
    content = f.read()

# 1. Update Q_TYPES
old_q_types = """const Q_TYPES = [
    { value: "mcq", label: "Multiple Choice", desc: "One correct answer", min: 2, max: 5, multi: false },
    { value: "true-false", label: "True / False", desc: "Binary choice", min: 2, max: 2, multi: false },
    { value: "multi-select", label: "Multi-Select", desc: "Multiple correct answers", min: 3, max: 5, multi: true },
    { value: "image-match", label: "Image Match", desc: "Pick the correct image", min: 2, max: 4, multi: false },
];"""

new_q_types = """const Q_TYPES = [
    { value: "MCQ_SINGLE", label: "Multiple Choice", desc: "One correct answer", min: 2, max: 5, multi: false },
    { value: "MCQ_MULTIPLE", label: "Multi-Select", desc: "Multiple correct answers", min: 3, max: 5, multi: true },
    { value: "TRUE_FALSE", label: "True / False", desc: "Binary choice", min: 2, max: 2, multi: false },
    { value: "IMAGE_BASED", label: "Image Based", desc: "Visual scenario", min: 2, max: 4, multi: false },
    { value: "MATCHING", label: "Matching", desc: "Match items from two sets", min: 2, max: 6, multi: false },
    { value: "FILL_BLANK", label: "Fill in the Blank", desc: "Missing word(s)", min: 1, max: 5, multi: false },
];"""
content = content.replace(old_q_types, new_q_types)

# 2. Update initial qType
content = content.replace('const [qType, setQType] = useState("mcq");', 'const [qType, setQType] = useState("MCQ_SINGLE");')

# 3. Update handleTypeChange
old_handle_type = """    const handleTypeChange = (type: string) => {
        setQType(type);
        const t = Q_TYPES.find(q => q.value === type)!;
        if (type === "true-false") {
            setAnswers([
                { id: "1", answerEn: "True", answerKm: "ពិត", isCorrect: false },
                { id: "2", answerEn: "False", answerKm: "មិនពិត", isCorrect: false },
            ]);
        } else if (type === "image-match") {
            // Pre-fill correct answer with topic image, 3 distractors
            const correct = topicData?.primaryImageUrl || "";
            const dists = distImages.slice(0, 3);
            const all = [
                { id: "1", answerEn: topicData?.nameEn || "Correct", answerKm: topicData?.nameKm || "", isCorrect: true, imageUrl: correct },
                ...dists.map((img, i) => ({ id: String(i + 2), answerEn: `Option ${i + 2}`, answerKm: "", isCorrect: false, imageUrl: img })),
            ];
            setAnswers(all.length >= 2 ? all : [
                { id: "1", answerEn: "", answerKm: "", isCorrect: true, imageUrl: correct },
                { id: "2", answerEn: "", answerKm: "", isCorrect: false, imageUrl: "" },
            ]);
        } else {
            setAnswers([
                { id: "1", answerEn: "", answerKm: "", isCorrect: false },
                { id: "2", answerEn: "", answerKm: "", isCorrect: false },
            ]);
        }
    };"""

new_handle_type = """    const handleTypeChange = (type: string) => {
        setQType(type);
        if (type === "TRUE_FALSE") {
            setAnswers([
                { id: "1", answerEn: "True", answerKm: "ពិត", isCorrect: false },
                { id: "2", answerEn: "False", answerKm: "មិនពិត", isCorrect: false },
            ]);
        } else if (type === "IMAGE_BASED") {
            const correct = topicData?.primaryImageUrl || "";
            const dists = distImages.slice(0, 3);
            const all = [
                { id: "1", answerEn: topicData?.nameEn || "Correct", answerKm: topicData?.nameKm || "", isCorrect: true, imageUrl: correct },
                ...dists.map((img, i) => ({ id: String(i + 2), answerEn: `Option ${i + 2}`, answerKm: "", isCorrect: false, imageUrl: img })),
            ];
            setAnswers(all.length >= 2 ? all : [
                { id: "1", answerEn: "", answerKm: "", isCorrect: true, imageUrl: correct },
                { id: "2", answerEn: "", answerKm: "", isCorrect: false, imageUrl: "" },
            ]);
        } else if (type === "MATCHING") {
            setAnswers([
                { id: "1", answerEn: "Left 1 = Right 1", answerKm: "", isCorrect: true },
                { id: "2", answerEn: "Left 2 = Right 2", answerKm: "", isCorrect: true },
            ]);
        } else if (type === "FILL_BLANK") {
            setAnswers([
                { id: "1", answerEn: "", answerKm: "", isCorrect: true },
            ]);
        } else {
            setAnswers([
                { id: "1", answerEn: "", answerKm: "", isCorrect: false },
                { id: "2", answerEn: "", answerKm: "", isCorrect: false },
            ]);
        }
    };"""
content = content.replace(old_handle_type, new_handle_type)

with open("src/components/admin/questions/question-form-modal.tsx", "w") as f:
    f.write(content)

print("Updated script")
