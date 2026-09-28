// Candy SVG Vector Generator for Ultra-Crisp Rendering on Mobile & Desktop
const CandyGraphics = {
    // Generate inline SVG for candies
    render(type, special = 'none', obstacle = null) {
        let baseSvg = '';
        
        switch (type) {
            case 'red': // Red Bean
                baseSvg = `
                <svg viewBox="0 0 100 100" class="candy-svg">
                    <defs>
                        <radialGradient id="redGrad" cx="35%" cy="30%" r="70%">
                            <stop offset="0%" stop-color="#ff7b90" />
                            <stop offset="45%" stop-color="#e60026" />
                            <stop offset="100%" stop-color="#800010" />
                        </radialGradient>
                        <filter id="glow">
                            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/>
                        </filter>
                    </defs>
                    <path d="M 30,22 C 55,10 85,25 80,60 C 76,85 45,95 25,80 C 8,66 12,32 30,22 Z" fill="url(#redGrad)" filter="url(#glow)" />
                    <!-- Gloss shine -->
                    <path d="M 32,28 C 45,20 65,26 68,40 C 60,35 45,34 32,45 C 30,38 30,32 32,28 Z" fill="rgba(255,255,255,0.75)" />
                </svg>`;
                break;

            case 'orange': // Orange Lozenge / Rounded Diamond
                baseSvg = `
                <svg viewBox="0 0 100 100" class="candy-svg">
                    <defs>
                        <radialGradient id="orangeGrad" cx="40%" cy="35%" r="65%">
                            <stop offset="0%" stop-color="#ffbe66" />
                            <stop offset="50%" stop-color="#ff7a00" />
                            <stop offset="100%" stop-color="#993d00" />
                        </radialGradient>
                    </defs>
                    <rect x="20" y="20" width="60" height="60" rx="18" transform="rotate(45 50 50)" fill="url(#orangeGrad)" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.3))" />
                    <!-- Gloss -->
                    <ellipse cx="46" cy="38" rx="14" ry="7" transform="rotate(-30 46 38)" fill="rgba(255,255,255,0.7)" />
                </svg>`;
                break;

            case 'yellow': // Yellow Lemon Drop / Tear
                baseSvg = `
                <svg viewBox="0 0 100 100" class="candy-svg">
                    <defs>
                        <radialGradient id="yellowGrad" cx="35%" cy="35%" r="70%">
                            <stop offset="0%" stop-color="#fff885" />
                            <stop offset="45%" stop-color="#ffd500" />
                            <stop offset="100%" stop-color="#b38600" />
                        </radialGradient>
                    </defs>
                    <path d="M 50,15 C 68,36 82,56 82,70 C 82,88 68,92 50,92 C 32,92 18,88 18,70 C 18,56 32,36 50,15 Z" fill="url(#yellowGrad)" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.3))" />
                    <ellipse cx="42" cy="48" rx="9" ry="18" transform="rotate(-20 42 48)" fill="rgba(255,255,255,0.65)" />
                </svg>`;
                break;

            case 'green': // Green Chiclet / Rounded Square
                baseSvg = `
                <svg viewBox="0 0 100 100" class="candy-svg">
                    <defs>
                        <radialGradient id="greenGrad" cx="35%" cy="30%" r="70%">
                            <stop offset="0%" stop-color="#88ff88" />
                            <stop offset="50%" stop-color="#00c818" />
                            <stop offset="100%" stop-color="#00660c" />
                        </radialGradient>
                    </defs>
                    <rect x="18" y="18" width="64" height="64" rx="16" fill="url(#greenGrad)" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.3))" />
                    <rect x="24" y="24" width="52" height="24" rx="10" fill="rgba(255,255,255,0.55)" />
                </svg>`;
                break;

            case 'blue': // Blue Lollipop Sphere
                baseSvg = `
                <svg viewBox="0 0 100 100" class="candy-svg">
                    <defs>
                        <radialGradient id="blueGrad" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stop-color="#70d6ff" />
                            <stop offset="45%" stop-color="#0080ff" />
                            <stop offset="100%" stop-color="#003580" />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="34" fill="url(#blueGrad)" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.3))" />
                    <ellipse cx="42" cy="38" rx="14" ry="8" transform="rotate(-35 42 38)" fill="rgba(255,255,255,0.7)" />
                </svg>`;
                break;

            case 'purple': // Purple Cluster / Jewel
                baseSvg = `
                <svg viewBox="0 0 100 100" class="candy-svg">
                    <defs>
                        <radialGradient id="purpleGrad" cx="38%" cy="30%" r="70%">
                            <stop offset="0%" stop-color="#e580ff" />
                            <stop offset="50%" stop-color="#a600e6" />
                            <stop offset="100%" stop-color="#4d0066" />
                        </radialGradient>
                    </defs>
                    <polygon points="50,15 82,34 82,68 50,88 18,68 18,34" fill="url(#purpleGrad)" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.3))" />
                    <!-- Facet shine -->
                    <polygon points="50,22 74,37 50,52 26,37" fill="rgba(255,255,255,0.5)" />
                </svg>`;
                break;

            case 'colorbomb': // Chocolate Rainbow Sprinkle Bomb
                return `
                <svg viewBox="0 0 100 100" class="candy-svg color-bomb-anim">
                    <defs>
                        <radialGradient id="chocoGrad" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" stop-color="#6b4423" />
                            <stop offset="60%" stop-color="#3d1f0d" />
                            <stop offset="100%" stop-color="#1f0e04" />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="36" fill="url(#chocoGrad)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
                    <!-- Rainbow Sprinkles -->
                    <rect x="36" y="32" width="7" height="4" rx="2" fill="#ff2244" transform="rotate(25 36 32)" />
                    <rect x="58" y="34" width="7" height="4" rx="2" fill="#ffe600" transform="rotate(-40 58 34)" />
                    <rect x="42" y="48" width="7" height="4" rx="2" fill="#00ff66" transform="rotate(70 42 48)" />
                    <rect x="62" y="52" width="7" height="4" rx="2" fill="#00c8ff" transform="rotate(-20 62 52)" />
                    <rect x="34" y="64" width="7" height="4" rx="2" fill="#ff44aa" transform="rotate(15 34 64)" />
                    <rect x="52" y="66" width="7" height="4" rx="2" fill="#ffffff" transform="rotate(80 52 66)" />
                    <rect x="25" y="45" width="7" height="4" rx="2" fill="#ff9900" transform="rotate(-50 25 45)" />
                    <rect x="48" y="24" width="6" height="4" rx="2" fill="#00ffcc" transform="rotate(10 48 24)" />
                    <!-- Sparkle aura -->
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.4)" stroke-dasharray="6,4" class="sparkle-ring" />
                </svg>`;

            default:
                return '';
        }

        // Apply special modifiers (striped / wrapped)
        if (special === 'striped-h') {
            baseSvg = baseSvg.replace('</svg>', `
                <g class="special-overlay striped-h">
                    <line x1="20" y1="40" x2="80" y2="40" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9" />
                    <line x1="16" y1="50" x2="84" y2="50" stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.95" />
                    <line x1="20" y1="60" x2="80" y2="60" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9" />
                </g>
            </svg>`);
        } else if (special === 'striped-v') {
            baseSvg = baseSvg.replace('</svg>', `
                <g class="special-overlay striped-v">
                    <line x1="40" y1="20" x2="40" y2="80" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9" />
                    <line x1="50" y1="16" x2="50" y2="84" stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.95" />
                    <line x1="60" y1="20" x2="60" y2="80" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9" />
                </g>
            </svg>`);
        } else if (special === 'wrapped') {
            baseSvg = baseSvg.replace('</svg>', `
                <g class="special-overlay wrapped-candy">
                    <polygon points="12,12 28,26 14,38" fill="rgba(255,255,255,0.7)" />
                    <polygon points="88,12 72,26 86,38" fill="rgba(255,255,255,0.7)" />
                    <polygon points="12,88 28,74 14,62" fill="rgba(255,255,255,0.7)" />
                    <polygon points="88,88 72,74 86,62" fill="rgba(255,255,255,0.7)" />
                    <rect x="24" y="24" width="52" height="52" rx="8" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-dasharray="4,3" />
                </g>
            </svg>`);
        }

        return baseSvg;
    }
};

window.CandyGraphics = CandyGraphics;
