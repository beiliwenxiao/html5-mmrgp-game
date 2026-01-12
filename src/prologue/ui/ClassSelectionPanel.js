/**
 * 职业选择面板 (ClassSelectionPanel) - 序章专用
 * 
 * 显示职业选择界面的UI面板
 * 
 * 功能:
 * - 显示三个职业卡片（战士、弓箭手、法师）
 * - 显示教官NPC（张梁、张宝、张角）
 * - 显示职业特性和技能树预览
 * - 确认职业选择
 * 
 * 需求: 19, 20
 */

import { UIElement } from '../../ui/UIElement.js';
import { ClassType, ClassNames, ClassInstructors } from '../../systems/ClassSystem.js';

/**
 * 职业卡片颜色映射
 */
const CLASS_COLORS = {
  [ClassType.WARRIOR]: '#ff6b6b',    // 战士 - 红色
  [ClassType.ARCHER]: '#4ecdc4',     // 弓箭手 - 青色
  [ClassType.MAGE]: '#a29bfe'        // 法师 - 紫色
};

/**
 * 职业选择面板类
 */
export class ClassSelectionPanel extends UIElement {
  /**
   * 创建职业选择面板
   * @param {Object} options - 配置选项
   * @param {number} options.x - X坐标
   * @param {number} options.y - Y坐标
   * @param {number} options.width - 宽度
   * @param {number} options.height - 高度
   * @param {ClassSystem} options.classSystem - 职业系统实例
   */
  constructor(options = {}) {
    super({
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 1200,
      height: options.height || 700,
      visible: options.visible !== undefined ? options.visible : false,
      zIndex: options.zIndex || 150
    });
    
    this.classSystem = options.classSystem;
    this.player = null;
    
    // UI布局配置
    this.titleHeight = 60;
    this.cardWidth = 320;
    this.cardHeight = 500;
    this.cardSpacing = 40;
    this.instructorSize = 80;
    
    // 计算卡片起始位置（居中显示）
    const totalWidth = this.cardWidth * 3 + this.cardSpacing * 2;
    this.cardStartX = (this.width - totalWidth) / 2;
    this.cardStartY = this.titleHeight + 60;
    
    // 交互状态
    this.hoveredClass = null;
    this.selectedClass = null;
    this.showingSkillTree = null;
    
    // 职业列表
    this.classes = [ClassType.WARRIOR, ClassType.ARCHER, ClassType.MAGE];
    
    // 事件回调
    this.onClassSelect = options.onClassSelect || null;
    this.onConfirm = options.onConfirm || null;
    this.onCancel = options.onCancel || null;
  }
  
  /**
   * 设置当前玩家
   * @param {Object} player - 玩家对象
   */
  setPlayer(player) {
    this.player = player;
  }
  
