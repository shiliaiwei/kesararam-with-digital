with open('src/components/staff/content/category-content-manager.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'placeholder="Image URL (optional)"'
new = 'placeholder="Image URL — shown above answers (use for Image Pick questions)"'
content = content.replace(old, new)

with open('src/components/staff/content/category-content-manager.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done, replaced:", content.count('Image URL'))
