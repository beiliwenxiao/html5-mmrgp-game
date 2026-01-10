/**
 * QuestTracker - 任务追踪器 UI 组件
 * 
 * 显示当前激活任务的追踪界面
 * 
 * 功能:
 * - 任务列表显示（屏幕右上角）
 * - 任务进度条显示
 * - 任务完成提示动画
 * - 任务目标高亮
 * - 可折叠/展开任务详情
 * 
 * 需求: 36
 * 
 * @author Kiro
 * @date 2026-01-10
 */

import { UIElement } from '../../ui/UIElement.js';

/**
 * 任务追踪器类
 */
export class QuestTracker extends UIElement {
  /**
   * 创建任务追踪器
   * @param {Object} options - 配置选项
   * @param {number} options.x - X坐标（默认右上角）
   * @param {number} options.y - Y坐标
   * @param {number} options.width - 宽度
   * @param {number} options.maxHeight - 最大高度
   * @param {QuestSystem} options.questSystem - 任务系统实例
   */
  constructor(options = {}) {
    super({
      x: options.x || 0,  // 将在 render 中动态计算
      y: options.y || 20,
      width: options.width || 320,
      height: options.height || 0,  // 动态计算
      visible: options.visible !== undefined ? options.visible : true,
      zIndex: options.zIndex || 50
    });
    
    this.questSystem = options.questSystem;
    this.maxHeight = options.maxHeight || 600;
    
    // UI 配置
    this.padding = 15;
    this.questSpacing = 10;
    this.lineHeight = 20;
    this.titleHeight = 30;
    this.progressBarHeight = 8;
    this.objectiveIndent = 20;
    
    // 交互状态
    this.expandedQuests = new Set();  // 展开的任务ID集合
    this.hoveredQuest = null;
    
    // 完成动画
    this.completionAnimations = [];  // { questId, text, alpha, y, duration }
    this.animationDuration = 2000;  // 2秒
    
    // 注册任务系统回调
    if (this.questSystem) {
      this.questSystem.on('questComplete', (quest) => {
        this.showCompletionAnimation(quest);
      });
      
      this.questSystem.on('questProgress', (quest, objective) => {
        // 可以添加进度更新动画
      });
    }
  }
  
  /**
   * 更新追踪器
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    if (!this.visible) return;
    
    // 更新完成动画
    this.updateCompletionAnimations(deltaTime);
  }
  
  /**
   * 更新完成动画
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  updateCompletionAnimations(deltaTime) {
    for (let i = this.completionAnimations.length - 1; i >= 0; i--) {
      const anim = this.completionAnimations[i];
      anim.duration -= deltaTime;
      
      // 更新透明度和位置
      const progress = 1 - (anim.duration / this.animationDuration);
      anim.alpha = Math.max(0, 1 - progress);
      anim.y -= deltaTime * 0.05;  // 向上漂浮
      
      // 移除完成的动画
      if (anim.duration <= 0) {
        this.completionAnimations.splice(i, 1);
      }
    }
  }
  
  /**
   * 渲染追踪器
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  render(ctx) {
    if (!this.visible || !this.questSystem) return;
    
    const activeQuests = this.questSystem.getActiveQuests();
    if (activeQuests.length === 0) return;
    
    ctx.save();
    
    // 动态计算位置（右上角）
    const canvasWidth = ctx.canvas.width;
    this.x = canvasWidth - this.width - 20;
    
    // 渲染任务列表
    let currentY = this.y;
    
    for (const quest of activeQuests) {
      const questHeight = this.renderQuest(ctx, quest, currentY);
      currentY += questHeight + this.questSpacing;
      
      // 检查是否超出最大高度
      if (currentY - this.y > this.maxHeight) {
        break;
      }
    }
    
    // 渲染完成动画
    this.renderCompletionAnimations(ctx);
    
    ctx.restore();
  }
  
  /**
   * 渲染单个任务
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} quest - 任务对象
   * @param {number} startY - 起始Y坐标
   * @returns {number} 任务块的高度
   */
  renderQuest(ctx, quest, startY) {
    const isExpanded = this.expandedQuests.has(quest.id);
    const isHovered = this.hoveredQuest === quest.id;
    
    // 计算任务块高度
    let blockHeight = this.titleHeight + this.padding * 2;
    
    if (isExpanded) {
      // 展开时显示所有目标
      blockHeight += quest.objectives.length * this.lineHeight;
      blockHeight += this.progressBarHeight + 10;
    } else {
      // 折叠时只显示进度条
      blockHeight += this.progressBarHeight + 5;
    }
    
    // 渲染背景
    ctx.fillStyle = isHovered ? 'rgba(40, 40, 40, 0.95)' : 'rgba(30, 30, 30, 0.9)';
    ctx.fillRect(this.x, startY, this.width, blockHeight);
    
    // 渲染边框
    ctx.strokeStyle = isHovered ? '#6080ff' : '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, startY, this.width, blockHeight);
    
    // 渲染任务标题
    this.renderQuestTitle(ctx, quest, startY, isExpanded);
    
    // 渲染进度条
    const progressY = startY + this.titleHeight + this.padding;
    this.renderProgressBar(ctx, quest, progressY);
    
    // 如果展开，渲染目标列表
    if (isExpanded) {
      const objectivesY = progressY + this.progressBarHeight + 10;
      this.renderObjectives(ctx, quest, objectivesY);
    }
    
    return blockHeight;
  }
  
