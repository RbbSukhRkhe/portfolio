// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Background particle system
const bgParticleCount = 2000;
const bgParticles = new THREE.BufferGeometry();
const bgPositions = new Float32Array(bgParticleCount * 3);
const bgColorsArray = new Float32Array(bgParticleCount * 3);
const bgVelocities = new Float32Array(bgParticleCount * 3);

const bgColorPalette = [
    [0.95, 0.9, 0.6],  // Pale yellow
    [0.6, 0.8, 0.95],  // Soft blue
    [0.8, 0.6, 0.9],   // Muted purple
    [0.7, 0.95, 0.7]   // Light green
];

for (let i = 0; i < bgParticleCount; i++) {
    bgPositions[i * 3] = (Math.random() - 0.5) * 100;
    bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    bgPositions[i * 3 + 2] = -10;

    bgVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
    bgVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    bgVelocities[i * 3 + 2] = 0;

    const color = bgColorPalette[Math.floor(Math.random() * bgColorPalette.length)];
    bgColorsArray[i * 3] = color[0];
    bgColorsArray[i * 3 + 1] = color[1];
    bgColorsArray[i * 3 + 2] = color[2];
}

bgParticles.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
bgParticles.setAttribute('color', new THREE.BufferAttribute(bgColorsArray, 3));

const bgMaterial = new THREE.PointsMaterial({
    size: 1.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.2
});
const bgParticleSystem = new THREE.Points(bgParticles, bgMaterial);
scene.add(bgParticleSystem);

// Main particle system for "Hi, I am Sukhan!"
const particleCount = 3000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const mainColors = new Float32Array(particleCount * 3);
const originalPositions = new Float32Array(particleCount * 3);

// Create canvas for text and center the text using textAlign and textBaseline
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 128;
const ctx = canvas.getContext('2d');
ctx.font = 'bold 100px Arial';
ctx.fillStyle = 'white';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Draw the full text centered
const fullText = "Hi, I am Sukhan!";
ctx.fillText(fullText, canvas.width / 2, canvas.height / 2);

// Measure the text to determine where "Sukhan!" starts
const beforeText = "Hi, I am ";
const fullTextWidth = ctx.measureText(fullText).width;
const beforeWidth = ctx.measureText(beforeText).width;
const leftTextX = canvas.width / 2 - fullTextWidth / 2;
const threshold = leftTextX + beforeWidth;

// Calculate scale factor based on screen width
const baseScale = 0.03;
const scaleFactor = Math.min(window.innerWidth / 1024, 1) * baseScale; // Scale down for screens < 1024px

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
let particleIndex = 0;
for (let i = 0; i < particleCount * 100 && particleIndex < particleCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const pixelIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    if (imageData.data[pixelIndex + 3] > 128) {
        positions[particleIndex * 3] = (x - canvas.width / 2) * scaleFactor;
        positions[particleIndex * 3 + 1] = (-y + canvas.height / 2) * scaleFactor;
        positions[particleIndex * 3 + 2] = 0;

        originalPositions[particleIndex * 3] = positions[particleIndex * 3];
        originalPositions[particleIndex * 3 + 1] = positions[particleIndex * 3 + 1];
        originalPositions[particleIndex * 3 + 2] = 0;

        const isSukhan = x > threshold;
        if (isSukhan) {
            const gradientPosition = y / canvas.height;
            const r = 1.0 - gradientPosition * 0.1;
            const g = 0.95 - gradientPosition * 0.15;
            const b = 0.6 + gradientPosition * 0.2;
            mainColors[particleIndex * 3] = r;
            mainColors[particleIndex * 3 + 1] = g;
            mainColors[particleIndex * 3 + 2] = b;
        } else {
            mainColors[particleIndex * 3] = 1.0;
            mainColors[particleIndex * 3 + 1] = 1.0;
            mainColors[particleIndex * 3 + 2] = 1.0;
        }
        particleIndex++;
    }
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(mainColors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

camera.position.z = 20;

// Mouse and touch interaction for main particles
const mouse = new THREE.Vector2(0, 0);

// Mouse move handler
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Touch move handler to mimic hover
document.addEventListener('touchmove', (event) => {
    event.preventDefault(); // Prevent scrolling while touching
    const touch = event.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
}, { passive: false });

// Touch start handler to initialize interaction
document.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
});

// Skills section horizontal scrolling
const skillsRows = [
    document.getElementById('row1'),
    document.getElementById('row2'),
    document.getElementById('row3')
];

// Speeds for each row (positive for left-to-right, negative for right-to-left)
let speeds = [-0.5, 0.7, -0.6];
let skillPositions = [0, 0, 0];

