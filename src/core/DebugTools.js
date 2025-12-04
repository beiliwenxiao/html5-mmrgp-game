import { logger, LogLevel } from './Logger.js';

/**
 * 调试工具
 * 提供调试模式开关、可视化调试信息和实体查看器
 */
export class DebugTools {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 调试模式开关
        this.enabled = false;
        
        // 调试选项
        this.options = {
            showCollisionBoxes: true,
            showPaths: true,
            showAttackRanges: true,
            showEntityInfo: true,
            showPerformanceStats: true,
            showGrid: false,
            showFPS: true
        };
        
        // 选中的实体
        this.selectedEntity = null;
        
        // 调试UI元素
        this.debugPanel = null;
        this.entityInfoPanel = null;
        
        // 性能统计
        this.stats = {
            fps: 0,
            frameTime: 0,
            entityCount: 0,
            drawCalls: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        // FPS计算
        this.fpsFrames = [];
        this.fpsUpdateInterval = 500; // 每500ms更新一次FPS
        this.lastFpsUpdate = 0;
        
        this.logger = logger.createChild('DebugTools');
        this.logger.info('Initialized');
        
        // 设置键盘快捷键
        this.setupKeyboardShortcuts();
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // F3 - 切换调试模式
            if (e.key === 'F3') {
                e.preventDefault();
                this.toggle();
            }
            
            // F4 - 切换碰撞盒显示
            if (e.key === 'F4' && this.enabled) {
                e.preventDefault();
                this.options.showCollisionBoxes = !this.options.showCollisionBoxes;
                this.logger.info('Collision boxes:', this.options.showCollisionBoxes);
            }
            
            // F5 - 切换路径显示
            if (e.key === 'F5' && this.enabled) {
                e.preventDefault();
                this.options.showPaths = !this.options.showPaths;
                this.logger.info('Paths:', this.options.showPaths);
            }
            
            // F6 - 切换攻击范围显示
            if (e.key === 'F6' && this.enabled) {
                e.preventDefault();
                this.options.showAttackRanges = !this.options.showAttackRanges;
                this.logger.info('Attack ranges:', this.options.showAttackRanges);
            }
            
            // F7 - 切换网格显示
            if (e.key === 'F7' && this.enabled) {
                e.preventDefault();
                this.options.showGrid = !this.options.showGrid;
                this.logger.info('Grid:', this.options.showGrid);
            }
            
            // F8 - 导出日志
            if (e.key === 'F8' && this.enabled) {
                e.preventDefault();
                logger.downloadLogs('text');
                this.logger.info('Logs exported');
            }
        });

        this.logger.info('Keyboard shortcuts set up (F3-F8)');
    }

    /**
     * 切换调试模式
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            this.enable();
        } else {
            this.disable();
        }
        
        this.logger.info('Debug mode:', this.enabled ? 'enabled' : 'disabled');
    }

    /**
     * 启用调试模式
     */
    enable() {
        this.enabled = true;
        this.createDebugUI();
        logger.setLevel(LogLevel.DEBUG);
        this.logger.info('Debug mode enabled');
    }

    /**
     * 禁用调试模式
     */
    disable() {
        this.enabled = false;
        this.destroyDebugUI();
        logger.setLevel(LogLevel.INFO);
        this.logger.info('Debug mode disabled');
    }

    /**
     * 创建调试UI
     */
    createDebugUI() {
        if (this.debugPanel) {
            return;
        }

        // 创建调试面板
        this.debugPanel = document.createElement('div');
        this.debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 250px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        // 创建实体信息面板
        this.entityInfoPanel = document.createElement('div');
        this.entityInfoPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 250px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
        `;

        document.body.appendChild(this.debugPanel);
        document.body.appendChild(this.entityInfoPanel);

        this.logger.debug('Debug UI created');
    }

    /**
     * 销毁调试UI
     */
    destroyDebugUI() {
        if (this.debugPanel) {
            this.debugPanel.remove();
            this.debugPanel = null;
        }
        
        if (this.entityInfoPanel) {
            this.entityInfoPanel.remove();
            this.entityInfoPanel = null;
        }

        this.logger.debug('Debug UI destroyed');
    }

    /**
     * 更新调试信息
     * @param {number} deltaTime - 帧时间
     */
    update(deltaTime) {
        if (!this.enabled) {
            return;
        }

        // 更新FPS
        this.updateFPS(deltaTime);
        
        // 更新调试面板
        this.updateDebugPanel();
    }

    /**
     * 更新FPS统计
     * @param {number} deltaTime - 帧时间
     */
    updateFPS(deltaTime) {
        const now = performance.now();
        this.fpsFrames.push({ time: now, deltaTime });
        
        // 移除旧帧
        this.fpsFrames = this.fpsFrames.filter(frame => 
            now - frame.time < this.fpsUpdateInterval
        );
        
        // 更新FPS
        if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            if (this.fpsFrames.length > 0) {
                const avgDelta = this.fpsFrames.reduce((sum, f) => sum + f.deltaTime, 0) / this.fpsFrames.length;
                this.stats.fps = Math.round(1 / avgDelta);
                this.stats.frameTime = Math.round(avgDelta * 1000 * 100) / 100;
            }
            this.lastFpsUpdate = now;
        }
    }

    /**
     * 更新调试面板
     */
    updateDebugPanel() {
        if (!this.debugPanel) {
            return;
        }

        const html = `
            <div style="margin-bottom: 10px;">
                <strong style="color: #ffff00;">🔧 调试工具 (F3关闭)</strong>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>性能统计:</strong><br>
                FPS: ${this.stats.fps}<br>
                帧时间: ${this.stats.frameTime}ms<br>
                实体数: ${this.stats.entityCount}<br>
                绘制调用: ${this.stats.drawCalls}
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>调试选项:</strong><br>
                <label><input type="checkbox" ${this.options.showCollisionBoxes ? 'checked' : ''} onchange="window.debugTools.options.showCollisionBoxes = this.checked"> 碰撞盒 (F4)</label><br>
                <label><input type="checkbox" ${this.options.showPaths ? 'checked' : ''} onchange="window.debugTools.options.showPaths = this.checked"> 路径 (F5)</label><br>
                <label><input type="checkbox" ${this.options.showAttackRanges ? 'checked' : ''} onchange="window.debugTools.options.showAttackRanges = this.checked"> 攻击范围 (F6)</label><br>
                <label><input type="checkbox" ${this.options.showGrid ? 'checked' : ''} onchange="window.debugTools.options.showGrid = this.checked"> 网格 (F7)</label><br>
                <label><input type="checkbox" ${this.options.showEntityInfo ? 'checked' : ''} onchange="window.debugTools.options.showEntityInfo = this.checked"> 实体信息</label>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>快捷键:</strong><br>
                F3: 切换调试模式<br>
                F4-F7: 切换显示选项<br>
                F8: 导出日志
            </div>
            
            <div>
                <button onclick="window.debugTools.clearSelectedEntity()" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-right: 5px;
                ">清除选择</button>
                <button onclick="logger.downloadLogs('text')" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                ">导出日志</button>
            </div>
        `;

        this.debugPanel.innerHTML = html;
    }

    /**
     * 渲染调试信息
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     * @param {object} camera - 相机对象
     * @param {Array} entities - 实体列表
     */
    render(ctx, camera, entities = []) {
        if (!this.enabled) {
            return;
        }

        ctx.save();

        // 更新实体数量
        this.stats.entityCount = entities.length;

        // 渲染网格
        if (this.options.showGrid) {
            this.renderGrid(ctx, camera);
        }

        // 渲染实体调试信息
        for (const entity of entities) {
            this.renderEntityDebug(ctx, camera, entity);
        }

        ctx.restore();
    }

    /**
     * 渲染网格
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     * @param {object} camera - 相机对象
     */
    renderGrid(ctx, camera) {
        const gridSize = 64;
        const startX = Math.floor(camera.x / gridSize) * gridSize;
        const startY = Math.floor(camera.y / gridSize) * gridSize;
        const endX = camera.x + camera.width;
        const endY = camera.y + camera.height;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // 垂直线
        for (let x = startX; x <= endX; x += gridSize) {
            const screenX = x - camera.x;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, camera.height);
            ctx.stroke();
        }

        // 水平线
        for (let y = startY; y <= endY; y += gridSize) {
            const screenY = y - camera.y;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(camera.width, screenY);
            ctx.stroke();
        }
    }

    /**
     * 渲染实体调试信息
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     * @param {object} camera - 相机对象
     * @param {object} entity - 实体
     */
    renderEntityDebug(ctx, camera, entity) {
        if (!entity.components) {
            return;
        }

        const transform = entity.components.get('transform');
        if (!transform) {
            return;
        }

        const screenX = transform.position.x - camera.x;
        const screenY = transform.position.y - camera.y;

        // 渲染碰撞盒
        if (this.options.showCollisionBoxes) {
            const size = 32; // 默认大小
            ctx.strokeStyle = entity === this.selectedEntity ? '#ffff00' : '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
        }

        // 渲染路径
        if (this.options.showPaths) {
            const movement = entity.components.get('movement');
            if (movement && movement.path && movement.path.length > 0) {
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                
                for (const point of movement.path) {
                    const px = point.x - camera.x;
                    const py = point.y - camera.y;
                    ctx.lineTo(px, py);
                }
                
                ctx.stroke();
                
                // 绘制路径点
                for (const point of movement.path) {
                    const px = point.x - camera.x;
                    const py = point.y - camera.y;
                    ctx.fillStyle = '#ff00ff';
                    ctx.fillRect(px - 3, py - 3, 6, 6);
                }
            }
        }

        // 渲染攻击范围
        if (this.options.showAttackRanges) {
            const combat = entity.components.get('combat');
            if (combat && combat.attackRange) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screenX, screenY, combat.attackRange, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // 渲染实体ID
        if (this.options.showEntityInfo) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(entity.id.substring(0, 8), screenX, screenY - 20);
        }
    }

    /**
     * 选择实体
     * @param {object} entity - 实体
     */
    selectEntity(entity) {
        this.selectedEntity = entity;
        this.updateEntityInfo();
        this.logger.debug('Entity selected:', entity.id);
    }

    /**
     * 清除选中的实体
     */
    clearSelectedEntity() {
        this.selectedEntity = null;
        if (this.entityInfoPanel) {
            this.entityInfoPanel.style.display = 'none';
        }
        this.logger.debug('Entity selection cleared');
    }

    /**
     * 更新实体信息面板
     */
    updateEntityInfo() {
        if (!this.entityInfoPanel || !this.selectedEntity) {
            return;
        }

        const entity = this.selectedEntity;
        let html = `
            <div style="margin-bottom: 10px;">
                <strong style="color: #ffff00;">📋 实体信息</strong>
            </div>
            <div style="margin-bottom: 5px;"><strong>ID:</strong> ${entity.id}</div>
            <div style="margin-bottom: 5px;"><strong>类型:</strong> ${entity.type || 'unknown'}</div>
        `;

        // 显示所有组件
        if (entity.components) {
            html += '<div style="margin-top: 10px;"><strong>组件:</strong></div>';
            
            for (const [name, component] of entity.components) {
                html += `<div style="margin-left: 10px; margin-top: 5px;">
                    <strong>${name}:</strong><br>
                    <pre style="margin: 5px 0; font-size: 10px;">${JSON.stringify(component, null, 2)}</pre>
                </div>`;
            }
        }

        this.entityInfoPanel.innerHTML = html;
        this.entityInfoPanel.style.display = 'block';
    }

    /**
     * 更新统计信息
     * @param {object} stats - 统计数据
     */
    updateStats(stats) {
        Object.assign(this.stats, stats);
    }

    /**
     * 检查是否启用
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * 获取选项
     * @returns {object}
     */
    getOptions() {
        return { ...this.options };
    }

    /**
     * 销毁调试工具
     */
    destroy() {
        this.destroyDebugUI();
        this.selectedEntity = null;
        this.logger.info('Destroyed');
    }
}

// 创建全局实例（在GameEngine初始化后设置）
if (typeof window !== 'undefined') {
    window.debugTools = null;
}
