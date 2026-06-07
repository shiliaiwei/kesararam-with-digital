import re

with open("src/components/admin/questions/question-form-modal.tsx", "r") as f:
    content = f.read()

old_json_template = """const JSON_TEMPLATE = `[
  {
    "q": "What is the maximum speed limit in a built-up area?",
    "qkm": "ល្បឿនកំណត់អតិបរមានៅក្នុងតំបន់ដែលមានប្រជាជនរស់នៅ?",
    "type": "mcq",
    "diff": "easy",
    "hint": "Look for speed limit signs",
    "image": "auto",
    "answers": [
      { "a": "40 km/h", "akm": "៤០ គ.ម/ម", "correct": true },
      { "a": "60 km/h", "akm": "៦០ គ.ម/ម" },
      { "a": "80 km/h", "akm": "៨០ គ.ម/ម" },
      { "a": "100 km/h", "akm": "១០០ គ.ម/ម" }
    ]
  },
  {
    "q": "This sign is a street name sign.",
    "qkm": "សញ្ញានេះជាសញ្ញាឈ្មោះផ្លូវ។",
    "type": "true-false",
    "diff": "easy",
    "image": "auto",
    "answers": [
      { "a": "True", "akm": "ពិត", "correct": true },
      { "a": "False", "akm": "មិនពិត" }
    ]
  },
  {
    "q": "Which statements are TRUE about this sign?",
    "qkm": "ចំណុចណាខ្លះជាការពិតអំពីសញ្ញានេះ?",
    "type": "multi-select",
    "diff": "medium",
    "image": "auto",
    "answers": [
      { "a": "It identifies a road name", "akm": "វាកំណត់ឈ្មោះផ្លូវ", "correct": true },
      { "a": "It helps drivers navigate", "akm": "វាជួយអ្នកបើកបរធ្វើដំណើរ", "correct": true },
      { "a": "It shows the speed limit", "akm": "វាបង្ហាញល្បឿនកំណត់" },
      { "a": "It is an informational sign", "akm": "វាជាសញ្ញាព័ត៌មាន", "correct": true }
    ]
  },
  {
    "q": "Which image shows the correct sign for this topic?",
    "qkm": "រូបភាពណាបង្ហាញសញ្ញាត្រឹមត្រូវសម្រាប់ប្រធានបទនេះ?",
    "type": "image-match",
    "diff": "medium",
    "image": "auto",
    "answers": []
  }
]`;"""

new_json_template = """const JSON_TEMPLATE = `[
  {
    "q": "What is the maximum speed limit in a built-up area?",
    "type": "MCQ_SINGLE",
    "diff": "easy",
    "answers": [
      { "a": "40 km/h", "correct": true },
      { "a": "60 km/h" }
    ]
  },
  {
    "q": "This sign is a street name sign.",
    "type": "TRUE_FALSE",
    "answers": [
      { "a": "True", "correct": true },
      { "a": "False" }
    ]
  },
  {
    "q": "Match the sign color to its meaning.",
    "type": "MATCHING",
    "diff": "medium",
    "answers": [
      { "a": "Red", "akm": "Stop", "correct": true },
      { "a": "Green", "akm": "Go", "correct": true }
    ]
  },
  {
    "q": "You must ___ at a red light.",
    "type": "FILL_BLANK",
    "answers": [
      { "a": "stop", "correct": true }
    ]
  }
]`;"""
content = content.replace(old_json_template, new_json_template)

old_json_guide = """                    <div><span className="text-yellow-400">"type"</span>: <span className="text-green-300">"mcq"</span> <span className="text-zinc-500">// mcq | true-false | multi-select</span></div>"""
new_json_guide = """                    <div><span className="text-yellow-400">"type"</span>: <span className="text-green-300">"MCQ_SINGLE"</span> <span className="text-zinc-500">// MCQ_SINGLE | MCQ_MULTIPLE | TRUE_FALSE | IMAGE_BASED | MATCHING | FILL_BLANK</span></div>"""
content = content.replace(old_json_guide, new_json_guide)

# Replace the type checks inside JsonImportMode
content = content.replace('item.type || item.questionType || "mcq"', 'item.type || item.questionType || "MCQ_SINGLE"')
content = content.replace('item.type || item.questionType) === "image-match"', 'item.type || item.questionType) === "IMAGE_BASED"')
content = content.replace('qType === "image-match"', 'qType === "IMAGE_BASED"')

with open("src/components/admin/questions/question-form-modal.tsx", "w") as f:
    f.write(content)

print("Updated json mode")
