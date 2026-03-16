import os
import re

root = r'd:\Abby_projects\ProjectBloom'
goals_dir = os.path.join(root, 'goals')

pattern = re.compile(r'<script>\s*// Load and Render Resources for Goal \d+.*?initGoalResources\([^)]+\);\s*</script>', re.DOTALL)

count = 0
for file in os.listdir(goals_dir):
    if file.startswith('g') and file.endswith('.html'):
        path = os.path.join(goals_dir, file)
        
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        goal_num = file[1:3]
        goal_id = f"Goal {goal_num}"

        replacement = f"""<script type="module">
        import {{ initGoalResources }} from "../load_resources.js";
        initGoalResources('{goal_id}');
    </script>"""
        
        new_content = re.sub(pattern, replacement, content)

        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated script tags in {file}")
        else:
            print(f"Skipped {file} - regex mismatch")

print(f"Total updated: {count} files")