  /**
   * 更新面板
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    if (!this.visible) return;
    
    // 可以在这里添加动画效果
  }
  
  /**
   * 渲染面板
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  render(ctx) {
    if (!this.visible) return;
    
    ctx.save();
    
    // 渲染背景遮罩
    this.renderOverlay(ctx);
    
    // 渲染背景
    this.renderBackground(ctx);
    
    // 渲染标题
    this.renderTitle(ctx);
    
    // 渲染职业卡片
    this.renderClassCards(ctx);
    
    // 渲染确认按钮
    if (this.selectedClass) {
      this.renderConfirmButton(ctx);
    }
    
    // 渲染技能树预览（如果有）
    if (this.showingSkillTree) {
      this.renderSkillTreePreview(ctx);
    }
    
    ctx.restore();
  }
  
  /**
   * 渲染背景遮罩
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderOverlay(ctx) {
    // 半透明黑色遮罩（覆盖整个画布）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  
  /**
   * 渲染背景
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderBackground(ctx) {
    // 主面板背景
    ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 边框
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // 标题栏背景
    ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
    ctx.fillRect(this.x, this.y, this.width, this.titleHeight);
    
    // 标题栏底部分隔线
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.titleHeight);
    ctx.lineTo(this.x + this.width, this.y + this.titleHeight);
    ctx.stroke();
  }
  
  /**
   * 渲染标题
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTitle(ctx) {
    // 主标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('选择你的职业', this.x + this.width / 2, this.y + this.titleHeight / 2 - 5);
    
    // 副标题
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('每个职业都有独特的战斗风格和技能树', this.x + this.width / 2, this.y + this.titleHeight / 2 + 20);
  }
  
  /**
   * 渲染职业卡片
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderClassCards(ctx) {
    this.classes.forEach((classType, index) => {
      const cardX = this.x + this.cardStartX + index * (this.cardWidth + this.cardSpacing);
      const cardY = this.y + this.cardStartY;
      
      this.renderClassCard(ctx, classType, cardX, cardY);
    });
  }
  
  /**
   * 渲染单个职业卡片
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} classType - 职业类型
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderClassCard(ctx, classType, x, y) {
    const classData = this.classSystem?.getClassData(classType);
    if (!classData) return;
    
    const isHovered = this.hoveredClass === classType;
    const isSelected = this.selectedClass === classType;
    const classColor = CLASS_COLORS[classType] || '#ffffff';
    
    // 卡片背景
    if (isSelected) {
      ctx.fillStyle = 'rgba(80, 80, 80, 0.9)';
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
    } else {
      ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    }
    ctx.fillRect(x, y, this.cardWidth, this.cardHeight);
    
    // 卡片边框（使用职业颜色）
    if (isSelected) {
      ctx.strokeStyle = classColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = classColor;
      ctx.shadowBlur = 15;
    } else if (isHovered) {
      ctx.strokeStyle = classColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = classColor;
      ctx.shadowBlur = 10;
    } else {
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
    }
    ctx.strokeRect(x, y, this.cardWidth, this.cardHeight);
    ctx.shadowBlur = 0;
    
    // 顶部职业名称栏
    ctx.fillStyle = classColor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x, y, this.cardWidth, 60);
    ctx.globalAlpha = 1.0;
    
    // 职业名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(classData.displayName, x + this.cardWidth / 2, y + 30);
    
    // 教官头像和信息
    this.renderInstructor(ctx, classType, x + this.cardWidth / 2, y + 100);
    
    // 职业描述
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    this.wrapText(ctx, classData.description, x + 20, y + 200, this.cardWidth - 40, 20);
    
    // 基础属性
    this.renderBaseAttributes(ctx, classData, x + 20, y + 280);
    
    // 推荐属性
    this.renderRecommendedAttributes(ctx, classData, x + 20, y + 370);
    
    // 查看技能树按钮
    this.renderSkillTreeButton(ctx, classType, x + 20, y + this.cardHeight - 60);
  }
  
  /**
   * 渲染教官信息
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} classType - 职业类型
   * @param {number} centerX - 中心X坐标
   * @param {number} centerY - 中心Y坐标
   */
  renderInstructor(ctx, classType, centerX, centerY) {
    const instructor = ClassInstructors[classType];
    if (!instructor) return;
    
    const classColor = CLASS_COLORS[classType] || '#ffffff';
    
    // 教官头像（圆形）
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.instructorSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // 头像背景（使用职业颜色）
    ctx.fillStyle = classColor;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // 教官名字缩写（简化显示）
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(instructor.name.substring(0, 2), centerX, centerY);
    
    ctx.restore();
    
    // 头像边框
    ctx.strokeStyle = classColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.instructorSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // 教官名字和称号
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(instructor.name, centerX, centerY + this.instructorSize / 2 + 10);
    
    ctx.fillStyle = classColor;
    ctx.font = '13px Arial, sans-serif';
    ctx.fillText(instructor.title, centerX, centerY + this.instructorSize / 2 + 30);
  }
  
