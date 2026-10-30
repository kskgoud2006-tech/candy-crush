/**
 * Candy Crush Main Game Engine & Controller
 * Integrates Board logic, CSS DOM animations, FX Engine, Audio, and Player Controls
 */

class CandyGame {
    constructor() {
        this.board = new Board(8, 8);
        this.boardEl = document.getElementById('candy-grid');
        this.canvasEl = document.getElementById('fx-canvas');
        this.fx = new FXEngine(this.canvasEl);
        this.sound = window.soundSystem;

        // Game State
        this.level = 1;
        this.score = 0;
        this.targetScore = 1500;
        this.moves = 25;
        this.stars = 0;
        this.isProcessing = false;
        this.selectedTile = null;
        this.dragStart = null;
        this.dragCandy = null;
        this.comboChain = 0;
        this.hintTimer = null;
        this.hintTiles = [];

        // Level Definitions
        this.levels = [
            { level: 1, name: 'Sweet Valley', target: 1500, moves: 25 },
            { level: 2, name: 'Lollipop Lake', target: 3500, moves: 22 },
            { level: 3, name: 'Gummy Glade', target: 6500, moves: 20 },
            { level: 4, name: 'Caramel Peak', target: 10000, moves: 20 },
            { level: 5, name: 'Sugar Kingdom', target: 15000, moves: 18 }
        ];

        this.initDOM();
        this.setupEventListeners();
        this.loadLevel(1);
    }

