/**
 * ChatSystem.js
 * 聊天系统 - 管理游戏内聊天功能
 */

/**
 * 聊天频道枚举
 */
export const ChatChannel = {
  WORLD: 'world',       // 世界频道
  MAP: 'map',           // 地图频道
  TEAM: 'team',         // 队伍频道
  GUILD: 'guild',       // 公会频道
  PRIVATE: 'private',   // 私聊
  SYSTEM: 'system',     // 系统消息
  COMBAT: 'combat'      // 战斗日志
};

/**
 * 消息类型枚举
 */
export const ChatMessageType = {
  TEXT: 'text',         // 普通文本
  EMOTE: 'emote',       // 表情
  ITEM: 'item',         // 物品链接
  LOCATION: 'location', // 位置分享
  SYSTEM: 'system'      // 系统消息
};

/**
 * 聊天消息类
 */
export class ChatMessage {
  constructor(config = {}) {
    this.id = config.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.channel = config.channel || ChatChannel.WORLD;
    this.type = config.type || ChatMessageType.TEXT;
    this.senderId = config.senderId || null;
    this.senderName = config.senderName || 'Unknown';
    this.content = config.content || '';
    this.timestamp = config.timestamp || Date.now();
    this.targetId = config.targetId || null;
    this.targetName = config.targetName || null;
    this.data = config.data || {};
  }

  /**
   * 格式化显示
   * @returns {string}
   */
  format() {
    const time = new Date(this.timestamp).toLocaleTimeString();
    const channelLabel = this.getChannelLabel();
    
    if (this.channel === ChatChannel.PRIVATE) {
      return `[${time}] [私聊] ${this.senderName} -> ${this.targetName}: ${this.content}`;
    }
    
    if (this.channel === ChatChannel.SYSTEM) {
      return `[${time}] [系统] ${this.content}`;
    }
    
    return `[${time}] [${channelLabel}] ${this.senderName}: ${this.content}`;
  }

  /**
   * 获取频道标签
   * @returns {string}
   */
  getChannelLabel() {
    const labels = {
      [ChatChannel.WORLD]: '世界',
      [ChatChannel.MAP]: '地图',
      [ChatChannel.TEAM]: '队伍',
      [ChatChannel.GUILD]: '公会',
      [ChatChannel.PRIVATE]: '私聊',
      [ChatChannel.SYSTEM]: '系统',
      [ChatChannel.COMBAT]: '战斗'
    };
    return labels[this.channel] || this.channel;
  }
}

/**
 * 聊天系统类
 */
export class ChatSystem {
  constructor(config = {}) {
    this.messages = new Map(); // 按频道存储消息
    this.maxMessagesPerChannel = config.maxMessagesPerChannel || 100;
    this.blockedUsers = new Set();
    this.mutedChannels = new Set();
    
    // 快捷消息
    this.quickMessages = config.quickMessages || [
      '你好！',
      '谢谢！',
      '再见！',
      '组队吗？',
      '等等我！',
      '小心！'
    ];
    
    // 表情列表
    this.emotes = config.emotes || [
      { id: 'smile', text: '😊', name: '微笑' },
      { id: 'laugh', text: '😂', name: '大笑' },
      { id: 'sad', text: '😢', name: '难过' },
      { id: 'angry', text: '😠', name: '生气' },
      { id: 'love', text: '❤️', name: '爱心' },
      { id: 'thumbsup', text: '👍', name: '点赞' },
      { id: 'wave', text: '👋', name: '挥手' },
      { id: 'think', text: '🤔', name: '思考' }
    ];
    
    // 敏感词过滤
    this.filterEnabled = config.filterEnabled !== false;
    this.filterWords = config.filterWords || ['脏话', '敏感词'];
    
    // 发送限制
    this.rateLimitEnabled = config.rateLimitEnabled !== false;
    this.rateLimitInterval = config.rateLimitInterval || 1000;
    this.lastSendTime = new Map();
    
    // 事件监听器
    this.listeners = new Map();
    
    // 初始化频道
    Object.values(ChatChannel).forEach(channel => {
      this.messages.set(channel, []);
    });
  }

