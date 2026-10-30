/**
 * Candy Definitions & SVG Icon Generator
 * Generates crisp, juicy, high-definition SVG candy graphics with glossy highlights
 */

const CANDY_TYPES = [
    {
        id: 'red',
        name: 'Strawberry Jelly',
        color: '#ff2e63',
        glow: 'rgba(255, 46, 99, 0.7)',
        svg: `<svg viewBox="0 0 100 100" class="candy-svg">
            <defs>
                <radialGradient id="redGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#ff8fab"/>
                    <stop offset="45%" stop-color="#ff2e63"/>
                    <stop offset="100%" stop-color="#a80038"/>
                </radialGradient>
                <linearGradient id="redGloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <filter id="shadowRed" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#550015" flood-opacity="0.4"/>
            </filter>
            <!-- Candy Body (Jelly Bean) -->
            <path d="M50 16 C74 16 88 32 88 56 C88 78 72 86 50 86 C28 86 12 78 12 56 C12 32 26 16 50 16 Z" fill="url(#redGrad)" filter="url(#shadowRed)"/>
            <!-- Inner Depth -->
            <ellipse cx="50" cy="54" rx="30" ry="24" fill="#d11a4b" opacity="0.4"/>
            <!-- Gloss Highlight -->
            <path d="M30 26 C42 20 62 20 70 26 C62 34 38 34 30 26 Z" fill="url(#redGloss)"/>
            <circle cx="68" cy="36" r="4" fill="#ffffff" opacity="0.6"/>
        </svg>`
    },
    {
        id: 'blue',
        name: 'Blueberry Drop',
        color: '#00d2fc',
        glow: 'rgba(0, 210, 252, 0.7)',
        svg: `<svg viewBox="0 0 100 100" class="candy-svg">
            <defs>
                <radialGradient id="blueGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stop-color="#bbf2f6"/>
                    <stop offset="35%" stop-color="#00d2fc"/>
                    <stop offset="75%" stop-color="#0066cc"/>
                    <stop offset="100%" stop-color="#003380"/>
                </radialGradient>
                <linearGradient id="blueGloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <filter id="shadowBlue" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#001f4d" flood-opacity="0.4"/>
            </filter>
            <!-- Candy Body (Round Drop) -->
            <circle cx="50" cy="50" r="38" fill="url(#blueGrad)" filter="url(#shadowBlue)"/>
            <!-- Swirl highlight -->
            <path d="M50 20 A30 30 0 0 1 78 52" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.45"/>
            <!-- Gloss highlight -->
            <ellipse cx="38" cy="34" rx="14" ry="8" transform="rotate(-30 38 34)" fill="url(#blueGloss)"/>
            <circle cx="30" cy="46" r="3.5" fill="#ffffff" opacity="0.7"/>
        </svg>`
    },
    {
        id: 'orange',
        name: 'Orange Lozenge',
        color: '#ff9234',
        glow: 'rgba(255, 146, 52, 0.7)',
        svg: `<svg viewBox="0 0 100 100" class="candy-svg">
            <defs>
                <radialGradient id="orangeGrad" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stop-color="#ffe49e"/>
                    <stop offset="40%" stop-color="#ff9234"/>
                    <stop offset="85%" stop-color="#d85200"/>
                    <stop offset="100%" stop-color="#8a2e00"/>
                </radialGradient>
                <linearGradient id="orangeGloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <filter id="shadowOrange" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#4d1600" flood-opacity="0.4"/>
            </filter>
            <!-- Candy Body (Hexagon/Lozenge) -->
            <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill="url(#orangeGrad)" filter="url(#shadowOrange)"/>
            <!-- Facet accents -->
            <polygon points="50,22 75,37 75,63 50,78 25,63 25,37" fill="#ff7a18" opacity="0.35"/>
            <!-- Gloss highlight -->
            <ellipse cx="42" cy="28" rx="16" ry="6" transform="rotate(-15 42 28)" fill="url(#orangeGloss)"/>
            <circle cx="62" cy="34" r="3" fill="#ffffff" opacity="0.7"/>
        </svg>`
    },
    {
        id: 'green',
        name: 'Lime Chiclet',
        color: '#1dd1a1',
        glow: 'rgba(29, 209, 161, 0.7)',
        svg: `<svg viewBox="0 0 100 100" class="candy-svg">
            <defs>
                <radialGradient id="greenGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#b8f2e6"/>
                    <stop offset="35%" stop-color="#1dd1a1"/>
                    <stop offset="75%" stop-color="#10ac84"/>
                    <stop offset="100%" stop-color="#0a5742"/>
                </radialGradient>
                <linearGradient id="greenGloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <filter id="shadowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#053327" flood-opacity="0.4"/>
            </filter>
            <!-- Candy Body (Rounded Square) -->
            <rect x="15" y="15" width="70" height="70" rx="20" ry="20" fill="url(#greenGrad)" filter="url(#shadowGreen)"/>
            <!-- Embossed bevel -->
            <rect x="23" y="23" width="54" height="54" rx="14" ry="14" fill="#0fa17b" opacity="0.25"/>
            <!-- Gloss highlight -->
            <ellipse cx="36" cy="30" rx="16" ry="7" transform="rotate(-10 36 30)" fill="url(#greenGloss)"/>
            <circle cx="64" cy="32" r="3" fill="#ffffff" opacity="0.6"/>
        </svg>`
    },
    {
        id: 'yellow',
        name: 'Lemon Star',
        color: '#ffd32a',
        glow: 'rgba(255, 211, 42, 0.7)',
        svg: `<svg viewBox="0 0 100 100" class="candy-svg">
            <defs>
                <radialGradient id="yellowGrad" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stop-color="#fffae0"/>
                    <stop offset="40%" stop-color="#ffd32a"/>
                    <stop offset="85%" stop-color="#ff9f1a"/>
                    <stop offset="100%" stop-color="#c96f00"/>
                </radialGradient>
                <linearGradient id="yellowGloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <filter id="shadowYellow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#542b00" flood-opacity="0.4"/>
            </filter>
            <!-- Candy Body (Drop shape) -->
            <path d="M50 12 C68 28 84 50 84 66 C84 84 68 88 50 88 C32 88 16 84 16 66 C16 50 32 28 50 12 Z" fill="url(#yellowGrad)" filter="url(#shadowYellow)"/>
            <!-- Inner glow -->
            <ellipse cx="50" cy="62" rx="22" ry="18" fill="#ffbe1a" opacity="0.4"/>
            <!-- Gloss highlight -->
            <ellipse cx="40" cy="36" rx="10" ry="16" transform="rotate(-20 40 36)" fill="url(#yellowGloss)"/>
            <circle cx="56" cy="30" r="3" fill="#ffffff" opacity="0.7"/>
        </svg>`
    },
    {
        id: 'purple',
        name: 'Grape Cluster',
        color: '#9b59b6',
        glow: 'rgba(155, 89, 182, 0.7)',
        svg: `<svg viewBox="0 0 100 100" class="candy-svg">
            <defs>
                <radialGradient id="purpleGrad" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stop-color="#e8c7f8"/>
                    <stop offset="40%" stop-color="#9b59b6"/>
                    <stop offset="80%" stop-color="#6c2d8a"/>
                    <stop offset="100%" stop-color="#421357"/>
                </radialGradient>
                <linearGradient id="purpleGloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <filter id="shadowPurple" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#2a0738" flood-opacity="0.4"/>
            </filter>
            <!-- Candy Body (Octagonal Diamond) -->
            <polygon points="50,14 82,34 82,66 50,86 18,66 18,34" fill="url(#purpleGrad)" filter="url(#shadowPurple)"/>
            <!-- Diamond bevel -->
            <polygon points="50,24 74,40 74,60 50,76 26,60 26,40" fill="#7d349e" opacity="0.3"/>
            <!-- Gloss highlight -->
            <ellipse cx="38" cy="30" rx="14" ry="6" transform="rotate(-15 38 30)" fill="url(#purpleGloss)"/>
            <circle cx="60" cy="32" r="3" fill="#ffffff" opacity="0.6"/>
        </svg>`
    }
];

