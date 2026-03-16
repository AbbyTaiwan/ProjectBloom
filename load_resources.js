import { db, collection, query, where, onSnapshot, deleteDoc, doc } from './firebase-config.js';

export function initGoalResources(goalId) {
    const resourceList = document.getElementById('resourceList');
    const resCount = document.getElementById('resCount');

    if (!resourceList || !resCount) return;

    // Listen to Firestore for resources matching this goal
    const q = query(collection(db, "resources"), where("stage", ">=", goalId), where("stage", "<=", goalId + '\\uf8ff'));

    onSnapshot(q, (snapshot) => {
        const resources = snapshot.docs.map(docSnap => ({ fbId: docSnap.id, ...docSnap.data() }));

        // Sort by date descending
        resources.sort((a, b) => new Date(b.date) - new Date(a.date));

        resCount.innerText = resources.length;
        resourceList.innerHTML = '';

        if (resources.length === 0) {
            resourceList.innerHTML = '<div class="text-[13px] text-slate-500 italic p-3 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">尚無共享資源<br><span class="text-[11px]">No resources yet</span></div>';
            return;
        }

        resources.forEach(res => {
            const isDoc = res.type === 'doc' || res.type === 'docx' || res.type === 'xlsx';
            let icon = 'description';
            if (res.type === 'pdf') { icon = 'picture_as_pdf'; }
            else if (res.type === 'link') { icon = 'link'; }
            else if (!isDoc && res.type !== 'unknown') { icon = 'image'; }

            const color = (isDoc || res.type === 'pdf') ? 'blue' : (res.type === 'link' ? 'emerald' : 'purple');

            resourceList.innerHTML += `
                <div class="group flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-${color}-200 hover:shadow-sm transition-all cursor-pointer" onclick="window.previewGoalResource('${res.fileUrl || ''}', '${res.fileName}')">
                    <div class="size-8 rounded-lg bg-${color}-50 text-${color}-600 flex items-center justify-center flex-shrink-0">
                        <span class="material-icons-outlined text-[18px]">${icon}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-semibold text-slate-900 truncate pr-6 relative" title="${res.title}">
                            ${res.title}
                            <!-- Delete Button (Only visible on hover) -->
                            <button onclick="window.deleteGoalResource(event, '${res.fbId}')" class="absolute right-0 top-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2" title="刪除資源">
                                <span class="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </h4>
                        <p class="text-[11px] text-slate-500 truncate mt-0.5">${res.desc}</p>
                        <div class="flex items-center gap-2 mt-2">
                            <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">${res.type}</span>
                            <span class="text-[10px] text-slate-400">${res.date.substring(5)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }, (error) => {
        console.error("Error fetching goal resources:", error);
    });
}

// Global delete function for the inline onclick handler
window.deleteGoalResource = async function (event, fbId) {
    if (event) {
        event.stopPropagation(); // Prevent the parent card's onclick from firing
    }

    if (confirm('確定要刪除這份資源嗎？ / Delete this resource?')) {
        try {
            await deleteDoc(doc(db, "resources", fbId));
            console.log("Resource deleted successfully");
            // Optional: alert('Deleted successfully');
        } catch (e) {
            console.error("Error deleting resource", e);
            alert("Delete failed: " + e.message);
        }
    }
};

// Global preview/download function for the inline onclick handler
window.previewGoalResource = function (fileUrl, fileName) {
    if (fileUrl && fileUrl !== 'null' && fileUrl !== 'undefined' && fileUrl !== '') {
        window.open(fileUrl, '_blank');
    } else {
        alert('這是一個純文字/連結資源或遺失了檔案網址：\\n' + fileName);
    }
};
