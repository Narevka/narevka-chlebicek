
export function HSVtoRGB(h: number, s: number, v: number) {
  let r: number = 0, g: number = 0, b: number = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  
  return { r, g, b };
}

export function generateColor() {
  let c = HSVtoRGB(Math.random(), 1.0, 1.0);
  c.r *= 0.15;
  c.g *= 0.15;
  c.b *= 0.15;
  return c;
}

export function correctRadius(radius: number, canvas: HTMLCanvasElement) {
  let aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1) radius *= aspectRatio;
  return radius;
}

export function correctDeltaX(delta: number, canvas: HTMLCanvasElement) {
  let aspectRatio = canvas.width / canvas.height;
  if (aspectRatio < 1) delta *= aspectRatio;
  return delta;
}

export function correctDeltaY(delta: number, canvas: HTMLCanvasElement) {
  let aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1) delta /= aspectRatio;
  return delta;
}

export function wrap(value: number, min: number, max: number) {
  const range = max - min;
  if (range === 0) return min;
  return ((value - min) % range) + min;
}

export function getResolution(resolution: number) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  if (aspectRatio < 1) {
    const min = Math.round(resolution);
    const max = Math.round(resolution / aspectRatio);
    return { width: min, height: max };
  } else {
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    return { width: max, height: min };
  }
}

export function scaleByPixelRatio(input: number) {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}

export function hashCode(s: string) {
  if (s.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
