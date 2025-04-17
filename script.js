const introSection = document.getElementById('intro-section');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
introSection.appendChild(renderer.domElement); // Append to intro-section

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

const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 128;
const ctx = canvas.getContext('2d');
ctx.font = 'bold 100px Arial';
ctx.fillStyle = 'white';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const fullText = "Hi, I am Sukhan!";
ctx.fillText(fullText, canvas.width / 2, canvas.height / 2);

const beforeText = "Hi, I am ";
const fullTextWidth = ctx.measureText(fullText).width;
const beforeWidth = ctx.measureText(beforeText).width;
const leftTextX = canvas.width / 2 - fullTextWidth / 2;
const threshold = leftTextX + beforeWidth;

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
let particleIndex = 0;
for (let i = 0; i < particleCount * 100 && particleIndex < particleCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const pixelIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    if (imageData.data[pixelIndex + 3] > 128) {
        positions[particleIndex * 3] = (x - canvas.width / 2) * 0.03;
        positions[particleIndex * 3 + 1] = (-y + canvas.height / 2) * 0.03;
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

// Mouse interaction for main particles
const mouse = new THREE.Vector2(0, 0);
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Skills section horizontal scrolling
const skillsRows = [
    document.getElementById('row1'),
    document.getElementById('row2'),
    document.getElementById('row3')
];

let speeds = [-0.5, 0.7, -0.6];
let skillPositions = [0, 0, 0];

skillsRows.forEach((row, index) => {
    const cardWidth = row.children[0].offsetWidth + 30;
    const totalOriginalCards = row.children.length;
    const totalWidth = cardWidth * totalOriginalCards;

    const visibleCards = Math.ceil(window.innerWidth / cardWidth) + 2;
    while (row.children.length < visibleCards * 2) {
        row.innerHTML += row.innerHTML;
    }

    if (index === 0 || index === 2) {
        skillPositions[index] = -totalWidth;
    }
});

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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

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

    const positionAttribute = particles.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positionAttribute.array[i3];
        const y = positionAttribute.array[i3 + 1];

        const dx = x - (mouse.x * 20);
        const dy = y - (mouse.y * 20);
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

    updateSkillsScroll();

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll animations for sections
const summary = document.getElementById('summary');
const skills = document.getElementById('skills');
const projects = document.getElementById('projects');
const blogs = document.getElementById('blogs');
const footer = document.getElementById('footer');

window.addEventListener('scroll', () => {
    const sections = [summary, skills, projects, blogs, footer];
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            section.classList.add('visible');
        } else {
            section.classList.remove('visible');
        }
    });
});