// Candy Crush Match-3 Engine
class CandyCrushGame {
    constructor() {
        this.rows = 8;
        this.cols = 8;
        this.board = [];
        this.jellies = [];
        this.candies = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
        
        this.currentLevel = 1;
        this.score = 0;
        this.moves = 20;
        this.targetScore = 1500;
        this.targetJellies = 0;
        this.isProcessing = false;
        this.selectedTile = null;
        this.comboCount = 0;
        this.gameMode = 'level'; // 'level' or 'endless'
        this.highScore = parseInt(localStorage.getItem('candy_high_score') || '0', 10);

        this.levelConfigs = {
            1: { name: "Level 1: Sweet Start", moves: 15, targetScore: 1200, jellies: 0, title: "Target: 1,200 pts" },
            2: { name: "Level 2: Jelly Time", moves: 18, targetScore: 2000, jellies: 16, title: "Clear 16 Jellies" },
            3: { name: "Level 3: Sugar Rush", moves: 20, targetScore: 3500, jellies: 0, title: "Target: 3,500 pts" },
            4: { name: "Level 4: Frosted Dream", moves: 22, targetScore: 4500, jellies: 28, title: "Clear 28 Jellies" },
            5: { name: "Level 5: Choco Crunch", moves: 25, targetScore: 6000, jellies: 20, title: "Score & Jellies" },
            6: { name: "Level 6: Grand Master", moves: 30, targetScore: 10000, jellies: 36, title: "Ultimate Challenge" }
        };

        this.initDOM();
        this.setupTouchControls();
        this.startLevel(1);
    }

    initDOM() {
        this.boardEl = document.getElementById('board');
        this.scoreEl = document.getElementById('score-val');
        this.movesEl = document.getElementById('moves-val');
        this.targetEl = document.getElementById('target-desc');
        this.highScoreEl = document.getElementById('high-score-val');
        this.starFillEl = document.getElementById('star-fill');
        this.announcementEl = document.getElementById('announcement');
        this.particlesContainer = document.getElementById('particles-container');

        this.highScoreEl.innerText = this.highScore.toLocaleString();
    }

    startLevel(lvlNum) {
        this.currentLevel = lvlNum;
        const config = this.levelConfigs[lvlNum] || {
            name: `Level ${lvlNum}`,
            moves: 20 + Math.floor(lvlNum * 1.5),
            targetScore: 2000 * lvlNum,
            jellies: lvlNum % 2 === 0 ? 20 : 0,
            title: `Score ${2000 * lvlNum}`
        };

        this.score = 0;
        this.moves = config.moves;
        this.targetScore = config.targetScore;
        this.targetJellies = config.jellies;
        this.comboCount = 0;
        this.isProcessing = false;
        this.selectedTile = null;

        document.getElementById('current-level-title').innerText = config.name;
        this.targetEl.innerText = config.title;
        this.updateHUD();

        this.createBoard(config.jellies > 0);
    }

