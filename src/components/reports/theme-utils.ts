/**
 * Utility to read current theme colors from CSS variables
 * and convert them to formats usable by jsPDF and docx libraries.
 */

export interface ThemeColors {
  primary: [number, number, number];
  primaryForeground: [number, number, number];
  background: [number, number, number];
  foreground: [number, number, number];
  muted: [number, number, number];
  mutedForeground: [number, number, number];
  border: [number, number, number];
  accent: [number, number, number];
  success: [number, number, number];
  warning: [number, number, number];
  destructive: [number, number, number];
  card: [number, number, number];
  isDark: boolean;
}

function parseHSL(hslStr: string): [number, number, number] {
  if (hslStr.startsWith('rgb')) {
    const match = hslStr.match(/(\d+)/g);
    if (match && match.length >= 3) {
      return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
    }
  }
  
  const match = hslStr.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return [59, 130, 246]; 
  
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  
  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getRGB(varName: string): [number, number, number] {
  const raw = getCSSVar(varName);
  if (!raw) return [59, 130, 246];
  return parseHSL(raw);
}

export function getThemeColors(): ThemeColors {
  const isDark = document.documentElement.classList.contains('dark') || 
                 getCSSVar('--background').includes('20%') ||
                 getCSSVar('--background').includes('10%');
  
  return {
    primary: getRGB('--primary'),
    primaryForeground: getRGB('--primary-foreground'),
    background: getRGB('--background'),
    foreground: getRGB('--foreground'),
    muted: getRGB('--muted'),
    mutedForeground: getRGB('--muted-foreground'),
    border: getRGB('--border'),
    accent: getRGB('--accent'),
    success: getRGB('--success'),
    warning: getRGB('--warning'),
    destructive: getRGB('--destructive'),
    card: getRGB('--card'),
    isDark,
  };
}

export function getFontFamily(): string {
  const raw = getCSSVar('--font-family-base');
  if (!raw) return 'Inter';
  const match = raw.match(/'([^']+)'/);
  return match ? match[1] : 'Inter';
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function lighten(rgb: [number, number, number], factor: number): [number, number, number] {
  return rgb.map(c => Math.min(255, Math.round(c + (255 - c) * factor))) as [number, number, number];
}

export function darken(rgb: [number, number, number], factor: number): [number, number, number] {
  return rgb.map(c => Math.max(0, Math.round(c * (1 - factor)))) as [number, number, number];
}

let logoBase64Cache: string | null = null;

export async function getLogoBase64(): Promise<string | null> {
  if (logoBase64Cache) return logoBase64Cache;
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64Cache = reader.result as string;
        resolve(logoBase64Cache);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
