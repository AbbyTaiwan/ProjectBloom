import os
import re

root = r'd:\Abby_projects\ProjectBloom'
goals_dir = os.path.join(root, 'goals')

# 1. Read g01.html to extract class MindMap
g01_path = os.path.join(goals_dir, 'g01.html')
with open(g01_path, 'r', encoding='utf-8') as f:
    g01 = f.read()

match = re.search(r'(class MindMap \{.*?\n        \})\n\n        // ============================================', g01, re.DOTALL)
if not match:
    print("Failed to match MindMap class")
    exit(1)

mindmap_code = match.group(1)

# Make it exportable
mindmap_code = mindmap_code.replace('class MindMap {', 'export class MindMap {')

# Prepend imports
header = "import { db, doc, onSnapshot, setDoc } from './firebase-config.js';\n\n"
mindmap_code = header + mindmap_code

# Replace saveData()
old_save = """            saveData() {
                localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            }"""
new_save = """            saveData() {
                localStorage.setItem(this.storageKey, JSON.stringify(this.data));
                setDoc(doc(db, "mindmaps", this.storageKey), {
                    data: this.data,
                    updatedAt: new Date().toISOString()
                }).catch(e => console.error("Firebase sync error", e));
            }"""
mindmap_code = mindmap_code.replace(old_save, new_save)

# Replace init() to include onSnapshot
init_anchor = """                resizeObserver.observe(parent);\n            }"""
new_init = """                resizeObserver.observe(parent);

                // Firebase Sync
                onSnapshot(doc(db, "mindmaps", this.storageKey), (snapshot) => {
                    if (snapshot.exists()) {
                        this.data = snapshot.data().data;
                        this.updatePositions();
                        this.g.selectAll('*').remove();
                        this.render();
                    }
                });
            }"""
mindmap_code = mindmap_code.replace(init_anchor, new_init)

# Write to root mindmap.js
with open(os.path.join(root, 'mindmap.js'), 'w', encoding='utf-8') as f:
    f.write(mindmap_code)

print("Created mindmap.js")

# 2. Modify all g*.html
count = 0
for file in os.listdir(goals_dir):
    if file.startswith('g') and file.endswith('.html'):
        path = os.path.join(goals_dir, file)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = re.sub(
            r'<script>\s*// ============================================\s*// Mind Map Component.*?\n        \}\s*// ============================================',
            '<script type="module">\\n        import { MindMap } from "../mindmap.js";\\n\\n        // ============================================',
            content,
            flags=re.DOTALL
        )
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
        else:
            print(f"Skipped {file} - regex mismatch")

print(f"Updated {count} files")
