import QRCode from 'qrcode';

// Audio feedback for barcode / QR scanner confirmation
export function playScannerBeep(success = true) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (success) {
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch crisp chime
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(320, ctx.currentTime); // Error buzz
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio autoplay restrictions fallback
  }
}

// Generate genuine QR Code Data URL (PNG)
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1C1814',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

// Generate pseudo Code-128 SVG Barcode representation with accurate bar widths
export function generateBarcodeSvg(code: string, width = 260, height = 70): string {
  // Deterministic bar widths based on char codes
  let bars: { width: number; isBlack: boolean }[] = [];
  // Quiet zone
  bars.push({ width: 10, isBlack: false });
  // Start guard
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  const safeCode = (code || 'VERTEX-001').toUpperCase().replace(/[^A-Z0-9-]/g, '');

  for (let i = 0; i < safeCode.length; i++) {
    const c = safeCode.charCodeAt(i);
    const pattern = [
      (c % 3) + 1,
      ((c >> 1) % 2) + 1,
      ((c >> 2) % 3) + 1,
      ((c >> 3) % 2) + 1,
      ((c >> 4) % 2) + 1
    ];
    for (let j = 0; j < pattern.length; j++) {
      bars.push({ width: pattern[j] * 1.5, isBlack: j % 2 === 0 });
    }
    bars.push({ width: 1.5, isBlack: false });
  }

  // Stop guard
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 10, isBlack: false });

  // Normalize total bar width to fit SVG
  const totalBarUnits = bars.reduce((acc, b) => acc + b.width, 0);
  const scale = (width - 20) / totalBarUnits;

  let currentX = 10;
  let rectsSvg = '';

  for (const bar of bars) {
    const barW = bar.width * scale;
    if (bar.isBlack) {
      rectsSvg += `<rect x="${currentX.toFixed(1)}" y="4" width="${Math.max(1, barW).toFixed(1)}" height="${height - 24}" fill="#1C1814" />`;
    }
    currentX += barW;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#ffffff;border-radius:4px;">
    ${rectsSvg}
    <text x="${width / 2}" y="${height - 6}" font-family="monospace" font-size="11" font-weight="bold" fill="#1C1814" text-anchor="middle" letter-spacing="2">${safeCode}</text>
  </svg>`;
}
