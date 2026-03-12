const fs = require('fs');
const path = require('path');

const goals = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'];

for (const num of goals) {
    const filePath = 'd:/Abby_projects/ProjectBloom/stitch/goals/g' + num + '.html';

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace the button text
        content = content.replace(
            /(<button id="clear-btn"[\s\S]*?>)\s*清除所有數據\s*(<\/button>)/g,
            '$1\n                    清除心智圖\n                $2'
        );

        fs.writeFileSync(filePath, content);
        console.log('Updated ' + num);
    }
}
