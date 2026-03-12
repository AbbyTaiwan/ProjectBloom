const fs = require('fs');

const cleanHtml = fs.readFileSync('d:/Abby_projects/ProjectBloom/stitch/goals/g01.html', 'utf8');
const g01SplitPoint = cleanHtml.indexOf('<!-- Shared Resources List -->');
if (g01SplitPoint === -1) throw new Error("Could not find g01 split point");
const newContentTail = cleanHtml.substring(g01SplitPoint);

const goals = ['02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'];

for (const num of goals) {
    const filePath = 'd:/Abby_projects/ProjectBloom/stitch/goals/g' + num + '.html';

    if (fs.existsSync(filePath)) {
        let origContent = fs.readFileSync(filePath, 'utf8');

        const splitPoint = origContent.indexOf('<button id="clear-btn"');
        if (splitPoint !== -1) {
            let tailoredTail = newContentTail.replace(
                /const goalRes = allRes\.filter\(r => r\.stage === 'Goal 01'\);/,
                "const goalRes = allRes.filter(r => r.stage === 'Goal " + num + "');"
            );

            let finalHTML = origContent.substring(0, splitPoint).replace(/\s+$/, '') + '\n                ' + tailoredTail;
            fs.writeFileSync(filePath, finalHTML);
            console.log('Fixed ' + num);
        }
    }
}
