const teams = [
    { name: "Team 1", color: "#ff6b6b" },
    { name: "Team 2", color: "#54a0ff" },
    { name: "Team 3", color: "#B1DDC9" },
    { name: "Team 4", color: "#FFB6C1" }
];

let scores = {};

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

function getLeadingTeam() {
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

function saveScoresToLocalStorage() {
    localStorage.setItem('teamScores', JSON.stringify(scores));
}

function loadScoresFromLocalStorage() {
    const savedScores = localStorage.getItem('teamScores');
    if (savedScores) {
        return JSON.parse(savedScores);
    }
    return null;
}

function initializeTeams() {
    const teamsContainer = document.getElementById('teams');
    const teamSelect = document.getElementById('teamSelect');
    
    // Load saved scores from localStorage
    const savedScores = loadScoresFromLocalStorage();

    teams.forEach(team => {
        // Initialize scores with saved values or 0
        scores[team.name] = savedScores ? savedScores[team.name] : 0;

        const teamElement = document.createElement('div');
        teamElement.className = 'team';
        teamElement.innerHTML = `
            <div class="team-header">
                <div class="team-name-container">
                    <div class="team-color" style="background-color: ${team.color};"></div>
                    <span>${team.name}</span>
                </div>
                <div class="team-controls">
                    <button class="icon-button minus" onclick="quickUpdateScore('${team.name}', -1)">-</button>
                    <button class="icon-button plus" onclick="quickUpdateScore('${team.name}', 1)">+</button>
                </div>
            </div>
            <div class="score-bar">
                <div class="score-fill" style="background-color: ${team.color};"></div>
                <div class="score-marks">
                    ${Array(5).fill().map(() => '<div class="score-mark"></div>').join('')}
                </div>
            </div>
            <div class="score-value">0</div>
        `;
        teamsContainer.appendChild(teamElement);

        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
    updateDisplay();
}

function updateScore() {
    const addPoints = parseInt(document.getElementById('addPoints').value) || 0;
    const subtractPoints = parseInt(document.getElementById('subtractPoints').value) || 0;
    const selectedTeam = document.getElementById('teamSelect').value;

    const oldScore = scores[selectedTeam];
    scores[selectedTeam] = Math.max(0, scores[selectedTeam] + addPoints - subtractPoints);

    updateDisplay(selectedTeam, oldScore);
    saveScoresToLocalStorage(); // Save after updating score

    document.getElementById('addPoints').value = '';
    document.getElementById('subtractPoints').value = '';
}

function updateDisplay(changedTeam, oldScore) {
    teams.forEach(team => {
        const teamElement = document.querySelector(`.team:nth-child(${teams.indexOf(team) + 1})`);
        const scoreFill = teamElement.querySelector('.score-fill');
        const scoreValue = teamElement.querySelector('.score-value');

        const percentage = Math.min(100, (scores[team.name] / 30) * 100); //modify the maximum score here
        scoreFill.style.width = `${percentage}%`;
        scoreValue.textContent = scores[team.name];

        if (team.name === changedTeam && scores[team.name] !== oldScore) {
            teamElement.classList.add('score-changed');
            setTimeout(() => {
                teamElement.classList.remove('score-changed');
            }, 500);
        }
    });

    const leadingTeam = getLeadingTeam();
    if (leadingTeam) {
        const leadingColor = teams.find(team => team.name === leadingTeam).color;
        transitionBackgroundColor(leadingColor);
    }
}

function transitionBackgroundColor(newColor) {
    const mainContent = document.querySelector('.main-content');
    const currentColor = getComputedStyle(mainContent).backgroundColor;
    
    let start = null;
    const duration = 1000; // 1 second transition

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;

        if (progress < 1) {
            const interpolatedColor = interpolateColor(currentColor, newColor, progress);
            mainContent.style.backgroundColor = interpolatedColor;
            requestAnimationFrame(animate);
        } else {
            mainContent.style.backgroundColor = newColor;
        }
    }

    requestAnimationFrame(animate);
}

function interpolateColor(startColor, endColor, factor) {
    // Convert hex to rgb if necessary
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    
    const start = startColor.startsWith('rgb') ? startColor.match(/\d+/g).map(Number) : hexToRgb(startColor);
    const end = endColor.startsWith('rgb') ? endColor.match(/\d+/g).map(Number) : hexToRgb(endColor);
    
    const result = start.map((c, i) => Math.round(c + factor * (end[i] - c)));
    return `rgb(${result.join(',')})`;
}

function randomColor(){
    r = Math.floor(Math.random() * 255);
    g = Math.floor(Math.random() * 255);
    b = Math.floor(Math.random() * 255);
    return {r,g,b}
}

function toRad(deg){
    return deg * (Math.PI / 180.0);
}

function randomRange(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 2.2);
}

function getPercent(input,min,max){
    return (((input - min) * 100) / (max - min))/100
}

// Update Wheel-specific data with all prizes
const wheelItems = [
    { 
        id: 1, 
        name: "Score Surge", 
        description: "All teams gain 10 points, except the team with the highest score.",
        imagePath: "images/image1.png"
    },
    { 
        id: 2, 
        name: "+2", 
        description: "Congrats! You got 2 points",
    },
    { 
        id: 3, 
        name: "All-in Round", 
        description: "Wager all points on a challenge. Success doubles them, failure resets to zero.",
        imagePath: "images/image3.png"
    },
    { 
        id: 4, 
        name: "Last Laugh", 
        description: "The team with the lowest score chooses another team to lose 5 points.",
        imagePath: "images/image4.png"
    },
    { 
        id: 5, 
        name: "+3", 
        description: "Congrats! You got 3 points",
    },
    { 
        id: 6, 
        name: "Sabotage", 
        description: "Choose a team to lose 5 points.",
        imagePath: "images/image6.png"
    },
    { 
        id: 7, 
        name: "Safe Haven", 
        description: "The team is immune to point deductions for the next round.",
        imagePath: "images/image7.png"
    },
    { 
        id: 8, 
        name: "+5", 
        description: "Congrats! You got 5 points",
    },
    { 
        id: 9, 
        name: "Point Swap", 
        description: "Swap points with another team.",
        imagePath: "images/image9.png"
    },
    { 
        id: 10, 
        name: "+8", 
        description: "Congrats! You got 8 points",
        imagePath: "images/image10.png"
    },
    { 
        id: 11, 
        name: "Bomb!!", 
        description: "Oh no! You lose all your points",
        imagePath: "images/image11.png"
    },
    { 
        id: 12, 
        name: "Freeze Team", 
        description: "Choose a team to be frozen and unable to gain or lose points for one round.",
        imagePath: "images/image12.png"
    },
    { 
        id: 13, 
        name: "Team Boost", 
        description: "Complete a collaborative task in 20 seconds to earn 10 points.",
        imagePath: "images/image13.png"
    },
    { 
        id: 14, 
        name: "Time Bomb", 
        description: "Lose 5 points every 10 seconds until the challenge is completed.",
        imagePath: "images/image14.png"
    },
    { 
        id: 15, 
        name: "Steal and Share", 
        description: "Steal 5 points from one team or give 3 points to each team.",
        imagePath: "images/image15.png"
    },
    { 
        id: 16, 
        name: "+1", 
        description: "Congrats! You got 1 point",
    }
];

// Update wheel colors to match the number of segments
const wheelColors = [
    { r: 255, g: 20, b: 147 },   // Deep Pink
    { r: 255, g: 69, b: 0 },     // Orange Red
    { r: 255, g: 215, b: 0 },    // Gold
    { r: 0, g: 255, b: 0 },      // Lime
    { r: 0, g: 255, b: 255 },    // Cyan
    { r: 148, g: 0, b: 211 },    // Dark Violet
    { r: 255, g: 105, b: 180 },  // Hot Pink
    { r: 50, g: 205, b: 50 },    // Lime Green
    { r: 75, g: 0, b: 130 },     // Indigo
    { r: 255, g: 140, b: 0 },    // Dark Orange
    { r: 106, g: 90, b: 205 },   // Slate Blue
    { r: 60, g: 179, b: 113 },   // Medium Sea Green
    { r: 238, g: 130, b: 238 },  // Violet
    { r: 30, g: 144, b: 255 },   // Dodger Blue
    { r: 178, g: 34, b: 34 },     // Firebrick Red
    { r: 50, g: 205, b: 50 }    // Lime Green
];

// Wheel setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

const centerX = width/2;
const centerY = height/2;
const radius = width/2;

let currentDeg = 0;
let step = 360/wheelItems.length;
let itemDegs = {};

function draw(){
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, toRad(0), toRad(360));
    ctx.fillStyle = `rgb(${33},${33},${33})`;
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    let startDeg = currentDeg;
    for(let i = 0; i < wheelItems.length; i++, startDeg += step){
        let endDeg = startDeg + step;
        let color = wheelColors[i];
        let colorStyle = `rgb(${color.r},${color.g},${color.b})`;

        // Draw outer arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 2, toRad(startDeg), toRad(endDeg));
        let colorStyle2 = `rgb(${color.r - 30},${color.g - 30},${color.b - 30})`;
        ctx.fillStyle = colorStyle2;
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        // Draw inner arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 30, toRad(startDeg), toRad(endDeg));
        ctx.fillStyle = colorStyle;
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        // Draw text with adaptive font size
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(toRad((startDeg + endDeg)/2));
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        
        // Calculate font size based on text length
        const maxWidth = 120; // Reduced from 160
        const baseSize = 16; // Reduced from 24
        let fontSize = baseSize;
        ctx.font = `bold ${fontSize}px Poppins`;
        
        // Measure text width and reduce font size if needed
        let textWidth = ctx.measureText(wheelItems[i].name).width;
        while (textWidth > maxWidth && fontSize > 10) { // Minimum font size reduced from 12 to 10
            fontSize--;
            ctx.font = `bold ${fontSize}px Poppins`;
            textWidth = ctx.measureText(wheelItems[i].name).width;
        }

        ctx.fillText(wheelItems[i].name, 130, 10);
        ctx.restore();

        itemDegs[wheelItems[i].name] = {
            "id": wheelItems[i].id,
            "startDeg": startDeg,
            "endDeg": endDeg
        };
    }

    // Only show winner when wheel has completely stopped
    if (pause && speed === 0) {
        const normalizedDeg = ((currentDeg % 360) + 360) % 360;
        const winningIndex = wheelItems.length - 1 - Math.floor(normalizedDeg / step);
        const adjustedIndex = winningIndex % wheelItems.length;
        const winner = wheelItems[adjustedIndex];
        
        document.getElementById("winner").innerHTML = winner.name;
        
        // Only show popup if it hasn't been shown for this spin
        if (!winner.shown) {
            winner.shown = true;
            setTimeout(() => {
                showPrizePopup(winner.name);
            }, 500);
        }
    }
}

