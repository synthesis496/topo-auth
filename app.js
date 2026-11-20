import { extractInvariants, applyMirror, getFibTime } from './math.js';
import { buildTemplate, calculateScore, isAuthentic, generateChallenge } from './protocol.js';

const canvas = document.getElementById('pad');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');
const fibNodes = document.querySelectorAll('.fib-node');

let strokes = [];
let currentStroke = null;
let template = null;
let challenge = null;
let challengeActive = false;

const log = (msg, isAlert = false) => {
    output.innerHTML = isAlert ? `<span class="alert">> ${msg}</span>` : `> ${msg}<br>` + output.innerHTML;
};

const resetFibNodes = () => {
    fibNodes.forEach(node => {
        node.className = 'fib-node';
        node.textContent = '?';
    });
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = challengeActive && challenge.type === 'MIRROR' ? '#f0f' : '#0ff';
    ctx.strokeStyle = challengeActive && challenge.type === 'MIRROR' ? '#f0f' : '#0ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(s => {
        ctx.beginPath();
        s.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
    });

    currentStroke && (() => {
        ctx.beginPath();
        currentStroke.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
    })();
    ctx.shadowBlur = 0;
};

const processTiming = (index, duration) => {
    const target = challenge.fibTarget[index];
    const diff = Math.abs(target - duration);
    const isPass = diff < 400;
    
    fibNodes[index].textContent = target / 1000;
    fibNodes[index].className = `fib-node ${isPass ? 'success' : 'fail'}`;
    return isPass ? 1 : Math.max(0, 1 - (diff / 1000));
};

canvas.addEventListener('pointerdown', (e) => {
    currentStroke = { points: [{ x: e.offsetX, y: e.offsetY, t: performance.now() }] };
    draw();
});

canvas.addEventListener('pointermove', (e) => {
    currentStroke && currentStroke.points.push({ x: e.offsetX, y: e.offsetY, t: performance.now() });
    currentStroke && draw();
});

canvas.addEventListener('pointerup', () => {
    currentStroke && strokes.push(currentStroke);
    currentStroke = null;
    draw();
});

document.getElementById('btn-register').addEventListener('click', () => {
    const valid = strokes.length > 0;
    valid && (template = buildTemplate(extractInvariants(strokes)));
    valid ? log(`Template registered. Invariants locked.`) : log("ERROR: Gesture required.");
    strokes = [];
    draw();
});

document.getElementById('btn-verify').addEventListener('click', () => {
    !challengeActive && template && (() => {
        challenge = generateChallenge(canvas.width);
        challengeActive = true;
        strokes = [];
        resetFibNodes();
        draw();
        log(`CHALLENGE: ${challenge.type} | Draw ${challenge.fibTarget.length} strokes with Fibonacci timing.`, true);
    })();

    challengeActive && strokes.length === challenge.fibTarget.length && (() => {
        const timeScores = strokes.map((s, i) => {
            const duration = s.points[s.points.length - 1].t - s.points[0].t;
            return processTiming(i, duration);
        });
        const avgTimeScore = timeScores.reduce((a, b) => a + b, 0) / timeScores.length;
        
        const processedStrokes = challenge.type === 'MIRROR' ? strokes.map(s => applyMirror(s, canvas.width)) : strokes;
        const inv = extractInvariants(processedStrokes);
        const score = calculateScore(template, inv, avgTimeScore);
        const auth = isAuthentic(score);

        log(`GeoScore: ${((1 - score) * 100).toFixed(1)}% | TimeScore: ${(avgTimeScore * 100).toFixed(1)}%`);
        log(`STATUS: ${auth ? 'AUTHENTICATED' : 'STRUCTURALLY ABSENT'}`);

        challengeActive = false;
        strokes = [];
        setTimeout(draw, 1000);
    })();
});
