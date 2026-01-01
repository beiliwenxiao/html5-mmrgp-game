/**
 * MapPanel.js
 * 地图面板UI组件 - 显示世界地图和传送点
 */

import { UIElement } from './UIElement.js';
import { MapState, PortalType } from '../systems/MapSystem.js';

/**
 * 地图面板类
 */
export class MapPanel extends UIElement {
  /**
   * @param {Object} config - 配置对象
   * @param {number} config.x - X坐标
   * @param {number} config.y - Y坐标
   * @param {number} config.width - 宽度
   * @param {number} config.height - 高度
   * @param {MapSystem} config.mapSystem - 地图系统
   * @param {Object} config.character - 角色数据
   */
  constructor(config) {
    super(config);
    
    this.mapSystem = config.mapSystem;
    this.character = config.character;
    
    // 选中和悬停状态
    this.selectedMap = null;
    this.hoveredMap = null;
    this.hoveredPortal = null;
    
    // 面板状态
    this.isVisible = false;
    
    // 地图节点布局
    this.mapNodes = this.calculateMapLayout();
    
    // 颜色配置
    this.colors = {
      background: 'rgba(20, 25, 35, 0.95)',
      border: '#4a5568',
      mapLocked: '#555555',
      mapUnlocked: '#4CAF50',
      mapCompleted: '#FFD700',
      mapCurrent: '#00BFFF',
      mapSelected: '#FF6B6B',
      mapHovered: '#87CEEB',
      connection: '#666666',
      connectionUnlocked: '#4CAF50',
      text: '#FFFFFF',
      textDisabled: '#888888',
      portalNormal: '#4CAF50',
      portalDungeon: '#9C27B0',
      portalBoss: '#F44336',
      portalSafeZone: '#2196F3'
    };
    
    // 回调函数
    this.onMapSelect = null;
    this.onTeleport = null;
  }

  /**
   * 计算地图布局
   * @returns {Map}
   */
  calculateMapLayout() {
    const nodes = new Map();
    const centerX = this.width / 2;
    const centerY = this.height / 2 - 30;
    
    // 定义地图位置（手动布局）
    const positions = {
      'starter_village': { x: centerX, y: centerY, tier: 1 },
      'green_forest': { x: centerX + 150, y: centerY - 80, tier: 2 },
      'mine_cave': { x: centerX - 150, y: centerY - 100, tier: 2 },
      'poison_swamp': { x: centerX + 250, y: centerY + 50, tier: 3 },
      'forest_boss_area': { x: centerX + 100, y: centerY - 180, tier: 3 },
      'ancient_castle': { x: centerX + 200, y: centerY + 150, tier: 4 },
      'castle_throne': { x: centerX + 100, y: centerY + 230, tier: 5 }
    };
    
    // 定义地图连接
    const connections = [
      ['starter_village', 'green_forest'],
      ['starter_village', 'mine_cave'],
      ['green_forest', 'poison_swamp'],
      ['green_forest', 'forest_boss_area'],
      ['poison_swamp', 'ancient_castle'],
      ['ancient_castle', 'castle_throne']
    ];
    
    for (const [mapId, pos] of Object.entries(positions)) {
      nodes.set(mapId, {
        ...pos,
        connections: connections
          .filter(c => c.includes(mapId))
          .map(c => c.find(id => id !== mapId))
      });
    }
    
    return nodes;
  }

  /**
   * 显示面板
   */
  show() {
    this.isVisible = true;
    this.mapNodes = this.calculateMapLayout();
  }

  /**
   * 隐藏面板
   */
  hide() {
    this.isVisible = false;
    this.selectedMap = null;
    this.hoveredMap = null;
  }

  /**
   * 切换显示状态
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 处理鼠标点击
   * @param {number} mouseX
   * @param {number} mouseY
   * @returns {boolean}
   */
  handleClick(mouseX, mouseY) {
    if (!this.isVisible) return false;
    if (!this.containsPoint(mouseX, mouseY)) return false;

    // 检查关闭按钮
    if (this.isPointInCloseButton(mouseX, mouseY)) {
      this.hide();
      return true;
    }

    // 检查传送按钮
    if (this.selectedMap && this.isPointInTeleportButton(mouseX, mouseY)) {
      this.handleTeleport();
      return true;
    }

    // 检查地图节点
    const clickedMap = this.getMapAtPosition(mouseX, mouseY);
    if (clickedMap) {
      if (this.selectedMap === clickedMap) {
        // 双击传送
        this.handleTeleport();
      } else {
        this.selectedMap = clickedMap;
        this.onMapSelect && this.onMapSelect(clickedMap);
      }
      return true;
    }

    return true;
  }

  /**
   * 处理鼠标移动
   * @param {number} mouseX
   * @param {number} mouseY
   */
  handleMouseMove(mouseX, mouseY) {
    if (!this.isVisible) return;
    
    this.hoveredMap = this.getMapAtPosition(mouseX, mouseY);
  }

