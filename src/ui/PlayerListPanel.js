/**
 * PlayerListPanel.js
 * 玩家列表面板 - 显示附近玩家和在线玩家列表
 */

import { PlayerState } from '../systems/PlayerSyncSystem.js';

/**
 * 玩家列表面板类
 */
export class PlayerListPanel {
  constructor(config = {}) {
    this.container = null;
    this.playerSyncSystem = null;
    this.networkManager = null;
    
    // 配置
    this.config = {
      maxDisplayPlayers: config.maxDisplayPlayers || 20,
      updateInterval: config.updateInterval || 1000,
      showOfflinePlayers: config.showOfflinePlayers || false,
      ...config
    };
    
    // 状态
    this.isVisible = false;
    this.selectedPlayerId = null;
    this.filterText = '';
    this.sortBy = 'distance'; // distance, name, level
    
    // 更新定时器
    this.updateTimer = null;
    
    // 事件监听器
    this.listeners = new Map();
    
    // 本地玩家位置（用于距离计算）
    this.localPlayerPosition = { x: 0, y: 0 };
  }

  /**
   * 初始化面板
   */
  initialize(playerSyncSystem, networkManager = null) {
    this.playerSyncSystem = playerSyncSystem;
    this.networkManager = networkManager;
    
    this.createUI();
    this.bindEvents();
    this.startUpdate();
  }

  /**
   * 销毁面板
   */
  destroy() {
    this.stopUpdate();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.listeners.clear();
  }

  /**
   * 创建UI
   */
  createUI() {
    this.container = document.createElement('div');
    this.container.className = 'player-list-panel';
    this.container.innerHTML = `
      <div class="panel-header">
        <h3>附近玩家</h3>
        <div class="panel-controls">
          <span class="player-count">0 在线</span>
          <button class="btn-close" title="关闭">×</button>
        </div>
      </div>
      <div class="panel-toolbar">
        <input type="text" class="search-input" placeholder="搜索玩家...">
        <select class="sort-select">
          <option value="distance">按距离</option>
          <option value="name">按名称</option>
          <option value="level">按等级</option>
        </select>
      </div>
      <div class="player-list"></div>
      <div class="panel-footer">
        <button class="btn-refresh" title="刷新">🔄 刷新</button>
      </div>
    `;

    this.applyStyles();
    document.body.appendChild(this.container);
    
    // 默认隐藏
    this.hide();
  }

  /**
   * 应用样式
   */
  applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .player-list-panel {
        position: fixed;
        right: 20px;
        top: 100px;
        width: 280px;
        max-height: 500px;
        background: rgba(0, 0, 0, 0.85);
        border: 1px solid #444;
        border-radius: 8px;
        color: #fff;
        font-family: Arial, sans-serif;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }

      .player-list-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid #444;
        border-radius: 8px 8px 0 0;
      }

      .player-list-panel .panel-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: bold;
      }

      .player-list-panel .panel-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .player-list-panel .player-count {
        font-size: 12px;
        color: #4CAF50;
      }

      .player-list-panel .btn-close {
        background: none;
        border: none;
        color: #999;
        font-size: 18px;
        cursor: pointer;
        padding: 0 5px;
      }

      .player-list-panel .btn-close:hover {
        color: #fff;
      }

      .player-list-panel .panel-toolbar {
        display: flex;
        gap: 8px;
        padding: 10px;
        border-bottom: 1px solid #333;
      }

      .player-list-panel .search-input {
        flex: 1;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
      }

      .player-list-panel .search-input::placeholder {
        color: #888;
      }

      .player-list-panel .sort-select {
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
      }

      .player-list-panel .player-list {
        flex: 1;
        overflow-y: auto;
        max-height: 350px;
      }

      .player-list-panel .player-item {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #333;
        cursor: pointer;
        transition: background 0.2s;
      }

      .player-list-panel .player-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .player-list-panel .player-item.selected {
        background: rgba(76, 175, 80, 0.2);
        border-left: 3px solid #4CAF50;
      }

      .player-list-panel .player-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #4CAF50;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-size: 14px;
        font-weight: bold;
      }

      .player-list-panel .player-avatar.offline {
        background: #607D8B;
      }

      .player-list-panel .player-avatar.attacking {
        background: #FF5722;
      }

      .player-list-panel .player-avatar.dead {
        background: #9E9E9E;
      }

      .player-list-panel .player-info {
        flex: 1;
        min-width: 0;
      }

      .player-list-panel .player-name {
        font-size: 13px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .player-list-panel .player-details {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      }

      .player-list-panel .player-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      .player-list-panel .player-distance {
        font-size: 11px;
        color: #888;
      }

      .player-list-panel .player-hp-bar {
        width: 50px;
        height: 4px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
      }

      .player-list-panel .player-hp-fill {
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s;
      }

      .player-list-panel .player-hp-fill.low {
        background: #f44336;
      }

      .player-list-panel .player-hp-fill.medium {
        background: #FF9800;
      }

      .player-list-panel .panel-footer {
        padding: 10px;
        border-top: 1px solid #333;
        text-align: center;
      }

      .player-list-panel .btn-refresh {
        padding: 6px 15px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .player-list-panel .btn-refresh:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .player-list-panel .empty-message {
        padding: 30px;
        text-align: center;
        color: #888;
        font-size: 13px;
      }

      .player-list-panel .context-menu {
        position: absolute;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #444;
        border-radius: 4px;
        padding: 5px 0;
        z-index: 1001;
        min-width: 120px;
      }

      .player-list-panel .context-menu-item {
        padding: 8px 15px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }

      .player-list-panel .context-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 关闭按钮
    const closeBtn = this.container.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => this.hide());

    // 搜索输入
    const searchInput = this.container.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
      this.filterText = e.target.value.toLowerCase();
      this.refresh();
    });

    // 排序选择
    const sortSelect = this.container.querySelector('.sort-select');
    sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.refresh();
    });

    // 刷新按钮
    const refreshBtn = this.container.querySelector('.btn-refresh');
    refreshBtn.addEventListener('click', () => this.refresh());

    // 玩家列表点击
    const playerList = this.container.querySelector('.player-list');
    playerList.addEventListener('click', (e) => {
      const playerItem = e.target.closest('.player-item');
      if (playerItem) {
        const playerId = playerItem.dataset.playerId;
        this.selectPlayer(playerId);
      }
    });

    // 右键菜单
    playerList.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const playerItem = e.target.closest('.player-item');
      if (playerItem) {
        const playerId = playerItem.dataset.playerId;
        this.showContextMenu(playerId, e.clientX, e.clientY);
      }
    });

    // 点击其他地方关闭右键菜单
    document.addEventListener('click', () => this.hideContextMenu());
  }

  /**
   * 开始更新
   */
  startUpdate() {
    this.stopUpdate();
    this.updateTimer = setInterval(() => {
      if (this.isVisible) {
        this.refresh();
      }
    }, this.config.updateInterval);
  }

  /**
   * 停止更新
   */
  stopUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * 显示面板
   */
  show() {
    this.isVisible = true;
    this.container.style.display = 'flex';
    this.refresh();
  }

  /**
   * 隐藏面板
   */
  hide() {
    this.isVisible = false;
    this.container.style.display = 'none';
    this.hideContextMenu();
  }

  /**
   * 切换显示
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 设置本地玩家位置
   */
  setLocalPlayerPosition(x, y) {
    this.localPlayerPosition = { x, y };
  }

  /**
   * 刷新玩家列表
   */
  refresh() {
    if (!this.playerSyncSystem) return;

    let players = this.playerSyncSystem.getAllPlayers();

    // 过滤
    if (this.filterText) {
      players = players.filter(p => 
        p.name.toLowerCase().includes(this.filterText)
      );
    }

    // 计算距离
    players = players.map(p => ({
      ...p,
      distance: this.calculateDistance(p.position)
    }));

    // 排序
    players.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.level - a.level;
        case 'distance':
        default:
          return a.distance - b.distance;
      }
    });

    // 限制显示数量
    players = players.slice(0, this.config.maxDisplayPlayers);

    this.renderPlayerList(players);
    this.updatePlayerCount();
  }

  /**
   * 计算距离
   */
  calculateDistance(position) {
    const dx = position.x - this.localPlayerPosition.x;
    const dy = position.y - this.localPlayerPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 渲染玩家列表
   */
  renderPlayerList(players) {
    const listContainer = this.container.querySelector('.player-list');

    if (players.length === 0) {
      listContainer.innerHTML = '<div class="empty-message">附近没有其他玩家</div>';
      return;
    }

    listContainer.innerHTML = players.map(player => this.renderPlayerItem(player)).join('');
  }

  /**
   * 渲染单个玩家项
   */
  renderPlayerItem(player) {
    const isSelected = player.id === this.selectedPlayerId;
    const avatarClass = this.getAvatarClass(player.state);
    const hpPercent = Math.round((player.hp / player.maxHp) * 100);
    const hpClass = hpPercent < 30 ? 'low' : hpPercent < 60 ? 'medium' : '';
    const distanceText = this.formatDistance(player.distance);
    const initial = player.name.charAt(0).toUpperCase();

    return `
      <div class="player-item ${isSelected ? 'selected' : ''}" data-player-id="${player.id}">
        <div class="player-avatar ${avatarClass}">${initial}</div>
        <div class="player-info">
          <div class="player-name">${this.escapeHtml(player.name)}</div>
          <div class="player-details">Lv.${player.level} · ${player.classType || '战士'}</div>
        </div>
        <div class="player-status">
          <div class="player-distance">${distanceText}</div>
          <div class="player-hp-bar">
            <div class="player-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 获取头像样式类
   */
  getAvatarClass(state) {
    switch (state) {
      case PlayerState.OFFLINE:
        return 'offline';
      case PlayerState.ATTACKING:
      case PlayerState.CASTING:
        return 'attacking';
      case PlayerState.DEAD:
        return 'dead';
      default:
        return '';
    }
  }

  /**
   * 格式化距离
   */
  formatDistance(distance) {
    if (distance < 100) {
      return `${Math.round(distance)}m`;
    } else if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  /**
   * 更新玩家数量显示
   */
  updatePlayerCount() {
    const countEl = this.container.querySelector('.player-count');
    const count = this.playerSyncSystem ? this.playerSyncSystem.getPlayerCount() : 0;
    countEl.textContent = `${count} 在线`;
  }

  /**
   * 选择玩家
   */
  selectPlayer(playerId) {
    this.selectedPlayerId = playerId;
    this.refresh();
    this.emit('playerSelected', { playerId });
  }

  /**
   * 显示右键菜单
   */
  showContextMenu(playerId, x, y) {
    this.hideContextMenu();

    const player = this.playerSyncSystem.getPlayer(playerId);
    if (!player) return;

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="context-menu-item" data-action="whisper">私聊</div>
      <div class="context-menu-item" data-action="invite">邀请组队</div>
      <div class="context-menu-item" data-action="addFriend">添加好友</div>
      <div class="context-menu-item" data-action="viewProfile">查看资料</div>
      <div class="context-menu-item" data-action="follow">跟随</div>
    `;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.context-menu-item');
      if (item) {
        const action = item.dataset.action;
        this.handleContextAction(action, playerId);
        this.hideContextMenu();
      }
    });

    this.container.appendChild(menu);
    this.contextMenu = menu;
  }

  /**
   * 隐藏右键菜单
   */
  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.remove();
      this.contextMenu = null;
    }
  }

  /**
   * 处理右键菜单动作
   */
  handleContextAction(action, playerId) {
    const player = this.playerSyncSystem.getPlayer(playerId);
    if (!player) return;

    switch (action) {
      case 'whisper':
        this.emit('whisper', { playerId, playerName: player.name });
        break;
      case 'invite':
        this.emit('inviteTeam', { playerId, playerName: player.name });
        break;
      case 'addFriend':
        this.emit('addFriend', { playerId, playerName: player.name });
        break;
      case 'viewProfile':
        this.emit('viewProfile', { playerId, player });
        break;
      case 'follow':
        this.emit('follow', { playerId, position: player.position });
        break;
    }
  }

  /**
   * HTML转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 添加事件监听器
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * 移除事件监听器
   */
  off(eventName, callback) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  emit(eventName, data) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export default PlayerListPanel;
