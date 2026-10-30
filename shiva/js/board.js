/**
 * Candy Crush Board Model & Logic Engine
 * Handles board state, match detection, specials, cascade gravity, and hint solving.
 */

class Board {
    constructor(rows = 8, cols = 8) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.idCounter = 1;
    }

    // Initialize board without pre-existing matches
    init() {
        do {
            this.grid = [];
            for (let r = 0; r < this.rows; r++) {
                const row = [];
                for (let c = 0; c < this.cols; c++) {
                    const candy = this.createRandomCandy(r, c, false);
                    row.push(candy);
                }
                this.grid.push(row);
            }
        } while (this.findAllMatches().length > 0 || !this.findPossibleMove());
    }

    createRandomCandy(r, c, allowBomb = false) {
        // Exclude colors that would immediately form 3-in-a-row during initialization
        const availableTypes = CANDY_TYPES.map(t => t.id);
        const forbidden = new Set();

        if (c >= 2) {
            const left1 = this.grid[r]?.[c - 1]?.type;
            const left2 = this.grid[r]?.[c - 2]?.type;
            if (left1 && left1 === left2) forbidden.add(left1);
        }
        if (r >= 2) {
            const up1 = this.grid[r - 1]?.[c]?.type;
            const up2 = this.grid[r - 2]?.[c]?.type;
            if (up1 && up1 === up2) forbidden.add(up1);
        }

        const validTypes = availableTypes.filter(t => !forbidden.has(t));
        const selectedType = validTypes.length > 0
            ? validTypes[Math.floor(Math.random() * validTypes.length)]
            : availableTypes[Math.floor(Math.random() * availableTypes.length)];

        return {
            id: this.idCounter++,
            type: selectedType,
            special: null, // null | 'striped_h' | 'striped_v' | 'wrapped' | 'bomb'
            row: r,
            col: c
        };
    }

    getCandy(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return null;
        return this.grid[r]?.[c] || null;
    }

    setCandy(r, c, candy) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.grid[r][c] = candy;
            if (candy) {
                candy.row = r;
                candy.col = c;
            }
        }
    }

    swap(r1, c1, r2, c2) {
        const c1Obj = this.grid[r1][c1];
        const c2Obj = this.grid[r2][c2];

        this.grid[r1][c1] = c2Obj;
        this.grid[r2][c2] = c1Obj;

        if (c1Obj) { c1Obj.row = r2; c1Obj.col = c2; }
        if (c2Obj) { c2Obj.row = r1; c2Obj.col = c1; }
    }

    // Detect all 3+ matches in rows and columns
    findAllMatches() {
        const matchedTiles = new Map(); // key: "r,c", value: { r, c, candy, horizontal: len, vertical: len }
        const matchGroups = [];

        // 1. Horizontal check
        for (let r = 0; r < this.rows; r++) {
            let matchLen = 1;
            for (let c = 0; c < this.cols; c++) {
                const current = this.getCandy(r, c);
                const next = this.getCandy(r, c + 1);

                if (current && next && current.type === next.type && current.type !== 'color_bomb') {
                    matchLen++;
                } else {
                    if (matchLen >= 3) {
                        const group = [];
                        for (let k = 0; k < matchLen; k++) {
                            const col = c - k;
                            group.push({ r, c: col, candy: this.getCandy(r, col) });
                            const key = `${r},${col}`;
                            const existing = matchedTiles.get(key) || { r, c: col, candy: this.getCandy(r, col), h: 0, v: 0 };
                            existing.h = matchLen;
                            matchedTiles.set(key, existing);
                        }
                        matchGroups.push({ type: 'h', tiles: group, length: matchLen });
                    }
                    matchLen = 1;
                }
            }
        }

        // 2. Vertical check
        for (let c = 0; c < this.cols; c++) {
            let matchLen = 1;
            for (let r = 0; r < this.rows; r++) {
                const current = this.getCandy(r, c);
                const next = this.getCandy(r + 1, c);

                if (current && next && current.type === next.type && current.type !== 'color_bomb') {
                    matchLen++;
                } else {
                    if (matchLen >= 3) {
                        const group = [];
                        for (let k = 0; k < matchLen; k++) {
                            const row = r - k;
                            group.push({ r: row, c, candy: this.getCandy(row, c) });
                            const key = `${row},${c}`;
                            const existing = matchedTiles.get(key) || { r: row, c, candy: this.getCandy(row, c), h: 0, v: 0 };
                            existing.v = matchLen;
                            matchedTiles.set(key, existing);
                        }
                        matchGroups.push({ type: 'v', tiles: group, length: matchLen });
                    }
                    matchLen = 1;
                }
            }
        }

        return Array.from(matchedTiles.values());
    }

    // Determine special candies created from matches
    resolveSpecialCreations(matchedTiles, lastSwappedTile) {
        const specialsToCreate = [];
        const processed = new Set();

        matchedTiles.forEach(tile => {
            const key = `${tile.r},${tile.c}`;
            if (processed.has(key)) return;

            // 5 in a row -> Color Bomb!
            if (tile.h >= 5 || tile.v >= 5) {
                specialsToCreate.push({
                    r: tile.r,
                    c: tile.c,
                    type: 'color_bomb',
                    special: 'bomb',
                    color: tile.candy.type
                });
                processed.add(key);
                return;
            }

            // L or T shape (intersects h >= 3 and v >= 3) -> Wrapped Candy!
            if (tile.h >= 3 && tile.v >= 3) {
                specialsToCreate.push({
                    r: tile.r,
                    c: tile.c,
                    type: tile.candy.type,
                    special: 'wrapped'
                });
                processed.add(key);
                return;
            }

            // 4 in a row -> Striped Candy!
            if (tile.h === 4 && tile.v < 3) {
                // Horizontal match creates Vertical stripe (or vice versa)
                const targetR = lastSwappedTile && (lastSwappedTile.r === tile.r) ? lastSwappedTile.r : tile.r;
                const targetC = lastSwappedTile && (lastSwappedTile.r === tile.r) ? lastSwappedTile.c : tile.c;
                specialsToCreate.push({
                    r: targetR,
                    c: targetC,
                    type: tile.candy.type,
                    special: 'striped_v'
                });
                processed.add(key);
                return;
            } else if (tile.v === 4 && tile.h < 3) {
                const targetR = lastSwappedTile && (lastSwappedTile.c === tile.c) ? lastSwappedTile.r : tile.r;
                const targetC = lastSwappedTile && (lastSwappedTile.c === tile.c) ? lastSwappedTile.c : tile.c;
                specialsToCreate.push({
                    r: targetR,
                    c: targetC,
                    type: tile.candy.type,
                    special: 'striped_h'
                });
                processed.add(key);
                return;
            }
        });

        return specialsToCreate;
    }

    // Find any valid move available on the board (used for hint & shuffle detection)
    findPossibleMove() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const current = this.getCandy(r, c);
                if (!current) continue;

                // Color bomb can swap with any neighbor
                if (current.special === 'bomb') {
                    if (c + 1 < this.cols) return { r1: r, c1: c, r2: r, c2: c + 1 };
                    if (r + 1 < this.rows) return { r1: r, c1: c, r2: r + 1, c2: c };
                }

                // Check right swap
                if (c + 1 < this.cols) {
                    this.swap(r, c, r, c + 1);
                    const matches = this.findAllMatches();
                    this.swap(r, c, r, c + 1); // revert
                    if (matches.length > 0) {
                        return { r1: r, c1: c, r2: r, c2: c + 1 };
                    }
                }

                // Check down swap
                if (r + 1 < this.rows) {
                    this.swap(r, c, r + 1, c);
                    const matches = this.findAllMatches();
                    this.swap(r, c, r + 1, c); // revert
                    if (matches.length > 0) {
                        return { r1: r, c1: c, r2: r + 1, c2: c };
                    }
                }
            }
        }
        return null;
    }

    // Shuffle board when no moves are left
    shuffle() {
        const allCandies = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c]) {
                    allCandies.push(this.grid[r][c]);
                }
            }
        }

        let attempts = 0;
        do {
            // Fisher-Yates shuffle
            for (let i = allCandies.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = allCandies[i];
                allCandies[i] = allCandies[j];
                allCandies[j] = temp;
            }

            let idx = 0;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    this.grid[r][c] = allCandies[idx++];
                    this.grid[r][c].row = r;
                    this.grid[r][c].col = c;
                }
            }
            attempts++;
        } while ((this.findAllMatches().length > 0 || !this.findPossibleMove()) && attempts < 50);
    }
}

window.Board = Board;

