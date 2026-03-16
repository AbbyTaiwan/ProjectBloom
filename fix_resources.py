import os
import re

root = r'd:\Abby_projects\ProjectBloom'
goals_dir = os.path.join(root, 'goals')

# Replace everything from `function loadResources()` to `window.addEventListener('DOMContentLoaded', loadResources);`
# Or better, just match function loadResources() and remove everything up to window.addEventListener
pattern = re.compile(r'function loadResources\(\) \{.*?window\.addEventListener\([^\)]+\);\s*', re.DOTALL)

count = 0
for file in os.listdir(goals_dir):
    if file.startswith('g') and file.endswith('.html'):
        path = os.path.join(goals_dir, file)
        
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        goal_num = file[1:3]
        goal_id = f"Goal {goal_num}"

        # 1. Inject import if missing
        if 'import { initGoalResources }' not in content:
            content = content.replace(
                'import { MindMap } from "../mindmap.js";',
                'import { MindMap } from "../mindmap.js";\n        import { initGoalResources } from "../load_resources.js";'
            )

        # 2. Replace the old loadResources block
        replacement = f"\n        // Load Resources from Firebase\n        initGoalResources('{goal_id}');\n    "
        new_content = re.sub(pattern, replacement, content)

        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated resources in {file}")
        else:
            print(f"Skipped {file} - regex mismatch")

print(f"Total updated: {count} files")
