# PowerShell script to generate G06-G15 HTML files based on g01.html template

$template = Get-Content "d:\Abby_projects\ProjectBloom\stitch\goals\g01.html" -Raw

$goals = @(
    @{
        num = "06"
        badge_bg = "bg-pink-100"
        badge_text = "text-pink-800"
        title_zh = "母嬰心理連結與未來規劃"
        title_en = "Mother-Baby Bonding & Future Planning"
        root_zh = "母嬰連結"
        root_en = "Bonding"
        children = @(
            @{id="prenatal"; zh="產前準備"; en="Prenatal"},
            @{id="attachment"; zh="情感連結"; en="Attachment"},
            @{id="parenting"; zh="育兒計畫"; en="Parenting"},
            @{id="planning"; zh="未來規劃"; en="Planning"}
        )
    },
    @{
        num = "07"
        badge_bg = "bg-teal-100"
        badge_text = "text-teal-800"
        title_zh = "機構內互助資產建立"
        title_en = "Building Mutual Aid Capital"
        root_zh = "互助資產"
        root_en = "Mutual Aid"
        children = @(
            @{id="network"; zh="人際網絡"; en="Network"},
            @{id="resources"; zh="資源共享"; en="Resources"},
            @{id="support"; zh="互助關係"; en="Support"},
            @{id="community"; zh="社群建立"; en="Community"}
        )
    },
    @{
        num = "08"
        badge_bg = "bg-red-100"
        badge_text = "text-red-800"
        title_zh = "最終生命路徑決策"
        title_en = "Final Life Path Decision"
        root_zh = "生命決策"
        root_en = "Life Decision"
        children = @(
            @{id="keep"; zh="留養選擇"; en="Keep Baby"},
            @{id="adoption"; zh="出養選擇"; en="Adoption"},
            @{id="support"; zh="支持系統"; en="Support"},
            @{id="assessment"; zh="決策評估"; en="Assessment"}
        )
    },
    @{
        num = "09"
        badge_bg = "bg-cyan-100"
        badge_text = "text-cyan-800"
        title_zh = "建立正式支持系統"
        title_en = "Establishing Formal Support System"
        root_zh = "支持系統"
        root_en = "Support System"
        children = @(
            @{id="healthcare"; zh="醫療資源"; en="Healthcare"},
            @{id="social"; zh="社福服務"; en="Social Services"},
            @{id="legal"; zh="法律協助"; en="Legal Aid"},
            @{id="financial"; zh="經濟支援"; en="Financial"}
        )
    },
    @{
        num = "10"
        badge_bg = "bg-fuchsia-100"
        badge_text = "text-fuchsia-800"
        title_zh = "公開認證與慶祝成功"
        title_en = "Recognition & Celebration of Success"
        root_zh = "慶祝成功"
        root_en = "Celebration"
        children = @(
            @{id="recognition"; zh="成就認證"; en="Recognition"},
            @{id="milestones"; zh="里程碑"; en="Milestones"},
            @{id="sharing"; zh="公開分享"; en="Sharing"},
            @{id="affirmation"; zh="自我肯定"; en="Affirmation"}
        )
    },
    @{
        num = "11"
        badge_bg = "bg-lime-100"
        badge_text = "text-lime-800"
        title_zh = "機構共養資源共享"
        title_en = "Institutional Resource Sharing"
        root_zh = "資源共享"
        root_en = "Resource Sharing"
        children = @(
            @{id="coparenting"; zh="共同養育"; en="Co-parenting"},
            @{id="materials"; zh="物資共享"; en="Materials"},
            @{id="exchange"; zh="經驗交流"; en="Exchange"},
            @{id="network"; zh="互助網絡"; en="Network"}
        )
    },
    @{
        num = "12"
        badge_bg = "bg-orange-100"
        badge_text = "text-orange-800"
        title_zh = "經驗傳承與同儕支持"
        title_en = "Mentoring & Peer Support"
        root_zh = "同儕支持"
        root_en = "Peer Support"
        children = @(
            @{id="sharing"; zh="經驗分享"; en="Sharing"},
            @{id="groups"; zh="互助小組"; en="Groups"},
            @{id="mentoring"; zh="導師制度"; en="Mentoring"},
            @{id="community"; zh="社群連結"; en="Community"}
        )
    },
    @{
        num = "13"
        badge_bg = "bg-yellow-100"
        badge_text = "text-yellow-800"
        title_zh = "咖啡廳服務職能提升"
        title_en = "Cafe Service Skill Enhancement"
        root_zh = "咖啡職能"
        root_en = "Cafe Skills"
        children = @(
            @{id="coffee"; zh="咖啡技術"; en="Coffee Making"},
            @{id="service"; zh="客戶服務"; en="Service"},
            @{id="management"; zh="店務管理"; en="Management"},
            @{id="teamwork"; zh="團隊協作"; en="Teamwork"}
        )
    },
    @{
        num = "14"
        badge_bg = "bg-blue-100"
        badge_text = "text-blue-800"
        title_zh = "理財規劃與收支平衡"
        title_en = "Financial Planning & Balance"
        root_zh = "理財規劃"
        root_en = "Financial Planning"
        children = @(
            @{id="budgeting"; zh="預算管理"; en="Budgeting"},
            @{id="saving"; zh="儲蓄計畫"; en="Saving"},
            @{id="income"; zh="收入來源"; en="Income"},
            @{id="goals"; zh="財務目標"; en="Goals"}
        )
    },
    @{
        num = "15"
        badge_bg = "bg-violet-100"
        badge_text = "text-violet-800"
        title_zh = "離園準備與社區融入"
        title_en = "Exit Preparation & Community Integration"
        root_zh = "社區融入"
        root_en = "Community"
        children = @(
            @{id="independent"; zh="獨立生活"; en="Independent Living"},
            @{id="resources"; zh="社區資源"; en="Resources"},
            @{id="relationships"; zh="人際關係"; en="Relationships"},
            @{id="support"; zh="持續支持"; en="Support"}
        )
    }
)

