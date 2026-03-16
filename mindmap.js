import { db, doc, onSnapshot, setDoc } from './firebase-config.js';

export class MindMap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.storageKey = options.storageKey || 'mindmap-data';
        this.colorScheme = options.colorScheme || this.getDefaultColors();
        this.defaultData = options.defaultData || this.createDefaultRoot('Root');

        this.data = this.loadData();
        this.selectedNode = null;
        this.editingNode = null;
        this.draggedNode = null;

        this.init();
    }

    getDefaultColors() {
        return {
            root: '#4ade80',      // 綠色
            level1: '#60a5fa',    // 藍色
            level2: '#fbbf24',    // 黃色
            level3: '#f87171',    // 紅色
            level4: '#a78bfa',    // 紫色
        };
    }

    createDefaultRoot(text) {
        return {
            id: 'root',
            zh: text,
            en: text,
            children: []
        };
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error loading data:', e);
                return JSON.parse(JSON.stringify(this.defaultData));
            }
        }
        return JSON.parse(JSON.stringify(this.defaultData));
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        setDoc(doc(db, "mindmaps", this.storageKey), {
            data: this.data,
            updatedAt: new Date().toISOString()
        }).catch(e => console.error("Firebase sync error", e));
    }

    init() {
        this.svg = d3.select(`#${this.containerId}`);

        // Get container dimensions
        const container = document.getElementById(this.containerId);
        const parent = container.parentElement;

        // Use computed dimensions
        this.width = parent.offsetWidth || 800;
        this.height = parent.offsetHeight || 600;

        console.log('📐 初始化:', {
            width: this.width,
            height: this.height,
            container: container.tagName,
            parent: parent.tagName,
            parentClass: parent.className
        });

        // Set SVG attributes
        this.svg
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('border', '1px solid #e5e7eb');

        // Setup zoom behavior
        this.g = this.svg.append('g');

        this.zoomBehavior = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoomBehavior);

        // Initial pan/zoom
        this.resetView();

        // First render
        console.log('🎨 執行第一次渲染');
        this.render();

        // Setup event handlers
        this.setupEventHandlers();

        console.log('✓ 初始化完成');

        // Handle window resize
        const resizeObserver = new ResizeObserver(() => {
            const newWidth = parent.offsetWidth;
            const newHeight = parent.offsetHeight;
            if (newWidth !== this.width || newHeight !== this.height) {
                this.width = newWidth;
                this.height = newHeight;
                this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
                this.render();
            }
        });
        resizeObserver.observe(parent);

        // Firebase Sync
        onSnapshot(doc(db, "mindmaps", this.storageKey), (snapshot) => {
            if (snapshot.exists()) {
                this.data = snapshot.data().data;
                this.updatePositions();
                this.g.selectAll('*').remove();
                this.render();
            }
        });
    }

    setupEventHandlers() {
        document.getElementById('reset-view-btn')?.addEventListener('click', () => this.resetView());
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('auto-layout-btn')?.addEventListener('click', () => this.autoLayout());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearData());
        document.getElementById('edit-save-btn')?.addEventListener('click', () => this.saveEdit());
        document.getElementById('edit-cancel-btn')?.addEventListener('click', () => this.closeEditModal());
        document.getElementById('edit-delete-btn')?.addEventListener('click', () => this.deleteNode());
        document.getElementById('edit-modal-overlay')?.addEventListener('click', () => this.closeEditModal());
    }

    render() {
        this.g.selectAll('*').remove();

        // Create hierarchy
        const root = d3.hierarchy(this.data);
        const nodes = root.descendants();
        const links = root.links();

        console.log('🎨 渲染:', { nodeCount: nodes.length, linkCount: links.length });

        // Check if nodes already have positions saved (user has manually positioned them)
        const hasManualPositions = nodes.some(n => n.data.x !== undefined && n.data.y !== undefined && n.data.manuallyPositioned === true);

        if (!hasManualPositions) {
            console.log('📐 使用樹狀布局（整齊排列）');
            // Use tree layout for clean, organized structure
            const treeLayout = d3.tree()
                .nodeSize([80, 200]) // [height spacing, width spacing]
                .separation((a, b) => a.parent === b.parent ? 1 : 1.2);

            treeLayout(root);

            // Assign positions from tree layout (x and y are swapped for horizontal layout)
            nodes.forEach(n => {
                if (n.data.x === undefined || n.data.y === undefined) {
                    // Swap x and y for horizontal layout (left to right)
                    n.data.x = n.y;  // tree's y becomes our x (horizontal position)
                    n.data.y = n.x;  // tree's x becomes our y (vertical position)
                    n.data.manuallyPositioned = false;
                }
                n.x = n.data.x;
                n.y = n.data.y;
            });

            // Save the initial layout
            this.saveData();
        } else {
            console.log('✓ 使用已保存的位置（用戶已調整）');
            // Restore positions from data
            nodes.forEach(n => {
                if (n.data.x !== undefined && n.data.y !== undefined) {
                    n.x = n.data.x;
                    n.y = n.data.y;
                }
            });
        }

        // Draw links first (curved paths like markmap)
        const linkElements = this.g.selectAll('.mindmap-link')
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'mindmap-link')
            .attr('d', d => {
                const sx = d.source.x;
                const sy = d.source.y;
                const tx = d.target.x;
                const ty = d.target.y;

                // Create smooth curve from left to right
                const mx = (sx + tx) / 2;
                return `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`;
            })
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 2);

        // Draw nodes
        const nodeGroups = this.g.selectAll('.mindmap-node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'mindmap-node')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Draw circles
        nodeGroups.append('circle')
            .attr('r', 35)
            .attr('fill', d => this.getNodeColor(d))
            .attr('stroke', d => this.getNodeColor(d))
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
            })
            .on('dblclick', (event, d) => {
                event.stopPropagation();
                if (d && d.data) this.openEditModal(d);
            });

        // Draw text
        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('font-size', '13px')
            .text(d => (d && d.data && d.data.zh) ? d.data.zh.substring(0, 5) : '');

        // Draw add-button
        nodeGroups.append('g')
            .attr('class', 'mindmap-node-btn')
            .attr('transform', 'translate(48, -48)')
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                if (d && d.data) this.addChild(d);
            })
            .append('circle')
            .attr('r', 18)
            .attr('fill', 'white')
            .attr('stroke', '#4ade80')
            .attr('stroke-width', 2);

        nodeGroups.select('.mindmap-node-btn')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#4ade80')
            .attr('font-weight', 'bold')
            .attr('font-size', '20px')
            .attr('pointer-events', 'none')
            .text('+');

        // Add drag behavior to nodes
        nodeGroups.call(d3.drag()
            .on('drag', (event, d) => {
                if (!d || !d.data) return;
                d.x = event.x;
                d.y = event.y;
                d.data.x = event.x;
                d.data.y = event.y;
                d.data.manuallyPositioned = true;  // Mark as manually positioned
                this.updatePositions();
            })
            .on('end', () => {
                this.saveData();  // Save after drag
            }));

        // Only fit to bounds on first render
        if (!hasManualPositions) {
            this.fitToBounds(nodes);
        }
    }

    updatePositions() {
        // Update curved link paths
        this.g.selectAll('.mindmap-link')
            .attr('d', d => {
                if (!d.source || !d.target) return '';
                const sx = d.source.x;
                const sy = d.source.y;
                const tx = d.target.x;
                const ty = d.target.y;

                const mx = (sx + tx) / 2;
                return `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`;
            });

        this.g.selectAll('.mindmap-node')
            .attr('transform', d => {
                if (!d) return '';
                return `translate(${d.x || 0},${d.y || 0})`;
            });
    }

    fitToBounds(nodes) {
        if (nodes.length === 0) return;

        const xs = nodes.map(d => d.x);
        const ys = nodes.map(d => d.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const padding = 80;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;

        const scale = Math.min(this.width / width, this.height / height, 2);
        const tx = this.width / 2 - (minX + maxX) / 2 * scale;
        const ty = this.height / 2 - (minY + maxY) / 2 * scale;

        this.svg.call(
            this.zoomBehavior.transform,
            d3.zoomIdentity.translate(tx, ty).scale(scale)
        );
    }

    getNodeColor(d) {
        const depth = d.depth || 0;
        if (depth === 0) return this.colorScheme.root;
        if (depth === 1) return this.colorScheme.level1;
        if (depth === 2) return this.colorScheme.level2;
        if (depth === 3) return this.colorScheme.level3;
        return this.colorScheme.level4;
    }

    findNodeById(node, id) {
        if (node.id === id) return node;
        if (node.children) {
            for (let child of node.children) {
                const found = this.findNodeById(child, id);
                if (found) return found;
            }
        }
        return null;
    }

    findParentById(node, id, parent = null) {
        if (node.id === id) return parent;
        if (node.children) {
            for (let child of node.children) {
                const foundParent = this.findParentById(child, id, node);
                if (foundParent) return foundParent;
            }
        }
        return null;
    }

    selectNode(d) {
        this.selectedNodeId = d.data ? d.data.id : null;
    }

    openEditModal(d) {
        if (!d || !d.data) return;
        this.editingNodeId = d.data.id;
        document.getElementById('edit-zh').value = d.data.zh || '';
        document.getElementById('edit-en').value = d.data.en || '';

        // Hide delete button for root node
        const deleteBtn = document.getElementById('edit-delete-btn');
        if (deleteBtn) {
            deleteBtn.style.display = d.data.id === 'root' ? 'none' : 'block';
        }

        document.getElementById('edit-modal-overlay').classList.remove('hidden');
        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-zh').focus();
    }

    closeEditModal() {
        document.getElementById('edit-modal-overlay').classList.add('hidden');
        document.getElementById('edit-modal').classList.add('hidden');
        this.editingNodeId = null;
    }

    saveEdit() {
        if (!this.editingNodeId) return;

        const zh = document.getElementById('edit-zh').value || '節點';
        const en = document.getElementById('edit-en').value || 'Node';
        const editingNodeId = this.editingNodeId;

        const targetNodeData = this.findNodeById(this.data, editingNodeId);
        if (targetNodeData) {
            targetNodeData.zh = zh;
            targetNodeData.en = en;
            this.saveData();

            // Update text without re-rendering entire graph
            this.g.selectAll('.mindmap-node')
                .filter(d => d.data.id === editingNodeId)
                .select('text')
                .text(zh.substring(0, 5));
        }

        this.closeEditModal();
    }

    deleteNode() {
        if (!this.editingNodeId || this.editingNodeId === 'root') return;

        const parentData = this.findParentById(this.data, this.editingNodeId);
        if (parentData && parentData.children) {
            const idx = parentData.children.findIndex(c => c.id === this.editingNodeId);
            if (idx !== -1) {
                parentData.children.splice(idx, 1);
            }
        }

        this.saveData();
        this.closeEditModal();
        this.render();
    }

    addChild(d) {
        if (!d || !d.data) return;
        const newId = 'node-' + Date.now();

        // Find current node data dynamically instead of relying on d3 hierarchy node d
        const targetNodeData = this.findNodeById(this.data, d.data.id);
        if (!targetNodeData) return;

        const siblings = targetNodeData.children || [];
        const siblingCount = siblings.length;

        // Default position: to the right of parent, vertically spaced
        const newX = (targetNodeData.x || 0) + 200;  // 200px to the right
        const newY = (targetNodeData.y || 0) + (siblingCount * 80) - (siblingCount * 40);

        const newChild = {
            id: newId,
            zh: '新節點',
            en: 'New Node',
            x: newX,
            y: newY,
            manuallyPositioned: false,
            children: []
        };

        if (!targetNodeData.children) targetNodeData.children = [];
        targetNodeData.children.push(newChild);

        this.saveData();
        this.render();

        // Auto-open edit modal for new node
        setTimeout(() => {
            const newNodeData = this.findNodeById(this.data, newId);
            if (newNodeData) {
                this.openEditModal({ data: newNodeData });
            }
        }, 100);
    }

    autoLayout() {
        // Remove all manual positioning flags to trigger tree layout
        const removeManualPositions = (node) => {
            if (node.manuallyPositioned !== undefined) {
                delete node.manuallyPositioned;
            }
            if (node.x !== undefined) delete node.x;
            if (node.y !== undefined) delete node.y;
            if (node.children) {
                node.children.forEach(child => removeManualPositions(child));
            }
        };

        removeManualPositions(this.data);
        this.saveData();
        this.render();
    }

    clearData() {
        if (confirm('確定要清除所有數據嗎？此操作無法撤銷！')) {
            // Clear localStorage completely to reset layout
            localStorage.removeItem(this.storageKey);
            this.data = JSON.parse(JSON.stringify(this.defaultData));
            this.saveData();
            this.render();
        }
    }

    resetView() {
        const x = this.width / 2;
        const y = this.height / 2;
        const k = 1;

        this.svg.transition()
            .duration(750)
            .call(
                this.zoomBehavior.transform,
                d3.zoomIdentity.translate(x, y).scale(k)
            );
    }

    zoomIn() {
        this.svg.transition().duration(300).call(
            this.zoomBehavior.scaleBy,
            1.3
        );
    }

    zoomOut() {
        this.svg.transition().duration(300).call(
            this.zoomBehavior.scaleBy,
            0.7
        );
    }

    handleResize() {
        const container = document.getElementById(this.containerId);
        this.width = container.parentElement.offsetWidth;
        this.height = container.parentElement.offsetHeight;
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
        this.render();
    }
}