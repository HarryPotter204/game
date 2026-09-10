import React, { useRef, useEffect, useCallback } from 'react';
import { Character, CurseSpell, CollectibleGem, Particle, DustCloud, FloatingText, Torch, Duelist, MagicMote } from '../types';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  character: Character;
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  gems: number;
  lives: number;
  level: number;
  onScoreChange: (score: number) => void;
  onGemsChange: (gems: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onGameOver: () => void;
  controlMode: 'follow' | 'keys_buttons' | 'split_touch';
  isMobileTouchLeft: boolean;
  isMobileTouchRight: boolean;
  isPortrait?: boolean;
}

export const getCanvasDimensions = (isPortrait: boolean) => ({
  width: isPortrait ? 720 : 1280,
  height: isPortrait ? 1280 : 720,
  floorY: isPortrait ? 1140 : 620,
});

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  isPlaying,
  isPaused,
  score,
  gems,
  lives,
  level,
  onScoreChange,
  onGemsChange,
  onLivesChange,
  onLevelChange,
  onGameOver,
  controlMode,
  isMobileTouchLeft,
  isMobileTouchRight,
  isPortrait = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Loop State
  const stateRef = useRef({
    player: {
      x: isPortrait ? 360 : 640,
      y: isPortrait ? 1140 : 620,
      targetX: isPortrait ? 360 : 640,
      vx: 0,
      width: 48,
      height: 64,
      facing: 1 as 1 | -1,
      runFrame: 0,
      isRunning: false,
      invulnerableTimer: 0,
      shieldTimer: 0,
    },
    spells: [] as CurseSpell[],
    gems: [] as CollectibleGem[],
    particles: [] as Particle[],
    dusts: [] as DustCloud[],
    floatingTexts: [] as FloatingText[],
    torches: [] as Torch[],
    duelists: [] as Duelist[],
    magicMotes: [] as MagicMote[],
    frameCount: 0,
    lastScoreUpdate: 0,
    keys: {
      left: false,
      right: false,
    },
    mousePos: {
      x: isPortrait ? 360 : 640,
      active: false,
    },
    screenShake: 0,
    nextSpellId: 1,
    nextGemId: 1,
    nextTextId: 1,
  });

  // Keep live props in ref for animation frame loop
  const propsRef = useRef({
    character,
    isPlaying,
    isPaused,
    score,
    gems,
    lives,
    level,
    controlMode,
    isMobileTouchLeft,
    isMobileTouchRight,
    isPortrait,
    onScoreChange,
    onGemsChange,
    onLivesChange,
    onLevelChange,
    onGameOver,
  });

  useEffect(() => {
    propsRef.current = {
      character,
      isPlaying,
      isPaused,
      score,
      gems,
      lives,
      level,
      controlMode,
      isMobileTouchLeft,
      isMobileTouchRight,
      isPortrait,
      onScoreChange,
      onGemsChange,
      onLivesChange,
      onLevelChange,
      onGameOver,
    };
  }, [
    character,
    isPlaying,
    isPaused,
    score,
    gems,
    lives,
    level,
    controlMode,
    isMobileTouchLeft,
    isMobileTouchRight,
    isPortrait,
    onScoreChange,
    onGemsChange,
    onLivesChange,
    onLevelChange,
    onGameOver,
  ]);

  // Handle portrait/landscape orientation switch dynamically
  useEffect(() => {
    const isP = Boolean(isPortrait);
    const { width, floorY } = getCanvasDimensions(isP);
    const player = stateRef.current.player;
    player.y = floorY;
    if (player.x > width - 40) {
      player.x = width / 2;
    }
    player.targetX = player.x;

    if (isP) {
      stateRef.current.torches = [
        { x: 60, y: 520, intensity: 1, flickerSpeed: 0.12, flickerOffset: 0 },
        { x: 60, y: 840, intensity: 0.95, flickerSpeed: 0.14, flickerOffset: 1.5 },
        { x: 660, y: 520, intensity: 1, flickerSpeed: 0.13, flickerOffset: 2.7 },
        { x: 660, y: 840, intensity: 0.95, flickerSpeed: 0.15, flickerOffset: 4.2 },
      ];
      stateRef.current.duelists = [
        { x: 80, y: 960, direction: 'right', wandCastTimer: 80, wandSparkTimer: 0, sparkColor: '#f43f5e' },
        { x: 640, y: 960, direction: 'left', wandCastTimer: 120, wandSparkTimer: 0, sparkColor: '#38bdf8' },
      ];
    } else {
      stateRef.current.torches = [
        { x: 120, y: 360, intensity: 1, flickerSpeed: 0.12, flickerOffset: 0 },
        { x: 250, y: 390, intensity: 0.9, flickerSpeed: 0.15, flickerOffset: 1.5 },
        { x: 1030, y: 390, intensity: 0.9, flickerSpeed: 0.14, flickerOffset: 2.7 },
        { x: 1160, y: 360, intensity: 1, flickerSpeed: 0.13, flickerOffset: 4.2 },
      ];
      stateRef.current.duelists = [
        { x: 380, y: 460, direction: 'right', wandCastTimer: 80, wandSparkTimer: 0, sparkColor: '#f43f5e' },
        { x: 900, y: 460, direction: 'left', wandCastTimer: 120, wandSparkTimer: 0, sparkColor: '#38bdf8' },
      ];
    }
  }, [isPortrait]);

  // Initialize atmospheric magic motes
  useEffect(() => {
    const isP = Boolean(isPortrait);
    const { width, floorY } = getCanvasDimensions(isP);

    // Atmospheric Magic Motes floating through the Gothic Great Hall
    const motes: MagicMote[] = [];
    const colors = [
      { c: '#fde047', g: 'rgba(253, 224, 71, 0.45)' }, // Warm Golden Starlight
      { c: '#67e8f9', g: 'rgba(103, 232, 249, 0.4)' },  // Ethereal Blue Glow
      { c: '#c084fc', g: 'rgba(192, 132, 252, 0.4)' },  // Arcane Lavender
      { c: '#6ee7b7', g: 'rgba(110, 231, 183, 0.4)' },  // Mystic Emerald
      { c: '#fed7aa', g: 'rgba(254, 215, 170, 0.45)' }, // Hearth Candle Ember
    ];
    for (let i = 0; i < 65; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      motes.push({
        x: Math.random() * width,
        y: Math.random() * (floorY + 15),
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.45 + 0.15),
        size: Math.random() * 2.2 + 1.1,
        color: col.c,
        glowColor: col.g,
        alpha: Math.random() * 0.5 + 0.3,
        baseAlpha: Math.random() * 0.4 + 0.3,
        flickerSpeed: Math.random() * 0.05 + 0.02,
        flickerOffset: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.02 + 0.015,
      });
    }
    stateRef.current.magicMotes = motes;
  }, [isPortrait]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        stateRef.current.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        stateRef.current.keys.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        stateRef.current.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer move / Touch follow
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const isP = Boolean(propsRef.current.isPortrait);
    const { width, height, floorY } = getCanvasDimensions(isP);
    if (!canvasRef.current) return { x: width / 2, y: floorY };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!propsRef.current.isPlaying) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const { x } = getCanvasCoords(e.clientX, e.clientY);
    stateRef.current.mousePos.x = x;
    stateRef.current.mousePos.active = true;
    stateRef.current.player.targetX = x;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!propsRef.current.isPlaying) return;
    const { x } = getCanvasCoords(e.clientX, e.clientY);
    stateRef.current.mousePos.x = x;
    // Follow mode or dragging/holding touch
    if (propsRef.current.controlMode === 'follow' || e.buttons > 0 || e.pointerType === 'touch' || stateRef.current.mousePos.active) {
      stateRef.current.mousePos.active = true;
      stateRef.current.player.targetX = x;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    stateRef.current.mousePos.active = false;
  };

  // Main Simulation and Rendering Loop
  useEffect(() => {
    let animId: number;

    const spawnSpell = (currentScore: number, currentLevel: number, curW: number, curH: number, isP: boolean) => {
      const state = stateRef.current;
      // Gentle difficulty scaling: Spawns gradually increase without sudden unfair bullet hell spikes
      const baseInterval = Math.max(14, 46 - currentLevel * 2 - Math.floor(currentScore / 5000));
      if (state.frameCount % baseInterval === 0) {
        const id = state.nextSpellId++;
        const targetX = Math.random() * (curW - 80) + 40;
        // Mild angle variance
        const angleSpread = (Math.random() - 0.5) * (isP ? 0.28 : 0.35);
        // Smoother, more reaction-friendly speed scaling
        const speed = Math.random() * 2.0 + (isP ? 4.6 : 3.8) + currentLevel * (isP ? 0.32 : 0.28);

        state.spells.push({
          id,
          x: targetX + (Math.random() - 0.5) * (isP ? 100 : 160),
          y: -40,
          vx: Math.sin(angleSpread) * speed * 0.75,
          vy: Math.cos(angleSpread) * speed + 2.2,
          radius: Math.random() * 5 + 10,
          length: Math.random() * 25 + (isP ? 45 : 35),
          angle: angleSpread,
          speed,
          trail: [],
          hue: 140 + Math.random() * 20, // vibrant emerald green
          power: 1,
        });

        // Occasional ambient whoosh
        if (Math.random() < 0.2) {
          sound.playSpellWhoosh();
        }
      }
    };

    const spawnGem = (currentLevel: number, curW: number, isP: boolean) => {
      const state = stateRef.current;
      // Gems/Galleons spawn every ~145 frames (~2.4 seconds) for smoother flow
      if (state.frameCount % 145 === 0) {
        const id = state.nextGemId++;
        const isShield = Math.random() < 0.16;
        const isRuby = !isShield && Math.random() < 0.25;
        const isStar = !isShield && !isRuby && Math.random() < 0.1;

        state.gems.push({
          id,
          x: Math.random() * (curW - 120) + 60,
          y: -20,
          vy: Math.random() * 1.1 + (isP ? 2.2 : 1.8), // gentle floating descent
          size: isStar ? 24 : 19,
          type: isShield ? 'shield' : isRuby ? 'ruby' : isStar ? 'star' : 'galleon',
          value: isShield ? 0 : isRuby ? 50 : isStar ? 100 : 10,
          sparkleTimer: 0,
          rotation: 0,
        });
      }
    };

    const addExplosion = (x: number, y: number, color: string, count = 12) => {
      const state = stateRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        state.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: Math.random() * 4 + 2,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
        });
      }
    };

    const addFloatingText = (text: string, x: number, y: number, color: string, fontSize = 20) => {
      const state = stateRef.current;
      state.floatingTexts.push({
        id: state.nextTextId++,
        text,
        x,
        y,
        vy: -2,
        color,
        alpha: 1,
        fontSize,
      });
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = stateRef.current;
      const props = propsRef.current;
      const isP = Boolean(props.isPortrait);
      const { width: curW, height: curH, floorY: curFloor } = getCanvasDimensions(isP);

      // Always update ambient magic motes so the gothic hall sparkles continuously
      const motesSpeed = (props.isPlaying && !props.isPaused) ? 1 : 0.6;
      state.magicMotes.forEach((mote) => {
        mote.driftPhase += mote.driftSpeed * motesSpeed;
        mote.x += (mote.vx + Math.sin(mote.driftPhase) * 0.45) * motesSpeed;
        mote.y += mote.vy * motesSpeed;

        // Gentle breathing pulsation
        mote.alpha = mote.baseAlpha + Math.sin(state.frameCount * mote.flickerSpeed + mote.flickerOffset) * 0.22;

        // Wrap around edges to maintain rich atmospheric density
        if (mote.y < -20) {
          mote.y = curFloor + 10;
          mote.x = Math.random() * curW;
        }
        if (mote.x < -20) mote.x = curW + 20;
        if (mote.x > curW + 20) mote.x = -20;
      });

      // 1. UPDATE STATE (If Playing & Not Paused)
      if (props.isPlaying && !props.isPaused) {
        state.frameCount++;

        // Increase score passively as survival continues
        if (state.frameCount % 2 === 0) {
          const newScore = props.score + 5 + props.level * 2;
          props.onScoreChange(newScore);

          // Level calculation: Gentle progression (increases every 5,000 points)
          const expectedLevel = Math.min(12, Math.floor(newScore / 5000) + 1);
          if (expectedLevel > props.level) {
            props.onLevelChange(expectedLevel);
            sound.playLevelUp();
            addFloatingText(`⚡ レベル ${expectedLevel} ⚡`, curW / 2, isP ? 380 : 280, '#facc15', 36);
          }
        }

        // --- PLAYER MOVEMENT LOGIC (Simple & Intuitive) ---
        const player = state.player;
        const charSpeed = props.character.speed;
        player.y = curFloor;

        let moveDir = 0;

        // Key movement or on-screen touch buttons
        if (state.keys.left || props.isMobileTouchLeft) {
          moveDir = -1;
          player.targetX = player.x;
          player.vx = moveDir * charSpeed;
        } else if (state.keys.right || props.isMobileTouchRight) {
          moveDir = 1;
          player.targetX = player.x;
          player.vx = moveDir * charSpeed;
        } else {
          // Tap or Pointer Follow: smoothly runs to target tap position
          const dx = player.targetX - player.x;
          if (Math.abs(dx) > 6) {
            moveDir = Math.sign(dx);
            const speedFactor = Math.min(1, Math.max(0.3, Math.abs(dx) / 25));
            player.vx = moveDir * charSpeed * speedFactor;
          } else {
            player.vx = 0;
          }
        }

        player.x += player.vx;

        // Boundaries
        const halfW = player.width / 2;
        if (player.x < halfW + 16) {
          player.x = halfW + 16;
          player.vx = 0;
        }
        if (player.x > curW - halfW - 16) {
          player.x = curW - halfW - 16;
          player.vx = 0;
        }

        // Direction & Running cycle
        if (Math.abs(player.vx) > 0.4) {
          player.facing = player.vx > 0 ? 1 : -1;
          player.runFrame += 0.25;
          player.isRunning = true;

          // Emit dust puffs
          if (state.frameCount % 5 === 0) {
            state.dusts.push({
              x: player.x - player.facing * 16,
              y: player.y + 24,
              vx: -player.facing * (Math.random() * 1.5 + 0.5),
              vy: -Math.random() * 0.8 - 0.2,
              size: Math.random() * 7 + 6,
              alpha: 0.6,
            });
          }
        } else {
          player.isRunning = false;
          player.runFrame = 0;
        }

        // Timers
        if (player.invulnerableTimer > 0) player.invulnerableTimer--;
        if (player.shieldTimer > 0) player.shieldTimer--;

        // Hermione magnet perk: pulls nearby gems
        if (props.character.perk === 'shield_magnet') {
          state.gems.forEach((g) => {
            const dist = Math.hypot(g.x - player.x, g.y - player.y);
            if (dist < 260) {
              const pull = (260 - dist) / 260 * 5;
              g.x += ((player.x - g.x) / dist) * pull;
              g.y += ((player.y - g.y) / dist) * pull;
            }
          });
        }

        // Spawners
        spawnSpell(props.score, props.level, curW, curH, isP);
        spawnGem(props.level, curW, isP);

        // Update Spells
        for (let i = state.spells.length - 1; i >= 0; i--) {
          const s = state.spells[i];
          // Record trail
          s.trail.push({ x: s.x, y: s.y, alpha: 1 });
          if (s.trail.length > 8) s.trail.shift();
          s.trail.forEach((t) => (t.alpha -= 0.12));

          s.x += s.vx;
          s.y += s.vy;

          // Floor collision / splash
          if (s.y >= curFloor + 10) {
            addExplosion(s.x, curFloor + 15, '#22c55e', 9);
            state.spells.splice(i, 1);
            continue;
          }

          // Near Miss Detection for Harry's perk & bonus score
          const distToPlayer = Math.hypot(s.x - player.x, s.y - (player.y - 10));
          if (distToPlayer < 70 && distToPlayer > 35 && s.y > player.y - 40 && s.y < player.y + 20) {
            if (Math.random() < 0.08) {
              sound.playNearMiss();
              const bonus = props.character.perk === 'near_miss_bonus' ? 250 : 100;
              props.onScoreChange(props.score + bonus);
              addFloatingText(`かすり抜け！ +${bonus}`, s.x, s.y - 20, '#4ade80', 16);
            }
          }

          // Collision with player
          const hitRadius = player.shieldTimer > 0 ? 38 : 24;
          if (distToPlayer < hitRadius) {
            if (player.shieldTimer > 0) {
              // Shield absorbed hit!
              addExplosion(s.x, s.y, '#38bdf8', 15);
              addFloatingText('プロテゴ防御！（ガード）', player.x, player.y - 60, '#38bdf8', 20);
              sound.playShieldPickup();
              state.spells.splice(i, 1);
              continue;
            }

            if (player.invulnerableTimer <= 0) {
              // Player takes damage
              sound.playHit();
              state.screenShake = 18;
              addExplosion(player.x, player.y, '#ef4444', 20);
              addFloatingText('ライフ -1！', player.x, player.y - 45, '#ef4444', 22);

              const newLives = props.lives - 1;
              props.onLivesChange(newLives);
              player.invulnerableTimer = 60; // 1 second invulnerability

              if (newLives <= 0) {
                sound.playGameOver();
                props.onGameOver();
              }
            }

            state.spells.splice(i, 1);
          }
        }

        // Update Gems / Galleons
        for (let i = state.gems.length - 1; i >= 0; i--) {
          const g = state.gems[i];
          g.y += g.vy;
          g.rotation += 0.03;
          g.sparkleTimer++;

          // Collision with player
          const distToPlayer = Math.hypot(g.x - player.x, g.y - player.y);
          if (distToPlayer < 40) {
            sound.playGemCollect();
            if (g.type === 'shield') {
              sound.playShieldPickup();
              player.shieldTimer = 360; // 6 seconds
              addFloatingText('プロテゴ・シールド展開！', player.x, player.y - 50, '#38bdf8', 22);
              addExplosion(g.x, g.y, '#38bdf8', 16);
            } else {
              const gemAdd = g.value;
              const scoreAdd = g.type === 'ruby' ? 500 : g.type === 'star' ? 1000 : 150;
              props.onGemsChange(props.gems + gemAdd);
              props.onScoreChange(props.score + scoreAdd);
              
              if (g.type === 'ruby') {
                addExplosion(g.x, g.y, '#f43f5e', 14);
                addFloatingText(`+${gemAdd} 💎`, g.x, g.y - 20, '#fb7185', 20);
              } else if (g.type === 'star') {
                addExplosion(g.x, g.y, '#eab308', 18);
                addFloatingText(`+${gemAdd} スニッチ！`, g.x, g.y - 20, '#fde047', 22);
              } else {
                // Gold galleon
                addExplosion(g.x, g.y, '#facc15', 14);
                addFloatingText(`+${gemAdd} 🪙`, g.x, g.y - 20, '#facc15', 20);
              }
            }
            state.gems.splice(i, 1);
            continue;
          }

          // Out of screen
          if (g.y > curH + 40) {
            state.gems.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gravity
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            state.particles.splice(i, 1);
          }
        }

        // Update Dust Clouds
        for (let i = state.dusts.length - 1; i >= 0; i--) {
          const d = state.dusts[i];
          d.x += d.vx;
          d.y += d.vy;
          d.size += 0.4;
          d.alpha -= 0.025;
          if (d.alpha <= 0) {
            state.dusts.splice(i, 1);
          }
        }

        // Update Floating Text
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const t = state.floatingTexts[i];
          t.y += t.vy;
          t.alpha -= 0.02;
          if (t.alpha <= 0) {
            state.floatingTexts.splice(i, 1);
          }
        }

        // Duelists wand sparks
        state.duelists.forEach((d) => {
          d.wandSparkTimer++;
          if (d.wandSparkTimer > d.wandCastTimer) {
            d.wandSparkTimer = 0;
            d.wandCastTimer = Math.random() * 80 + 70;
            // Spawn spark burst towards center
            const startX = d.direction === 'right' ? d.x + 35 : d.x - 35;
            for (let k = 0; k < 6; k++) {
              state.particles.push({
                x: startX,
                y: d.y - 10,
                vx: (d.direction === 'right' ? 1 : -1) * (Math.random() * 4 + 2),
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 3 + 1.5,
                color: d.sparkColor,
                alpha: 0.9,
                decay: 0.04,
              });
            }
          }
        });

        // Screen shake decay
        if (state.screenShake > 0) {
          state.screenShake *= 0.88;
          if (state.screenShake < 0.5) state.screenShake = 0;
        }
      }

      // --- 2. RENDER THE GOTHIC HALL SCENE ---
      ctx.save();

      // Apply screen shake
      if (state.screenShake > 0) {
        const sx = (Math.random() - 0.5) * state.screenShake;
        const sy = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(sx, sy);
      }

      // Background base (dark midnight stone castle hall)
      ctx.fillStyle = '#080a12';
      ctx.fillRect(0, 0, curW, curH);

      // Central Gothic Arch & Stained Glass Window glow
      const windowGrad = ctx.createRadialGradient(
        curW / 2,
        isP ? 340 : 260,
        20,
        curW / 2,
        isP ? 340 : 260,
        isP ? 380 : 360
      );
      windowGrad.addColorStop(0, 'rgba(40, 70, 120, 0.45)');
      windowGrad.addColorStop(0.5, 'rgba(20, 35, 75, 0.3)');
      windowGrad.addColorStop(1, 'rgba(8, 10, 18, 0)');
      ctx.fillStyle = windowGrad;
      ctx.fillRect(curW / 2 - (isP ? 260 : 380), 40, isP ? 520 : 760, isP ? 700 : 500);

      // Draw Gothic Window frame in background
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 3;
      // Tall central gothic lancet window
      const winX = curW / 2;
      const winW = isP ? 130 : 140;
      const winTop = isP ? 120 : 110;
      const winBottom = isP ? 650 : 430;
      ctx.beginPath();
      ctx.moveTo(winX - winW / 2, winBottom);
      ctx.lineTo(winX - winW / 2, winTop + (isP ? 90 : 70));
      ctx.quadraticCurveTo(winX - winW / 4, winTop - 20, winX, winTop);
      ctx.quadraticCurveTo(winX + winW / 4, winTop - 20, winX + winW / 2, winTop + (isP ? 90 : 70));
      ctx.lineTo(winX + winW / 2, winBottom);
      ctx.stroke();

      // Window tracery mullions
      ctx.beginPath();
      ctx.moveTo(winX, winTop);
      ctx.lineTo(winX, winBottom);
      for (let wy = winTop + 50; wy < winBottom; wy += isP ? 55 : 45) {
        ctx.moveTo(winX - winW / 2 + 5, wy);
        ctx.lineTo(winX + winW / 2 - 5, wy);
      }
      ctx.stroke();
      ctx.restore();

      // Stone Wall Pillars & Gothic Arches on sides
      ctx.fillStyle = '#0c0f1d';
      if (isP) {
        // Portrait Pillars
        ctx.fillRect(0, 0, 80, curFloor + 40);
        ctx.fillRect(curW - 80, 0, 80, curFloor + 40);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(80, 520);
        ctx.quadraticCurveTo(140, 240, 220, 200);
        ctx.moveTo(curW - 80, 520);
        ctx.quadraticCurveTo(curW - 140, 240, curW - 220, 200);
        ctx.stroke();

        // Portrait Banners
        ctx.save();
        ctx.fillStyle = '#6b131e';
        ctx.beginPath();
        ctx.moveTo(90, 160);
        ctx.lineTo(150, 160);
        ctx.lineTo(150, 360);
        ctx.lineTo(120, 390);
        ctx.lineTo(90, 360);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(120, 260, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#0f442d';
        ctx.beginPath();
        ctx.moveTo(curW - 150, 160);
        ctx.lineTo(curW - 90, 160);
        ctx.lineTo(curW - 90, 360);
        ctx.lineTo(curW - 120, 390);
        ctx.lineTo(curW - 150, 360);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(curW - 120, 260, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Landscape Pillars & arches
        ctx.fillRect(0, 0, 160, curFloor + 40);
        ctx.fillRect(200, 0, 90, curFloor + 40);
        ctx.fillRect(curW - 160, 0, 160, curFloor + 40);
        ctx.fillRect(curW - 290, 0, 90, curFloor + 40);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(160, 360);
        ctx.quadraticCurveTo(200, 120, 290, 100);
        ctx.moveTo(curW - 160, 360);
        ctx.quadraticCurveTo(curW - 200, 120, curW - 290, 100);
        ctx.stroke();

        // Left banner (Crimson & Gold)
        ctx.save();
        ctx.fillStyle = '#6b131e';
        ctx.beginPath();
        ctx.moveTo(180, 130);
        ctx.lineTo(250, 130);
        ctx.lineTo(250, 350);
        ctx.lineTo(215, 380);
        ctx.lineTo(180, 350);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(215, 230, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right banner (Emerald & Silver)
        ctx.save();
        ctx.fillStyle = '#0f442d';
        ctx.beginPath();
        ctx.moveTo(curW - 250, 130);
        ctx.lineTo(curW - 180, 130);
        ctx.lineTo(curW - 180, 350);
        ctx.lineTo(curW - 215, 380);
        ctx.lineTo(curW - 250, 350);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(curW - 215, 230, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Torches on Walls (Warm glowing light)
      state.torches.forEach((t) => {
        const flicker = Math.sin(state.frameCount * t.flickerSpeed + t.flickerOffset) * 0.15;
        const radius = 90 * (t.intensity + flicker);

        // Torch light cone / radial glow
        const glow = ctx.createRadialGradient(t.x, t.y, 8, t.x, t.y, radius);
        glow.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
        glow.addColorStop(0.4, 'rgba(234, 88, 12, 0.2)');
        glow.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Torch metal bracket / holder
        ctx.fillStyle = '#1e202e';
        ctx.beginPath();
        ctx.moveTo(t.x - 12, t.y + 8);
        ctx.lineTo(t.x + 12, t.y + 8);
        ctx.lineTo(t.x + 4, t.y + 35);
        ctx.lineTo(t.x - 4, t.y + 35);
        ctx.closePath();
        ctx.fill();

        // Fire flame shape
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(t.x - 8, t.y + 5);
        ctx.quadraticCurveTo(t.x - 12, t.y - 12, t.x, t.y - 24 + flicker * 8);
        ctx.quadraticCurveTo(t.x + 12, t.y - 12, t.x + 8, t.y + 5);
        ctx.fill();
        // Inner white hot core
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(t.x, t.y - 4, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Midground Dueling Wizard Silhouettes (as seen in the screenshot)
      state.duelists.forEach((d) => {
        ctx.save();
        ctx.fillStyle = 'rgba(12, 16, 28, 0.85)';
        // Cloaked silhouette
        ctx.beginPath();
        // Head
        ctx.arc(d.x, d.y - 38, 9, 0, Math.PI * 2);
        ctx.fill();
        // Robe body
        ctx.beginPath();
        ctx.moveTo(d.x - 14, d.y + 15);
        ctx.lineTo(d.x - 8, d.y - 28);
        ctx.lineTo(d.x + 8, d.y - 28);
        ctx.lineTo(d.x + 14, d.y + 15);
        ctx.closePath();
        ctx.fill();

        // Wand arm outstretched
        const wandEndX = d.direction === 'right' ? d.x + 30 : d.x - 30;
        ctx.strokeStyle = 'rgba(20, 24, 38, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - 20);
        ctx.lineTo(wandEndX, d.y - 15);
        ctx.stroke();

        // Wand tip spark
        const tipGlow = ctx.createRadialGradient(wandEndX, d.y - 15, 2, wandEndX, d.y - 15, 18);
        tipGlow.addColorStop(0, '#ffffff');
        tipGlow.addColorStop(0.3, d.sparkColor);
        tipGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = tipGlow;
        ctx.beginPath();
        ctx.arc(wandEndX, d.y - 15, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // --- AMBIENT FLOATING MAGIC MOTES (Gothic Hall Ethereal Particles) ---
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      state.magicMotes.forEach((mote) => {
        if (mote.alpha <= 0.04) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, mote.alpha));

        // Soft magical glow aura
        const glowRadius = mote.size * 3.6;
        const grad = ctx.createRadialGradient(mote.x, mote.y, 0, mote.x, mote.y, glowRadius);
        grad.addColorStop(0, mote.color);
        grad.addColorStop(0.35, mote.glowColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Brilliant glowing core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, Math.max(0.65, mote.size * 0.52), 0, Math.PI * 2);
        ctx.fill();

        // Delicate star sparkle on prominent motes
        if (mote.size > 2.5) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mote.x - mote.size * 1.5, mote.y);
          ctx.lineTo(mote.x + mote.size * 1.5, mote.y);
          ctx.moveTo(mote.x, mote.y - mote.size * 1.5);
          ctx.lineTo(mote.x, mote.y + mote.size * 1.5);
          ctx.stroke();
        }

        ctx.restore();
      });
      ctx.restore();

      // Ambient low-lying mist/fog on floor
      const mistGrad = ctx.createLinearGradient(0, curFloor - 50, 0, curFloor + 50);
      mistGrad.addColorStop(0, 'rgba(30, 41, 59, 0)');
      mistGrad.addColorStop(0.6, 'rgba(51, 65, 85, 0.18)');
      mistGrad.addColorStop(1, 'rgba(15, 23, 42, 0.3)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, curFloor - 50, curW, 100);

      // Stone Flagstone Floor
      ctx.fillStyle = '#111422';
      ctx.fillRect(0, curFloor + 15, curW, curH - curFloor - 15);

      // Floor stone tile grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;
      for (let fy = curFloor + 15; fy < curH; fy += 28) {
        ctx.beginPath();
        ctx.moveTo(0, fy);
        ctx.lineTo(curW, fy);
        ctx.stroke();
      }
      for (let fx = 0; fx < curW; fx += 70) {
        ctx.beginPath();
        ctx.moveTo(fx, curFloor + 15);
        ctx.lineTo(fx, curH);
        ctx.stroke();
      }

      // Dynamic floor green light reflection under falling curses
      state.spells.forEach((s) => {
        if (s.y > 200) {
          const proximity = Math.max(0, (s.y - 200) / (curFloor - 200));
          const reflGrad = ctx.createRadialGradient(s.x, curFloor + 20, 4, s.x, curFloor + 20, 60 * proximity);
          reflGrad.addColorStop(0, `rgba(74, 222, 128, ${0.4 * proximity})`);
          reflGrad.addColorStop(1, 'rgba(74, 222, 128, 0)');
          ctx.fillStyle = reflGrad;
          ctx.beginPath();
          ctx.ellipse(s.x, curFloor + 20, 50 * proximity, 12 * proximity, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- 3. DRAW DUST CLOUDS ---
      state.dusts.forEach((d) => {
        ctx.fillStyle = `rgba(148, 163, 184, ${d.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 4. DRAW FALLING EMERALD CURSES (Avada Kedavra meteors) ---
      state.spells.forEach((s) => {
        // Draw trailing luminous tail
        if (s.trail.length > 1) {
          ctx.save();
          for (let i = 0; i < s.trail.length - 1; i++) {
            const p1 = s.trail[i];
            const p2 = s.trail[i + 1];
            ctx.strokeStyle = `hsla(${s.hue}, 90%, 55%, ${p1.alpha * 0.7})`;
            ctx.lineWidth = s.radius * 1.4 * (i / s.trail.length);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw elongated fiery meteor shape
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        // Outer emerald flare/glow
        const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, s.radius * 2.8);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        glow.addColorStop(0.3, `hsla(${s.hue}, 95%, 65%, 0.9)`);
        glow.addColorStop(0.7, `hsla(${s.hue}, 95%, 45%, 0.4)`);
        glow.addColorStop(1, 'transparent');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, s.radius * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Main fiery teardrop head
        const headGrad = ctx.createLinearGradient(0, -s.length, 0, s.radius);
        headGrad.addColorStop(0, 'transparent');
        headGrad.addColorStop(0.5, `hsla(${s.hue}, 95%, 60%, 0.8)`);
        headGrad.addColorStop(1, '#ffffff');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(-s.radius * 0.8, 0);
        ctx.quadraticCurveTo(-s.radius * 0.3, -s.length, 0, -s.length);
        ctx.quadraticCurveTo(s.radius * 0.3, -s.length, s.radius * 0.8, 0);
        ctx.arc(0, 0, s.radius * 0.8, 0, Math.PI);
        ctx.closePath();
        ctx.fill();

        // Hot bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, s.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // --- 5. DRAW COLLECTIBLES (GEMS & POTIONS) ---
      state.gems.forEach((g) => {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rotation);

        if (g.type === 'shield') {
          // Blue floating potion orb
          const orbGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, g.size);
          orbGrad.addColorStop(0, '#ffffff');
          orbGrad.addColorStop(0.4, '#38bdf8');
          orbGrad.addColorStop(0.9, '#0284c7');
          orbGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(0, 0, g.size, 0, Math.PI * 2);
          ctx.fill();

          // Shield emblem in center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (g.type === 'star') {
          // Golden Snitch
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          // Wings fluttering
          const wingFlap = Math.sin(state.frameCount * 0.4) * 8;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-8, -2);
          ctx.lineTo(-24, -10 + wingFlap);
          ctx.moveTo(8, -2);
          ctx.lineTo(24, -10 + wingFlap);
          ctx.stroke();
        } else if (g.type === 'ruby') {
          // Ruby Gem (Crimson faceted diamond)
          const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, g.size * 1.5);
          glow.addColorStop(0, 'rgba(244, 63, 94, 0.6)');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, g.size * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Diamond shape
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(0, -g.size);
          ctx.lineTo(g.size * 0.85, 0);
          ctx.lineTo(0, g.size);
          ctx.lineTo(-g.size * 0.85, 0);
          ctx.closePath();
          ctx.fill();

          // Facet shine highlight
          ctx.fillStyle = '#fecdd3';
          ctx.beginPath();
          ctx.moveTo(0, -g.size);
          ctx.lineTo(g.size * 0.4, 0);
          ctx.lineTo(0, g.size * 0.6);
          ctx.lineTo(0, -g.size);
          ctx.closePath();
          ctx.fill();
        } else {
          // Golden Galleon Coin (Warm shining gold - clearly distinct from spells!)
          const r = g.size * 0.85;

          // 1. Warm Golden Halo Glow
          const goldGlow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.0);
          goldGlow.addColorStop(0, 'rgba(250, 204, 21, 0.55)');
          goldGlow.addColorStop(0.5, 'rgba(234, 179, 8, 0.25)');
          goldGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = goldGlow;
          ctx.beginPath();
          ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Outer Coin Rim & Shadow
          ctx.fillStyle = '#92400e';
          ctx.beginPath();
          ctx.arc(0, 1.5, r, 0, Math.PI * 2);
          ctx.fill();

          // 3. Golden Gradient Coin Body
          const coinGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
          coinGrad.addColorStop(0, '#fef08a');
          coinGrad.addColorStop(0.35, '#facc15');
          coinGrad.addColorStop(0.85, '#d97706');
          coinGrad.addColorStop(1, '#b45309');
          ctx.fillStyle = coinGrad;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          // 4. Inner Ring
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
          ctx.stroke();

          // 5. Embossed "G" Galleon Symbol
          ctx.fillStyle = '#78350f';
          ctx.font = `bold ${Math.round(r * 0.9)}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('G', 0, 1);

          // 6. Twinkling 4-point sparkle star on the rim
          const sparkAngle = state.frameCount * 0.08;
          const sparkX = Math.cos(sparkAngle) * (r * 0.85);
          const sparkY = Math.sin(sparkAngle) * (r * 0.85);
          const sparkScale = (Math.sin(state.frameCount * 0.15) + 1.2) * 2;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(sparkX, sparkY - sparkScale);
          ctx.lineTo(sparkX + sparkScale * 0.35, sparkY);
          ctx.lineTo(sparkX, sparkY + sparkScale);
          ctx.lineTo(sparkX - sparkScale * 0.35, sparkY);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // --- 6. DRAW PLAYER CHARACTER (Chibi Wizard Harry / Hermione / Ron) ---
      const player = state.player;
      const isBlinking = player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 4) % 2 === 0;

      if (!isBlinking) {
        ctx.save();
        ctx.translate(player.x, player.y);

        // Character shadow on the stone floor
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 24, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Direction facing transform
        ctx.scale(player.facing, 1);

        // Running animation bounce
        const runCycle = Math.sin(player.runFrame);
        const bobY = player.isRunning ? Math.abs(runCycle) * -4 : 0;

        // Billowing wizard robe cloak (behind body)
        ctx.fillStyle = props.character.robeColor;
        ctx.beginPath();
        ctx.moveTo(-10, -10 + bobY);
        const cloakFlutter = player.isRunning ? -player.facing * (14 + Math.sin(player.runFrame) * 6) : -8;
        ctx.quadraticCurveTo(-18 + cloakFlutter, 10 + bobY, -14 + cloakFlutter, 22 + bobY);
        ctx.lineTo(10, 20 + bobY);
        ctx.closePath();
        ctx.fill();

        // Inner red/gold robe lining
        ctx.fillStyle = props.character.accentColor;
        ctx.beginPath();
        ctx.moveTo(-8, -6 + bobY);
        ctx.lineTo(-14 + (player.isRunning ? -8 : 0), 18 + bobY);
        ctx.lineTo(-4, 18 + bobY);
        ctx.closePath();
        ctx.fill();

        // Legs (Pants and shoes)
        ctx.fillStyle = '#0f172a';
        if (player.isRunning) {
          // Left leg
          ctx.fillRect(-10 + runCycle * 7, 14 + bobY, 6, 12);
          // Right leg
          ctx.fillRect(2 - runCycle * 7, 14 + bobY, 6, 12);
        } else {
          ctx.fillRect(-8, 16, 6, 10);
          ctx.fillRect(2, 16, 6, 10);
        }

        // Torso & School Uniform Sweater
        ctx.fillStyle = '#334155'; // Dark grey uniform
        ctx.fillRect(-10, -14 + bobY, 20, 26);

        // Striped House Scarf / V-Neck collar
        ctx.fillStyle = props.character.accentColor;
        ctx.beginPath();
        ctx.moveTo(-7, -14 + bobY);
        ctx.lineTo(0, -6 + bobY);
        ctx.lineTo(7, -14 + bobY);
        ctx.closePath();
        ctx.fill();

        // Gold stripe in scarf
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-4, -10 + bobY, 8, 3);

        // Head
        ctx.fillStyle = '#fed7aa'; // Cute skin tone
        ctx.beginPath();
        ctx.arc(0, -26 + bobY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(4, -26 + bobY, 2.5, 0, Math.PI * 2);
        ctx.arc(10, -26 + bobY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Eye sparkles
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(5, -27 + bobY, 0.8, 0, Math.PI * 2);
        ctx.arc(11, -27 + bobY, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Harry's Spectacles / Round Glasses
        if (props.character.hasGlasses) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.6;
          // Right lens
          ctx.beginPath();
          ctx.arc(4, -26 + bobY, 4.5, 0, Math.PI * 2);
          ctx.stroke();
          // Left lens
          ctx.beginPath();
          ctx.arc(10, -26 + bobY, 4.5, 0, Math.PI * 2);
          ctx.stroke();
          // Bridge
          ctx.beginPath();
          ctx.moveTo(8.5, -26 + bobY);
          ctx.lineTo(9.5, -26 + bobY);
          ctx.stroke();
        }

        // Hair
        ctx.fillStyle = props.character.hairColor;
        ctx.beginPath();
        ctx.arc(0, -29 + bobY, 15, Math.PI * 0.9, Math.PI * 2.1);
        // Messy fringe
        ctx.lineTo(14, -26 + bobY);
        ctx.lineTo(10, -22 + bobY);
        ctx.lineTo(5, -24 + bobY);
        ctx.lineTo(0, -22 + bobY);
        ctx.lineTo(-6, -25 + bobY);
        ctx.lineTo(-14, -26 + bobY);
        ctx.closePath();
        ctx.fill();

        // Wand in Outstretched Hand
        ctx.fillStyle = '#78350f'; // Wood wand
        ctx.save();
        ctx.translate(10, -8 + bobY);
        ctx.rotate(0.3 + (player.isRunning ? Math.sin(player.runFrame) * 0.15 : 0));
        ctx.fillRect(0, -2, 22, 3);

        // Glowing Wand Tip (Lumos / Spark effect)
        const wandGlow = ctx.createRadialGradient(22, 0, 1, 22, 0, 16);
        wandGlow.addColorStop(0, '#ffffff');
        wandGlow.addColorStop(0.3, '#86efac');
        wandGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = wandGlow;
        ctx.beginPath();
        ctx.arc(22, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Protego Shield Bubble (if active)
        if (player.shieldTimer > 0) {
          const pulse = Math.sin(state.frameCount * 0.1) * 3;
          const shieldGrad = ctx.createRadialGradient(0, -4, 25, 0, -4, 46 + pulse);
          shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
          shieldGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.4)');
          shieldGrad.addColorStop(1, 'rgba(125, 211, 252, 0.9)');

          ctx.fillStyle = shieldGrad;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, -4, 46 + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Hexagonal magic runes around shield
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          for (let r = 0; r < 6; r++) {
            const rot = r * (Math.PI / 3) + state.frameCount * 0.02;
            const rx = Math.cos(rot) * (42 + pulse);
            const ry = Math.sin(rot) * (42 + pulse);
            ctx.beginPath();
            ctx.arc(rx, ry - 4, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // --- 7. DRAW PARTICLES ---
      state.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // --- 8. DRAW FLOATING TEXT ALERTS ---
      state.floatingTexts.forEach((t) => {
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.font = `900 ${t.fontSize}px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      // --- 9. INTERACTIVE TARGET INDICATOR (For intuitive pointer follow) ---
      if (props.controlMode === 'follow' && props.isPlaying && !props.isPaused && state.mousePos.active) {
        ctx.save();
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(player.targetX, curFloor + 22, 18, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(Boolean(isPortrait));

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#0a0a0e]">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full object-contain cursor-crosshair touch-none"
      />
    </div>
  );
};
