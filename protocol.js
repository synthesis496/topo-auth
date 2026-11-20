export const buildTemplate = (invariants) => ({
  invariants,
  tolerances: Object.fromEntries(
    Object.keys(invariants).map(key => [key, Math.max(invariants[key] * 0.2, 0.1)])
  )
});

export const calculateScore = (template, actual, timeScore) => {
  const keys = Object.keys(template.invariants);
  const sumDiff = keys.reduce((acc, key) => {
    const expected = template.invariants[key];
    const got = actual[key] ?? 0;
    const tol = template.tolerances[key] ?? 1;
    return acc + Math.min(Math.abs(expected - got) / tol, 1);
  }, 0);
  const geoScore = keys.length > 0 ? sumDiff / keys.length : 1;
  return (geoScore * 0.7) + (timeScore * 0.3);
};

export const isAuthentic = (score, threshold = 0.35) =>
  Math.sign(threshold - score) > 0;

export const generateChallenge = (canvasWidth) => ({
  type: Math.random() > 0.5 ? 'MIRROR' : 'NORMAL',
  fibTarget: getFibTime(3).map(f => f * 1000),
  c: canvasWidth
});

const getFibTime = (n) =>
  Array.from({ length: n }).reduce((acc, _, i) => 
    acc.concat(i < 2 ? i + 1 : acc[i - 1] + acc[i - 2]), []);