// Special candy modifier SVGs and visuals
const SPECIAL_CANDIES = {
    // Color Bomb: Chocolate truffle with rainbow sprinkles
    color_bomb: {
        id: 'color_bomb',
        name: 'Rainbow Color Bomb',
        glow: 'rgba(255, 215, 0, 0.9)',
        svg: `<svg viewBox="0 0 100 100" class="candy-svg special-bomb">
            <defs>
                <radialGradient id="chocoGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stop-color="#6d4c41"/>
                    <stop offset="30%" stop-color="#4e342e"/>
                    <stop offset="80%" stop-color="#2d1d17"/>
                    <stop offset="100%" stop-color="#150d0a"/>
                </radialGradient>
                <filter id="bombGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ffd700" flood-opacity="0.8"/>
                </filter>
            </defs>
            <!-- Chocolate orb -->
            <circle cx="50" cy="50" r="38" fill="url(#chocoGrad)" filter="url(#bombGlow)"/>
            <!-- Rainbow nonpareil sprinkles -->
            <circle cx="34" cy="32" r="4.5" fill="#ff2e63"/>
            <circle cx="52" cy="24" r="4" fill="#ffd32a"/>
            <circle cx="68" cy="36" r="4.5" fill="#00d2fc"/>
            <circle cx="32" cy="52" r="4" fill="#1dd1a1"/>
            <circle cx="50" cy="46" r="5" fill="#ffffff"/>
            <circle cx="66" cy="56" r="4.5" fill="#ff9234"/>
            <circle cx="38" cy="68" r="4.5" fill="#9b59b6"/>
            <circle cx="54" cy="68" r="4" fill="#ff2e63"/>
            <circle cx="22" cy="42" r="3.5" fill="#ffd32a"/>
            <circle cx="76" cy="48" r="3.5" fill="#1dd1a1"/>
            <!-- Pulsing outer ring -->
            <circle cx="50" cy="50" r="39" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
        </svg>`
    },

    // Striped overlays (Horizontal and Vertical)
    striped_h: {
        overlay: `<div class="striped-overlay striped-h"></div>`
    },
    striped_v: {
        overlay: `<div class="striped-overlay striped-v"></div>`
    },

    // Wrapped Candy wrapper overlay (shiny cellophane folds)
    wrapped: {
        overlay: `<div class="wrapped-overlay"></div>`
    }
};

window.CANDY_TYPES = CANDY_TYPES;
window.SPECIAL_CANDIES = SPECIAL_CANDIES;

