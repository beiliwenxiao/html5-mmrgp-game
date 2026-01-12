/**
 * 对话框组件 (DialogueBox)
 * 需求: 6, 9, 35
 */

import { UIElement } from '../../ui/UIElement.js';

export class DialogueBox extends UIElement {
  constructor(options = {}) {
    super({
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 1100,
      height: options.height || 230,
      visible: options.visible !== undefined ? options.visible : false,
      zIndex: options.zIndex || 200
    });
    
    this.dialogueSystem = options.dialogueSystem;
    this.audioManager = options.audioManager;
    this.onChoiceSelect = options.onChoiceSelect || null;
    this.onDialogueEnd = options.onDialogueEnd || null;
    this.onContinue = options.onContinue || null;
    
    this.padding = 20;
    this.portraitSize = 100;
    this.portraitPadding = 15;
    this.textPadding = 15;
    this.choiceSpacing = 10;
    this.choiceHeight = 40;
    this.minHeight = 230;
    this.baseHeight = 230;
    this.baseY = options.y || 0;
    this.choiceOffsetY = 200;
    
    this.hoveredChoiceIndex = -1;
    this.canInteract = true;
    
    this.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    this.borderColor = '#8B7355';
    this.textColor = '#FFFFFF';
    this.speakerColor = '#FFD700';
    this.choiceColor = '#4A90E2';
    this.choiceHoverColor = '#5BA3F5';
    this.choiceTextColor = '#FFFFFF';
    
    this.speakerFont = 'bold 20px Arial, sans-serif';
    this.textFont = '18px Arial, sans-serif';
    this.choiceFont = '16px Arial, sans-serif';
    
    this.typewriterSoundKey = 'dialogue_type';
    this.typewriterSoundInterval = 3;
    this.lastTypewriterSoundIndex = 0;
    this.choiceHoverSoundKey = 'dialogue_hover';
    this.choiceSelectSoundKey = 'dialogue_select';
    
    this.showContinuePrompt = false;
    this.continuePromptAlpha = 0;
    this.continuePromptDirection = 1;
    
    console.log('DialogueBox: 初始化完成');
  }

  update(deltaTime) {
    if (!this.visible || !this.dialogueSystem) return;
    
    const wasTyping = this.dialogueSystem.isTyping();
    this.dialogueSystem.update(deltaTime);
    const isTyping = this.dialogueSystem.isTyping();
    
    if (isTyping && this.audioManager) {
      const currentIndex = this.dialogueSystem.typewriterState.currentIndex;
      if (currentIndex > this.lastTypewriterSoundIndex + this.typewriterSoundInterval) {
        this.playTypewriterSound();
        this.lastTypewriterSoundIndex = currentIndex;
      }
    }
    
    if (!isTyping && wasTyping) {
      this.lastTypewriterSoundIndex = 0;
    }
    
    const currentNode = this.dialogueSystem.getCurrentNode();
    if (currentNode && !isTyping) {
      this.showContinuePrompt = !currentNode.choices || currentNode.choices.length === 0;
      
      if (this.showContinuePrompt) {
        this.continuePromptAlpha += this.continuePromptDirection * deltaTime * 0.002;
        if (this.continuePromptAlpha >= 1) {
          this.continuePromptAlpha = 1;
          this.continuePromptDirection = -1;
        } else if (this.continuePromptAlpha <= 0.3) {
          this.continuePromptAlpha = 0.3;
          this.continuePromptDirection = 1;
        }
      }
    } else {
      this.showContinuePrompt = false;
    }
  }

  render(ctx) {
    if (!this.visible || !this.dialogueSystem || !this.dialogueSystem.isDialogueActive()) return;
    
    const currentNode = this.dialogueSystem.getCurrentNode();
    if (!currentNode) return;
    
    this.updateHeightAndPosition(currentNode, ctx.canvas.height);
    
    ctx.save();
    this.renderBackground(ctx);
    if (currentNode.portrait) this.renderPortrait(ctx, currentNode.portrait);
    this.renderSpeaker(ctx, currentNode.speaker);
    this.renderText(ctx, this.dialogueSystem.getDisplayedText());
    if (currentNode.choices && currentNode.choices.length > 0 && !this.dialogueSystem.isTyping()) {
      this.renderChoices(ctx, currentNode.choices);
    }
    if (this.showContinuePrompt) this.renderContinuePrompt(ctx);
    ctx.restore();
  }