  /**
   * 渲染任务标题
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} quest - 任务对象
   * @param {number} startY - 起始Y坐标
   * @param {boolean} isExpanded - 是否展开
   */
  renderQuestTitle(ctx, quest, startY, isExpanded) {
    // 展开/折叠图标
    const iconX = this.x + this.padding;
    const iconY = startY + this.padding + this.titleHeight / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(isExpanded ? '▼' : '▶', iconX, iconY);
    
    // 任务名称
    const titleX = iconX + 20;
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 15px Arial, sans-serif';
    
    // 截断过长的标题
    let title = quest.name;
    const maxWidth = this.width - this.padding * 2 - 20;
    const metrics = ctx.measureText(title);
    
    if (metrics.width > maxWidth) {
      while (ctx.measureText(title + '...').width > maxWidth && title.length > 0) {
        title = title.slice(0, -1);
      }
      title += '...';
    }
    
    ctx.fillText(title, titleX, iconY);
  }
  
  /**
   * 渲染进度条
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} quest - 任务对象
   * @param {number} y - Y坐标
   */
  renderProgressBar(ctx, quest, y) {
    const barX = this.x + this.padding;
    const barWidth = this.width - this.padding * 2;
    
    // 计算进度
    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    const totalObjectives = quest.objectives.length;
    const progress = totalObjectives > 0 ? completedObjectives / totalObjectives : 0;
    
    // 背景
    ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
    ctx.fillRect(barX, y, barWidth, this.progressBarHeight);
    
    // 进度条
    const progressWidth = barWidth * progress;
    const gradient = ctx.createLinearGradient(barX, y, barX + progressWidth, y);
    gradient.addColorStop(0, '#4080ff');
    gradient.addColorStop(1, '#60a0ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, y, progressWidth, this.progressBarHeight);
    
    // 边框
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, y, barWidth, this.progressBarHeight);
    
    // 进度文字
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const progressText = `${completedObjectives}/${totalObjectives}`;
    ctx.fillText(progressText, barX + barWidth / 2, y + this.progressBarHeight + 2);
  }
  
  /**
   * 渲染任务目标列表
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} quest - 任务对象
   * @param {number} startY - 起始Y坐标
   */
  renderObjectives(ctx, quest, startY) {
    let currentY = startY;
    
    for (const objective of quest.objectives) {
      this.renderObjective(ctx, objective, currentY);
      currentY += this.lineHeight;
    }
  }
  
  /**
   * 渲染单个任务目标
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} objective - 目标对象
   * @param {number} y - Y坐标
   */
  renderObjective(ctx, objective, y) {
    const objX = this.x + this.padding + this.objectiveIndent;
    
    // 完成状态图标
    const iconX = objX - 15;
    ctx.fillStyle = objective.completed ? '#00ff00' : '#888888';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(objective.completed ? '✓' : '○', iconX, y);
    
    // 目标描述
    ctx.fillStyle = objective.completed ? '#888888' : '#ffffff';
    ctx.font = '12px Arial, sans-serif';
    
    // 截断过长的描述
    let description = objective.description;
    const maxWidth = this.width - this.padding * 2 - this.objectiveIndent - 20;
    const metrics = ctx.measureText(description);
    
    if (metrics.width > maxWidth) {
      while (ctx.measureText(description + '...').width > maxWidth && description.length > 0) {
        description = description.slice(0, -1);
      }
      description += '...';
    }
    
    ctx.fillText(description, objX, y);
    
    // 进度数字（如果需要）
    if (objective.required > 1) {
      const progressText = `(${objective.current}/${objective.required})`;
      ctx.fillStyle = objective.completed ? '#00ff00' : '#cccccc';
      ctx.font = '11px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(progressText, this.x + this.width - this.padding, y);
    }
  }
  
