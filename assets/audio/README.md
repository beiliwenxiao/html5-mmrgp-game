# 音频资源目录

此目录用于存放游戏的音频文件。

## 目录结构

```
audio/
  sfx/          # 音效文件
  music/        # 背景音乐
```

## 音效文件 (sfx/)

推荐的音效文件：

- `attack.mp3` - 普通攻击音效
- `skill_fire.mp3` - 火球术音效
- `skill_heal.mp3` - 治疗术音效
- `skill_frost.mp3` - 冰霜术音效
- `skill_arrow.mp3` - 箭雨音效
- `skill_shield.mp3` - 护盾音效
- `hit.mp3` - 受击音效
- `death.mp3` - 死亡音效
- `levelup.mp3` - 升级音效
- `coin.mp3` - 拾取金币音效
- `button_click.mp3` - 按钮点击音效
- `menu_open.mp3` - 菜单打开音效
- `menu_close.mp3` - 菜单关闭音效

## 背景音乐 (music/)

推荐的背景音乐：

- `menu.mp3` - 菜单背景音乐
- `battle.mp3` - 战斗背景音乐
- `victory.mp3` - 胜利音乐
- `defeat.mp3` - 失败音乐

## 音频规格建议

### 音效
- **格式**：MP3 或 OGG
- **时长**：1-3 秒
- **文件大小**：< 100KB
- **采样率**：44.1kHz
- **比特率**：128 kbps
- **声道**：单声道或立体声

### 背景音乐
- **格式**：MP3 或 OGG
- **时长**：2-5 分钟（循环）
- **文件大小**：< 5MB
- **采样率**：44.1kHz 或 48kHz
- **比特率**：192-256 kbps
- **声道**：立体声

## 免费音频资源网站

如果需要免费的游戏音频资源，可以访问以下网站：

- **Freesound** (https://freesound.org/) - 大量免费音效
- **OpenGameArt** (https://opengameart.org/) - 游戏音频和音乐
- **Incompetech** (https://incompetech.com/) - 免费背景音乐
- **Zapsplat** (https://www.zapsplat.com/) - 音效库
- **Bensound** (https://www.bensound.com/) - 免版税音乐

## 使用示例

```javascript
import { AssetManager } from './src/core/AssetManager.js';

const assetManager = new AssetManager();
const audioManager = assetManager.getAudioManager();

// 加载音效
audioManager.addSound('attack', 'assets/audio/sfx/attack.mp3');
audioManager.addSound('skill_fire', 'assets/audio/sfx/skill_fire.mp3');

// 加载背景音乐
audioManager.addMusic('menu', 'assets/audio/music/menu.mp3');
audioManager.addMusic('battle', 'assets/audio/music/battle.mp3');

// 播放音效
audioManager.playSound('attack');

// 播放背景音乐
audioManager.playMusic('menu', true); // 带淡入效果
```

## 注意事项

1. **浏览器自动播放限制**：现代浏览器通常会阻止自动播放音频，需要用户交互后才能播放
2. **文件格式兼容性**：建议同时提供 MP3 和 OGG 格式以确保跨浏览器兼容
3. **文件大小**：注意控制文件大小，避免影响游戏加载速度
4. **版权问题**：确保使用的音频文件有合法的使用权限
