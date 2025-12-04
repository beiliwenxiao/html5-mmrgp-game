# 游戏资源目录

## 概述

此目录用于存放游戏的静态资源文件，包括图片、音频等。

## 当前状态

目前游戏使用**占位符资源系统**，通过 `PlaceholderAssets` 类动态生成简单的精灵图和UI元素。这样可以在没有美术资源的情况下快速开始开发。

## 占位符资源

占位符资源通过 Canvas API 实时生成，包括：

### 角色精灵
- **战士 (Warrior)**: 红色，剑标识 ⚔
- **法师 (Mage)**: 蓝色，星标识 ✦
- **弓箭手 (Archer)**: 绿色，箭标识 ➶

### 敌人精灵
- **史莱姆 (Slime)**: 绿色椭圆形
- **哥布林 (Goblin)**: 浅绿色类人形
- **骷髅 (Skeleton)**: 灰白色类人形

### 技能图标
- 普通攻击 (attack)
- 火球术 (fireball)
- 治疗术 (heal)
- 护盾 (shield)
- 箭雨 (arrow)
- 冰霜 (frost)

### UI元素
- 生命值条背景和填充
- 魔法值条填充
- 按钮
- 面板

### 粒子纹理
- 火焰粒子
- 治疗粒子
- 冰霜粒子
- 火花粒子

## 使用方法

### 在 AssetManager 中使用

```javascript
import { AssetManager } from './src/core/AssetManager.js';

const assetManager = new AssetManager();

// 加载占位符资源
assetManager.loadPlaceholderAssets();

// 获取资源
const warriorSprite = assetManager.getImage('character_warrior');
const slimeSprite = assetManager.getImage('enemy_slime');
const fireballIcon = assetManager.getImage('skill_fireball');
```

### 直接使用 PlaceholderAssets

```javascript
import { PlaceholderAssets } from './src/core/PlaceholderAssets.js';

const placeholderAssets = new PlaceholderAssets();

// 创建角色精灵
const mageSprite = placeholderAssets.createCharacterSprite('mage', 64);

// 创建敌人精灵
const goblinSprite = placeholderAssets.createEnemySprite('goblin', 64);

// 创建技能图标
const healIcon = placeholderAssets.createSkillIcon('heal', 48);

// 创建UI元素
const healthBar = placeholderAssets.createUIElement('healthbar_bg', 200, 20);

// 创建粒子纹理
const fireParticle = placeholderAssets.createParticleTexture('fire', 16);
```

## 测试

运行 `test-placeholder-assets.html` 查看所有占位符资源的效果。

## 未来计划

当美术资源准备好后，可以按照以下步骤替换占位符资源：

1. 将图片文件放入对应的子目录：
   - `assets/characters/` - 角色精灵
   - `assets/enemies/` - 敌人精灵
   - `assets/skills/` - 技能图标
   - `assets/ui/` - UI元素
   - `assets/particles/` - 粒子纹理

2. 使用 AssetManager 的 `addImage()` 方法加载真实资源：

```javascript
// 加载真实资源
assetManager.addImage('character_warrior', 'assets/characters/warrior.png');
assetManager.addImage('enemy_slime', 'assets/enemies/slime.png');
await assetManager.loadAll();
```

3. 代码中的资源引用保持不变，只需更改资源加载方式即可。

## 资源规范

### 图片格式
- 推荐使用 PNG 格式（支持透明）
- 角色和敌人精灵：64x64 像素
- 技能图标：48x48 像素
- UI元素：根据需要自定义尺寸

### 命名规范
- 使用小写字母和下划线
- 格式：`类型_名称.png`
- 例如：`character_warrior.png`, `enemy_slime.png`, `skill_fireball.png`

### 精灵图集
如果使用精灵图集，请提供对应的 JSON 配置文件：

```json
{
  "frames": {
    "warrior_idle_0": { "x": 0, "y": 0, "w": 64, "h": 64 },
    "warrior_idle_1": { "x": 64, "y": 0, "w": 64, "h": 64 }
  }
}
```

## 音频资源

游戏使用 `AudioManager` 类来管理音效和背景音乐。

### 音频管理器功能

- 音效播放（支持重叠播放）
- 背景音乐播放（循环）
- 音量控制（主音量、音效音量、音乐音量）
- 静音功能
- 淡入淡出效果

### 使用方法

```javascript
import { AudioManager } from './src/core/AudioManager.js';

const audioManager = new AudioManager();

// 添加音效
audioManager.addSound('attack', 'assets/audio/attack.mp3');
audioManager.addSound('skill', 'assets/audio/skill.mp3');

// 添加背景音乐
audioManager.addMusic('bgm_menu', 'assets/audio/menu.mp3');
audioManager.addMusic('bgm_battle', 'assets/audio/battle.mp3');

// 播放音效
audioManager.playSound('attack');

// 播放背景音乐（带淡入效果）
audioManager.playMusic('bgm_menu', true);

// 音量控制
audioManager.setMasterVolume(0.8);
audioManager.setSoundVolume(0.7);
audioManager.setMusicVolume(0.5);

// 静音
audioManager.setMuted(true);
```

### 推荐的音频文件

**音效：**
- `attack.mp3` - 普通攻击音效
- `skill_fire.mp3` - 火球术音效
- `skill_heal.mp3` - 治疗术音效
- `skill_frost.mp3` - 冰霜术音效
- `hit.mp3` - 受击音效
- `death.mp3` - 死亡音效
- `levelup.mp3` - 升级音效
- `coin.mp3` - 拾取金币音效
- `button_click.mp3` - 按钮点击音效

**背景音乐：**
- `menu.mp3` - 菜单背景音乐
- `battle.mp3` - 战斗背景音乐
- `victory.mp3` - 胜利音乐

### 音频格式建议

- **格式**：MP3 或 OGG（浏览器兼容性好）
- **音效**：短小精悍（1-3秒），文件大小 < 100KB
- **背景音乐**：循环友好，文件大小 < 5MB
- **采样率**：44.1kHz 或 48kHz
- **比特率**：128-192 kbps（音效），192-256 kbps（音乐）

### 测试

运行 `test-audio-manager.html` 查看音频管理器的功能演示。

### 目录结构

```
assets/
  audio/
    sfx/          # 音效文件
      attack.mp3
      skill.mp3
      ...
    music/        # 背景音乐
      menu.mp3
      battle.mp3
      ...
```
