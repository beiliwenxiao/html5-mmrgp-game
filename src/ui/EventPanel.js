/**
 * EventPanel.js
 * 事件通知面板UI组件
 */

import { EventType, EventState } from '../systems/EventSystem.js';

/**
 * 事件面板类
 */
export class EventPanel {
  constructor(eventSystem) {
    this.eventSystem = eventSystem;
    this.container = null;
    this.eventList = null;
    this.notificationQueue = [];
    this.maxNotifications = 5;
    this.notificationDuration = 5000; // 5秒
    
    // 事件类型图标映射
    this.eventIcons = {
      [EventType.ELITE_SPAWN]: '👹',
      [EventType.TREASURE_CHEST]: '📦',
      [EventType.WORLD_BOSS]: '🐉',
      [EventType.INVASION]: '⚔️',
      [EventType.BONUS_EXP]: '✨',
      [EventType.BONUS_DROP]: '💎',
      [EventType.MERCHANT]: '🛒',
      [EventType.PORTAL]: '🌀'
    };

    // 事件类型颜色映射
    this.eventColors = {
      [EventType.ELITE_SPAWN]: '#ff6b6b',
      [EventType.TREASURE_CHEST]: '#ffd93d',
      [EventType.WORLD_BOSS]: '#9b59b6',
      [EventType.INVASION]: '#e74c3c',
      [EventType.BONUS_EXP]: '#2ecc71',
      [EventType.BONUS_DROP]: '#3498db',
      [EventType.MERCHANT]: '#f39c12',
      [EventType.PORTAL]: '#1abc9c'
    };

    this.init();
  }

  /**
   * 初始化面板
   */
  init() {
    this.createContainer();
    this.bindEvents();
  }


  /**
   * 创建容器
   */
  createContainer() {
    // 主容器
    this.container = document.createElement('div');
    this.container.id = 'event-panel';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 320px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.85);
      border: 2px solid #4a4a4a;
      border-radius: 8px;
      color: white;
      font-family: 'Microsoft YaHei', Arial, sans-serif;
      z-index: 1000;
      overflow: hidden;
    `;

    // 标题栏
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 10px 15px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border-bottom: 1px solid #4a4a4a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span style="font-size: 16px; font-weight: bold;">🎯 世界事件</span>
      <span id="event-count" style="font-size: 12px; color: #95a5a6;">0 个活跃</span>
    `;
    this.container.appendChild(header);

