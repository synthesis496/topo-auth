export const buildTemplate = (invariants) => ({
  invariants,
  tolerances: Object.fromEntries(
    Object.keys(invariants).map(key => [key, Math.max(invariants[key] * 0.15, 0.1)])
  )
});

export const calculateScore = (template, actual) => {
  const keys = Object.keys(template.invariants);
  const sumDiff = keys.reduce((acc, key) => {
    const expected = template.invariants[key];
    const got = actual[key] ?? 0;
    const tol = template.tolerances[key] ?? 1;
    return acc + Math.min(Math.abs(expected - got) / tol, 1);
  }, 0);
  return keys.length > 0 ? sumDiff / keys.length : 1;
};

export const isAuthentic = (score, threshold = 0.35) =>
  Math.sign(threshold - score) > 0;