  /**
   * 渲染基础属性
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {ClassData} classData - 职业数据
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderBaseAttributes(ctx, classData, x, y) {
    // 标题
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('基础属性:', x, y);
    
    // 属性列表
    const attrs = [
      { name: '生命', value: classData.baseAttributes.health, color: '#ff6b6b' },
      { name: '法力', value: classData.baseAttributes.mana, color: '#4ecdc4' },
      { name: '攻击', value: classData.baseAttributes.attack, color: '#ff9f43' },
      { name: '防御', value: classData.baseAttributes.defense, color: '#54a0ff' },
      { name: '速度', value: classData.baseAttributes.speed, color: '#48dbfb' }
    ];
    
    ctx.font = '12px Arial, sans-serif';
    let currentY = y + 20;
    
    attrs.forEach(attr => {
      // 属性名
      ctx.fillStyle = '#cccccc';
      ctx.fillText(attr.name + ':', x, currentY);
      
      // 属性值
      ctx.fillStyle = attr.color;
      ctx.textAlign = 'right';
      ctx.fillText(attr.value.toString(), x + this.cardWidth - 40, currentY);
      ctx.textAlign = 'left';
      
      currentY += 16;
    });
  }
  
  /**
   * 渲染推荐属性
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {ClassData} classData - 职业数据
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderRecommendedAttributes(ctx, classData, x, y) {
    // 标题
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('推荐属性:', x, y);
    
    // 推荐属性列表
    const recommended = classData.recommendedAttributes;
    const attrNames = {
      strength: '力量',
      agility: '敏捷',
      intelligence: '智力',
      constitution: '体质',
      spirit: '精神'
    };
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px Arial, sans-serif';
    let currentY = y + 20;
    
    if (recommended.primary) {
      ctx.fillText(`主属性: ${attrNames[recommended.primary]}`, x, currentY);
      currentY += 16;
    }
    
    if (recommended.secondary) {
      ctx.fillText(`副属性: ${attrNames[recommended.secondary]}`, x, currentY);
      currentY += 16;
    }
    
    if (recommended.tertiary) {
      ctx.fillText(`辅属性: ${attrNames[recommended.tertiary]}`, x, currentY);
    }
  }
  
  /**
   * 渲染技能树按钮
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} classType - 职业类型
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderSkillTreeButton(ctx, classType, x, y) {
    const buttonWidth = this.cardWidth - 40;
    const buttonHeight = 35;
    const classColor = CLASS_COLORS[classType] || '#ffffff';
    
    // 按钮背景
    ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
    ctx.fillRect(x, y, buttonWidth, buttonHeight);
    
    // 按钮边框
    ctx.strokeStyle = classColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, buttonWidth, buttonHeight);
    
    // 按钮文字
    ctx.fillStyle = classColor;
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('查看技能树', x + buttonWidth / 2, y + buttonHeight / 2);
  }
  
  /**
   * 渲染确认按钮
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderConfirmButton(ctx) {
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.x + (this.width - buttonWidth) / 2;
    const buttonY = this.y + this.height - 80;
    
    const classColor = CLASS_COLORS[this.selectedClass] || '#00ff00';
    
    // 按钮背景
    ctx.fillStyle = classColor;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.globalAlpha = 1.0;
    
    // 按钮边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 按钮文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('确认选择', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
  }
  
  /**
   * 渲染技能树预览
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderSkillTreePreview(ctx) {
    if (!this.showingSkillTree) return;
    
    const previewWidth = 600;
    const previewHeight = 500;
    const previewX = this.x + (this.width - previewWidth) / 2;
    const previewY = this.y + (this.height - previewHeight) / 2;
    
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 预览窗口背景
    ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
    ctx.fillRect(previewX, previewY, previewWidth, previewHeight);
    
    // 边框
    const classColor = CLASS_COLORS[this.showingSkillTree] || '#ffffff';
    ctx.strokeStyle = classColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(previewX, previewY, previewWidth, previewHeight);
    
    // 标题
    const classData = this.classSystem?.getClassData(this.showingSkillTree);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${classData?.displayName || ''} - 技能树预览`, previewX + previewWidth / 2, previewY + 20);
    
    // 技能树简介
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px Arial, sans-serif';
    const skillTreeInfo = this.getSkillTreeInfo(this.showingSkillTree);
    let currentY = previewY + 60;
    
    skillTreeInfo.forEach(info => {
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'left';
      ctx.fillText(info.category + ':', previewX + 30, currentY);
      currentY += 25;
      
      ctx.fillStyle = '#cccccc';
      ctx.font = '13px Arial, sans-serif';
      info.skills.forEach(skill => {
        ctx.fillText('• ' + skill, previewX + 50, currentY);
        currentY += 22;
      });
      
      currentY += 10;
      ctx.font = '14px Arial, sans-serif';
    });
    
    // 关闭按钮
    const closeButtonSize = 40;
    const closeButtonX = previewX + previewWidth - closeButtonSize - 10;
    const closeButtonY = previewY + 10;
    
    ctx.fillStyle = 'rgba(200, 50, 50, 0.8)';
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2);
  }
  
  /**
   * 获取技能树信息
   * @param {string} classType - 职业类型
   * @returns {Array} 技能树信息数组
   */
  getSkillTreeInfo(classType) {
    // 简化的技能树信息（实际应该从SkillTreeSystem获取）
    const skillTrees = {
      [ClassType.WARRIOR]: [
        {
          category: '攻击系',
          skills: ['重击 - 造成150%伤害', '旋风斩 - 范围攻击', '致命一击 - 暴击率+20%']
        },
        {
          category: '防御系',
          skills: ['铁壁 - 防御+30%', '格挡 - 格挡率+25%', '反击 - 格挡后反击']
        },
        {
          category: '被动系',
          skills: ['战斗狂热 - 攻击速度+15%', '不屈 - 低血量时防御+50%', '战争领主 - 队友攻击+10%']
        }
      ],
      [ClassType.ARCHER]: [
        {
          category: '射击系',
          skills: ['多重射击 - 同时射出3箭', '穿透箭 - 穿透敌人', '爆裂箭 - 范围爆炸']
        },
        {
          category: '机动系',
          skills: ['闪避 - 闪避率+30%', '疾步 - 移动速度+40%', '后跳 - 快速后退']
        },
        {
          category: '被动系',
          skills: ['鹰眼 - 射程+50%', '致命精准 - 暴击伤害+50%', '箭雨 - 攻击速度+20%']
        }
      ],
      [ClassType.MAGE]: [
        {
          category: '火系',
          skills: ['火球术 - 火焰伤害', '流星火雨 - 范围火焰', '炎爆术 - 高爆发伤害']
        },
        {
          category: '冰系',
          skills: ['冰箭术 - 冰冻伤害', '暴风雪 - 范围减速', '冰封 - 冻结敌人']
        },
        {
          category: '被动系',
          skills: ['法术精通 - 法术伤害+25%', '法力回复 - 法力回复+50%', '元素掌控 - 元素伤害+30%']
        }
      ]
    };
    
    return skillTrees[classType] || [];
  }
  
