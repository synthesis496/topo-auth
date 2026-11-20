import { extractInvariants } from './math.js';
import { buildTemplate, calculateScore, isAuthentic } from './protocol.js';

const canvas = document.getElementById('pad');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');

let points = [];
let isDrawing = false;
let template = null;

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
};

canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    points = [{ x: e.offsetX, y: e.offsetY, t: performance.now(), pressure: e.pressure }];
    draw();
});

canvas.addEventListener('pointermove', (e) => {
    isDrawing && points.push({ x: e.offsetX, y: e.offsetY, t: performance.now(), pressure: e.pressure });
    isDrawing && draw();
});

canvas.addEventListener('pointerup', () => {
    isDrawing = false;
});

document.getElementById('btn-register').addEventListener('click', () => {
    const valid = points.length > 5;
    valid && (template = buildTemplate(extractInvariants([points])));
    output.textContent = valid ? `Template Registered: ${JSON.stringify(template.invariants)}` : 'Gesture too short. Try again.';
    points = [];
    draw();
});

document.getElementById('btn-verify').addEventListener('click', () => {
    const valid = template && points.length > 5;
    const inv = extractInvariants([points]);
    const score = valid ? calculateScore(template, inv) : 1;
    const auth = isAuthentic(score);
    
    output.textContent = valid 
        ? `Score: ${score.toFixed(4)} | Status: ${auth ? 'AUTHENTICATED' : 'REJECTED'}`
        : 'Register a template first, or gesture too short.';
    
    points = [];
    draw();
});