  /**
   * 渲染完成动画
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderCompletionAnimations(ctx) {
    for (const anim of this.completionAnimations) {
      ctx.save();
      ctx.globalAlpha = anim.alpha;
      
      // 设置字体以正确测量文字宽度
      ctx.font = 'bold 18px Arial, sans-serif';
      
      // 背景 - 增加内边距以确保文字不会超出
      const textMetrics = ctx.measureText(anim.text);
      const textWidth = textMetrics.width;
      const padding = 30;  // 左右各15px内边距
      const bgWidth = textWidth + padding * 2;
      const bgHeight = 60;  // 增加高度
      const bgX = (ctx.canvas.width - bgWidth) / 2;
      const bgY = anim.y - 30;  // 调整Y位置以居中文字
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
      
      // 边框（金色）
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);
      
      // 文字
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(anim.text, ctx.canvas.width / 2, anim.y);
      
      ctx.restore();
    }
  }
  
  /**
   * 显示任务完成动画
   * @param {Object} quest - 完成的任务
   */
  showCompletionAnimation(quest) {
    const canvasHeight = 600;  // 默认高度，实际应从 canvas 获取
    
    this.completionAnimations.push({
      questId: quest.id,
      text: `任务完成: ${quest.name}`,
      alpha: 1.0,
      y: canvasHeight / 2,
      duration: this.animationDuration
    });
  }
  
  /**
   * 切换任务展开/折叠状态
   * @param {string} questId - 任务ID
   */
  toggleQuestExpansion(questId) {
    if (this.expandedQuests.has(questId)) {
      this.expandedQuests.delete(questId);
    } else {
      this.expandedQuests.add(questId);
    }
  }
  
  /**
   * 展开所有任务
   */
  expandAll() {
    if (!this.questSystem) return;
    
    const activeQuests = this.questSystem.getActiveQuests();
    for (const quest of activeQuests) {
      this.expandedQuests.add(quest.id);
    }
  }
  
  /**
   * 折叠所有任务
   */
  collapseAll() {
    this.expandedQuests.clear();
  }
  
  /**
   * 处理鼠标移动事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   */
  handleMouseMove(mouseX, mouseY) {
    if (!this.visible || !this.questSystem) {
      this.hoveredQuest = null;
      return;
    }
    
    const activeQuests = this.questSystem.getActiveQuests();
    let currentY = this.y;
    
    this.hoveredQuest = null;
    
    for (const quest of activeQuests) {
      const isExpanded = this.expandedQuests.has(quest.id);
      let blockHeight = this.titleHeight + this.padding * 2;
      
      if (isExpanded) {
        blockHeight += quest.objectives.length * this.lineHeight;
        blockHeight += this.progressBarHeight + 10;
      } else {
        blockHeight += this.progressBarHeight + 5;
      }
      
      // 检查鼠标是否在任务块内
      if (mouseX >= this.x && mouseX <= this.x + this.width &&
          mouseY >= currentY && mouseY <= currentY + blockHeight) {
        this.hoveredQuest = quest.id;
        break;
      }
      
      currentY += blockHeight + this.questSpacing;
    }
  }
  
  /**
   * 处理鼠标点击事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {boolean} 是否处理了事件
   */
  handleMouseClick(mouseX, mouseY) {
    if (!this.visible || !this.questSystem) {
      return false;
    }
    
    const activeQuests = this.questSystem.getActiveQuests();
    let currentY = this.y;
    
    for (const quest of activeQuests) {
      const isExpanded = this.expandedQuests.has(quest.id);
      let blockHeight = this.titleHeight + this.padding * 2;
      
      if (isExpanded) {
        blockHeight += quest.objectives.length * this.lineHeight;
        blockHeight += this.progressBarHeight + 10;
      } else {
        blockHeight += this.progressBarHeight + 5;
      }
      
      // 检查是否点击了任务块
      if (mouseX >= this.x && mouseX <= this.x + this.width &&
          mouseY >= currentY && mouseY <= currentY + blockHeight) {
        // 切换展开/折叠
        this.toggleQuestExpansion(quest.id);
        return true;
      }
      
      currentY += blockHeight + this.questSpacing;
    }
    
    return false;
  }
  
  /**
   * 获取当前显示的任务数量
   * @returns {number} 任务数量
   */
  getActiveQuestCount() {
    if (!this.questSystem) return 0;
    return this.questSystem.getActiveQuests().length;
  }
  
  /**
   * 清除所有完成动画
   */
  clearAnimations() {
    this.completionAnimations = [];
  }
  
  /**
   * 重置追踪器状态
   */
  reset() {
    this.expandedQuests.clear();
    this.hoveredQuest = null;
    this.clearAnimations();
  }
}

export default QuestTracker;