    // 事件列表
    this.eventList = document.createElement('div');
    this.eventList.id = 'event-list';
    this.eventList.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
      padding: 10px;
    `;
    this.container.appendChild(this.eventList);

    // 通知容器
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'event-notifications';
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2000;
      pointer-events: none;
    `;
    document.body.appendChild(this.notificationContainer);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    if (this.eventSystem) {
      this.eventSystem.on('eventCreated', (event) => this.onEventCreated(event));
      this.eventSystem.on('eventStart', (event) => this.onEventStart(event));
      this.eventSystem.on('eventComplete', (event) => this.onEventComplete(event));
      this.eventSystem.on('eventExpire', (event) => this.onEventExpire(event));
      this.eventSystem.on('eventProgress', (data) => this.onEventProgress(data));
    }
  }

  /**
   * 显示面板
   */
  show() {
    if (!this.container.parentNode) {
      document.body.appendChild(this.container);
    }
    this.container.style.display = 'block';
    this.refresh();
  }

  /**
   * 隐藏面板
   */
  hide() {
    this.container.style.display = 'none';
  }

  /**
   * 切换显示
   */
  toggle() {
    if (this.container.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * 刷新事件列表
   */
  refresh() {
    if (!this.eventSystem) return;

    const events = this.eventSystem.getActiveEvents();
    this.eventList.innerHTML = '';

    // 更新计数
    const countEl = document.getElementById('event-count');
    if (countEl) {
      countEl.textContent = `${events.length} 个活跃`;
    }

    if (events.length === 0) {
      this.eventList.innerHTML = `
        <div style="text-align: center; color: #7f8c8d; padding: 20px;">
          暂无活跃事件
        </div>
      `;
      return;
    }

    // 按类型排序（世界Boss优先）
    events.sort((a, b) => {
      const priority = {
        [EventType.WORLD_BOSS]: 0,
        [EventType.INVASION]: 1,
        [EventType.ELITE_SPAWN]: 2,
        [EventType.TREASURE_CHEST]: 3,
        [EventType.PORTAL]: 4,
        [EventType.MERCHANT]: 5,
        [EventType.BONUS_EXP]: 6,
        [EventType.BONUS_DROP]: 7
      };
      return (priority[a.type] || 99) - (priority[b.type] || 99);
    });

    events.forEach(event => {
      const eventEl = this.createEventElement(event);
      this.eventList.appendChild(eventEl);
    });
  }

  /**
   * 创建事件元素
   * @param {WorldEvent} event
   * @returns {HTMLElement}
   */
  createEventElement(event) {
    const el = document.createElement('div');
    el.className = 'event-item';
    el.dataset.eventId = event.id;
    
    const color = this.eventColors[event.type] || '#95a5a6';
    const icon = this.eventIcons[event.type] || '❓';
    const remainingTime = event.getRemainingTime();
    const progressPercent = event.getProgressPercent();

    el.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border-left: 3px solid ${color};
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: background 0.2s;
    `;

    el.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
        <span style="font-size: 14px; font-weight: bold;">
          ${icon} ${event.name}
        </span>
        <span style="font-size: 12px; color: ${remainingTime < 60 ? '#e74c3c' : '#95a5a6'};">
          ${this.formatTime(remainingTime)}
        </span>
      </div>
      <div style="font-size: 12px; color: #bdc3c7; margin-bottom: 8px;">
        ${event.description}
      </div>
      <div style="background: rgba(0, 0, 0, 0.3); border-radius: 4px; height: 6px; overflow: hidden;">
        <div style="
          width: ${progressPercent}%;
          height: 100%;
          background: ${color};
          transition: width 0.3s;
        "></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px; color: #7f8c8d;">
        <span>进度: ${Math.floor(progressPercent)}%</span>
        <span>参与者: ${event.participants.size}</span>
      </div>
    `;

    el.addEventListener('mouseenter', () => {
      el.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.background = 'rgba(255, 255, 255, 0.05)';
    });

    el.addEventListener('click', () => {
      this.onEventClick(event);
    });

    return el;
  }

  /**
   * 格式化时间
   * @param {number} seconds
   * @returns {string}
   */
  formatTime(seconds) {
    if (seconds <= 0) return '已结束';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    }
    return `${secs}秒`;
  }

  /**
   * 显示通知
   * @param {string} message
   * @param {string} type - 通知类型
   * @param {string} color - 颜色
   */
  showNotification(message, type = 'info', color = '#3498db') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid ${color};
      border-radius: 8px;
      padding: 15px 25px;
      margin-bottom: 10px;
      text-align: center;
      animation: eventNotificationIn 0.5s ease-out;
      box-shadow: 0 0 20px ${color}40;
    `;
    notification.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; color: ${color}; margin-bottom: 5px;">
        ${message}
      </div>
    `;

    this.notificationContainer.appendChild(notification);

    // 自动移除
    setTimeout(() => {
      notification.style.animation = 'eventNotificationOut 0.5s ease-in forwards';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, this.notificationDuration);

    // 添加动画样式
    this.addNotificationStyles();
  }

  /**
   * 添加通知动画样式
   */
  addNotificationStyles() {
    if (document.getElementById('event-notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'event-notification-styles';
    style.textContent = `
      @keyframes eventNotificationIn {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes eventNotificationOut {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 事件创建回调
   * @param {WorldEvent} event
   */
  onEventCreated(event) {
    const icon = this.eventIcons[event.type] || '❓';
    const color = this.eventColors[event.type] || '#95a5a6';
    this.showNotification(`${icon} ${event.name} 即将开始！`, 'created', color);
    this.refresh();
  }

  /**
   * 事件开始回调
   * @param {WorldEvent} event
   */
  onEventStart(event) {
    const icon = this.eventIcons[event.type] || '❓';
    const color = this.eventColors[event.type] || '#95a5a6';
    this.showNotification(`${icon} ${event.name} 已开始！`, 'start', color);
    this.refresh();
  }

  /**
   * 事件完成回调
   * @param {WorldEvent} event
   */
  onEventComplete(event) {
    const icon = this.eventIcons[event.type] || '❓';
    this.showNotification(`${icon} ${event.name} 已完成！`, 'complete', '#2ecc71');
    this.refresh();
  }

  /**
   * 事件过期回调
   * @param {WorldEvent} event
   */
  onEventExpire(event) {
    const icon = this.eventIcons[event.type] || '❓';
    this.showNotification(`${icon} ${event.name} 已过期`, 'expire', '#e74c3c');
    this.refresh();
  }

  /**
   * 事件进度回调
   * @param {Object} data
   */
  onEventProgress(data) {
    const eventEl = this.eventList.querySelector(`[data-event-id="${data.event.id}"]`);
    if (eventEl) {
      const progressBar = eventEl.querySelector('div > div');
      if (progressBar) {
        progressBar.style.width = `${data.event.getProgressPercent()}%`;
      }
    }
  }

  /**
   * 事件点击回调
   * @param {WorldEvent} event
   */
  onEventClick(event) {
    // 可以扩展为显示详细信息或传送到事件位置
    console.log('Event clicked:', event);
  }

  /**
   * 更新面板
   * @param {number} deltaTime
   */
  update(deltaTime) {
    // 定期刷新显示
    this.refresh();
  }

  /**
   * 销毁面板
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.notificationContainer && this.notificationContainer.parentNode) {
      this.notificationContainer.parentNode.removeChild(this.notificationContainer);
    }
  }
}