  /**
   * 获取指定位置的地图
   * @param {number} x
   * @param {number} y
   * @returns {GameMap|null}
   */
  getMapAtPosition(x, y) {
    const nodeRadius = 25;
    
    for (const [mapId, node] of this.mapNodes) {
      const nodeX = this.x + node.x;
      const nodeY = this.y + node.y;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance <= nodeRadius) {
        return this.mapSystem.getMap(mapId);
      }
    }
    
    return null;
  }

  /**
   * 处理传送
   */
  handleTeleport() {
    if (!this.selectedMap) return;
    
    const currentMap = this.mapSystem.getCurrentMap();
    if (currentMap && currentMap.id === this.selectedMap.id) {
      return; // 已在当前地图
    }
    
    const result = this.mapSystem.changeMap(this.selectedMap.id, this.character);
    if (result.success) {
      this.onTeleport && this.onTeleport(this.selectedMap);
      this.hide();
    } else {
      console.warn(result.message);
    }
  }

  /**
   * 检查点是否在关闭按钮内
   */
  isPointInCloseButton(x, y) {
    const buttonX = this.x + this.width - 35;
    const buttonY = this.y + 10;
    const buttonSize = 25;
    
    return x >= buttonX && x <= buttonX + buttonSize &&
           y >= buttonY && y <= buttonY + buttonSize;
  }

  /**
   * 检查点是否在传送按钮内
   */
  isPointInTeleportButton(x, y) {
    const buttonX = this.x + this.width - 130;
    const buttonY = this.y + this.height - 50;
    const buttonWidth = 100;
    const buttonHeight = 35;
    
    return x >= buttonX && x <= buttonX + buttonWidth &&
           y >= buttonY && y <= buttonY + buttonHeight;
  }

  /**
   * 渲染地图面板
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    if (!this.isVisible) return;

    this.renderBackground(ctx);
    this.renderConnections(ctx);
    this.renderMapNodes(ctx);
    this.renderMapInfo(ctx);
    this.renderButtons(ctx);
    this.renderTitle(ctx);
  }

  /**
   * 渲染背景
   * @param {CanvasRenderingContext2D} ctx
   */
  renderBackground(ctx) {
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.strokeStyle = this.colors.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // 内边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
  }

  /**
   * 渲染地图连接线
   * @param {CanvasRenderingContext2D} ctx
   */
  renderConnections(ctx) {
    const drawnConnections = new Set();
    
    for (const [mapId, node] of this.mapNodes) {
      const map = this.mapSystem.getMap(mapId);
      
      for (const targetId of node.connections) {
        const connectionKey = [mapId, targetId].sort().join('-');
        if (drawnConnections.has(connectionKey)) continue;
        drawnConnections.add(connectionKey);
        
        const targetNode = this.mapNodes.get(targetId);
        if (!targetNode) continue;
        
        const targetMap = this.mapSystem.getMap(targetId);
        const bothUnlocked = map?.state !== MapState.LOCKED && 
                            targetMap?.state !== MapState.LOCKED;
        
        ctx.strokeStyle = bothUnlocked ? this.colors.connectionUnlocked : this.colors.connection;
        ctx.lineWidth = bothUnlocked ? 3 : 2;
        ctx.setLineDash(bothUnlocked ? [] : [5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(this.x + node.x, this.y + node.y);
        ctx.lineTo(this.x + targetNode.x, this.y + targetNode.y);
        ctx.stroke();
        
        ctx.setLineDash([]);
      }
    }
  }

  /**
   * 渲染地图节点
   * @param {CanvasRenderingContext2D} ctx
   */
  renderMapNodes(ctx) {
    const nodeRadius = 25;
    const currentMapId = this.mapSystem.currentMapId;
    
    for (const [mapId, node] of this.mapNodes) {
      const map = this.mapSystem.getMap(mapId);
      if (!map) continue;
      
      const nodeX = this.x + node.x;
      const nodeY = this.y + node.y;
      
      // 确定节点颜色
      let nodeColor;
      let borderColor = '#000';
      let borderWidth = 2;
      
      if (this.selectedMap && this.selectedMap.id === mapId) {
        nodeColor = this.colors.mapSelected;
        borderColor = '#FF0000';
        borderWidth = 3;
      } else if (this.hoveredMap && this.hoveredMap.id === mapId) {
        nodeColor = this.colors.mapHovered;
      } else if (currentMapId === mapId) {
        nodeColor = this.colors.mapCurrent;
        borderColor = '#00FFFF';
        borderWidth = 3;
      } else if (map.state === MapState.COMPLETED) {
        nodeColor = this.colors.mapCompleted;
      } else if (map.state === MapState.UNLOCKED) {
        nodeColor = this.colors.mapUnlocked;
      } else {
        nodeColor = this.colors.mapLocked;
      }
      
      // 绘制节点
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
      
      // 绘制地图名称
      ctx.fillStyle = map.state === MapState.LOCKED ? this.colors.textDisabled : this.colors.text;
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(map.name, nodeX, nodeY + nodeRadius + 5);
      
      // 绘制等级要求
      ctx.fillStyle = '#AAA';
      ctx.font = '9px Arial';
      ctx.fillText(`Lv.${map.minLevel}+`, nodeX, nodeY + nodeRadius + 18);
      
      // 当前地图标记
      if (currentMapId === mapId) {
        ctx.fillStyle = '#00FFFF';
        ctx.font = 'bold 12px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', nodeX, nodeY);
      }
      
      // 锁定图标
      if (map.state === MapState.LOCKED) {
        ctx.fillStyle = '#FFF';
        ctx.font = '16px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', nodeX, nodeY);
      }
    }
  }

  /**
   * 渲染地图信息
   * @param {CanvasRenderingContext2D} ctx
   */
  renderMapInfo(ctx) {
    const displayMap = this.hoveredMap || this.selectedMap;
    if (!displayMap) return;

    const infoX = this.x + 20;
    const infoY = this.y + this.height - 180;
    const infoWidth = 280;
    const infoHeight = 130;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
    
    ctx.strokeStyle = this.colors.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);
    
    let textY = infoY + 20;
    
    // 地图名称
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(displayMap.name, infoX + 10, textY);
    textY += 22;
    
    // 状态
    const stateNames = {
      locked: '未解锁',
      unlocked: '已解锁',
      completed: '已完成'
    };
    const stateColors = {
      locked: '#888',
      unlocked: '#4CAF50',
      completed: '#FFD700'
    };
    ctx.fillStyle = stateColors[displayMap.state];
    ctx.font = '12px Arial';
    ctx.fillText(`状态: ${stateNames[displayMap.state]}`, infoX + 10, textY);
    textY += 18;
    
    // 等级要求
    ctx.fillStyle = this.character.level >= displayMap.minLevel ? '#4CAF50' : '#F44336';
    ctx.fillText(`等级要求: ${displayMap.minLevel} (当前: ${this.character.level})`, infoX + 10, textY);
    textY += 18;
    
    // 描述
    ctx.fillStyle = '#AAA';
    ctx.font = '11px Arial';
    const descLines = this.wrapText(displayMap.description, 35);
    for (const line of descLines) {
      if (textY < infoY + infoHeight - 10) {
        ctx.fillText(line, infoX + 10, textY);
        textY += 14;
      }
    }
    
    // 传送点数量
    const portalCount = displayMap.getAllPortals().length;
    ctx.fillStyle = '#888';
    ctx.fillText(`传送点: ${portalCount}`, infoX + 10, textY);
  }

  /**
   * 渲染按钮
   * @param {CanvasRenderingContext2D} ctx
   */
  renderButtons(ctx) {
    // 传送按钮
    if (this.selectedMap) {
      const buttonX = this.x + this.width - 130;
      const buttonY = this.y + this.height - 50;
      const buttonWidth = 100;
      const buttonHeight = 35;
      
      const canTeleport = this.selectedMap.canEnter(this.character).canEnter &&
                         this.mapSystem.currentMapId !== this.selectedMap.id;
      
      ctx.fillStyle = canTeleport ? '#4CAF50' : '#555';
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      ctx.strokeStyle = canTeleport ? '#66BB6A' : '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('传送', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    }
    
    // 关闭按钮
    const closeX = this.x + this.width - 35;
    const closeY = this.y + 10;
    const closeSize = 25;
    
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(closeX, closeY, closeSize, closeSize);
    
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(closeX, closeY, closeSize, closeSize);
    
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeX + closeSize / 2, closeY + closeSize / 2);
  }

  /**
   * 渲染标题
   * @param {CanvasRenderingContext2D} ctx
   */
  renderTitle(ctx) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('🗺️ 世界地图', this.x + 20, this.y + 15);
    
    // 进度信息
    const progress = this.mapSystem.getProgressInfo();
    ctx.fillStyle = '#AAA';
    ctx.font = '12px Arial';
    ctx.fillText(
      `探索进度: ${progress.unlocked}/${progress.total} (${progress.progress.toFixed(0)}%)`,
      this.x + 20, this.y + 40
    );
  }

  /**
   * 文本换行
   * @param {string} text
   * @param {number} maxLength
   * @returns {Array<string>}
   */
  wrapText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return [text || ''];
    }
    
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < text.length; i++) {
      currentLine += text[i];
      if (currentLine.length >= maxLength || i === text.length - 1) {
        lines.push(currentLine);
        currentLine = '';
      }
    }
    
    return lines;
  }

  /**
   * 设置回调函数
   */
  setOnMapSelect(callback) {
    this.onMapSelect = callback;
  }

  setOnTeleport(callback) {
    this.onTeleport = callback;
  }
}