  /**
   * 文字换行辅助函数
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文本
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} maxWidth - 最大宽度
   * @param {number} lineHeight - 行高
   */
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
  
  /**
   * 获取卡片在指定位置
   * @param {number} index - 卡片索引
   * @returns {Object} {x, y, width, height}
   */
  getCardBounds(index) {
    const cardX = this.x + this.cardStartX + index * (this.cardWidth + this.cardSpacing);
    const cardY = this.y + this.cardStartY;
    
    return {
      x: cardX,
      y: cardY,
      width: this.cardWidth,
      height: this.cardHeight
    };
  }
  
  /**
   * 获取技能树按钮边界
   * @param {number} index - 卡片索引
   * @returns {Object} {x, y, width, height}
   */
  getSkillTreeButtonBounds(index) {
    const cardBounds = this.getCardBounds(index);
    const buttonWidth = this.cardWidth - 40;
    const buttonHeight = 35;
    
    return {
      x: cardBounds.x + 20,
      y: cardBounds.y + this.cardHeight - 60,
      width: buttonWidth,
      height: buttonHeight
    };
  }
  
  /**
   * 获取确认按钮边界
   * @returns {Object} {x, y, width, height}
   */
  getConfirmButtonBounds() {
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.x + (this.width - buttonWidth) / 2;
    const buttonY = this.y + this.height - 80;
    
    return {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };
  }
  
  /**
   * 获取技能树预览关闭按钮边界
   * @returns {Object} {x, y, width, height}
   */
  getSkillTreeCloseButtonBounds() {
    const previewWidth = 600;
    const previewHeight = 500;
    const previewX = this.x + (this.width - previewWidth) / 2;
    const previewY = this.y + (this.height - previewHeight) / 2;
    
    const closeButtonSize = 40;
    const closeButtonX = previewX + previewWidth - closeButtonSize - 10;
    const closeButtonY = previewY + 10;
    
    return {
      x: closeButtonX,
      y: closeButtonY,
      width: closeButtonSize,
      height: closeButtonSize
    };
  }
  
  /**
   * 检查点是否在矩形内
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {Object} bounds - 边界 {x, y, width, height}
   * @returns {boolean}
   */
  isPointInBounds(x, y, bounds) {
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }
  
