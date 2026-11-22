// CHRONO.FOUNDRY 首页选配：选项数据与价格模型（US$，50 只基准价）
// p = 每只加价；t = 一次性模具费（每款收一次，翻单免收）
window.CF = window.CF || {};
(function (CF) {
  CF.OPT = {
    func: [
      { v: '3h', n: '经典三针款', d: '大三针 / 日历', p: 0 },
      { v: 'chrono', n: '六针计时款', d: '三眼计时盘', p: 6.5 }
    ],
    power: [
      { v: 'quartz', n: '石英机芯', d: '薄壳 ≈ 9.6mm' },
      { v: 'auto', n: '机械机芯', d: '壳厚 ≈ 11.6mm' }
    ],
    shape: [
      { v: 'round', n: '经典圆壳', d: '百搭潜水 / 正装', p: 0 },
      { v: 'cushion', n: '枕形鲍鱼壳', d: '弧形宽肩 · 复古', p: 2 },
      { v: 'octagon', n: '八角运动壳', d: '硬朗折线 · 运动', p: 3.5 },
      { v: 'tonneau', n: '酒桶壳', d: '流线曲面 · 先锋', p: 4.5 }
    ],
    size: [
      { v: 38, n: '38mm 小巧', d: '耳距 45 · 带宽 18' },
      { v: 40, n: '40mm 标准', d: '耳距 47.5 · 带宽 20' },
      { v: 42, n: '42mm 硬朗', d: '耳距 50 · 带宽 22' }
    ],
    guard: [
      { v: 'std', n: '标准护肩', d: '保留护冠', p: 0 },
      { v: 'flat', n: '无护肩铣平', d: 'CNC 铣平', p: 2 },
      { v: 'facet', n: '切面护肩', d: '棱角切面', p: 4 }
    ],
    strap: [
      { v: 'steel', n: '实心钢带', d: '拉丝 · 折叠扣', p: 38 },
      { v: 'rubber', n: '氟橡胶带', d: '防水 · 针扣', p: 32 },
      { v: 'leather', n: '真皮表带', d: '小牛皮 · 针扣', p: 30 }
    ],
    plate: [
      { v: 'steel', n: '精钢本色', p: 0 },
      { v: 'gun', n: '枪灰色', p: 2.5 },
      { v: 'rose', n: '玫瑰金', p: 3 },
      { v: 'dlc', n: '黑 DLC', p: 3.5 }
    ],
    back: [
      { v: 'solid', n: '实心钢底', d: '刻品牌与 001/050 编号', p: 0 },
      { v: 'open', n: '透明底 · 原厂摆陀', d: '仅机械机芯', p: 2.5, auto: true },
      { v: 'rotor', n: '透明底 · 定制摆陀', d: '金色品牌摆陀', p: 5.5, auto: true }
    ],
    bezel: [
      { v: 'polish', n: '抛光光圈', d: '简约正装', p: 0 },
      { v: 'coin', n: '立体狗牙圈', d: '经典切面', p: 3.5 },
      { v: 'ceramic', n: '夜光陶瓷圈', d: '200M 潜水', p: 6.5 },
      { v: 'tachy', n: '测速刻度圈', d: '赛车计时', p: 4.5 }
    ],
    scale: [
      { v: 'pub', n: '现成公模刻度', d: '潜水 / 测速 / 光圈', p: 0 },
      { v: 'own', n: '定制专属刻度', d: '12 点印品牌缩写', p: 0, t: 180 }
    ],
    dial: [
      { v: 'sun', n: '普通表盘', d: '太阳纹 / 哑光 / 喷砂', p: 6 },
      { v: 'emb', n: '3D 油压表盘', d: '立体格纹', p: 8.5, t: 240 }
    ],
    color: [
      { v: 'blue', n: '午夜蓝', c: ['#3567cf', '#0a1638'] },
      { v: 'black', n: '曜石黑', c: ['#454b53', '#07090b'] },
      { v: 'green', n: '墨绿', c: ['#2f7d5c', '#082419'] },
      { v: 'silver', n: '银白', c: ['#fbfbfa', '#b4bbc2'], light: true },
      { v: 'panda', n: '熊猫盘', c: ['#fbfbf8', '#dfe2e4'], light: true }
    ],
    logo: [
      { v: 'print', n: '平面移印 Logo', d: '线条清晰', p: 0 },
      { v: 'metal', n: '立体金属字钉', d: '专柜级 3D 金属', p: 1.5, t: 65 }
    ],
    hands: [
      { v: 'std', n: '普通公模针', d: '90+ 款，可改色', p: 3.5 },
      { v: 'lume', n: '瑞士夜光公模针', d: '剑形 · C3 夜光', p: 4.5 },
      { v: 'own', n: '私模异形针', d: '秒针尾带品牌标', p: 5.5, t: 220 }
    ],
    box: [
      { v: 'eco', n: '防雾简装盒', d: 'EVA 内托 + 保修卡', p: 0 },
      { v: 'pu', n: '专柜皮盒套装', d: '烫金 Logo + VIP 卡', p: 4.5 },
      { v: 'wood', n: '钢琴漆木盒', d: '实木 + 金属铭牌', p: 9.5 }
    ]
  };

  // 机芯参考价（US$/只，批量采购区间，下单按当期实价；不计入套壳总价）
  CF.MV = {
    '3h-auto': [
      { k: 'NH35A', n: '日本精工 NH35A 自动', r: [26, 32] },
      { k: '9015', n: '日本 Miyota 9015 自动', r: [55, 70] },
      { k: 'SW200', n: '瑞士 Sellita SW200-1 自动', r: [180, 230] }
    ],
    '3h-quartz': [
      { k: '2035', n: '日本 Miyota 2035 石英', r: [3, 5] },
      { k: '515', n: '瑞士 Ronda 515 石英', r: [12, 18] }
    ],
    'chrono-quartz': [
      { k: 'VK63', n: '日本精工 VK63 机械石英计时', r: [30, 38] },
      { k: 'OS20', n: '日本 Miyota OS20 石英计时', r: [10, 14] }
    ],
    'chrono-auto': [
      { k: 'ST19', n: '海鸥 ST1901 手动计时', r: [95, 130] },
      { k: 'SW510', n: '瑞士 Sellita SW510 自动计时', r: [650, 800] }
    ]
  };
  CF.MV_OWN = { k: 'OWN', n: '客户自带机芯（免费装配）', r: [0, 0] };
  CF.THICK = { '3h-quartz': 9.6, '3h-auto': 11.6, 'chrono-quartz': 11.4, 'chrono-auto': 13.8 };
  CF.SIZE = { 38: { l2l: 45, strap: 18 }, 40: { l2l: 47.5, strap: 20 }, 42: { l2l: 50, strap: 22 } };

  const A = { func: '3h', power: 'auto', mv: 'NH35A', shape: 'round', size: 40, guard: 'std', strap: 'rubber', plate: 'steel', back: 'solid', bezel: 'ceramic', scale: 'pub', dial: 'sun', color: 'blue', logo: 'print', hands: 'lume', box: 'pu', render: false };
  const B = Object.assign({}, A, { func: 'chrono', power: 'quartz', mv: 'VK63', shape: 'octagon', size: 42, strap: 'steel', bezel: 'tachy', color: 'panda' });
  const C = Object.assign({}, A, { size: 38, guard: 'flat', strap: 'leather', plate: 'rose', back: 'rotor', bezel: 'polish', color: 'silver', logo: 'metal', hands: 'std', box: 'wood' });
  CF.PRESET = { A: A, B: B, C: C };

  CF.CASES = [
    { tag: '款式 A // 200M 潜水风', side: '经典圆壳 · 40mm', name: '深海潜航者 · 潜水表', mod: '夜光陶瓷圈 + 太阳纹蓝盘 + 立体金属标', fit: '独立品牌主力款', cfg: Object.assign({}, A, { logo: 'metal' }) },
    { tag: '款式 B // 六针赛车风', side: '八角运动壳 · 42mm', name: '银石赛道 · 熊猫盘计时表', mod: '测速圈 + 3D 油压熊猫盘 + 切面护肩', fit: '潮牌 / 赛车联名', cfg: Object.assign({}, B, { dial: 'emb', guard: 'facet' }) },
    { tag: '款式 C // 极简正装风', side: '38mm · 铣平无护肩', name: '包豪斯 · 无护肩正装表', mod: '铣平护肩 + 定制摆陀 + 玫瑰金电镀', fit: '设计师礼赠 / 对表', cfg: C }
  ];

  CF.find = (k, v) => CF.OPT[k].find((o) => o.v === v) || CF.OPT[k][0];
  CF.mvList = (c) => CF.MV[c.func + '-' + c.power];
  CF.mvOf = (c) => (c.mv === 'OWN' ? CF.MV_OWN : CF.mvList(c).find((m) => m.k === c.mv) || CF.mvList(c)[0]);

  // 单只套壳价拆分（不含机芯、未打折）
  CF.unit = (c) => {
    const f = (k) => CF.find(k, c[k]).p || 0;
    const u = {
      shell: f('strap') + f('shape'),
      guardBack: f('guard') + f('back'),
      plate: f('plate'),
      bezel: f('bezel'),
      dial: f('dial') + f('logo') + f('func'),
      handsBox: f('hands') + f('box')
    };
    u.sum = u.shell + u.guardBack + u.plate + u.bezel + u.dial + u.handsBox;
    return u;
  };

  // 一次性模具与服务费
  CF.tooling = (c) => {
    const out = [];
    ['scale', 'dial', 'logo', 'hands'].forEach((k) => {
      const o = CF.find(k, c[k]);
      if (o.t) out.push({ n: o.n, t: o.t });
    });
    return out;
  };

  CF.discount = (q) => {
    if (q >= 200) return { r: 0.86, label: '200 只+ · 86 折' };
    if (q >= 100) return { r: 0.92, label: '100 只+ · 92 折' };
    return { r: 1, label: '50 只基准价' };
  };

  CF.initials = (b) => {
    const w = String(b).trim().split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || 'CF').slice(0, 2)).toUpperCase();
  };
})(window.CF);