  updateHeightAndPosition(currentNode, canvasHeight) {
    let requiredHeight = this.padding + 30 + this.portraitSize + this.padding;
    
    if (currentNode.choices && currentNode.choices.length > 0) {
      const choicesHeight = this.textPadding + 
        (currentNode.choices.length * this.choiceHeight) + 
        ((currentNode.choices.length - 1) * this.choiceSpacing) + 
        this.padding;
      requiredHeight += choicesHeight;
    }
    
    this.height = Math.max(this.minHeight, requiredHeight);
    this.y = (canvasHeight - this.height) / 2;
    
    if (this.y < 0) {
      this.y = 0;
    }
    
    if (this.y + this.height > canvasHeight) {
      this.y = canvasHeight - this.height;
    }
  }

  renderBackground(ctx) {
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + this.padding, this.y + this.padding + 30);
    ctx.lineTo(this.x + this.width - this.padding, this.y + this.padding + 30);
    ctx.stroke();
  }

  renderPortrait(ctx, portraitKey) {
    const portraitX = this.x + this.padding;
    const portraitY = this.y + this.padding + 40;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(portraitX, portraitY, this.portraitSize, this.portraitSize);
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(portraitX, portraitY, this.portraitSize, this.portraitSize);
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('头像', portraitX + this.portraitSize / 2, portraitY + this.portraitSize / 2);
  }

  renderSpeaker(ctx, speaker) {
    if (!speaker) return;
    ctx.fillStyle = this.speakerColor;
    ctx.font = this.speakerFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(speaker, this.x + this.padding, this.y + this.padding);
  }

  renderText(ctx, text) {
    if (!text) return;
    const textX = this.x + this.padding + this.portraitSize + this.portraitPadding;
    const textY = this.y + this.padding + 40;
    const textWidth = this.width - this.padding * 2 - this.portraitSize - this.portraitPadding;
    const textHeight = this.portraitSize;
    ctx.fillStyle = this.textColor;
    ctx.font = this.textFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const lines = this.wrapText(ctx, text, textWidth);
    const lineHeight = 24;
    lines.forEach((line, index) => {
      if (index * lineHeight < textHeight) {
        ctx.fillText(line, textX, textY + index * lineHeight);
      }
    });
  }

  renderChoices(ctx, choices) {
    if (!choices || choices.length === 0) return;
    const choicesStartY = this.y + this.padding + 40 + this.portraitSize + this.textPadding;
    const choiceWidth = this.width - this.padding * 2;
    choices.forEach((choice, index) => {
      const choiceY = choicesStartY + index * (this.choiceHeight + this.choiceSpacing);
      const isHovered = this.hoveredChoiceIndex === index;
      ctx.fillStyle = isHovered ? this.choiceHoverColor : this.choiceColor;
      ctx.fillRect(this.x + this.padding, choiceY, choiceWidth, this.choiceHeight);
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x + this.padding, choiceY, choiceWidth, this.choiceHeight);
      ctx.fillStyle = this.choiceTextColor;
      ctx.font = this.choiceFont;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const choiceText = String(index + 1) + '. ' + choice.text;
      ctx.fillText(choiceText, this.x + this.padding + 15, choiceY + this.choiceHeight / 2);
    });
  }

  renderContinuePrompt(ctx) {
    const promptText = '▼ 点击继续 ▼';
    const promptX = this.x + this.width - this.padding - 10;
    const promptY = this.y + this.height - this.padding - 10;
    ctx.save();
    ctx.globalAlpha = this.continuePromptAlpha;
    ctx.fillStyle = this.speakerColor;
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(promptText, promptX, promptY);
    ctx.restore();
  }

  wrapText(ctx, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split('\n');
    paragraphs.forEach(paragraph => {
      let line = '';
      const words = paragraph.split('');
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
          lines.push(line);
          line = words[i];
        } else {
          line = testLine;
        }
      }
      if (line.length > 0) lines.push(line);
    });
    return lines;
  }

  handleMouseMove(mouseX, mouseY) {
    if (!this.visible || !this.canInteract) return;
    const currentNode = this.dialogueSystem.getCurrentNode();
    if (!currentNode || !currentNode.choices || currentNode.choices.length === 0) {
      this.hoveredChoiceIndex = -1;
      return;
    }
    const choicesStartY = this.y + this.padding + 40 + this.portraitSize + this.textPadding;
    const choiceWidth = this.width - this.padding * 2;
    let newHoveredIndex = -1;
    for (let i = 0; i < currentNode.choices.length; i++) {
      const choiceY = choicesStartY + i * (this.choiceHeight + this.choiceSpacing);
      if (mouseX >= this.x + this.padding && mouseX <= this.x + this.padding + choiceWidth &&
          mouseY >= choiceY && mouseY <= choiceY + this.choiceHeight) {
        newHoveredIndex = i;
        break;
      }
    }
    if (newHoveredIndex !== this.hoveredChoiceIndex && newHoveredIndex !== -1) {
      this.playChoiceHoverSound();
    }
    this.hoveredChoiceIndex = newHoveredIndex;
  }

  handleMouseClick(mouseX, mouseY) {
    if (!this.visible || !this.canInteract) return false;
    if (!this.containsPoint(mouseX, mouseY)) return false;
    const currentNode = this.dialogueSystem.getCurrentNode();
    if (!currentNode) return false;
    if (this.dialogueSystem.isTyping()) {
      this.dialogueSystem.skipTypewriter();
      return true;
    }
    if (currentNode.choices && currentNode.choices.length > 0) {
      const choicesStartY = this.y + this.padding + 40 + this.portraitSize + this.textPadding;
      const choiceWidth = this.width - this.padding * 2;
      for (let i = 0; i < currentNode.choices.length; i++) {
        const choiceY = choicesStartY + i * (this.choiceHeight + this.choiceSpacing);
        if (mouseX >= this.x + this.padding && mouseX <= this.x + this.padding + choiceWidth &&
            mouseY >= choiceY && mouseY <= choiceY + this.choiceHeight) {
          this.selectChoice(i);
          return true;
        }
      }
      return false;
    }
    this.continueDialogue();
    return true;
  }

  selectChoice(choiceIndex) {
    const currentNode = this.dialogueSystem.getCurrentNode();
    if (!currentNode || !currentNode.choices || choiceIndex >= currentNode.choices.length) return;
    this.playChoiceSelectSound();
    this.dialogueSystem.selectChoice(choiceIndex);
    if (this.onChoiceSelect) {
      this.onChoiceSelect(choiceIndex, currentNode.choices[choiceIndex]);
    }
    if (!this.dialogueSystem.isDialogueActive()) {
      this.handleDialogueEnd();
    }
  }

  continueDialogue() {
    this.dialogueSystem.continue();
    if (this.onContinue) this.onContinue();
    if (!this.dialogueSystem.isDialogueActive()) {
      this.handleDialogueEnd();
    }
  }

  handleDialogueEnd() {
    this.hide();
    if (this.onDialogueEnd) this.onDialogueEnd();
  }

  playTypewriterSound() {
    if (this.audioManager && this.audioManager.hasSound(this.typewriterSoundKey)) {
      this.audioManager.playSound(this.typewriterSoundKey, { volume: 0.3 });
    }
  }

  playChoiceHoverSound() {
    if (this.audioManager && this.audioManager.hasSound(this.choiceHoverSoundKey)) {
      this.audioManager.playSound(this.choiceHoverSoundKey, { volume: 0.5 });
    }
  }

  playChoiceSelectSound() {
    if (this.audioManager && this.audioManager.hasSound(this.choiceSelectSoundKey)) {
      this.audioManager.playSound(this.choiceSelectSoundKey, { volume: 0.7 });
    }
  }

  show() {
    super.show();
    this.canInteract = true;
    this.hoveredChoiceIndex = -1;
    this.lastTypewriterSoundIndex = 0;
  }

  hide() {
    super.hide();
    this.canInteract = false;
    this.hoveredChoiceIndex = -1;
  }

  setDialogueSystem(dialogueSystem) {
    this.dialogueSystem = dialogueSystem;
  }

  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }

  setTypewriterSoundKey(soundKey) {
    this.typewriterSoundKey = soundKey;
  }

  setChoiceHoverSoundKey(soundKey) {
    this.choiceHoverSoundKey = soundKey;
  }

  setChoiceSelectSoundKey(soundKey) {
    this.choiceSelectSoundKey = soundKey;
  }
}

export default DialogueBox;
