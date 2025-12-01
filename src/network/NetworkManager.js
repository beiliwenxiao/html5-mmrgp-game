import { MockWebSocket } from './MockWebSocket.js';
import { MockDataService } from '../data/MockDataService.js';

/**
 * 网络管理器
 * 统一管理网络通信和数据服务
 */
export class NetworkManager {
    constructor(config = {}) {
        this.config = {
            useMockData: true,
            mockDelay: 100,
            serverUrl: 'ws://localhost:8080',
            debugMode: true,
            ...config
        };

        // 初始化模拟数据服务
        this.mockDataService = new MockDataService();
        
        // 初始化WebSocket客户端
        this.webSocket = new MockWebSocket(this.config);
        
        // 当前会话信息
        this.sessionId = null;
        this.currentCharacter = null;
        
        this.logDebug('NetworkManager initialized', this.config);
    }

    /**
     * 连接到服务器
     */
    async connect() {
        try {
            await this.webSocket.connect();
            this.logDebug('Connected to server');
            return true;
        } catch (error) {
            console.error('NetworkManager: Failed to connect', error);
            return false;
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        this.webSocket.disconnect();
        this.sessionId = null;
        this.currentCharacter = null;
        this.logDebug('Disconnected from server');
    }

    /**
     * 登录
     */
    async login(username, password) {
        try {
            const response = await this.webSocket.send('login', {
                username,
                password
            });

            if (response.data.success) {
                this.sessionId = response.data.sessionId;
                this.logDebug('Login successful', response.data);
            }

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Login failed', error);
            throw error;
        }
    }

    /**
     * 创建角色
     */
    async createCharacter(name, classType) {
        try {
            // 使用MockDataService创建角色
            const character = this.mockDataService.createCharacter(name, classType);
            
            // 发送到服务器（模拟）
            const response = await this.webSocket.send('create_character', {
                character
            });

            if (response.data.success) {
                this.logDebug('Character created', character);
            }

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Failed to create character', error);
            throw error;
        }
    }

    /**
     * 选择角色
     */
    async selectCharacter(character) {
        try {
            const response = await this.webSocket.send('select_character', {
                character
            });

            if (response.data.success) {
                this.currentCharacter = character;
                this.logDebug('Character selected', character);
            }

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Failed to select character', error);
            throw error;
        }
    }

    /**
     * 发送移动消息
     */
    async sendMove(position) {
        try {
            const response = await this.webSocket.send('move', {
                characterId: this.currentCharacter?.id,
                position
            });

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Failed to send move', error);
            throw error;
        }
    }

    /**
     * 发送攻击消息
     */
    async sendAttack(targetId, attack, defense) {
        try {
            const response = await this.webSocket.send('attack', {
                attackerId: this.currentCharacter?.id,
                targetId,
                attack,
                defense
            });

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Failed to send attack', error);
            throw error;
        }
    }

    /**
     * 发送技能使用消息
     */
    async sendUseSkill(skillId, targetId, damage, heal) {
        try {
            const response = await this.webSocket.send('use_skill', {
                casterId: this.currentCharacter?.id,
                skillId,
                targetId,
                damage,
                heal
            });

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Failed to send use skill', error);
            throw error;
        }
    }

    /**
     * 发送伤害消息
     */
    async sendDamage(targetId, damage, currentHp) {
        try {
            const response = await this.webSocket.send('damage', {
                targetId,
                damage,
                currentHp
            });

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Failed to send damage', error);
            throw error;
        }
    }

    /**
     * 发送死亡消息
     */
    async sendDeath(entityId, killerId, expReward) {
        try {
            const response = await this.webSocket.send('death', {
                entityId,
                killerId,
                expReward
            });

            return response.data;
        } catch (error) {
            console.error('NetworkManager: Failed to send death', error);
            throw error;
        }
    }

    /**
     * 注册消息处理器
     */
    onMessage(messageType, handler) {
        this.webSocket.on(messageType, handler);
    }

    /**
     * 移除消息处理器
     */
    offMessage(messageType, handler) {
        this.webSocket.off(messageType, handler);
    }

    /**
     * 获取角色模板
     */
    getCharacterTemplate(classType) {
        return this.mockDataService.getCharacterTemplate(classType);
    }

    /**
     * 获取所有角色模板
     */
    getAllCharacterTemplates() {
        return this.mockDataService.getAllCharacterTemplates();
    }

    /**
     * 获取敌人模板
     */
    getEnemyTemplate(enemyId) {
        return this.mockDataService.getEnemyTemplate(enemyId);
    }

    /**
     * 获取技能数据
     */
    getSkillData(skillId) {
        return this.mockDataService.getSkillData(skillId);
    }

    /**
     * 获取角色技能列表
     */
    getCharacterSkills(classType) {
        return this.mockDataService.getCharacterSkills(classType);
    }

    /**
     * 获取地图数据
     */
    getMapData(mapId) {
        return this.mockDataService.getMapData(mapId);
    }

    /**
     * 创建敌人实例
     */
    createEnemy(templateId, position) {
        return this.mockDataService.createEnemy(templateId, position);
    }

    /**
     * 获取连接状态
     */
    getConnectionStatus() {
        return this.webSocket.getConnectionStatus();
    }

    /**
     * 获取当前角色
     */
    getCurrentCharacter() {
        return this.currentCharacter;
    }

    /**
     * 切换模式（模拟/真实服务器）
     */
    setMockMode(useMockData) {
        this.config.useMockData = useMockData;
        this.webSocket.config.useMockData = useMockData;
        this.logDebug(`Mock mode ${useMockData ? 'enabled' : 'disabled'}`);
    }

    /**
     * 调试日志
     */
    logDebug(message, data) {
        if (this.config.debugMode) {
            if (data) {
                console.log(`[NetworkManager] ${message}`, data);
            } else {
                console.log(`[NetworkManager] ${message}`);
            }
        }
    }
}