    createBoard(withJellies) {
        this.board = [];
        this.jellies = [];
        this.boardEl.innerHTML = '';

        // Initialize empty grid
        for (let r = 0; r < this.rows; r++) {
            this.board[r] = [];
            this.jellies[r] = [];
            for (let c = 0; c < this.cols; c++) {
                // Place jellies in center area if level requires
                const isJelly = withJellies && (r >= 2 && r <= 5 && c >= 2 && c <= 5);
                this.jellies[r][c] = isJelly;

                let color;
                do {
                    color = this.candies[Math.floor(Math.random() * this.candies.length)];
                } while (
                    (r >= 2 && this.board[r - 1][c].type === color && this.board[r - 2][c].type === color) ||
                    (c >= 2 && this.board[r][c - 1].type === color && this.board[r][c - 2].type === color)
                );

                this.board[r][c] = {
                    type: color,
                    special: 'none', // 'none', 'striped-h', 'striped-v', 'wrapped', 'colorbomb'
                    r: r,
                    c: c
                };
            }
        }

        // Count initial jellies
        let count = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.jellies[r][c]) count++;
            }
        }
        this.targetJellies = count;
        this.renderBoard();
        this.updateHUD();
    }

    renderBoard() {
        this.boardEl.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (this.jellies[r][c]) {
                    const jellyDiv = document.createElement('div');
                    jellyDiv.className = 'jelly-layer';
                    cell.appendChild(jellyDiv);
                }

                const item = this.board[r][c];
                if (item) {
                    const tileDiv = document.createElement('div');
                    tileDiv.className = `tile candy-${item.type} ${item.special !== 'none' ? 'special-' + item.special : ''}`;
                    tileDiv.innerHTML = CandyGraphics.render(item.type, item.special);
                    cell.appendChild(tileDiv);
                }

                this.boardEl.appendChild(cell);
            }
        }
    }

    setupTouchControls() {
        let startX = 0;
        let startY = 0;
        let activeR = -1;
        let activeC = -1;

        const handleStart = (clientX, clientY, target) => {
            if (this.isProcessing) return;
            const cell = target.closest('.cell');
            if (!cell) return;
            activeR = parseInt(cell.dataset.row, 10);
            activeC = parseInt(cell.dataset.col, 10);
            startX = clientX;
            startY = clientY;

            // Highlight selected cell
            this.highlightCell(activeR, activeC, true);
        };

        const handleEnd = (clientX, clientY) => {
            if (this.isProcessing || activeR === -1) return;
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            const minSwipe = 28;

            this.highlightCell(activeR, activeC, false);

            if (Math.abs(deltaX) > minSwipe || Math.abs(deltaY) > minSwipe) {
                // Swipe detected
                let targetR = activeR;
                let targetC = activeC;
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    targetC += deltaX > 0 ? 1 : -1;
                } else {
                    targetR += deltaY > 0 ? 1 : -1;
                }

                if (this.isValidCell(targetR, targetC)) {
                    this.attemptSwap(activeR, activeC, targetR, targetC);
                }
            } else {
                // Click tap selection
                if (!this.selectedTile) {
                    this.selectedTile = { r: activeR, c: activeC };
                    this.highlightCell(activeR, activeC, true);
                } else {
                    const prevR = this.selectedTile.r;
                    const prevC = this.selectedTile.c;
                    this.highlightCell(prevR, prevC, false);
                    this.selectedTile = null;

                    if ((Math.abs(prevR - activeR) === 1 && prevC === activeC) ||
                        (Math.abs(prevC - activeC) === 1 && prevR === activeR)) {
                        this.attemptSwap(prevR, prevC, activeR, activeC);
                    } else if (prevR !== activeR || prevC !== activeC) {
                        this.selectedTile = { r: activeR, c: activeC };
                        this.highlightCell(activeR, activeC, true);
                    }
                }
            }
            activeR = -1;
            activeC = -1;
        };

        // Mobile touch events
        this.boardEl.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY, e.target);
        }, { passive: false });

        this.boardEl.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            handleEnd(touch.clientX, touch.clientY);
        }, { passive: false });

        // Desktop mouse events
        let isMouseDown = false;
        this.boardEl.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            handleStart(e.clientX, e.clientY, e.target);
        });

        window.addEventListener('mouseup', (e) => {
            if (isMouseDown) {
                isMouseDown = false;
                handleEnd(e.clientX, e.clientY);
            }
        });
    }

    isValidCell(r, c) {
        return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
    }

    highlightCell(r, c, active) {
        const cell = this.getCellElement(r, c);
        if (cell) {
            if (active) {
                cell.classList.add('cell-active');
            } else {
                cell.classList.remove('cell-active');
            }
        }
    }

    getCellElement(r, c) {
        return this.boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    }

    async attemptSwap(r1, c1, r2, c2) {
        this.isProcessing = true;
        window.soundFx.playSwap();

        const item1 = this.board[r1][c1];
        const item2 = this.board[r2][c2];

        // Animate swap
        await this.animateSwap(r1, c1, r2, c2);

        // Perform logical swap
        this.board[r1][c1] = item2;
        this.board[r2][c2] = item1;
        item1.r = r2; item1.c = c2;
        item2.r = r1; item2.c = c1;

        // Check for special combos (Color Bomb + Color Bomb / Striped / Wrapped)
        const isSpecialCombo = this.checkSpecialCombo(item1, item2, r1, c1, r2, c2);

        if (isSpecialCombo) {
            this.moves--;
            this.updateHUD();
            await this.executeSpecialCombo(item1, item2, r2, c2);
            await this.processBoardCascades();
            this.checkGameStatus();
            this.isProcessing = false;
            return;
        }

        // Standard Match Check
        const matches = this.findMatches();
        if (matches.length > 0) {
            this.moves--;
            this.comboCount = 1;
            this.updateHUD();
            await this.processBoardCascades();
            this.checkGameStatus();
        } else {
            // Swap back if no match
            await this.animateSwap(r1, c1, r2, c2);
            this.board[r1][c1] = item1;
            this.board[r2][c2] = item2;
            item1.r = r1; item1.c = c1;
            item2.r = r2; item2.c = c2;
            this.renderBoard();
        }
        this.isProcessing = false;
    }

    animateSwap(r1, c1, r2, c2) {
        return new Promise((resolve) => {
            const el1 = this.getCellElement(r1, c1)?.querySelector('.tile');
            const el2 = this.getCellElement(r2, c2)?.querySelector('.tile');
            if (!el1 || !el2) {
                resolve();
                return;
            }

            const dx = (c2 - c1) * 100;
            const dy = (r2 - r1) * 100;

            el1.style.transition = 'transform 0.18s ease-in-out';
            el2.style.transition = 'transform 0.18s ease-in-out';
            el1.style.transform = `translate(${dx}%, ${dy}%)`;
            el2.style.transform = `translate(${-dx}%, ${-dy}%)`;

            setTimeout(() => {
                el1.style.transition = '';
                el2.style.transition = '';
                el1.style.transform = '';
                el2.style.transform = '';
                resolve();
            }, 180);
        });
    }

    checkSpecialCombo(item1, item2) {
        if (!item1 || !item2) return false;
        if (item1.type === 'colorbomb' || item2.type === 'colorbomb') return true;
        if (item1.special !== 'none' && item2.special !== 'none') return true;
        return false;
    }

    async executeSpecialCombo(item1, item2, targetR, targetC) {
        const toClear = new Set();

        // 1. Color Bomb + Color Bomb -> Apocalypse (Wipes Board)
        if (item1.type === 'colorbomb' && item2.type === 'colorbomb') {
            window.soundFx.playExplosion();
            this.showAnnouncement("SUGAR CRUSH!");
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    toClear.add(`${r},${c}`);
                }
            }
            this.addScore(4000);
        }
        // 2. Color Bomb + Striped -> Turn all candies of that color to striped and detonate
        else if ((item1.type === 'colorbomb' && item2.special.startsWith('striped')) ||
                 (item2.type === 'colorbomb' && item1.special.startsWith('striped'))) {
            const targetColor = item1.type === 'colorbomb' ? item2.type : item1.type;
            window.soundFx.playColorBomb();
            this.showAnnouncement("STRIPED FRENZY!");

            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.board[r][c] && this.board[r][c].type === targetColor) {
                        this.board[r][c].special = Math.random() > 0.5 ? 'striped-h' : 'striped-v';
                        toClear.add(`${r},${c}`);
                    }
                }
            }
            toClear.add(`${item1.r},${item1.c}`);
            toClear.add(`${item2.r},${item2.c}`);
        }
        // 3. Color Bomb + Regular Candy -> Zap all candies of that color
        else if (item1.type === 'colorbomb' || item2.type === 'colorbomb') {
            const targetColor = item1.type === 'colorbomb' ? item2.type : item1.type;
            window.soundFx.playColorBomb();
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.board[r][c] && this.board[r][c].type === targetColor) {
                        toClear.add(`${r},${c}`);
                    }
                }
            }
            toClear.add(`${item1.r},${item1.c}`);
            toClear.add(`${item2.r},${item2.c}`);
        }
        // 4. Striped + Striped -> Clears row and column (Cross laser)
        else if (item1.special.startsWith('striped') && item2.special.startsWith('striped')) {
            window.soundFx.playLaser();
            this.showAnnouncement("SUPER CROSS!");
            for (let c = 0; c < this.cols; c++) toClear.add(`${targetR},${c}`);
            for (let r = 0; r < this.rows; r++) toClear.add(`${r},${targetC}`);
        }
        // 5. Striped + Wrapped -> Clears 3 rows and 3 columns!
        else if ((item1.special.startsWith('striped') && item2.special === 'wrapped') ||
                 (item2.special.startsWith('striped') && item1.special === 'wrapped')) {
            window.soundFx.playLaser();
            window.soundFx.playExplosion();
            this.showAnnouncement("MEGA BLAST!");
            for (let dr = -1; dr <= 1; dr++) {
                const r = targetR + dr;
                if (r >= 0 && r < this.rows) {
                    for (let c = 0; c < this.cols; c++) toClear.add(`${r},${c}`);
                }
            }
            for (let dc = -1; dc <= 1; dc++) {
                const c = targetC + dc;
                if (c >= 0 && c < this.cols) {
                    for (let r = 0; r < this.rows; r++) toClear.add(`${r},${c}`);
                }
            }
        }
        // 6. Wrapped + Wrapped -> 5x5 Bomb Explosion
        else if (item1.special === 'wrapped' && item2.special === 'wrapped') {
            window.soundFx.playExplosion();
            this.showAnnouncement("DOUBLE WRAPPED!");
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    const r = targetR + dr;
                    const c = targetC + dc;
                    if (this.isValidCell(r, c)) toClear.add(`${r},${c}`);
                }
            }
        }

        await this.clearTiles(toClear);
    }

    findMatches() {
        const matches = [];

        // Check horizontal matches
        for (let r = 0; r < this.rows; r++) {
            let matchLength = 1;
            for (let c = 0; c < this.cols; c++) {
                const current = this.board[r][c];
                const next = c < this.cols - 1 ? this.board[r][c + 1] : null;

                if (current && next && current.type === next.type && current.type !== 'colorbomb') {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        const coords = [];
                        for (let i = 0; i < matchLength; i++) {
                            coords.push({ r, c: c - i });
                        }
                        matches.push({ type: this.board[r][c].type, coords, orientation: 'h' });
                    }
                    matchLength = 1;
                }
            }
        }

        // Check vertical matches
        for (let c = 0; c < this.cols; c++) {
            let matchLength = 1;
            for (let r = 0; r < this.rows; r++) {
                const current = this.board[r][c];
                const next = r < this.rows - 1 ? this.board[r + 1][c] : null;

                if (current && next && current.type === next.type && current.type !== 'colorbomb') {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        const coords = [];
                        for (let i = 0; i < matchLength; i++) {
                            coords.push({ r: r - i, c });
                        }
                        matches.push({ type: this.board[r][c].type, coords, orientation: 'v' });
                    }
                    matchLength = 1;
                }
            }
        }

        return matches;
    }

    async processBoardCascades() {
        let hasMatches = true;

        while (hasMatches) {
            const matches = this.findMatches();
            if (matches.length === 0) {
                hasMatches = false;
                break;
            }

            window.soundFx.playMatch(this.comboCount);

            // Audio Announcements for combos
            if (this.comboCount === 3) this.showAnnouncement("Sweet!");
            else if (this.comboCount === 4) this.showAnnouncement("Tasty!");
            else if (this.comboCount === 5) this.showAnnouncement("Delicious!");
            else if (this.comboCount >= 6) this.showAnnouncement("Divine!");

            const toClear = new Set();
            const specialSpawns = [];

            // Group matches to identify 5-in-a-row (Color Bomb), T/L-shapes (Wrapped), and 4-in-a-row (Striped)
            matches.forEach(m => {
                m.coords.forEach(pt => toClear.add(`${pt.r},${pt.c}`));

                if (m.coords.length >= 5) {
                    const center = m.coords[Math.floor(m.coords.length / 2)];
                    specialSpawns.push({ r: center.r, c: center.c, type: 'colorbomb', special: 'none' });
                } else if (m.coords.length === 4) {
                    const center = m.coords[1];
                    const specialType = m.orientation === 'h' ? 'striped-v' : 'striped-h';
                    specialSpawns.push({ r: center.r, c: center.c, type: m.type, special: specialType });
                }
            });

            // Expand clearing for matched striped and wrapped tiles
            toClear.forEach(coordKey => {
                const [r, c] = coordKey.split(',').map(Number);
                const tile = this.board[r][c];
                if (tile) {
                    if (tile.special === 'striped-h') {
                        for (let cc = 0; cc < this.cols; cc++) toClear.add(`${r},${cc}`);
                    } else if (tile.special === 'striped-v') {
                        for (let rr = 0; rr < this.rows; rr++) toClear.add(`${rr},${c}`);
                    } else if (tile.special === 'wrapped') {
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                if (this.isValidCell(r + dr, c + dc)) toClear.add(`${r + dr},${c + dc}`);
                            }
                        }
                    }
                }
            });

            // Clear matched tiles
            await this.clearTiles(toClear);

            // Spawn special candies created from matches
            specialSpawns.forEach(sp => {
                this.board[sp.r][sp.c] = {
                    type: sp.type,
                    special: sp.special,
                    r: sp.r,
                    c: sp.c
                };
            });

            // Apply gravity and refill
            await this.dropAndRefill();
            this.comboCount++;
        }
    }

    async clearTiles(coordSet) {
        let earnedPoints = 0;
        coordSet.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const cellEl = this.getCellElement(r, c);
            const tile = this.board[r][c];

            if (tile && cellEl) {
                // Clear jelly if present
                if (this.jellies[r][c]) {
                    this.jellies[r][c] = false;
                    this.targetJellies = Math.max(0, this.targetJellies - 1);
                    const jellyEl = cellEl.querySelector('.jelly-layer');
                    if (jellyEl) jellyEl.remove();
                    earnedPoints += 100;
                }

                this.emitParticles(cellEl, tile.type);
                this.showFloatingScore(cellEl, 60 * this.comboCount);
                earnedPoints += 60 * Math.max(1, this.comboCount);

                this.board[r][c] = null;
            }
        });

        this.addScore(earnedPoints);
        this.renderBoard();
        await new Promise(r => setTimeout(r, 120));
    }

    async dropAndRefill() {
        // Fall down existing candies
        for (let c = 0; c < this.cols; c++) {
            let emptyRow = this.rows - 1;
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.board[r][c] !== null) {
                    if (r !== emptyRow) {
                        this.board[emptyRow][c] = this.board[r][c];
                        this.board[emptyRow][c].r = emptyRow;
                        this.board[r][c] = null;
                    }
                    emptyRow--;
                }
            }

            // Fill empty rows from top with new candies
            for (let r = emptyRow; r >= 0; r--) {
                const color = this.candies[Math.floor(Math.random() * this.candies.length)];
                this.board[r][c] = {
                    type: color,
                    special: 'none',
                    r: r,
                    c: c
                };
            }
        }

        this.renderBoard();
        await new Promise(r => setTimeout(r, 150));
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('candy_high_score', this.highScore);
            this.highScoreEl.innerText = this.highScore.toLocaleString();
        }
        this.updateHUD();
    }

    updateHUD() {
        this.scoreEl.innerText = this.score.toLocaleString();
        this.movesEl.innerText = this.moves;

        // Progress bar / Stars fill percentage
        const progress = Math.min(100, Math.round((this.score / this.targetScore) * 100));
        this.starFillEl.style.width = `${progress}%`;

        // Update target status display
        const config = this.levelConfigs[this.currentLevel];
        if (config && config.jellies > 0) {
            this.targetEl.innerText = `Jellies: ${this.targetJellies} left (${this.score}/${this.targetScore})`;
        } else {
            this.targetEl.innerText = `Target: ${this.targetScore.toLocaleString()} pts`;
        }
    }

    emitParticles(cellEl, type) {
        if (!cellEl || !this.particlesContainer) return;
        const rect = cellEl.getBoundingClientRect();
        const colors = {
            red: '#ff1744',
            orange: '#ff9100',
            yellow: '#ffea00',
            green: '#00e676',
            blue: '#00b0ff',
            purple: '#d500f9',
            colorbomb: '#ffffff'
        };
        const color = colors[type] || '#ff4081';

        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.backgroundColor = color;
            p.style.left = `${rect.left + rect.width / 2}px`;
            p.style.top = `${rect.top + rect.height / 2}px`;

            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 50;
            p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
            p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);

            this.particlesContainer.appendChild(p);
            setTimeout(() => p.remove(), 600);
        }
    }

    showFloatingScore(cellEl, pts) {
        if (!cellEl) return;
        const rect = cellEl.getBoundingClientRect();
        const scorePop = document.createElement('div');
        scorePop.className = 'floating-score';
        scorePop.innerText = `+${pts}`;
        scorePop.style.left = `${rect.left + rect.width / 4}px`;
        scorePop.style.top = `${rect.top}px`;
        document.body.appendChild(scorePop);
        setTimeout(() => scorePop.remove(), 700);
    }

    showAnnouncement(text) {
        if (!this.announcementEl) return;
        this.announcementEl.innerText = text;
        this.announcementEl.classList.remove('announcement-active');
        void this.announcementEl.offsetWidth; // Trigger reflow
        this.announcementEl.classList.add('announcement-active');
        window.soundFx.speak(text);
    }

    async checkGameStatus() {
        const config = this.levelConfigs[this.currentLevel] || { targetScore: this.targetScore, jellies: 0 };
        const hasWonScore = this.score >= config.targetScore;
        const hasClearedJellies = config.jellies === 0 || this.targetJellies === 0;

        if (hasWonScore && hasClearedJellies) {
            // Level Completed - Trigger Sugar Crush!
            await this.triggerSugarCrush();
            window.soundFx.playWin();
            this.showWinModal();
        } else if (this.moves <= 0) {
            window.soundFx.playLose();
            this.showLoseModal();
        }
    }

    async triggerSugarCrush() {
        this.showAnnouncement("SUGAR CRUSH!");
        // Convert remaining moves into striped candies & detonate
        while (this.moves > 0) {
            this.moves--;
            this.updateHUD();
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            if (this.board[r][c] && this.board[r][c].type !== 'colorbomb') {
                this.board[r][c].special = Math.random() > 0.5 ? 'striped-h' : 'striped-v';
            }
            this.renderBoard();
            window.soundFx.playLaser();
            await new Promise(res => setTimeout(res, 80));
        }

        await new Promise(res => setTimeout(res, 250));
        await this.processBoardCascades();
    }

    showWinModal() {
        document.getElementById('modal-title').innerText = "SWEET VICTORY!";
        document.getElementById('modal-score').innerText = `Final Score: ${this.score.toLocaleString()}`;
        document.getElementById('modal-btn-next').style.display = 'inline-block';
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    showLoseModal() {
        document.getElementById('modal-title').innerText = "OUT OF MOVES!";
        document.getElementById('modal-score').innerText = `Score: ${this.score.toLocaleString()}`;
        document.getElementById('modal-btn-next').style.display = 'none';
        document.getElementById('modal-overlay').classList.remove('hidden');
    }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.game = new CandyCrushGame();

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
        const isMuted = window.soundFx.toggleMute();
        soundBtn.innerText = isMuted ? '🔇' : '🔊';
    });

    // Level selector
    document.getElementById('btn-levels').addEventListener('click', () => {
        document.getElementById('levels-modal').classList.remove('hidden');
    });

    document.querySelectorAll('.level-pick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lvl = parseInt(e.target.dataset.level, 10);
            window.game.startLevel(lvl);
            document.getElementById('levels-modal').classList.add('hidden');
        });
    });

    // Fullscreen toggle
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    // Restart button
    document.getElementById('btn-restart').addEventListener('click', () => {
        window.game.startLevel(window.game.currentLevel);
    });

    // Modal buttons
    document.getElementById('modal-btn-retry').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('hidden');
        window.game.startLevel(window.game.currentLevel);
    });

    document.getElementById('modal-btn-next').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('hidden');
        window.game.startLevel(window.game.currentLevel + 1);
    });

    document.getElementById('close-levels-modal').addEventListener('click', () => {
        document.getElementById('levels-modal').classList.add('hidden');
    });
});