  /**
   * 处理鼠标移动事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   */
  handleMouseMove(mouseX, mouseY) {
    if (!this.visible) {
      this.hoveredClass = null;
      return;
    }
    
    // 如果正在显示技能树预览，不处理卡片悬停
    if (this.showingSkillTree) {
      return;
    }
    
    // 检查鼠标是否在面板内
    if (!this.containsPoint(mouseX, mouseY)) {
      this.hoveredClass = null;
      return;
    }
    
    // 检查鼠标是否悬停在某个职业卡片上
    this.hoveredClass = null;
    this.classes.forEach((classType, index) => {
      const cardBounds = this.getCardBounds(index);
      if (this.isPointInBounds(mouseX, mouseY, cardBounds)) {
        this.hoveredClass = classType;
      }
    });
  }
  
  /**
   * 处理鼠标点击事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {boolean} 是否处理了点击事件
   */
  handleMouseClick(mouseX, mouseY) {
    if (!this.visible) {
      return false;
    }
    
    // 如果正在显示技能树预览
    if (this.showingSkillTree) {
      // 检查是否点击了关闭按钮
      const closeBounds = this.getSkillTreeCloseButtonBounds();
      if (this.isPointInBounds(mouseX, mouseY, closeBounds)) {
        this.showingSkillTree = null;
        return true;
      }
      
      // 点击预览窗口外部也关闭
      const previewWidth = 600;
      const previewHeight = 500;
      const previewX = this.x + (this.width - previewWidth) / 2;
      const previewY = this.y + (this.height - previewHeight) / 2;
      
      if (mouseX < previewX || mouseX > previewX + previewWidth ||
          mouseY < previewY || mouseY > previewY + previewHeight) {
        this.showingSkillTree = null;
        return true;
      }
      
      return true;
    }
    
    // 检查是否点击了确认按钮
    if (this.selectedClass) {
      const confirmBounds = this.getConfirmButtonBounds();
      if (this.isPointInBounds(mouseX, mouseY, confirmBounds)) {
        this.confirmSelection();
        return true;
      }
    }
    
    // 检查是否点击了技能树按钮
    for (let i = 0; i < this.classes.length; i++) {
      const skillTreeBounds = this.getSkillTreeButtonBounds(i);
      if (this.isPointInBounds(mouseX, mouseY, skillTreeBounds)) {
        this.showingSkillTree = this.classes[i];
        return true;
      }
    }
    
    // 检查是否点击了职业卡片
    for (let i = 0; i < this.classes.length; i++) {
      const cardBounds = this.getCardBounds(i);
      if (this.isPointInBounds(mouseX, mouseY, cardBounds)) {
        this.selectClass(this.classes[i]);
        return true;
      }
    }
    
    // 点击了面板其他区域，也算处理了（阻止事件传播）
    if (this.containsPoint(mouseX, mouseY)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 选择职业
   * @param {string} classType - 职业类型
   */
  selectClass(classType) {
    this.selectedClass = classType;
    
    // 触发选择回调
    if (this.onClassSelect) {
      this.onClassSelect(classType);
    }
    
    console.log(`选择了职业: ${ClassNames[classType]}`);
  }
  
  /**
   * 确认选择
   */
  confirmSelection() {
    if (!this.selectedClass) {
      console.warn('没有选择职业');
      return;
    }
    
    // 触发确认回调
    if (this.onConfirm) {
      this.onConfirm(this.selectedClass);
    }
    
    console.log(`确认选择职业: ${ClassNames[this.selectedClass]}`);
    
    // 隐藏面板
    this.hide();
  }
  
  /**
   * 取消选择
   */
  cancel() {
    // 触发取消回调
    if (this.onCancel) {
      this.onCancel();
    }
    
    // 隐藏面板
    this.hide();
  }
  
  /**
   * 显示面板
   */
  show() {
    this.visible = true;
    this.selectedClass = null;
    this.hoveredClass = null;
    this.showingSkillTree = null;
  }
  
  /**
   * 隐藏面板
   */
  hide() {
    this.visible = false;
    this.selectedClass = null;
    this.hoveredClass = null;
    this.showingSkillTree = null;
  }
  
  /**
   * 切换面板显示/隐藏
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * 重置面板状态
   */
  reset() {
    this.selectedClass = null;
    this.hoveredClass = null;
    this.showingSkillTree = null;
  }
}

export default ClassSelectionPanel;
