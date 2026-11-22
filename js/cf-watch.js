// CHRONO.FOUNDRY 首页：SVG 表款渲染（正面 / 背面底盖 / 专柜表盒 / 改款部位图 / 印标位置图）
window.CF = window.CF || {};
(function (CF) {
  let uid = 0;
  const K = 4.2; // 1mm = 4.2px
  const METAL = {
    steel: ['#f4f6f7', '#a9b1b7', '#5d656c'],
    gun: ['#a3a9ae', '#5e6368', '#2c3034'],
    rose: ['#f6d9c6', '#c99273', '#7f4d36'],
    dlc: ['#62676e', '#2a2d31', '#0b0c0e']
  };
  const LUME = '#e6f6d4';
  const ORANGE = '#E0561C';
  const f1 = (n) => Math.round(n * 10) / 10;
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const pol = (cx, cy, r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [f1(cx + r * Math.sin(a)), f1(cy - r * Math.cos(a))];
  };
  const circ = (cx, cy, r) => `M${f1(cx - r)},${cy} a${f1(r)},${f1(r)} 0 1,1 ${f1(2 * r)},0 a${f1(r)},${f1(r)} 0 1,1 ${f1(-2 * r)},0 Z`;
  const ring = (cx, cy, ro, ri) => circ(cx, cy, ro) + ' ' + circ(cx, cy, ri);

  function rrect(cx, cy, w, h, r) {
    const x = cx - w / 2, y = cy - h / 2;
    return `M${f1(x + r)},${f1(y)} H${f1(x + w - r)} Q${f1(x + w)},${f1(y)} ${f1(x + w)},${f1(y + r)} V${f1(y + h - r)} Q${f1(x + w)},${f1(y + h)} ${f1(x + w - r)},${f1(y + h)} H${f1(x + r)} Q${f1(x)},${f1(y + h)} ${f1(x)},${f1(y + h - r)} V${f1(y + r)} Q${f1(x)},${f1(y)} ${f1(x + r)},${f1(y)} Z`;
  }
  function octa(cx, cy, r) {
    const rv = r / Math.cos(Math.PI / 8);
    let d = '';
    for (let i = 0; i < 8; i++) {
      const p = pol(cx, cy, rv, 22.5 + 45 * i);
      d += (i ? 'L' : 'M') + p[0] + ',' + p[1] + ' ';
    }
    return d + 'Z';
  }
  function shapePath(shape, cx, cy, R) {
    if (shape === 'cushion') return rrect(cx, cy, R * 1.94, R * 1.94, R * 0.56);
    if (shape === 'octagon') return octa(cx, cy, R * 0.97);
    if (shape === 'tonneau') {
      const w = R * 0.92, h = R * 1.1;
      const P = (x, y) => f1(cx + x) + ',' + f1(cy + y);
      return `M${P(-w * 0.8, -h)} C${P(-w * 0.3, -h * 1.05)} ${P(w * 0.3, -h * 1.05)} ${P(w * 0.8, -h)} C${P(w * 1.12, -h * 0.5)} ${P(w * 1.12, h * 0.5)} ${P(w * 0.8, h)} C${P(w * 0.3, h * 1.05)} ${P(-w * 0.3, h * 1.05)} ${P(-w * 0.8, h)} C${P(-w * 1.12, h * 0.5)} ${P(-w * 1.12, -h * 0.5)} ${P(-w * 0.8, -h)} Z`;
    }
    return circ(cx, cy, R);
  }

  function defs(u, c) {
    const m = METAL[c.plate] || METAL.steel;
    const col = CF.find('color', c.color).c;
    return `<defs>
<linearGradient id="m${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m[0]}"/><stop offset=".55" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[2]}"/></linearGradient>
<linearGradient id="mh${u}" x1="0" x2="1"><stop offset="0" stop-color="${m[2]}"/><stop offset=".3" stop-color="${m[0]}"/><stop offset=".5" stop-color="${m[1]}"/><stop offset=".7" stop-color="${m[0]}"/><stop offset="1" stop-color="${m[2]}"/></linearGradient>
<linearGradient id="mv${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m[0]}"/><stop offset="1" stop-color="${m[1]}"/></linearGradient>
<radialGradient id="d${u}" cx=".42" cy=".36" r=".72"><stop offset="0" stop-color="${col[0]}"/><stop offset="1" stop-color="${col[1]}"/></radialGradient>
<linearGradient id="lt${u}" x1="0" x2="1"><stop offset="0" stop-color="#5a3420"/><stop offset=".5" stop-color="#7d4c2e"/><stop offset="1" stop-color="#5a3420"/></linearGradient>
<linearGradient id="gd${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc95"/><stop offset=".5" stop-color="#d1a24a"/><stop offset="1" stop-color="#8f6a22"/></linearGradient>
<pattern id="cp${u}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1"/><rect x="1" y="1" width="4" height="4" fill="rgba(0,0,0,.12)"/></pattern>
</defs>`;
  }

  // ---------- 表带 ----------
  function strap(c, u, cx, cy, half, sw, ext, under) {
    const m = METAL[c.plate] || METAL.steel;
    let s = '';
    [[cy - half + 6, cy - half - ext], [cy + half - 6, cy + half + ext]].forEach(([y0, y1], n) => {
      const w0 = sw / 2, w1 = sw * 0.43, id = `sc${u}${n}`;
      const d = `M${f1(cx - w0)},${f1(y0)} L${f1(cx + w0)},${f1(y0)} L${f1(cx + w1)},${f1(y1)} L${f1(cx - w1)},${f1(y1)} Z`;
      const dir = y1 > y0 ? 1 : -1;
      let inner = '';
      if (c.strap === 'steel') {
        s += `<path d="${d}" fill="url(#mh${u})" stroke="${m[2]}" stroke-width=".8"/>`;
        for (let y = y0 + dir * 14; dir * (y1 - y) > 0; y += dir * 14) inner += `<line x1="${cx - w0}" y1="${f1(y)}" x2="${cx + w0}" y2="${f1(y)}" stroke="${m[2]}" stroke-width=".9" opacity=".75"/>`;
        inner += `<line x1="${f1(cx - sw * 0.17)}" y1="${y0}" x2="${f1(cx - sw * 0.17)}" y2="${y1}" stroke="${m[2]}" stroke-width=".8"/><line x1="${f1(cx + sw * 0.17)}" y1="${y0}" x2="${f1(cx + sw * 0.17)}" y2="${y1}" stroke="${m[2]}" stroke-width=".8"/>`;
      } else if (c.strap === 'rubber') {
        s += `<path d="${d}" fill="#1c1f23" stroke="#0a0c0e" stroke-width="1"/>`;
        for (let y = y0 + dir * 9; dir * (y1 - y) > 0; y += dir * 9) inner += `<line x1="${cx - w0}" y1="${f1(y)}" x2="${cx + w0}" y2="${f1(y)}" stroke="#2f343a" stroke-width="3"/>`;
      } else {
        s += `<path d="${d}" fill="${under ? '#a57c58' : `url(#lt${u})`}" stroke="#3d2314" stroke-width="1"/>`;
        const a = w0 - 4, b = w1 - 4;
        inner += `<path d="M${f1(cx - a)},${f1(y0)} L${f1(cx - b)},${f1(y1)} M${f1(cx + a)},${f1(y0)} L${f1(cx + b)},${f1(y1)}" stroke="#ecd9b6" stroke-width="1" stroke-dasharray="4 3" fill="none"/>`;
      }
      s += `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
    });
    return s;
  }

  // ---------- 耳、护肩、表冠、表壳 ----------
  function caseBody(c, u, cx, cy, R, half, sw) {
    const m = METAL[c.plate] || METAL.steel;
    const lw = 2.4 * K;
    let s = '';
    [cx - sw / 2 - lw, cx + sw / 2].forEach((x) => {
      s += `<rect x="${f1(x)}" y="${f1(cy - half)}" width="${f1(lw)}" height="${f1(half - R * 0.55)}" rx="3" fill="url(#m${u})" stroke="${m[2]}" stroke-width=".8"/>`;
      s += `<rect x="${f1(x)}" y="${f1(cy + R * 0.55)}" width="${f1(lw)}" height="${f1(half - R * 0.55)}" rx="3" fill="url(#m${u})" stroke="${m[2]}" stroke-width=".8"/>`;
    });
    const e = R * 0.97;
    const crownX = c.guard === 'flat' ? cx + e - 1 : cx + R + 2;
    if (c.guard === 'std') {
      s += `<path d="M${f1(cx + R * 0.8)},${f1(cy - R * 0.52)} Q${f1(cx + R + 10)},${f1(cy - R * 0.38)} ${f1(cx + R + 8)},${f1(cy - 14)} L${f1(cx + R + 2)},${f1(cy - 14)} L${f1(cx + R + 2)},${f1(cy + 14)} L${f1(cx + R + 8)},${f1(cy + 14)} Q${f1(cx + R + 10)},${f1(cy + R * 0.38)} ${f1(cx + R * 0.8)},${f1(cy + R * 0.52)} Z" fill="url(#m${u})" stroke="${m[2]}" stroke-width="1"/>`;
    } else if (c.guard === 'facet') {
      s += `<path d="M${f1(cx + R * 0.8)},${f1(cy - R * 0.54)} L${f1(cx + R + 10)},${f1(cy - R * 0.3)} L${f1(cx + R + 10)},${f1(cy - 14)} L${f1(cx + R + 2)},${f1(cy - 14)} L${f1(cx + R + 2)},${f1(cy + 14)} L${f1(cx + R + 10)},${f1(cy + 14)} L${f1(cx + R + 10)},${f1(cy + R * 0.3)} L${f1(cx + R * 0.8)},${f1(cy + R * 0.54)} Z" fill="url(#m${u})" stroke="${m[2]}" stroke-width="1"/>`;
      s += `<path d="M${f1(cx + R * 0.86)},${f1(cy - R * 0.46)} L${f1(cx + R + 7)},${f1(cy - R * 0.27)} M${f1(cx + R * 0.86)},${f1(cy + R * 0.46)} L${f1(cx + R + 7)},${f1(cy + R * 0.27)}" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/>`;
    }
    s += `<rect x="${f1(crownX - 2)}" y="${f1(cy - 5)}" width="6" height="10" fill="${m[1]}"/>`;
    s += `<rect x="${f1(crownX + 2)}" y="${f1(cy - 13)}" width="${f1(2.8 * K)}" height="26" rx="2.5" fill="url(#mv${u})" stroke="${m[2]}" stroke-width=".8"/>`;
    for (let i = -9; i <= 9; i += 4.5) s += `<line x1="${f1(crownX + 3)}" y1="${f1(cy + i)}" x2="${f1(crownX + 1 + 2.8 * K)}" y2="${f1(cy + i)}" stroke="${m[2]}" stroke-width=".7"/>`;
    const sp = shapePath(c.shape, cx, cy, R);
    s += `<path d="${sp}" fill="url(#m${u})" stroke="${m[2]}" stroke-width="1.2"/>`;
    s += `<path d="${sp}" transform="translate(${cx},${cy}) scale(.965) translate(${-cx},${-cy})" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>`;
    return s;
  }
  // ---------- 表圈 ----------
  function bezel(c, u, cx, cy, R) {
    const m = METAL[c.plate] || METAL.steel;
    let s = '';
    if (c.bezel === 'polish') {
      const ro = R * 0.9, ri = R * 0.79;
      s += `<path d="${ring(cx, cy, ro, ri)}" fill-rule="evenodd" fill="url(#m${u})" stroke="${m[2]}" stroke-width="1"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${f1(ro - 2)}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.2"/>`;
      return { s, rd: ri - 1 };
    }
    const ro = R * 0.93, ri = R * 0.75, mid = (ro + ri) / 2;
    if (c.bezel === 'coin') {
      s += `<path d="${ring(cx, cy, ro, ri)}" fill-rule="evenodd" fill="url(#m${u})" stroke="${m[2]}" stroke-width="1"/>`;
      for (let i = 0; i < 60; i++) {
        const a = pol(cx, cy, ro, i * 6), b = pol(cx, cy, ri + 2, i * 6);
        s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${i % 2 ? m[0] : m[2]}" stroke-width="2.4"/>`;
      }
      return { s, rd: ri - 1 };
    }
    s += `<path d="${ring(cx, cy, ro, ri)}" fill-rule="evenodd" fill="#101214" stroke="${m[2]}" stroke-width="1.5"/>`;
    const own = c.scale === 'own';
    if (c.bezel === 'ceramic') {
      for (let i = 0; i < 60; i++) {
        if (i === 0) continue;
        const big = i % 5 === 0;
        if (big && i % 10 === 0) {
          const p = pol(cx, cy, mid, i * 6);
          s += `<text x="${p[0]}" y="${p[1]}" transform="rotate(${i * 6} ${p[0]} ${p[1]})" font-size="${f1(R * 0.12)}" font-family="Inter,Arial" font-weight="600" fill="${LUME}" text-anchor="middle" dominant-baseline="central">${i}</text>`;
        } else if (i < 15 || big) {
          const a = pol(cx, cy, ro - 3, i * 6), b = pol(cx, cy, big ? ri + 4 : ro - R * 0.06, i * 6);
          s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${LUME}" stroke-width="${big ? 3 : 1.4}"/>`;
        }
      }
    } else {
      const nums = [[0, ''], [36, '500'], [60, '300'], [90, '200'], [120, '150'], [154, '120'], [180, '100'], [216, '90'], [252, '80'], [288, '70'], [324, '60']];
      nums.forEach(([deg, t]) => {
        if (!t) return;
        const p = pol(cx, cy, mid, deg);
        s += `<text x="${p[0]}" y="${p[1]}" transform="rotate(${deg} ${p[0]} ${p[1]})" font-size="${f1(R * 0.085)}" font-family="Inter,Arial" font-weight="600" fill="#f2f2f2" text-anchor="middle" dominant-baseline="central">${t}</text>`;
      });
      for (let i = 0; i < 72; i++) {
        const a = pol(cx, cy, ri + 1, i * 5), b = pol(cx, cy, ri + 5, i * 5);
        s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#bbb" stroke-width=".8"/>`;
      }
    }
    if (own) {
      const p = pol(cx, cy, mid, 0);
      s += `<text x="${p[0]}" y="${p[1]}" font-size="${f1(R * 0.11)}" font-family="'Space Grotesk',Arial" font-weight="700" fill="${ORANGE}" text-anchor="middle" dominant-baseline="central">${esc(CF.initials(c.brand))}</text>`;
    } else if (c.bezel === 'ceramic') {
      const t = pol(cx, cy, ro - 4, 0), l = pol(cx, cy, ri + 5, -7), r = pol(cx, cy, ri + 5, 7);
      s += `<path d="M${t[0]},${t[1]} L${r[0]},${r[1]} L${l[0]},${l[1]} Z" fill="${LUME}"/><circle cx="${t[0]}" cy="${f1(t[1] + R * 0.07)}" r="2.6" fill="#0f2b1c"/>`;
    } else {
      const p = pol(cx, cy, mid, 0);
      s += `<text x="${p[0]}" y="${p[1]}" font-size="${f1(R * 0.075)}" font-family="Inter,Arial" font-weight="700" fill="${ORANGE}" text-anchor="middle" dominant-baseline="central">TACHY</text>`;
    }
    return { s, rd: ri - 1 };
  }

  // ---------- 表盘 ----------
  function dial(c, u, cx, cy, rd) {
    const col = CF.find('color', c.color);
    const ink = col.light ? '#1c2228' : '#f4f5f6';
    const idx = col.light ? '#2a3036' : LUME;
    let s = `<circle cx="${cx}" cy="${cy}" r="${f1(rd)}" fill="url(#d${u})"/>`;
    if (c.dial === 'emb') s += `<circle cx="${cx}" cy="${cy}" r="${f1(rd)}" fill="url(#cp${u})"/>`;
    else if (c.dial === 'sun') for (let i = 0; i < 48; i++) {
      const a = pol(cx, cy, rd * 0.18, i * 7.5), b = pol(cx, cy, rd * 0.98, i * 7.5);
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`;
    }
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = pol(cx, cy, rd - 2, i * 6), b = pol(cx, cy, rd - 6, i * 6);
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${ink}" stroke-width=".7" opacity=".6"/>`;
    }
    const chrono = c.func === 'chrono';
    for (let h = 0; h < 12; h++) {
      if (h === 3 && !chrono) continue;
      if (chrono && (h === 3 || h === 6 || h === 9)) continue;
      const a = pol(cx, cy, rd - 8, h * 30), b = pol(cx, cy, rd - (h === 0 ? 26 : 20), h * 30);
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${idx}" stroke-width="${h === 0 ? 7 : 5}" stroke-linecap="round"/>`;
    }
    if (chrono) {
      const sr = rd * 0.22;
      [[90, 0.48], [180, 0.48], [270, 0.48]].forEach(([deg, k]) => {
        const p = pol(cx, cy, rd * k, deg);
        const sub = c.color === 'panda' ? '#15191d' : col.light ? '#d8dde1' : 'rgba(0,0,0,.35)';
        const tk = c.color === 'panda' ? '#f2f2f2' : ink;
        s += `<circle cx="${p[0]}" cy="${p[1]}" r="${f1(sr)}" fill="${sub}" stroke="${tk}" stroke-width=".8" opacity=".95"/>`;
        for (let i = 0; i < 12; i++) {
          const a = pol(p[0], p[1], sr - 1.5, i * 30), b = pol(p[0], p[1], sr - 5, i * 30);
          s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${tk}" stroke-width=".9"/>`;
        }
        const h = pol(p[0], p[1], sr * 0.78, deg * 1.7 + 40);
        s += `<line x1="${p[0]}" y1="${p[1]}" x2="${h[0]}" y2="${h[1]}" stroke="${ORANGE}" stroke-width="1.6"/>`;
      });
    } else {
      const x = cx + rd * 0.6, w = rd * 0.19, h = rd * 0.14;
      s += `<rect x="${f1(x - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" fill="#fff" stroke="${col.light ? '#888' : '#000'}" stroke-width="1"/>`;
      s += `<text x="${f1(x)}" y="${f1(cy + 0.5)}" font-size="${f1(h * 0.78)}" font-family="Inter,Arial" font-weight="700" fill="#111" text-anchor="middle" dominant-baseline="central">18</text>`;
    }
    const metal = c.logo === 'metal';
    const by = cy - rd * (chrono ? 0.56 : 0.42);
    const fs = Math.min(rd * 0.13, (rd * 1.05) / Math.max(4, String(c.brand).length) * 1.45);
    s += `<text x="${cx}" y="${f1(by)}" font-size="${f1(fs)}" font-family="'Space Grotesk',Arial" font-weight="700" letter-spacing="1.5" fill="${metal ? `url(#gd${u})` : ink}" ${metal ? 'stroke="#5d4512" stroke-width=".5"' : ''} text-anchor="middle" dominant-baseline="central">${esc(String(c.brand).toUpperCase())}</text>`;
    const tl = chrono ? 'CHRONOGRAPH' : c.power === 'auto' ? 'AUTOMATIC' : 'QUARTZ';
    s += `<text x="${cx}" y="${f1(by + fs * 1.05)}" font-size="${f1(rd * 0.06)}" font-family="Inter,Arial" letter-spacing="1.2" fill="${ink}" opacity=".7" text-anchor="middle" dominant-baseline="central">${tl}</text>`;
    if (c.bezel === 'ceramic' && !chrono) s += `<text x="${cx}" y="${f1(cy + rd * 0.46)}" font-size="${f1(rd * 0.06)}" font-family="Inter,Arial" letter-spacing="1" fill="${ORANGE}" text-anchor="middle">200M · 660FT</text>`;
    return s;
  }

  // ---------- 指针 ----------
  function hands(c, u, cx, cy, rd) {
    const col = CF.find('color', c.color);
    const steel = col.light ? '#2a2f35' : '#e8ebee';
    const fillH = c.hands === 'std' ? steel : LUME;
    const edge = col.light ? '#000' : '#6d757c';
    const hand = (deg, len, w, tail) => {
      let d;
      if (c.hands === 'std') d = `M${-w / 2},${tail} L${-w / 2},${-len} L${w / 2},${-len} L${w / 2},${tail} Z`;
      else if (c.hands === 'lume') d = `M${-w * 0.5},${tail} L${-w * 0.6},${-len * 0.78} L0,${-len} L${w * 0.6},${-len * 0.78} L${w * 0.5},${tail} Z`;
      else d = `M${-w * 0.35},${tail} L${-w * 0.35},${-len * 0.72} L${-w * 1.05},${-len * 0.72} L0,${-len} L${w * 1.05},${-len * 0.72} L${w * 0.35},${-len * 0.72} L${w * 0.35},${tail} Z`;
      return `<path d="${d}" transform="translate(${cx},${cy}) rotate(${deg})" fill="${fillH}" stroke="${edge}" stroke-width="1"/>`;
    };
    let s = hand(305, rd * 0.55, rd * 0.11, rd * 0.1) + hand(60, rd * 0.8, rd * 0.08, rd * 0.1);
    s += `<g transform="translate(${cx},${cy}) rotate(160)"><line x1="0" y1="${f1(rd * 0.22)}" x2="0" y2="${f1(-rd * 0.86)}" stroke="${ORANGE}" stroke-width="1.6"/>`;
    if (c.hands === 'own') s += `<circle cx="0" cy="${f1(rd * 0.2)}" r="${f1(rd * 0.075)}" fill="${ORANGE}"/><text x="0" y="${f1(rd * 0.2)}" transform="rotate(-160 0 ${f1(rd * 0.2)})" font-size="${f1(rd * 0.075)}" font-family="'Space Grotesk',Arial" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${esc(CF.initials(c.brand)[0])}</text>`;
    else s += `<circle cx="0" cy="${f1(-rd * 0.62)}" r="3" fill="none" stroke="${ORANGE}" stroke-width="1.4"/>`;
    s += `</g><circle cx="${cx}" cy="${cy}" r="4.5" fill="${ORANGE}" stroke="#222" stroke-width=".8"/>`;
    return s;
  }
  // ---------- 正面整表 ----------
  function frontInner(c, u, ruler) {
    const cx = 200, cy = 220;
    const R = (c.size / 2) * K;
    const dim = CF.SIZE[c.size];
    const half = (dim.l2l / 2) * K, sw = dim.strap * K;
    let s = defs(u, c);
    s += strap(c, u, cx, cy, half, sw, 220);
    s += caseBody(c, u, cx, cy, R, half, sw);
    const b = bezel(c, u, cx, cy, R);
    s += b.s + dial(c, u, cx, cy, b.rd) + hands(c, u, cx, cy, b.rd);
    s += `<ellipse cx="${f1(cx - R * 0.3)}" cy="${f1(cy - R * 0.38)}" rx="${f1(R * 0.38)}" ry="${f1(R * 0.16)}" transform="rotate(-30 ${f1(cx - R * 0.3)} ${f1(cy - R * 0.38)})" fill="rgba(255,255,255,.07)"/>`;
    if (ruler) {
      const xl = cx - R - 34, t = cy - half, bt = cy + half;
      s += `<g stroke="${ORANGE}" stroke-width="1" fill="none"><line x1="${xl}" y1="${f1(t)}" x2="${xl}" y2="${f1(bt)}"/><line x1="${xl - 6}" y1="${f1(t)}" x2="${cx - sw / 2 - 12}" y2="${f1(t)}" stroke-dasharray="3 3"/><line x1="${xl - 6}" y1="${f1(bt)}" x2="${cx - sw / 2 - 12}" y2="${f1(bt)}" stroke-dasharray="3 3"/></g>`;
      s += `<text x="${xl - 8}" y="${cy}" transform="rotate(-90 ${xl - 8} ${cy})" font-size="11" font-family="JetBrains Mono,monospace" fill="${ORANGE}" text-anchor="middle">L2L ${dim.l2l}mm</text>`;
      const yb = cy + R + 16;
      s += `<g stroke="${ORANGE}" stroke-width="1"><line x1="${f1(cx - R)}" y1="${f1(yb)}" x2="${f1(cx + R)}" y2="${f1(yb)}"/><line x1="${f1(cx - R)}" y1="${f1(yb - 4)}" x2="${f1(cx - R)}" y2="${f1(yb + 4)}"/><line x1="${f1(cx + R)}" y1="${f1(yb - 4)}" x2="${f1(cx + R)}" y2="${f1(yb + 4)}"/></g>`;
      s += `<rect x="${cx - 62}" y="${f1(yb + 5)}" width="124" height="17" rx="8.5" fill="#14181b"/><text x="${cx}" y="${f1(yb + 17)}" font-size="10.5" font-family="JetBrains Mono,monospace" fill="#fff" text-anchor="middle">Ø${c.size.toFixed(1)} (含冠${(c.size + 2.8).toFixed(1)})</text>`;
    }
    return s;
  }
  CF.front = (c, ruler) => `<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="正面预览">${frontInner(c, ++uid, ruler)}</svg>`;

  // ---------- 背面底盖 ----------
  function backInner(c, u) {
    const cx = 200, cy = 220;
    const R = (c.size / 2) * K;
    const dim = CF.SIZE[c.size];
    const half = (dim.l2l / 2) * K, sw = dim.strap * K;
    const m = METAL[c.plate] || METAL.steel;
    const mirror = Object.assign({}, c, { guard: 'none' });
    let s = defs(u, c) + strap(c, u, cx, cy, half, sw, 220, true);
    s += `<g transform="translate(400,0) scale(-1,1)">${caseBody(mirror, u, cx, cy, R, half, sw)}</g>`;
    const rb = R * 0.86;
    s += `<circle cx="${cx}" cy="${cy}" r="${f1(rb)}" fill="url(#m${u})" stroke="${m[2]}" stroke-width="1.2"/>`;
    for (let i = 0; i < 6; i++) {
      const p = pol(cx, cy, rb * 0.92, 30 + i * 60);
      s += `<circle cx="${p[0]}" cy="${p[1]}" r="3.6" fill="${m[1]}" stroke="${m[2]}"/><line x1="${p[0] - 2.4}" y1="${p[1]}" x2="${p[0] + 2.4}" y2="${p[1]}" stroke="${m[2]}" stroke-width="1"/>`;
    }
    const ri = rb * 0.78;
    const brand = esc(String(c.brand).toUpperCase());
    if (c.back === 'solid') {
      s += `<circle cx="${cx}" cy="${cy}" r="${f1(ri)}" fill="none" stroke="${m[2]}" stroke-width="1" opacity=".7"/>`;
      s += `<path id="arc${u}" d="M${f1(cx - ri * 0.86)},${cy} A${f1(ri * 0.86)},${f1(ri * 0.86)} 0 0,1 ${f1(cx + ri * 0.86)},${cy}" fill="none"/>`;
      s += `<text font-size="${f1(R * 0.085)}" font-family="Inter,Arial" letter-spacing="2" fill="${m[2]}"><textPath href="#arc${u}" startOffset="50%" text-anchor="middle">SAPPHIRE · 10ATM · 316L</textPath></text>`;
      s += `<text x="${cx}" y="${f1(cy - ri * 0.18)}" font-size="${f1(R * 0.15)}" font-family="'Space Grotesk',Arial" font-weight="700" fill="${m[2]}" text-anchor="middle">${brand}</text>`;
      s += `<text x="${cx}" y="${f1(cy + ri * 0.12)}" font-size="${f1(R * 0.075)}" font-family="Inter,Arial" letter-spacing="2" fill="${m[2]}" text-anchor="middle">LIMITED EDITION</text>`;
      s += `<text x="${cx}" y="${f1(cy + ri * 0.42)}" font-size="${f1(R * 0.16)}" font-family="JetBrains Mono,monospace" font-weight="700" fill="${m[2]}" text-anchor="middle">001 / 050</text>`;
      s += `<text x="${cx}" y="${f1(cy + ri * 0.66)}" font-size="${f1(R * 0.06)}" font-family="Inter,Arial" letter-spacing="1.5" fill="${m[2]}" text-anchor="middle">SOLID 316L STAINLESS STEEL</text>`;
    } else {
      s += `<circle cx="${cx}" cy="${cy}" r="${f1(ri)}" fill="#8e969c" stroke="${m[2]}" stroke-width="1.5"/>`;
      for (let i = 0; i < 9; i++) s += `<circle cx="${cx}" cy="${cy}" r="${f1(ri * (0.2 + i * 0.09))}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>`;
      [[-0.45, -0.3], [0.4, 0.38], [-0.2, 0.55]].forEach(([x, y]) => s += `<circle cx="${f1(cx + ri * x)}" cy="${f1(cy + ri * y)}" r="4" fill="#b3262b" stroke="#ddd" stroke-width="1"/>`);
      const own = c.back === 'rotor';
      const rr = ri * 0.96;
      const a = pol(cx, cy, rr, 300), z = pol(cx, cy, rr, 60);
      s += `<path d="M${a[0]},${a[1]} A${f1(rr)},${f1(rr)} 0 0,1 ${z[0]},${z[1]} L${cx + 14},${cy} A14,14 0 0,1 ${cx - 14},${cy} Z" transform="rotate(200 ${cx} ${cy})" fill="${own ? `url(#gd${u})` : 'url(#mh' + u + ')'}" stroke="${own ? '#7d5c1c' : m[2]}" stroke-width="1"/>`;
      const tp = pol(cx, cy, rr * 0.62, 200);
      s += `<text x="${tp[0]}" y="${tp[1]}" transform="rotate(20 ${tp[0]} ${tp[1]})" font-size="${f1(R * (own ? 0.11 : 0.07))}" font-family="'Space Grotesk',Arial" font-weight="700" fill="${own ? '#5b3f0c' : '#555'}" text-anchor="middle" dominant-baseline="central">${own ? brand : 'NH35A · 24 JEWELS'}</text>`;
      s += `<circle cx="${cx}" cy="${cy}" r="10" fill="#c9ced2" stroke="#666"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${f1(ri)}" fill="rgba(160,200,255,.08)"/>`;
    }
    return s;
  }
  CF.back = (c) => `<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="背面底盖预览">${backInner(c, ++uid)}</svg>`;

  // ---------- 专柜表盒 ----------
  CF.BOXNAME = { eco: '防雾简装盒 · 110×90×70mm', pu: '专柜 PU 皮盒套装 · 145×125×95mm', wood: '钢琴漆木盒 · 160×140×100mm' };
  CF.box = (c) => {
    const u = ++uid;
    const pal = {
      eco: { lid: '#e9e5dc', body: '#d9d3c6', in: '#f3f0ea', txt: '#55504a', pil: '#ffffff' },
      pu: { lid: '#1c1f23', body: '#121417', in: '#2a2e33', txt: '#d9b46a', pil: '#3a3f45' },
      wood: { lid: '#0b0b0c', body: '#060607', in: '#5a1220', txt: '#e5c98b', pil: '#7a1a2b' }
    }[c.box] || {};
    const brand = esc(String(c.brand).toUpperCase());
    let s = `<defs><linearGradient id="bx${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.lid}"/><stop offset="1" stop-color="${pal.body}"/></linearGradient></defs>`;
    s += `<path d="M70,40 L330,40 L350,170 L50,170 Z" fill="url(#bx${u})" stroke="#000" stroke-opacity=".4"/>`;
    s += `<path d="M86,54 L314,54 L330,158 L70,158 Z" fill="${pal.in}"/>`;
    if (c.box === 'wood') s += `<rect x="150" y="88" width="100" height="34" rx="3" fill="#c9cdd1" stroke="#7b8187"/>`;
    s += `<text x="200" y="${c.box === 'wood' ? 106 : 100}" font-size="17" font-family="'Space Grotesk',Arial" font-weight="700" letter-spacing="2" fill="${c.box === 'wood' ? '#2b2f33' : pal.txt}" text-anchor="middle">${brand}</text>`;
    s += `<text x="200" y="${c.box === 'wood' ? 118 : 120}" font-size="7.5" font-family="Inter,Arial" letter-spacing="2" fill="${c.box === 'wood' ? '#2b2f33' : pal.txt}" opacity=".85" text-anchor="middle">OFFICIAL TIMEPIECE COLLECTION</text>`;
    s += `<path d="M50,170 L350,170 L360,330 L40,330 Z" fill="${pal.body}" stroke="#000" stroke-opacity=".4"/>`;
    s += `<path d="M64,180 L336,180 L344,318 L56,318 Z" fill="${pal.in}"/>`;
    s += `<ellipse cx="200" cy="250" rx="92" ry="52" fill="${pal.pil}" stroke="rgba(0,0,0,.25)"/>`;
    s += `<svg x="128" y="172" width="144" height="158" viewBox="0 0 400 440">${frontInner(c, ++uid, false)}</svg>`;
    s += `<g transform="rotate(-6 300 300)"><rect x="248" y="276" width="92" height="56" rx="4" fill="#f7f4ec" stroke="#c9b98f"/><text x="294" y="294" font-size="7" font-family="Inter,Arial" font-weight="700" letter-spacing="1.5" fill="#8a6d2b" text-anchor="middle">VIP WARRANTY</text><text x="294" y="308" font-size="8" font-family="'Space Grotesk',Arial" font-weight="700" fill="#222" text-anchor="middle">${brand}</text><text x="294" y="322" font-size="7.5" font-family="JetBrains Mono,monospace" fill="#555" text-anchor="middle">NO. 001 / 050</text></g>`;
    return `<svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="表盒预览">${s}</svg>`;
  };
  // ---------- STEP 01-B：4 层改款部位分解图 ----------
  CF.zonesSVG = (c) => {
    const u = ++uid;
    const layer = (z, y, rx, ry, body, label, note) => `<g class="zl" data-z="${z}">
<ellipse class="zl__hit" cx="200" cy="${y}" rx="${rx + 14}" ry="${ry + 12}" fill="transparent"/>
${body}
<line x1="${200 + rx + 6}" y1="${y}" x2="372" y2="${y}" class="zl__ln"/>
<text x="376" y="${y - 3}" class="zl__t">${label}</text><text x="376" y="${y + 12}" class="zl__n">${note}</text></g>`;
    const ell = (y, rx, ry, fill, stroke, extra) => `<ellipse cx="200" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${extra || ''}`;
    let ticks = '';
    for (let i = 0; i < 60; i += 5) {
      const a = (i * 6 * Math.PI) / 180;
      ticks += `<line x1="${f1(200 + 106 * Math.sin(a))}" y1="${f1(70 - 31 * Math.cos(a))}" x2="${f1(200 + 92 * Math.sin(a))}" y2="${f1(70 - 27 * Math.cos(a))}" stroke="${LUME}" stroke-width="2"/>`;
    }
    const L4 = ell(70, 116, 34, '#101214', '#5d656c', `<ellipse cx="200" cy="70" rx="86" ry="25" fill="#0b0d0f" stroke="#3a4046"/>${ticks}`);
    const L3 = `<ellipse cx="200" cy="160" rx="70" ry="20" fill="none" stroke="#3a4046" stroke-dasharray="3 4"/><path d="M200,160 L160,146 L156,150 Z" fill="${LUME}" stroke="#777"/><path d="M200,160 L262,150 L264,155 Z" fill="${LUME}" stroke="#777"/><line x1="200" y1="160" x2="170" y2="172" stroke="${ORANGE}" stroke-width="2"/><circle cx="200" cy="160" r="5" fill="${ORANGE}"/>`;
    const col = CF.find('color', c.color).c;
    const L2 = `<defs><radialGradient id="zd${u}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${col[0]}"/><stop offset="1" stop-color="${col[1]}"/></radialGradient></defs>` + ell(250, 100, 29, `url(#zd${u})`, '#5d656c', `<text x="200" y="247" font-size="12" font-family="'Space Grotesk',Arial" font-weight="700" letter-spacing="2" fill="#f4f5f6" text-anchor="middle" transform="scale(1,.62) translate(0,${f1(250 / 0.62 - 250)})">${esc(String(c.brand).toUpperCase())}</text>`);
    const L1 = `<path d="M84,340 L84,362 A116,34 0 0,0 316,362 L316,340" fill="#6f777d" stroke="#a9b1b7"/>` + ell(340, 116, 34, '#a9b1b7', '#5d656c', `<ellipse cx="200" cy="340" rx="96" ry="27" fill="#4a5157"/><path d="M314,326 q20,4 18,14 q2,10 -18,14 Z" fill="#c4cbd0" stroke="#5d656c"/><rect x="330" y="334" width="12" height="12" rx="2" fill="#d5dade" stroke="#5d656c"/><rect x="140" y="374" width="120" height="16" fill="#1c1f23" opacity=".9"/>`);
    let s = `<defs><marker id="zh${u}" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${ORANGE}"/></marker></defs>`;
    s += `<line x1="200" y1="100" x2="200" y2="312" stroke="#3a4046" stroke-dasharray="2 5"/>`;
    s += layer(1, 340, 116, 34, L1, '① 公模表壳 + 护肩 + 表带', '4 款现成壳型');
    s += layer(2, 250, 100, 29, L2, '② 表盘与 Logo', '平面免模 / 立体开模');
    s += layer(3, 160, 70, 20, L3, '③ 指针', '90+ 款现成针 / 专属针');
    s += layer(4, 70, 116, 34, L4, '④ 表圈', '光圈 / 狗牙 / 陶瓷 / 测速');
    s += `<text x="350" y="318" font-size="10" font-family="JetBrains Mono,monospace" fill="${ORANGE}" text-anchor="end">护肩</text>`;
    return `<svg viewBox="0 0 560 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="4 层改款部位">${s}</svg>`;
  };

  // ---------- STEP 01-B：4 处印标位置 ----------
  CF.logoSVG = (c, n) => {
    const u = ++uid;
    const B = esc(String(c.brand).toUpperCase());
    const I = esc(CF.initials(c.brand));
    const tag = `<rect x="12" y="12" width="96" height="20" rx="10" fill="${ORANGE}"/><text x="60" y="26" font-size="10" font-family="JetBrains Mono,monospace" fill="#fff" text-anchor="middle">${['', 'DIAL', 'CROWN', 'CASEBACK', 'BUCKLE'][n]}</text>`;
    let s = `<defs><linearGradient id="lm${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f7"/><stop offset=".55" stop-color="#a9b1b7"/><stop offset="1" stop-color="#5d656c"/></linearGradient><radialGradient id="ld${u}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#3567cf"/><stop offset="1" stop-color="#0a1638"/></radialGradient></defs>`;
    if (n === 1) {
      s += `<circle cx="160" cy="105" r="78" fill="url(#lm${u})"/><circle cx="160" cy="105" r="66" fill="url(#ld${u})"/>`;
      for (let h = 0; h < 12; h++) { const a = pol(160, 105, 60, h * 30), b = pol(160, 105, 50, h * 30); s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${LUME}" stroke-width="4" stroke-linecap="round"/>`; }
      s += `<text x="160" y="82" font-size="14" font-family="'Space Grotesk',Arial" font-weight="700" letter-spacing="1.5" fill="#fff" text-anchor="middle">${B}</text><rect x="${160 - 58}" y="66" width="116" height="24" rx="4" fill="none" stroke="${ORANGE}" stroke-dasharray="4 3"/>`;
    } else if (n === 2) {
      s += `<rect x="40" y="60" width="120" height="90" rx="40" fill="url(#lm${u})"/><rect x="160" y="92" width="22" height="26" fill="#8e969c"/><rect x="182" y="70" width="56" height="70" rx="10" fill="url(#lm${u})" stroke="#5d656c"/>`;
      for (let y = 76; y < 136; y += 6) s += `<line x1="184" y1="${y}" x2="236" y2="${y}" stroke="#5d656c" stroke-width=".8"/>`;
      s += `<circle cx="270" cy="105" r="30" fill="url(#lm${u})" stroke="#5d656c"/><text x="270" y="111" font-size="18" font-family="'Space Grotesk',Arial" font-weight="700" fill="#2d3237" text-anchor="middle">${I}</text><circle cx="270" cy="105" r="36" fill="none" stroke="${ORANGE}" stroke-dasharray="4 3"/><line x1="238" y1="105" x2="250" y2="105" stroke="${ORANGE}"/>`;
    } else if (n === 3) {
      s += `<circle cx="160" cy="105" r="80" fill="url(#lm${u})" stroke="#5d656c"/><circle cx="160" cy="105" r="62" fill="none" stroke="#5d656c" opacity=".7"/>`;
      s += `<text x="160" y="92" font-size="14" font-family="'Space Grotesk',Arial" font-weight="700" fill="#2d3237" text-anchor="middle">${B}</text><text x="160" y="108" font-size="7.5" font-family="Inter,Arial" letter-spacing="2" fill="#2d3237" text-anchor="middle">LIMITED EDITION</text><text x="160" y="132" font-size="17" font-family="JetBrains Mono,monospace" font-weight="700" fill="${ORANGE}" text-anchor="middle">001 / 050</text>`;
    } else {
      s += `<rect x="40" y="88" width="80" height="34" fill="#1c1f23"/><rect x="200" y="88" width="80" height="34" fill="#1c1f23"/><rect x="118" y="72" width="84" height="66" rx="12" fill="none" stroke="url(#lm${u})" stroke-width="12"/><rect x="156" y="66" width="8" height="78" rx="4" fill="url(#lm${u})"/>`;
      s += `<text x="160" y="161" font-size="11" font-family="'Space Grotesk',Arial" font-weight="700" letter-spacing="1.5" fill="#c9ced2" text-anchor="middle">${B}</text><rect x="104" y="148" width="112" height="20" rx="4" fill="none" stroke="${ORANGE}" stroke-dasharray="4 3"/>`;
    }
    return `<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" role="img">${tag}${s}</svg>`;
  };
})(window.CF);