  /**
   * 发送消息
   * @param {Object} config
   * @returns {{ success: boolean, message?: ChatMessage, error?: string }}
   */
  sendMessage(config) {
    const { channel, senderId, senderName, content, targetId, targetName, type } = config;
    
    // 检查频道是否被静音
    if (this.mutedChannels.has(channel)) {
      return { success: false, error: '该频道已被静音' };
    }
    
    // 检查发送频率
    if (this.rateLimitEnabled && senderId) {
      const lastTime = this.lastSendTime.get(senderId) || 0;
      if (Date.now() - lastTime < this.rateLimitInterval) {
        return { success: false, error: '发送太频繁，请稍后再试' };
      }
    }
    
    // 过滤敏感词
    let filteredContent = content;
    if (this.filterEnabled) {
      filteredContent = this.filterContent(content);
    }
    
    // 创建消息
    const message = new ChatMessage({
      channel,
      type: type || ChatMessageType.TEXT,
      senderId,
      senderName,
      content: filteredContent,
      targetId,
      targetName
    });
    
    // 添加到消息列表
    this.addMessage(message);
    
    // 更新发送时间
    if (senderId) {
      this.lastSendTime.set(senderId, Date.now());
    }
    
    // 触发事件
    this.emit('messageSent', message);
    
    return { success: true, message };
  }

  /**
   * 添加消息到频道
   * @param {ChatMessage} message
   */
  addMessage(message) {
    const channelMessages = this.messages.get(message.channel);
    if (!channelMessages) return;
    
    channelMessages.push(message);
    
    // 限制消息数量
    while (channelMessages.length > this.maxMessagesPerChannel) {
      channelMessages.shift();
    }
    
    this.emit('messageReceived', message);
  }

  /**
   * 接收远程消息
   * @param {Object} data
   */
  receiveMessage(data) {
    // 检查是否被屏蔽
    if (this.blockedUsers.has(data.senderId)) {
      return;
    }
    
    const message = new ChatMessage(data);
    this.addMessage(message);
  }

  /**
   * 发送系统消息
   * @param {string} content
   * @param {string} channel
   */
  sendSystemMessage(content, channel = ChatChannel.SYSTEM) {
    const message = new ChatMessage({
      channel,
      type: ChatMessageType.SYSTEM,
      senderName: '系统',
      content
    });
    
    this.addMessage(message);
  }

  /**
   * 过滤敏感词
   * @param {string} content
   * @returns {string}
   */
  filterContent(content) {
    let filtered = content;
    for (const word of this.filterWords) {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    }
    return filtered;
  }

  /**
   * 获取频道消息
   * @param {string} channel
   * @param {number} limit
   * @returns {ChatMessage[]}
   */
  getMessages(channel, limit = 50) {
    const messages = this.messages.get(channel) || [];
    return messages.slice(-limit);
  }

  /**
   * 获取所有频道的最新消息
   * @param {number} limit
   * @returns {ChatMessage[]}
   */
  getAllMessages(limit = 100) {
    const allMessages = [];
    for (const messages of this.messages.values()) {
      allMessages.push(...messages);
    }
    return allMessages
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  }

  /**
   * 清空频道消息
   * @param {string} channel
   */
  clearChannel(channel) {
    if (this.messages.has(channel)) {
      this.messages.set(channel, []);
      this.emit('channelCleared', channel);
    }
  }

  /**
   * 屏蔽用户
   * @param {string} userId
   */
  blockUser(userId) {
    this.blockedUsers.add(userId);
    this.emit('userBlocked', userId);
  }

  /**
   * 取消屏蔽用户
   * @param {string} userId
   */
  unblockUser(userId) {
    this.blockedUsers.delete(userId);
    this.emit('userUnblocked', userId);
  }

  /**
   * 检查用户是否被屏蔽
   * @param {string} userId
   * @returns {boolean}
   */
  isBlocked(userId) {
    return this.blockedUsers.has(userId);
  }

  /**
   * 静音频道
   * @param {string} channel
   */
  muteChannel(channel) {
    this.mutedChannels.add(channel);
    this.emit('channelMuted', channel);
  }

  /**
   * 取消静音频道
   * @param {string} channel
   */
  unmuteChannel(channel) {
    this.mutedChannels.delete(channel);
    this.emit('channelUnmuted', channel);
  }

  /**
   * 检查频道是否被静音
   * @param {string} channel
   * @returns {boolean}
   */
  isMuted(channel) {
    return this.mutedChannels.has(channel);
  }

  /**
   * 获取表情
   * @param {string} emoteId
   * @returns {Object|null}
   */
  getEmote(emoteId) {
    return this.emotes.find(e => e.id === emoteId) || null;
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

  /**
   * 获取统计信息
   */
  getStats() {
    let totalMessages = 0;
    for (const messages of this.messages.values()) {
      totalMessages += messages.length;
    }
    
    return {
      totalMessages,
      blockedUsers: this.blockedUsers.size,
      mutedChannels: this.mutedChannels.size,
      channels: Object.values(ChatChannel).length
    };
  }

  /**
   * 重置系统
   */
  reset() {
    Object.values(ChatChannel).forEach(channel => {
      this.messages.set(channel, []);
    });
    this.blockedUsers.clear();
    this.mutedChannels.clear();
    this.lastSendTime.clear();
  }
}