foreach ($goal in $goals) {
    $output = $template
    
    # Replace title
    $output = $output -replace '<title>Goal 01: 生理安全感與情緒穩定 / Bio-Safety & Emotional Stability</title>', 
                               "<title>Goal $($goal.num): $($goal.title_zh) / $($goal.title_en)</title>"
    
    # Replace badge
    $output = $output -replace 'bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-2">GOAL 01',
                               "$($goal.badge_bg) $($goal.badge_text) text-xs font-bold px-3 py-1 rounded-full mb-2`">GOAL $($goal.num)"
    
    # Replace sidebar titles
    $output = $output -replace '<h2 class="text-xl font-bold text-slate-900 mb-2">生理安全感與情緒穩定</h2>',
                               "<h2 class=`"text-xl font-bold text-slate-900 mb-2`">$($goal.title_zh)</h2>"
    $output = $output -replace '<p class="text-sm text-slate-600">Bio-Safety & Emotional Stability</p>',
                               "<p class=`"text-sm text-slate-600`">$($goal.title_en)</p>"
    
    # Replace storageKey
    $output = $output -replace "storageKey: 'goal-01-mindmap'",
                               "storageKey: 'goal-$($goal.num)-mindmap'"
    
    # Build children array for JavaScript
    $childrenJS = ""
    foreach ($child in $goal.children) {
        $childrenJS += @"
                            {
                                id: '$($child.id)',
                                zh: '$($child.zh)',
                                en: '$($child.en)',
                                children: []
                            },

"@
    }
    $childrenJS = $childrenJS.TrimEnd(",`n")
    
    # Replace defaultData
    $defaultDataPattern = "const defaultData = \{[.\s\S]*?\};"
    $newDefaultData = @"
const defaultData = {
                        id: 'root',
                        zh: '$($goal.root_zh)',
                        en: '$($goal.root_en)',
                        children: [
$childrenJS
                        ]
                    };
"@
    $output = $output -replace $defaultDataPattern, $newDefaultData
    
    # Replace console log message
    $output = $output -replace "✓ Goal 01 Mind Map initialized successfully",
                               "✓ Goal $($goal.num) Mind Map initialized successfully"
    
    # Write to file
    $outputPath = "d:\Abby_projects\ProjectBloom\stitch\goals\g$($goal.num).html"
    $output | Out-File -FilePath $outputPath -Encoding UTF8
    Write-Host "Created $outputPath"
}

Write-Host "`nAll files created successfully!"
