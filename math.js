export const TAU = 2 * Math.PI;
export const PHI = (1 + Math.sqrt(5)) / 2;

export const pathLength = (pts) =>
  pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0) || 0;

export const windingNumber = (pts) => {
  const totalTurn = pts.reduce((acc, p, i, arr) => {
    const prev = arr[i - 1] ?? arr[0];
    const prev2 = arr[i - 2] ?? prev;
    const a1 = Math.atan2(prev.y - prev2.y, prev.x - prev2.x);
    const a2 = Math.atan2(p.y - prev.y, p.x - prev.x);
    const diff = a2 - a1;
    return acc + Math.atan2(Math.sin(diff), Math.cos(diff));
  }, 0);
  return Math.round(totalTurn / TAU) || 0;
};

export const extractInvariants = (strokes) => {
  const allPoints = strokes.reduce((acc, s) => acc.concat(s), []);
  return {
    length: pathLength(allPoints) || 1,
    winding: windingNumber(allPoints),
    strokeCount: strokes.length || 1,
    duration: allPoints.reduce((acc, p) => acc + p.t, 0) || 1
  };
};

export const fibTime = (n) =>
  Array.from({ length: n }).reduce((acc, _, i) => 
    acc.concat(i < 2 ? i + 1 : acc[i - 1] + acc[i - 2]), []);

export const mirrorPoint = (p, c = 1) => ({
  ...p,
  x: c - (-p.x),
  y: c - (-p.y)
});

export const applyMirror = (stroke, c = 1) =>
  stroke.map(p => mirrorPoint(p, c));
