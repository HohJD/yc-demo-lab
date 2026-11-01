export interface HWParams { alpha: number; beta: number; gamma: number }

export function holtWinters(y: number[], m: number, p: HWParams, horizon: number) {
  const n = y.length;
  if (n < 2 * m) throw new Error("Need at least two full seasons of history");
  let level = y.slice(0, m).reduce((a, b) => a + b, 0) / m;
  const level2 = y.slice(m, 2 * m).reduce((a, b) => a + b, 0) / m;
  let trend = (level2 - level) / m;
  const season = y.slice(0, m).map((v) => v - level);
  const fitted: number[] = [];
  for (let t = 0; t < n; t++) {
    const s = season[t % m];
    const yhat = level + trend + s;
    fitted.push(yhat);
    const prevLevel = level;
    level = p.alpha * (y[t] - s) + (1 - p.alpha) * (level + trend);
    trend = p.beta * (level - prevLevel) + (1 - p.beta) * trend;
    season[t % m] = p.gamma * (y[t] - level) + (1 - p.gamma) * s;
  }
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) forecast.push(level + h * trend + season[(n + h - 1) % m]);
  return { fitted, forecast };
}

export function seasonalNaive(y: number[], m: number, horizon: number) {
  const out: number[] = [];
  for (let h = 0; h < horizon; h++) out.push(y[y.length - m + (h % m)]);
  return out;
}

export const mae = (a: number[], b: number[]) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
export const smape = (a: number[], f: number[]) => (a.reduce((s, v, i) => s + (2 * Math.abs(v - f[i])) / (Math.abs(v) + Math.abs(f[i]) || 1), 0) / a.length) * 100;

export function fitHW(y: number[], m: number) {
  const alphas = [0.1, 0.3, 0.5, 0.7, 0.9];
  const betas = [0, 0.02, 0.1];
  const gammas = [0.05, 0.2, 0.5];
  let best = { p: { alpha: 0.3, beta: 0.02, gamma: 0.2 }, sse: Infinity };
  let evals = 0;
  for (const alpha of alphas) for (const beta of betas) for (const gamma of gammas) {
    const p = { alpha, beta, gamma };
    const { fitted } = holtWinters(y, m, p, 0);
    let sse = 0;
    for (let t = m; t < y.length; t++) sse += (y[t] - fitted[t]) ** 2;
    evals++;
    if (sse < best.sse) best = { p, sse };
  }
  return { params: best.p, evals, sigma: Math.sqrt(best.sse / Math.max(1, y.length - m)) };
}

export function forecastEnsemble(y: number[], m: number, horizon: number) {
  const holdout = Math.min(horizon, Math.floor(y.length / 5));
  const train = y.slice(0, y.length - holdout);
  const test = y.slice(y.length - holdout);
  const fitTrain = fitHW(train, m);
  const hwBack = holtWinters(train, m, fitTrain.params, holdout).forecast;
  const snBack = seasonalNaive(train, m, holdout);
  const eHW = mae(test, hwBack), eSN = mae(test, snBack);
  const wHW = (1 / (eHW + 1e-9)) / (1 / (eHW + 1e-9) + 1 / (eSN + 1e-9));
  const ensBack = hwBack.map((v, i) => wHW * v + (1 - wHW) * snBack[i]);
  const full = fitHW(y, m);
  const hw = holtWinters(y, m, full.params, horizon).forecast;
  const sn = seasonalNaive(y, m, horizon);
  const ens = hw.map((v, i) => wHW * v + (1 - wHW) * sn[i]);
  const band = ens.map((_, i) => 1.64 * full.sigma * Math.sqrt(1 + (i / m) * 0.5));
  return {
    params: full.params,
    weightHW: wHW,
    evals: fitTrain.evals + full.evals,
    backtest: { holdout, hw: { mae: eHW, smape: smape(test, hwBack) }, sn: { mae: eSN, smape: smape(test, snBack) }, ens: { mae: mae(test, ensBack), smape: smape(test, ensBack) } },
    forecast: ens,
    lower: ens.map((v, i) => v - band[i]),
    upper: ens.map((v, i) => v + band[i]),
  };
}