// Initialize the starting positions for seamless scrolling
function initializeSkillsRows() {
    skillsRows.forEach((row, index) => {
        const cardWidth = row.children[0].offsetWidth + 30;
        const totalOriginalCards = row.children.length / 2;
        const totalWidth = cardWidth * totalOriginalCards;

        // Clear existing content to avoid duplication on resize
        row.innerHTML = '';
        // Original cards
        const cards = index === 0 ? ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'] :
                      index === 1 ? ['Python', 'TensorFlow', 'Three.js', 'Git', 'MongoDB'] :
                                    ['UI/UX', 'Figma', 'Photoshop', 'Creative Coding', 'Problem Solving'];
        cards.forEach(card => {
            const div = document.createElement('div');
            div.className = 'skill-card';
            div.textContent = card;
            row.appendChild(div);
        });

        // Calculate number of cards needed
        const visibleCards = Math.ceil(window.innerWidth / cardWidth) + 2;
        while (row.children.length < visibleCards * 2) {
            row.innerHTML += row.innerHTML;
        }

        // Set initial position for rows 1 and 3
        if (index === 0 || index === 2) {
            skillPositions[index] = -totalWidth;
        } else {
            skillPositions[index] = 0;
        }

        row.addEventListener('mouseenter', () => speeds[index] = 0);
        row.addEventListener('mouseleave', () => speeds[index] = index === 1 ? 0.7 : -0.5 - index * 0.1);
    });
}

initializeSkillsRows();

function updateSkillsScroll() {
    skillsRows.forEach((row, index) => {
        const cardWidth = row.children[0].offsetWidth + 30;
        const totalOriginalCards = row.children.length / 2;
        const totalWidth = cardWidth * totalOriginalCards;

        skillPositions[index] += speeds[index];

        if (speeds[index] > 0) {
            if (skillPositions[index] >= 0) {
                skillPositions[index] -= totalWidth;
            }
        } else {
            if (skillPositions[index] <= -totalWidth) {
                skillPositions[index] += totalWidth;
            }
        }

        row.style.transform = `translateX(${skillPositions[index]}px)`;
    });
}

// Add skills to scroll event listener
const skillsSection = document.getElementById('skills');
window.addEventListener('scroll', () => {
    const skillsTop = skillsSection.getBoundingClientRect().top;
    if (skillsTop < window.innerHeight * 0.8) {
        skillsSection.classList.add('visible');
    } else {
        skillsSection.classList.remove('visible');
    }
});

// Animation loop with the original jumpy effect
function animate() {
    requestAnimationFrame(animate);

    // Update background particles
    const bgPositionAttribute = bgParticles.getAttribute('position');
    for (let i = 0; i < bgParticleCount; i++) {
        const i3 = i * 3;
        bgPositionAttribute.array[i3] += bgVelocities[i3];
        bgPositionAttribute.array[i3 + 1] += bgVelocities[i3 + 1];

        if (bgPositionAttribute.array[i3] > 50) bgPositionAttribute.array[i3] = -50;
        if (bgPositionAttribute.array[i3] < -50) bgPositionAttribute.array[i3] = 50;
        if (bgPositionAttribute.array[i3 + 1] > 50) bgPositionAttribute.array[i3 + 1] = -50;
        if (bgPositionAttribute.array[i3 + 1] < -50) bgPositionAttribute.array[i3 + 1] = 50;
    }
    bgPositionAttribute.needsUpdate = true;

    // Update main particles
    const positionAttribute = particles.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positionAttribute.array[i3];
        const y = positionAttribute.array[i3 + 1];

        const dx = x - (mouse.x * 20 * scaleFactor / baseScale); // Adjust mouse influence based on scale
        const dy = y - (mouse.y * 20 * scaleFactor / baseScale);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            const force = (5 - dist) * 0.1;
            const angle = Math.atan2(dy, dx);
            positionAttribute.array[i3] -= Math.cos(angle) * force;
            positionAttribute.array[i3 + 1] -= Math.sin(angle) * force;
        }

        positionAttribute.array[i3] += (originalPositions[i3] - positionAttribute.array[i3]) * 0.05;
        positionAttribute.array[i3 + 1] += (originalPositions[i3 + 1] - positionAttribute.array[i3 + 1]) * 0.05;
    }
    positionAttribute.needsUpdate = true;

    // Update skills scrolling
    updateSkillsScroll();

    renderer.render(scene, camera);
}

animate();

// Handle window resize and scroll events
const summary = document.getElementById('summary');
const projects = document.getElementById('projects');
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('subtext').style.top = '55%';
    document.getElementById('subtext').style.left = '50%';

    // Reinitialize skills rows for responsive scrolling
    initializeSkillsRows();
});

window.addEventListener('scroll', () => {
    // Summary section animation
    const summaryTop = summary.getBoundingClientRect().top;
    if (summaryTop < window.innerHeight * 0.8) {
        summary.classList.add('visible');
    } else {
        summary.classList.remove('visible');
    }

    // Projects section animation
    const projectsTop = projects.getBoundingClientRect().top;
    if (projectsTop < window.innerHeight * 0.8) {
        projects.classList.add('visible');
    } else {
        projects.classList.remove('visible');
    }
});