    initDOM() {
        // UI Elements
        this.scoreEl = document.getElementById('score-value');
        this.targetEl = document.getElementById('target-value');
        this.movesEl = document.getElementById('moves-value');
        this.levelEl = document.getElementById('level-name');
        this.starBarEl = document.getElementById('star-progress-fill');
        this.starIcons = [
            document.getElementById('star-1'),
            document.getElementById('star-2'),
            document.getElementById('star-3')
        ];
        this.muteBtn = document.getElementById('btn-mute');
        this.updateMuteButton();

        // Create 8x8 background tile slots
        const tileSlotsContainer = document.getElementById('tile-slots');
        tileSlotsContainer.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const slot = document.createElement('div');
                slot.className = `tile-slot ${(r + c) % 2 === 0 ? 'slot-even' : 'slot-odd'}`;
                tileSlotsContainer.appendChild(slot);
            }
        }
    }

    loadLevel(lvlNum) {
        this.level = Math.min(Math.max(1, lvlNum), this.levels.length);
        const lvlData = this.levels[this.level - 1];

        this.score = 0;
        this.targetScore = lvlData.target;
        this.moves = lvlData.moves;
        this.stars = 0;
        this.isProcessing = false;
        this.selectedTile = null;
        this.clearHints();

        this.levelEl.textContent = `Lvl ${lvlData.level}: ${lvlData.name}`;
        this.targetEl.textContent = this.targetScore.toLocaleString();
        this.updateHUD();

        this.board.init();
        this.renderBoard();
        this.resetHintTimer();
    }

    updateHUD() {
        this.scoreEl.textContent = this.score.toLocaleString();
        this.movesEl.textContent = this.moves;

        // Progress toward 3 stars (Target = 3 stars, 70% = 2 stars, 40% = 1 star)
        const progressPct = Math.min(100, Math.floor((this.score / this.targetScore) * 100));
        this.starBarEl.style.width = `${progressPct}%`;

        // Update star achievements
        const star1 = progressPct >= 40;
        const star2 = progressPct >= 70;
        const star3 = progressPct >= 100;

        this.starIcons[0].classList.toggle('earned', star1);
        this.starIcons[1].classList.toggle('earned', star2);
        this.starIcons[2].classList.toggle('earned', star3);

        this.stars = (star3 ? 3 : (star2 ? 2 : (star1 ? 1 : 0)));

        if (this.moves <= 5) {
            this.movesEl.parentElement.classList.add('low-moves');
        } else {
            this.movesEl.parentElement.classList.remove('low-moves');
        }
    }

    renderBoard() {
        this.boardEl.innerHTML = '';
        const tileSize = this.getTileSize();

        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const candy = this.board.getCandy(r, c);
                if (candy) {
                    const el = this.createCandyElement(candy, tileSize);
                    this.boardEl.appendChild(el);
                }
            }
        }
    }

    getTileSize() {
        const boardWidth = this.boardEl.clientWidth || 480;
        return boardWidth / 8;
    }

    createCandyElement(candy, tileSize = this.getTileSize()) {
        const el = document.createElement('div');
        el.className = `candy-piece type-${candy.type}`;
        el.id = `candy-${candy.id}`;
        el.dataset.row = candy.row;
        el.dataset.col = candy.col;
        el.dataset.id = candy.id;

        // Position with GPU accelerated translate3d
        el.style.width = `${tileSize}px`;
        el.style.height = `${tileSize}px`;
        el.style.transform = `translate3d(${candy.col * tileSize}px, ${candy.row * tileSize}px, 0)`;

        // Visual graphic
        if (candy.special === 'bomb') {
            el.innerHTML = SPECIAL_CANDIES.color_bomb.svg;
            el.classList.add('is-bomb');
        } else {
            const def = CANDY_TYPES.find(t => t.id === candy.type);
            el.innerHTML = def ? def.svg : '';

            // Apply special overlays
            if (candy.special === 'striped_h') {
                el.insertAdjacentHTML('beforeend', SPECIAL_CANDIES.striped_h.overlay);
                el.classList.add('is-striped-h');
            } else if (candy.special === 'striped_v') {
                el.insertAdjacentHTML('beforeend', SPECIAL_CANDIES.striped_v.overlay);
                el.classList.add('is-striped-v');
            } else if (candy.special === 'wrapped') {
                el.insertAdjacentHTML('beforeend', SPECIAL_CANDIES.wrapped.overlay);
                el.classList.add('is-wrapped');
            }
        }

        return el;
    }

    updateCandyPositions() {
        const tileSize = this.getTileSize();
        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const candy = this.board.getCandy(r, c);
                if (candy) {
                    let el = document.getElementById(`candy-${candy.id}`);
                    if (!el) {
                        el = this.createCandyElement(candy, tileSize);
                        // Drop in from top
                        el.style.transform = `translate3d(${c * tileSize}px, ${-tileSize * 1.5}px, 0)`;
                        this.boardEl.appendChild(el);
                        // Trigger reflow for drop animation
                        void el.offsetWidth;
                    }
                    el.dataset.row = r;
                    el.dataset.col = c;
                    el.style.transform = `translate3d(${c * tileSize}px, ${r * tileSize}px, 0)`;
                }
            }
        }
    }

    setupEventListeners() {
        // Pointer down (Click or Touch start)
        this.boardEl.addEventListener('pointerdown', (e) => {
            if (this.isProcessing) return;
            this.sound.ensureContext();
            this.clearHints();

            const candyEl = e.target.closest('.candy-piece');
            if (!candyEl) return;

            const r = parseInt(candyEl.dataset.row, 10);
            const c = parseInt(candyEl.dataset.col, 10);

            this.dragStart = { x: e.clientX, y: e.clientY };
            this.dragCandy = { r, c };

            // Capture pointer for smooth dragging across touch/mouse
            candyEl.setPointerCapture(e.pointerId);
        });

        // Pointer move (Swipe detection)
        this.boardEl.addEventListener('pointermove', (e) => {
            if (!this.dragStart || !this.dragCandy || this.isProcessing) return;

            const dx = e.clientX - this.dragStart.x;
            const dy = e.clientY - this.dragStart.y;
            const threshold = 22; // pixels to trigger swipe

            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
                let targetR = this.dragCandy.r;
                let targetC = this.dragCandy.c;

                if (Math.abs(dx) > Math.abs(dy)) {
                    targetC += dx > 0 ? 1 : -1;
                } else {
                    targetR += dy > 0 ? 1 : -1;
                }

                // Check boundary
                if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
                    const startCandy = this.dragCandy;
                    this.dragStart = null;
                    this.dragCandy = null;
                    this.handleSwap(startCandy.r, startCandy.c, targetR, targetC);
                }
            }
        });

        // Pointer up (Click selection handling)
        this.boardEl.addEventListener('pointerup', (e) => {
            if (!this.dragStart || !this.dragCandy || this.isProcessing) {
                this.dragStart = null;
                this.dragCandy = null;
                return;
            }

            const { r, c } = this.dragCandy;
            this.dragStart = null;
            this.dragCandy = null;

            if (!this.selectedTile) {
                // Select first tile
                this.selectedTile = { r, c };
                this.highlightTile(r, c, true);
                this.sound.playClick();
            } else {
                const r1 = this.selectedTile.r;
                const c1 = this.selectedTile.c;
                this.highlightTile(r1, c1, false);
                this.selectedTile = null;

                // Check if clicked the same tile
                if (r1 === r && c1 === c) return;

                // Check adjacency (distance === 1)
                const dist = Math.abs(r1 - r) + Math.abs(c1 - c);
                if (dist === 1) {
                    this.handleSwap(r1, c1, r, c);
                } else {
                    // Select new tile instead
                    this.selectedTile = { r, c };
                    this.highlightTile(r, c, true);
                    this.sound.playClick();
                }
            }
        });

        // HUD Buttons
        this.muteBtn.addEventListener('click', () => {
            this.sound.toggleMute();
            this.updateMuteButton();
        });

        document.getElementById('btn-hint').addEventListener('click', () => {
            this.sound.playClick();
            this.showHint();
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.sound.playClick();
            this.loadLevel(this.level);
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            this.sound.playClick();
            document.getElementById('modal-instructions').classList.remove('hidden');
        });

        document.getElementById('btn-close-modal').addEventListener('click', () => {
            this.sound.playClick();
            document.getElementById('modal-instructions').classList.add('hidden');
        });

        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.sound.playClick();
            document.getElementById('modal-win').classList.add('hidden');
            this.loadLevel(this.level + 1);
        });

        document.getElementById('btn-retry-win').addEventListener('click', () => {
            this.sound.playClick();
            document.getElementById('modal-win').classList.add('hidden');
            this.loadLevel(this.level);
        });

        document.getElementById('btn-try-again').addEventListener('click', () => {
            this.sound.playClick();
            document.getElementById('modal-gameover').classList.add('hidden');
            this.loadLevel(this.level);
        });

        window.addEventListener('resize', () => {
            this.updateCandyPositions();
            this.fx.resize();
        });
    }

    updateMuteButton() {
        const isMuted = this.sound.isMuted();
        this.muteBtn.innerHTML = isMuted 
            ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
            : `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
    }

    highlightTile(r, c, active) {
        const candy = this.board.getCandy(r, c);
        if (!candy) return;
        const el = document.getElementById(`candy-${candy.id}`);
        if (el) {
            el.classList.toggle('selected', active);
        }
    }

    async handleSwap(r1, c1, r2, c2) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.clearHints();

        const c1Obj = this.board.getCandy(r1, c1);
        const c2Obj = this.board.getCandy(r2, c2);

        if (!c1Obj || !c2Obj) {
            this.isProcessing = false;
            return;
        }

        // Swap in board model
        this.board.swap(r1, c1, r2, c2);
        this.sound.playSwap();

        // Animate swap visually
        await this.animateSwap(c1Obj, c2Obj);

        // Check for Special + Special combos
        const isSpecialCombo = this.checkSpecialCombos(c1Obj, c2Obj);

        if (isSpecialCombo) {
            this.moves--;
            this.updateHUD();
            await this.resolveSpecialCombo(c1Obj, c2Obj);
            await this.processBoardCascades();
            this.checkGameCompletion();
            this.isProcessing = false;
            this.resetHintTimer();
            return;
        }

        // Standard match detection
        const matches = this.board.findAllMatches();

        if (matches.length > 0) {
            // Valid swap!
            this.moves--;
            this.updateHUD();
            this.comboChain = 1;
            await this.resolveMatches(matches, c2Obj);
            await this.processBoardCascades();
            this.checkGameCompletion();
        } else {
            // Invalid swap: Revert!
            this.board.swap(r1, c1, r2, c2);
            this.sound.playInvalid();
            await this.animateSwap(c1Obj, c2Obj);
        }

        this.isProcessing = false;
        this.resetHintTimer();
    }

    animateSwap(c1Obj, c2Obj) {
        return new Promise(resolve => {
            const el1 = document.getElementById(`candy-${c1Obj.id}`);
            const el2 = document.getElementById(`candy-${c2Obj.id}`);
            const tileSize = this.getTileSize();

            if (el1) el1.style.transform = `translate3d(${c1Obj.col * tileSize}px, ${c1Obj.row * tileSize}px, 0)`;
            if (el2) el2.style.transform = `translate3d(${c2Obj.col * tileSize}px, ${c2Obj.row * tileSize}px, 0)`;

            setTimeout(resolve, 240);
        });
    }

    checkSpecialCombos(c1, c2) {
        return (c1.special && c2.special) ||
               (c1.special === 'bomb' || c2.special === 'bomb');
    }

    async resolveSpecialCombo(c1, c2) {
        const tileSize = this.getTileSize();
        const p1 = this.getTileCenter(c1.row, c1.col, tileSize);
        const p2 = this.getTileCenter(c2.row, c2.col, tileSize);

        // 1. Dual Color Bomb: Clears whole board!
        if (c1.special === 'bomb' && c2.special === 'bomb') {
            this.fx.createShockwave((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, '#ffd700');
            this.sound.playColorBomb();
            this.addScore(2500, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 'SUPER BOARD WIPE!');

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const candy = this.board.getCandy(r, c);
                    if (candy) {
                        this.destroyCandy(candy);
                    }
                }
            }
            await this.wait(300);
            return;
        }

        // 2. Color Bomb + Striped Candy: Turns all candies of that color into striped candies & detonates!
        if ((c1.special === 'bomb' && c2.special?.startsWith('striped')) ||
            (c2.special === 'bomb' && c1.special?.startsWith('striped'))) {
            const bomb = c1.special === 'bomb' ? c1 : c2;
            const striped = c1.special === 'bomb' ? c2 : c1;
            const targetColor = striped.type;

            this.destroyCandy(bomb);
            this.sound.playColorBomb();

            const targets = [];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const candy = this.board.getCandy(r, c);
                    if (candy && candy.type === targetColor) {
                        targets.push(candy);
                    }
                }
            }

            for (const t of targets) {
                const tp = this.getTileCenter(t.row, t.col, tileSize);
                this.fx.createLightning(p1.x, p1.y, tp.x, tp.y);
                t.special = Math.random() > 0.5 ? 'striped_h' : 'striped_v';
                const el = document.getElementById(`candy-${t.id}`);
                if (el) el.classList.add(t.special === 'striped_h' ? 'is-striped-h' : 'is-striped-v');
            }

            await this.wait(350);

            for (const t of targets) {
                await this.triggerStriped(t);
            }
            return;
        }

        // 3. Color Bomb + Normal Candy: Zap and clear all of that color!
        if (c1.special === 'bomb' || c2.special === 'bomb') {
            const bomb = c1.special === 'bomb' ? c1 : c2;
            const normal = c1.special === 'bomb' ? c2 : c1;
            const targetColor = normal.type;

            this.destroyCandy(bomb);
            this.sound.playColorBomb();
            this.addScore(1000, p1.x, p1.y, 'SUGAR CRUSH!');

            const targets = [];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const candy = this.board.getCandy(r, c);
                    if (candy && (candy.type === targetColor || candy.id === normal.id)) {
                        targets.push(candy);
                    }
                }
            }

            for (const t of targets) {
                const tp = this.getTileCenter(t.row, t.col, tileSize);
                this.fx.createLightning(p1.x, p1.y, tp.x, tp.y);
                this.destroyCandy(t);
            }
            await this.wait(300);
            return;
        }

        // 4. Striped + Striped: Cross blast
        if (c1.special?.startsWith('striped') && c2.special?.startsWith('striped')) {
            this.destroyCandy(c1);
            this.destroyCandy(c2);
            await this.triggerCrossBlast(c2.row, c2.col);
            return;
        }

        // 5. Striped + Wrapped: Mega 3-line cross blast
        if ((c1.special?.startsWith('striped') && c2.special === 'wrapped') ||
            (c2.special?.startsWith('striped') && c1.special === 'wrapped')) {
            this.destroyCandy(c1);
            this.destroyCandy(c2);
            await this.triggerMegaCrossBlast(c2.row, c2.col);
            return;
        }

        // 6. Wrapped + Wrapped: Giant 5x5 explosion
        if (c1.special === 'wrapped' && c2.special === 'wrapped') {
            this.destroyCandy(c1);
            this.destroyCandy(c2);
            await this.triggerGiantExplosion(c2.row, c2.col);
            return;
        }
    }

    async resolveMatches(matchedTiles, lastSwapped) {
        const tileSize = this.getTileSize();
        const specialsToCreate = this.board.resolveSpecialCreations(matchedTiles, lastSwapped);

        // Calculate score
        const baseScore = matchedTiles.length * 20 * this.comboChain;
        const centerTile = matchedTiles[Math.floor(matchedTiles.length / 2)];
        const centerPos = this.getTileCenter(centerTile.r, centerTile.c, tileSize);

        this.addScore(baseScore, centerPos.x, centerPos.y);
        this.sound.playPop(this.comboChain);

        if (this.comboChain >= 2) {
            const praiseTiers = ['SWEET!', 'TASTY!', 'DELICIOUS!', 'DIVINE!'];
            const praise = praiseTiers[Math.min(this.comboChain - 2, praiseTiers.length - 1)];
            this.fx.createFloatingText(centerPos.x, centerPos.y - 30, praise, '#ffd700', 32, true);
            this.sound.playCombo(this.comboChain);
        }

        // Trigger specials already matched
        for (const t of matchedTiles) {
            const candy = t.candy;
            if (!candy) continue;

            if (candy.special === 'striped_h') {
                this.fx.createStripedBeam(centerPos.x, this.getTileCenter(candy.row, candy.col, tileSize).y, 'horizontal');
                this.sound.playStriped();
                this.clearRow(candy.row);
            } else if (candy.special === 'striped_v') {
                this.fx.createStripedBeam(this.getTileCenter(candy.row, candy.col, tileSize).x, centerPos.y, 'vertical');
                this.sound.playStriped();
                this.clearColumn(candy.col);
            } else if (candy.special === 'wrapped') {
                const pt = this.getTileCenter(candy.row, candy.col, tileSize);
                this.fx.createShockwave(pt.x, pt.y);
                this.sound.playWrapped();
                this.clearArea(candy.row, candy.col, 1);
            }

            this.destroyCandy(candy);
        }

        await this.wait(200);

        // Spawn created special candies in place
        for (const sp of specialsToCreate) {
            const candy = {
                id: this.board.idCounter++,
                type: sp.type,
                special: sp.special,
                row: sp.r,
                col: sp.c
            };
            this.board.setCandy(sp.r, sp.c, candy);
            const el = this.createCandyElement(candy, tileSize);
            el.classList.add('created-special');
            this.boardEl.appendChild(el);
            this.fx.createShockwave(sp.c * tileSize + tileSize / 2, sp.r * tileSize + tileSize / 2, '#fff');
        }
    }

    destroyCandy(candy) {
        if (!candy) return;
        const tileSize = this.getTileSize();
        const pt = this.getTileCenter(candy.row, candy.col, tileSize);
        const def = CANDY_TYPES.find(t => t.id === candy.type);

        this.fx.createPop(pt.x, pt.y, def ? def.color : '#ffd700', 16);

        const el = document.getElementById(`candy-${candy.id}`);
        if (el) {
            el.classList.add('candy-popping');
            setTimeout(() => el.remove(), 160);
        }

        this.board.grid[candy.row][candy.col] = null;
    }

    async clearRow(row) {
        for (let c = 0; c < 8; c++) {
            const candy = this.board.getCandy(row, c);
            if (candy) this.destroyCandy(candy);
        }
    }

    async clearColumn(col) {
        for (let r = 0; r < 8; r++) {
            const candy = this.board.getCandy(r, col);
            if (candy) this.destroyCandy(candy);
        }
    }

    async clearArea(row, col, radius = 1) {
        for (let r = row - radius; r <= row + radius; r++) {
            for (let c = col - radius; c <= col + radius; c++) {
                const candy = this.board.getCandy(r, c);
                if (candy) this.destroyCandy(candy);
            }
        }
    }

    async triggerStriped(candy) {
        const tileSize = this.getTileSize();
        const pt = this.getTileCenter(candy.row, candy.col, tileSize);
        this.destroyCandy(candy);
        this.sound.playStriped();

        if (candy.special === 'striped_h') {
            this.fx.createStripedBeam(pt.x, pt.y, 'horizontal');
            await this.clearRow(candy.row);
        } else {
            this.fx.createStripedBeam(pt.x, pt.y, 'vertical');
            await this.clearColumn(candy.col);
        }
        await this.wait(150);
    }

    async triggerCrossBlast(row, col) {
        const tileSize = this.getTileSize();
        const pt = this.getTileCenter(row, col, tileSize);
        this.sound.playStriped();
        this.fx.createStripedBeam(pt.x, pt.y, 'horizontal');
        this.fx.createStripedBeam(pt.x, pt.y, 'vertical');

        this.clearRow(row);
        this.clearColumn(col);
        await this.wait(200);
    }

    async triggerMegaCrossBlast(row, col) {
        const tileSize = this.getTileSize();
        const pt = this.getTileCenter(row, col, tileSize);
        this.sound.playWrapped();
        this.sound.playStriped();

        for (let dr = -1; dr <= 1; dr++) {
            const r = row + dr;
            if (r >= 0 && r < 8) {
                this.fx.createStripedBeam(pt.x, r * tileSize + tileSize / 2, 'horizontal');
                this.clearRow(r);
            }
        }
        for (let dc = -1; dc <= 1; dc++) {
            const c = col + dc;
            if (c >= 0 && c < 8) {
                this.fx.createStripedBeam(c * tileSize + tileSize / 2, pt.y, 'vertical');
                this.clearColumn(c);
            }
        }
        await this.wait(250);
    }

    async triggerGiantExplosion(row, col) {
        const tileSize = this.getTileSize();
        const pt = this.getTileCenter(row, col, tileSize);
        this.sound.playWrapped();
        this.fx.createShockwave(pt.x, pt.y, '#ff4757');
        await this.clearArea(row, col, 2);
        await this.wait(250);
    }

    // Cascade & Refill Loop
    async processBoardCascades() {
        let hasCascades = true;

        while (hasCascades) {
            // Apply Gravity: fall down
            await this.applyGravity();
            await this.wait(150);

            // Refill top
            await this.refillTop();
            await this.wait(250);

            // Check for cascading matches
            const cascadeMatches = this.board.findAllMatches();
            if (cascadeMatches.length > 0) {
                this.comboChain++;
                await this.resolveMatches(cascadeMatches, null);
            } else {
                hasCascades = false;
            }
        }

        // Check if playable moves exist, else reshuffle!
        if (!this.board.findPossibleMove() && this.moves > 0) {
            await this.reshuffleBoard();
        }
    }

    async applyGravity() {
        let moved = false;
        for (let c = 0; c < 8; c++) {
            for (let r = 7; r >= 0; r--) {
                if (this.board.getCandy(r, c) === null) {
                    // Find first candy above
                    for (let k = r - 1; k >= 0; k--) {
                        const aboveCandy = this.board.getCandy(k, c);
                        if (aboveCandy !== null) {
                            this.board.grid[r][c] = aboveCandy;
                            this.board.grid[k][c] = null;
                            aboveCandy.row = r;
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }
        if (moved) {
            this.updateCandyPositions();
        }
    }

    async refillTop() {
        const tileSize = this.getTileSize();
        for (let c = 0; c < 8; c++) {
            let emptyCount = 0;
            for (let r = 7; r >= 0; r--) {
                if (this.board.getCandy(r, c) === null) {
                    emptyCount++;
                    const candy = this.board.createRandomCandy(r, c, false);
                    this.board.grid[r][c] = candy;

                    const el = this.createCandyElement(candy, tileSize);
                    // Start above the board
                    el.style.transform = `translate3d(${c * tileSize}px, ${-emptyCount * tileSize * 1.2}px, 0)`;
                    this.boardEl.appendChild(el);

                    // Drop to position
                    setTimeout(() => {
                        el.style.transform = `translate3d(${c * tileSize}px, ${r * tileSize}px, 0)`;
                    }, 20);
                }
            }
        }
    }

    async reshuffleBoard() {
        const banner = document.getElementById('shuffle-banner');
        banner.classList.remove('hidden');
        this.sound.playSwap();

        await this.wait(800);
        this.board.shuffle();
        this.renderBoard();
        await this.wait(400);

        banner.classList.add('hidden');
    }

    addScore(points, x, y, customText = null) {
        this.score += points;
        this.updateHUD();
        this.fx.createFloatingText(x, y, customText || `+${points}`, '#ffffff', 26);
    }

    getTileCenter(r, c, tileSize = this.getTileSize()) {
        return {
            x: c * tileSize + tileSize / 2,
            y: r * tileSize + tileSize / 2
        };
    }

    checkGameCompletion() {
        if (this.score >= this.targetScore) {
            // Level Win!
            setTimeout(() => this.showWinModal(), 500);
        } else if (this.moves <= 0) {
            // Out of moves!
            setTimeout(() => this.showGameOverModal(), 500);
        }
    }

    showWinModal() {
        this.sound.playWin();
        this.fx.triggerVictoryConfetti();

        const modal = document.getElementById('modal-win');
        document.getElementById('win-score').textContent = this.score.toLocaleString();
        document.getElementById('win-target').textContent = this.targetScore.toLocaleString();

        const winStars = [
            document.getElementById('win-star-1'),
            document.getElementById('win-star-2'),
            document.getElementById('win-star-3')
        ];

        winStars.forEach((s, idx) => {
            s.classList.toggle('earned', idx < this.stars);
        });

        // Hide Next Level button if on final level
        const nextBtn = document.getElementById('btn-next-level');
        if (this.level >= this.levels.length) {
            nextBtn.textContent = 'All Levels Complete! Play Again';
            nextBtn.onclick = () => {
                modal.classList.add('hidden');
                this.loadLevel(1);
            };
        }

        modal.classList.remove('hidden');
    }

    showGameOverModal() {
        this.sound.playGameOver();
        const modal = document.getElementById('modal-gameover');
        document.getElementById('fail-score').textContent = this.score.toLocaleString();
        document.getElementById('fail-target').textContent = this.targetScore.toLocaleString();
        modal.classList.remove('hidden');
    }

    // Hint & Idle System
    resetHintTimer() {
        this.clearHints();
        this.hintTimer = setTimeout(() => {
            this.showHint(false);
        }, 6000);
    }

    clearHints() {
        if (this.hintTimer) clearTimeout(this.hintTimer);
        this.hintTiles.forEach(el => el.classList.remove('hint-pulse'));
        this.hintTiles = [];
    }

    showHint(isManual = true) {
        this.clearHints();
        const move = this.board.findPossibleMove();
        if (!move) return;

        const c1 = this.board.getCandy(move.r1, move.c1);
        const c2 = this.board.getCandy(move.r2, move.c2);

        if (c1 && c2) {
            const el1 = document.getElementById(`candy-${c1.id}`);
            const el2 = document.getElementById(`candy-${c2.id}`);

            if (el1) { el1.classList.add('hint-pulse'); this.hintTiles.push(el1); }
            if (el2) { el2.classList.add('hint-pulse'); this.hintTiles.push(el2); }
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Start game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.candyGame = new CandyGame();
});