let speed = 0;
let maxRotation = randomRange(360* 3, 360 * 5);
let pause = false;

function animate(){
    if(pause) return;
    
    speed = easeOutQuart(getPercent(currentDeg, maxRotation, 0)) * 28; //speed of spin
    if(speed < 0.08){
        speed = 0;
        pause = true;
    }
    currentDeg += speed;
    draw();
    window.requestAnimationFrame(animate);
}

function spin(){
    if(speed != 0) return;

    // Reset shown status for all prizes
    wheelItems.forEach(item => item.shown = false);
    
    // Clear the winner display
    document.getElementById("winner").innerHTML = "NONE";
    
    maxRotation = randomRange(360 * 3, 360 * 5); //time of spin
    currentDeg = 0;
    itemDegs = {};
    pause = false;
    speed = 1; // Set initial speed
    window.requestAnimationFrame(animate);
}

const originalInitializeTeams = initializeTeams;
initializeTeams = function() {
    originalInitializeTeams();
    draw();
};

initializeTeams(); 

// Add new function for quick score updates
function quickUpdateScore(teamName, change) {
    const oldScore = scores[teamName];
    scores[teamName] = Math.max(0, scores[teamName] + change);
    updateDisplay(teamName, oldScore);
    saveScoresToLocalStorage(); // Save after updating score
} 

function resetAllScores() {
    if (confirm('Are you sure you want to reset all scores to 0?')) {
        teams.forEach(team => {
            scores[team.name] = 0;
        });
        updateDisplay();
        localStorage.removeItem('teamScores'); // Clear the stored scores
    }
} 

// Add this function to show the popup
function showPrizePopup(prizeName) {
    const prize = wheelItems.find(item => item.name === prizeName);
    if (!prize) return;

    const popupHTML = `
        <div class="prize-popup-content">
            <h2>${prize.name}</h2>
            <p>${prize.description}</p>
            ${prize.imagePath ? `<img src="${prize.imagePath}" alt="${prize.name}" class="prize-image">` : ''}
            <button onclick="closePopup()" class="close-popup-btn">Close</button>
        </div>
    `;

    const popup = document.createElement('div');
    popup.className = 'prize-popup';
    popup.innerHTML = popupHTML;
    document.body.appendChild(popup);

    // Add animation class after a small delay
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
}

function closePopup() {
    const popup = document.querySelector('.prize-popup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
} 