import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// 快三点位：用 public/K3-ball/{1-6}.png 骰子图渲染点数（单/对/豹子按数量调整大小）
const renderDiceOptionName = (name) => {
  if (/^\d+$/.test(name)) {
    const digits = name.split('');
    // 点位区改成两行撑满后卡片只有 ~69px，原本 42/32/24 的骰子会顶到卡片上缘，
    // 所以整体缩一级，留出上下留白
    const size = digits.length === 1 ? 30 : digits.length === 2 ? 26 : 20;
    return (
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center' }}>
        {digits.map((val, idx) => (
          <img key={idx} src={`K3-ball/${val}.png`} alt={val} style={{ width: `${size}px`, height: `${size}px` }} />
        ))}
      </div>
    );
  }
  return name;
};

// 快三 二同号/三不同：三颗骰子「上一下二」金字塔排列
const renderDicePyramid = (name) => {
  const digits = name.split('');
  const size = 22;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <img src={`K3-ball/${digits[0]}.png`} alt={digits[0]} style={{ width: `${size}px`, height: `${size}px` }} />
      <div style={{ display: 'flex', gap: '2px' }}>
        <img src={`K3-ball/${digits[1]}.png`} alt={digits[1]} style={{ width: `${size}px`, height: `${size}px` }} />
        <img src={`K3-ball/${digits[2]}.png`} alt={digits[2]} style={{ width: `${size}px`, height: `${size}px` }} />
      </div>
    </div>
  );
};

// 彩票盘口统一配色（百家乐除外）：
// 大/单/和大/和单 = 粉红，小/双/和小/和双 = 粉蓝，和/全豹 = 黄
const LOTTERY_PINK = '#e6157a';
const LOTTERY_BLUE = '#12b5c9';
const LOTTERY_YELLOW = '#f5b301';
const LOTTERY_COLOR = {
  '大': LOTTERY_PINK, '单': LOTTERY_PINK, '和大': LOTTERY_PINK, '和单': LOTTERY_PINK,
  '小': LOTTERY_BLUE, '双': LOTTERY_BLUE, '和小': LOTTERY_BLUE, '和双': LOTTERY_BLUE,
  '和': LOTTERY_YELLOW, '全豹': LOTTERY_YELLOW
};
const lotteryColor = (name) => LOTTERY_COLOR[name];

// Mark Six (六合彩) number color mapping
const M6_RED_NUMS = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
const M6_BLUE_NUMS = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
const M6_ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const getM6BallColor = (num) => {
  if (M6_RED_NUMS.includes(num)) return 'red';
  if (M6_BLUE_NUMS.includes(num)) return 'blue';
  return 'green';
};

// ===== 一分六合彩 专业版玩法资料（依 docs/六合彩玩法结构.md） =====
const M6P_NUMS = Array.from({ length: 49 }, (_, i) => i + 1);
const m6pPad = (n) => String(n).padStart(2, '0');
// §4.1 配色：成对玩法「大系」蓝、「小系」橘，波色用各自色码
const M6P_BLUE = '#3b82f6';
const M6P_ORANGE = '#f59e0b';
const M6P_GRAY = '#cbd5e1';
const M6P_BO = { 红: '#e3342f', 绿: '#16a34a', 蓝: '#2563eb' };
const M6P_ORANGE_NAMES = ['小', '双', '合小', '合双', '小单', '小双', '尾小', '野兽', '虎', '总和小', '总和双', '总尾小', '总肖双'];
// 只有成对的两面点位套蓝橘；总肖 2肖~7肖 之类的数量点位用深色
const M6P_BLUE_NAMES = [
  '大', '单', '合大', '合单', '大单', '大双', '尾大', '家禽', '龙', '总和大', '总和单', '总尾大',
  '1-10', '11-20', '21-30', '31-40', '41-49', '总肖单'
];
const m6pBetColor = (name) => {
  if (name === '红波') return M6P_BO['红'];
  if (name === '绿波') return M6P_BO['绿'];
  if (name === '蓝波') return M6P_BO['蓝'];
  if (name === '和局') return '#9ca3af';
  if (M6P_ORANGE_NAMES.includes(name)) return M6P_ORANGE;
  if (M6P_BLUE_NAMES.includes(name)) return M6P_BLUE;
  return '#1e293b';
};

const M6P_ZHENGTE_NAMES = ['一', '二', '三', '四', '五', '六'];
// 第一层玩法（「长龙」为走势统计页、非投注玩法，不纳入盘面）
// 特码A/B、正特一~六 原本是大类底下的分页，这里提到第一层，让盘面维持两层
const M6P_PLAY_TABS = [
  { cat: 'temaA', label: '特码A' },
  { cat: 'temaB', label: '特码B' },
  { cat: 'zhengma', label: '正码' },
  ...M6P_ZHENGTE_NAMES.map((c, i) => ({ cat: `zhengte${i + 1}`, label: `正特${c}` })),
  { cat: 'texiao', label: '特肖' },
  { cat: 'zhengxiao', label: '正肖' },
  { cat: 'yixiao', label: '一肖' },
  { cat: 'yixiao-no', label: '一肖不中' },
  { cat: 'weishu', label: '尾数' },
  { cat: 'weishu-no', label: '尾数不中' },
  { cat: 'tetoushu', label: '特头数' },
  { cat: 'teweishu', label: '特尾数' },
  { cat: 'banbo', label: '半波' },
  { cat: 'wuxing', label: '五行' },
  { cat: 'zongxiao', label: '总肖' },
  { cat: 'qisebo', label: '七色波' },
  { cat: 'hexiao', label: '合肖' },
  { cat: 'lianma', label: '连码' },
  { cat: 'buzhong', label: '不中' }
];
// 第二层小类；合肖/连码/不中 另带 n（每注需选几个）与该小类赔率
const M6P_NUM_SIDE_TABS = [{ key: 'num', label: '数字' }, { key: 'sides', label: '两面' }];
const M6P_SUB_TABS = {
  temaA: M6P_NUM_SIDE_TABS,
  temaB: M6P_NUM_SIDE_TABS,
  zhengma: M6P_NUM_SIDE_TABS,
  ...Object.fromEntries(M6P_ZHENGTE_NAMES.map((c, i) => [`zhengte${i + 1}`, M6P_NUM_SIDE_TABS])),
  hexiao: [
    { key: 'x2', label: '二肖', n: 2, odds: '6' },
    { key: 'x3', label: '三肖', n: 3, odds: '4' },
    { key: 'x4', label: '四肖', n: 4, odds: '3' },
    { key: 'x5', label: '五肖', n: 5, odds: '2.4' },
    { key: 'x6', label: '六肖', n: 6, odds: '2' },
    { key: 'x7', label: '七肖', n: 7, odds: '1.71' },
    { key: 'x8', label: '八肖', n: 8, odds: '1.5' },
    { key: 'x9', label: '九肖', n: 9, odds: '1.33' },
    { key: 'x10', label: '十肖', n: 10, odds: '1.2' },
    { key: 'x11', label: '十一肖', n: 11, odds: '1.09' }
  ],
  lianma: [
    { key: 'q4', label: '四全中', n: 4, odds: '9000' },
    { key: 'q3', label: '三全中', n: 3, odds: '600' },
    { key: 's32', label: '三中二', n: 3, odds: '100' },
    { key: 'q2', label: '二全中', n: 2, odds: '65' },
    { key: 'e2t', label: '二中特', n: 2, odds: '50' },
    { key: 'tc', label: '特串', n: 2, odds: '150' }
  ],
  buzhong: [
    { key: 'b4', label: '四不中', n: 4, odds: '1.19' },
    { key: 'b5', label: '五不中', n: 5, odds: '1.41' },
    { key: 'b6', label: '六不中', n: 6, odds: '1.68' },
    { key: 'b7', label: '七不中', n: 7, odds: '2.0' },
    { key: 'b8', label: '八不中', n: 8, odds: '2.4' },
    { key: 'b9', label: '九不中', n: 9, odds: '2.9' },
    { key: 'b10', label: '十不中', n: 10, odds: '3.51' },
    { key: 'b11', label: '十一不中', n: 11, odds: '4.28' },
    { key: 'b12', label: '十二不中', n: 12, odds: '5.25' }
  ]
};
const M6P_COMBO_TABS = ['hexiao', 'lianma', 'buzhong'];
// 走「数字 / 两面」两个小类的玩法
const M6P_NUMBER_TABS = ['temaA', 'temaB', 'zhengma', ...M6P_ZHENGTE_NAMES.map((_, i) => `zhengte${i + 1}`)];
const M6P_XIAO_TABS = ['texiao', 'zhengxiao', 'yixiao', 'yixiao-no'];
const M6P_WEI_TABS = ['weishu', 'weishu-no', 'teweishu'];

// §5.1 生肖 ↔ 号码（马年，01 = 马）
const M6P_ZODIAC_NUMS = {
  鼠: [7, 19, 31, 43], 牛: [6, 18, 30, 42], 虎: [5, 17, 29, 41], 兔: [4, 16, 28, 40],
  龙: [3, 15, 27, 39], 蛇: [2, 14, 26, 38], 马: [1, 13, 25, 37, 49], 羊: [12, 24, 36, 48],
  猴: [11, 23, 35, 47], 鸡: [10, 22, 34, 46], 狗: [9, 21, 33, 45], 猪: [8, 20, 32, 44]
};
// §5.2 / §5.3 尾数、头数
const M6P_TAIL_GROUPS = Array.from({ length: 10 }, (_, d) => ({ name: `${d}尾`, nums: M6P_NUMS.filter(n => n % 10 === d) }));
const M6P_HEAD_GROUPS = Array.from({ length: 5 }, (_, h) => ({ name: `${h}头`, nums: M6P_NUMS.filter(n => Math.floor(n / 10) === h) }));
// §3.8 五行（2026 年版本）
const M6P_WUXING = [
  { name: '金', odds: '4.2', nums: [4, 5, 12, 13, 26, 27, 34, 35, 42, 43] },
  { name: '木', odds: '4.2', nums: [8, 9, 16, 17, 24, 25, 38, 39, 46, 47] },
  { name: '水', odds: '4.74', nums: [1, 14, 15, 22, 23, 30, 31, 44, 45] },
  { name: '火', odds: '3.38', nums: [2, 3, 10, 11, 18, 19, 32, 33, 40, 41, 48, 49] },
  { name: '土', odds: '5.42', nums: [6, 7, 20, 21, 28, 29, 36, 37] }
];
// §3.7 半波：3 波色 × 10 属性
const M6P_BANBO = [
  { name: '红大', odds: '6.15', nums: [29, 30, 34, 35, 40, 45, 46] },
  { name: '红小', odds: '4.1', nums: [1, 2, 7, 8, 12, 13, 18, 19, 23, 24] },
  { name: '红单', odds: '5.3', nums: [1, 7, 13, 19, 23, 29, 35, 45] },
  { name: '红双', odds: '4.63', nums: [2, 8, 12, 18, 24, 30, 34, 40, 46] },
  { name: '红合单', odds: '4.63', nums: [1, 7, 12, 18, 23, 29, 30, 34, 45] },
  { name: '红合双', odds: '5.3', nums: [2, 8, 13, 19, 24, 35, 40, 46] },
  { name: '红大单', odds: '15.3', nums: [29, 35, 45] },
  { name: '红小单', odds: '8.9', nums: [1, 7, 13, 19, 23] },
  { name: '红大双', odds: '11.3', nums: [30, 34, 40, 46] },
  { name: '红小双', odds: '8.9', nums: [2, 8, 12, 18, 24] },
  { name: '蓝大', odds: '4.63', nums: [25, 26, 31, 36, 37, 41, 42, 47, 48] },
  { name: '蓝小', odds: '6.15', nums: [3, 4, 9, 10, 14, 15, 20] },
  { name: '蓝单', odds: '5.3', nums: [3, 9, 15, 25, 31, 37, 41, 47] },
  { name: '蓝双', odds: '5.3', nums: [4, 10, 14, 20, 26, 36, 42, 48] },
  { name: '蓝合单', odds: '5.3', nums: [3, 9, 10, 14, 25, 36, 41, 47] },
  { name: '蓝合双', odds: '5.3', nums: [4, 15, 20, 26, 31, 37, 42, 48] },
  { name: '蓝大单', odds: '8.9', nums: [25, 31, 37, 41, 47] },
  { name: '蓝小单', odds: '15.3', nums: [3, 9, 15] },
  { name: '蓝大双', odds: '11.3', nums: [26, 36, 42, 48] },
  { name: '蓝小双', odds: '11.3', nums: [4, 10, 14, 20] },
  { name: '绿大', odds: '5.3', nums: [27, 28, 32, 33, 38, 39, 43, 44] },
  { name: '绿小', odds: '6.15', nums: [5, 6, 11, 16, 17, 21, 22] },
  { name: '绿单', odds: '5.3', nums: [5, 11, 17, 21, 27, 33, 39, 43] },
  { name: '绿双', odds: '6.15', nums: [6, 16, 22, 28, 32, 38, 44] },
  { name: '绿合单', odds: '5.3', nums: [5, 16, 21, 27, 32, 38, 43] },
  { name: '绿合双', odds: '5.3', nums: [6, 11, 17, 22, 28, 33, 39, 44] },
  { name: '绿大单', odds: '11.3', nums: [27, 33, 39, 43] },
  { name: '绿小单', odds: '11.3', nums: [5, 11, 17, 21] },
  { name: '绿大双', odds: '11.3', nums: [28, 32, 38, 44] },
  { name: '绿小双', odds: '15.3', nums: [6, 16, 22] }
];
// §3.9 / §3.10 总肖、七色波
const M6P_ZONGXIAO = [
  { name: '2肖', odds: '900' }, { name: '3肖', odds: '350' }, { name: '4肖', odds: '16.49' },
  { name: '5肖', odds: '2.56' }, { name: '6肖', odds: '1.47' }, { name: '7肖', odds: '5.07' },
  { name: '总肖单', odds: '1.37' }, { name: '总肖双', odds: '1.23' }
];
const M6P_QISEBO = [
  { name: '红波', odds: '2.13' }, { name: '绿波', odds: '2.53' },
  { name: '蓝波', odds: '2.53' }, { name: '和局', odds: '30.62' }
];
// §3.1 特码两面（A/B 两套赔率；合大、合小永久停用）
const M6P_TEMA_SIDES = [
  { name: '大', a: '1.3', b: '1.25' }, { name: '小', a: '1.3', b: '1.25' },
  { name: '单', a: '1.3', b: '1.25' }, { name: '双', a: '1.3', b: '1.25' },
  { name: '合大', a: null, b: null }, { name: '合小', a: null, b: null },
  { name: '合单', a: '1.3', b: '1.25' }, { name: '合双', a: '1.3', b: '1.25' },
  { name: '大单', a: '3.3', b: '3.2' }, { name: '小单', a: '3.3', b: '3.2' },
  { name: '大双', a: '3.3', b: '3.2' }, { name: '小双', a: '3.3', b: '3.2' },
  { name: '尾大', a: '1.3', b: '1.25' }, { name: '尾小', a: '1.3', b: '1.25' },
  { name: '家禽', a: '1.3', b: '1.25' }, { name: '野兽', a: '1.3', b: '1.25' },
  { name: '红波', a: '2.18', b: '2.1' }, { name: '绿波', a: '2.36', b: '2.28' }, { name: '蓝波', a: '2.36', b: '2.28' },
  { name: '1-10', a: '4.2', b: '4.1' }, { name: '11-20', a: '4.2', b: '4.1' },
  { name: '21-30', a: '4.2', b: '4.1' }, { name: '31-40', a: '4.2', b: '4.1' }, { name: '41-49', a: '4.74', b: '4.6' }
];
// §3.2 正码两面（一律 1.3）
const M6P_ZHENGMA_SIDES = ['总和大', '总和小', '总和单', '总和双', '总尾大', '总尾小', '龙', '虎'].map(name => ({ name, odds: '1.3' }));
// §3.3 正特两面
const M6P_ZHENGTE_SIDES = [
  ...['大', '小', '单', '双', '合大', '合小', '合单', '合双', '尾大', '尾小'].map(name => ({ name, odds: '1.3' })),
  { name: '红波', odds: '2.18' }, { name: '绿波', odds: '2.36' }, { name: '蓝波', odds: '2.36' }
];
// C(m, n)
const m6pNck = (m, n) => {
  if (n <= 0 || m < n) return 0;
  let r = 1;
  for (let i = 0; i < n; i++) r = (r * (m - i)) / (i + 1);
  return Math.round(r);
};
const m6pCombinations = (arr, n) => {
  const out = [];
  const walk = (start, cur) => {
    if (cur.length === n) { out.push([...cur]); return; }
    for (let i = start; i < arr.length; i++) { cur.push(arr[i]); walk(i + 1, cur); cur.pop(); }
  };
  walk(0, []);
  return out;
};

// 鱼虾蟹（魚蝦蟹）六面图案 —— 图标来自 public/鱼虾蟹/
// 盘面顺序：鱼 虾 葫芦 / 金钱 蟹 鸡
const FISH_CRAB_SYMBOLS = [
  { key: 'fish', label: '鱼', icon: '鱼虾蟹/鱼.svg', color: '#e03131' },
  { key: 'prawn', label: '虾', icon: '鱼虾蟹/虾.svg', color: '#2f9e44' },
  { key: 'gourd', label: '葫芦', icon: '鱼虾蟹/葫芦.svg', color: '#1971c2' },
  { key: 'coin', label: '金钱', icon: '鱼虾蟹/金钱.svg', color: '#1971c2' },
  { key: 'crab', label: '蟹', icon: '鱼虾蟹/蟹.svg', color: '#2f9e44' },
  { key: 'rooster', label: '鸡', icon: '鱼虾蟹/鸡.svg', color: '#c2255c' }
];

// ===== 百家乐 (Baccarat) 配置 —— 扑克牌素材来自 public/poker/{花色}/{点数}.svg =====
const BAC_C = { banker: '#e5405e', player: '#12a5cf', tie: '#2fb344', gold: '#e8912a' };
// 庄闲：庄/闲左右两列（竖），和/庄幸运6 中间上下
const BAC_MAIN = [
  { name: '庄', odds: '1.95', color: BAC_C.banker, area: 'z' },
  { name: '和', odds: '9.0', color: BAC_C.tie, area: 'h' },
  { name: '庄幸运6', odds: '12.0', color: BAC_C.gold, area: 'l' },
  { name: '闲', odds: '2.0', color: BAC_C.player, area: 'x' }
];
const BAC_PAIR = [
  { name: '庄对', odds: '12.0', color: BAC_C.banker },
  { name: '闲对', odds: '12.0', color: BAC_C.player },
  { name: '任意对子', odds: '6.0', color: BAC_C.tie },
  { name: '完美对子', odds: '26.0', color: BAC_C.gold }
];
const BAC_SIDES = [
  { name: '闲单', odds: '1.96', color: BAC_C.player },
  { name: '闲双', odds: '1.96', color: BAC_C.player },
  { name: '庄单', odds: '1.96', color: BAC_C.banker },
  { name: '庄双', odds: '1.96', color: BAC_C.banker }
];
// 百家乐点数：A=1，10/J/Q/K=0，其余按面值；总和取个位
const bacCardPoint = (rank) => (rank === 'A' ? 1 : ['10', 'J', 'Q', 'K'].includes(rank) ? 0 : parseInt(rank, 10));
const bacHandPoints = (cards) => cards.reduce((s, c) => s + bacCardPoint(c.rank), 0) % 10;

// ===== 动物运动会（冠军玩法）—— 开奖用 public/T-ball/T{1-6}.svg =====
const ANIMAL_C = { blue: '#5b7cf5', orange: '#f0a83a' };
const ANIMAL_TWOSIDES = [
  { name: '大', color: ANIMAL_C.blue }, { name: '小', color: ANIMAL_C.orange },
  { name: '单', color: ANIMAL_C.blue }, { name: '双', color: ANIMAL_C.orange },
  { name: '龙', color: ANIMAL_C.blue }, { name: '虎', color: ANIMAL_C.orange }
];

// ===== 体育赛事直播间（滚球盘）=====
// 专属直播间：只有这场比赛的盘口，不提供切换到其他游戏
// 简易版玩法页签：每种底下都是「大／小」两个点位（各占一半宽）
// 实际盘口方给的大小玩法数量不一定，页签列可左右滑动，房间用 board 指定要开哪一组
const spOU = (cat, label, line, overOdds, underOdds) => ({
  cat,
  label,
  options: [
    { name: '大', line, odds: overOdds },
    { name: '小', line, odds: underOdds }
  ]
});

const SPORTS_BOARDS = {
  // 基本盘：只开全场三种大小
  default: [
    spOU('total', '总分大小', '139.5', '1.84', '1.74'),
    spOU('home', '主队总分大小', '76.5', '1.74', '1.84'),
    spOU('away', '客队总分大小', '62.5', '1.83', '1.75')
  ],
  // 全盘口：全场 + 上下半场 + 各节，页签需要横向滑动
  full: [
    spOU('total', '总分大小', '172.5', '1.81', '1.85'),
    spOU('home', '主队总分大小', '92.5', '1.81', '1.83'),
    spOU('away', '客队总分大小', '80.5', '1.83', '1.81'),
    spOU('half1', '上半场总分大小', '86.5', '1.82', '1.84'),
    spOU('half2', '下半场总分大小', '85.5', '1.85', '1.81'),
    spOU('q1', '第一节总分大小', '43.5', '1.80', '1.86'),
    spOU('q2', '第二节总分大小', '42.5', '1.84', '1.82'),
    spOU('q3', '第三节总分大小', '43.5', '1.79', '1.87'),
    spOU('q4', '第四节总分大小', '44.5', '1.87', '1.77'),
    spOU('q4home', '第四节主队总分大小', '25.5', '1.76', '1.88'),
    spOU('q4away', '第四节客队总分大小', '19.5', '1.83', '1.81')
  ]
};

// 专业版盘面：内容比照「体育」页里的更多玩法（PageSportsMorePlay）
const SPORTS_PRO_FILTERS = [
  { id: 'hot', label: '热门' },
  { id: 'all', label: '全部' },
  { id: 'handicap_ou', label: '让球&大小' },
  { id: 'half', label: '半场' },
  { id: 'full', label: '全场' },
  { id: 'correct_score', label: '波胆' }
];

const SPORTS_PRO_MARKETS = [
  {
    key: 'handicap',
    title: '全场让球',
    filters: ['hot', 'all', 'handicap_ou', 'full'],
    options: [
      { name: '主队 -1', odds: '1.77' },
      { name: '客队 +1', odds: '2.01' },
      { name: '主队 -1/1.5', odds: '2.04' },
      { name: '客队 +1/1.5', odds: '1.74' }
    ]
  },
  {
    key: 'ou',
    title: '全场大小',
    filters: ['hot', 'all', 'handicap_ou', 'full'],
    options: [
      { name: '大 3', odds: '1.96' },
      { name: '小 3', odds: '1.82' },
      { name: '大 2.5/3', odds: '1.72' },
      { name: '小 2.5/3', odds: '2.06' }
    ]
  },
  {
    key: 'half_ou',
    title: '上半场大小',
    filters: ['hot', 'all', 'half'],
    options: [
      { name: '大 1', odds: '2.01' },
      { name: '小 1', odds: '1.77' }
    ]
  }
];

// ===== 历史开奖：各游戏共用的开奖号产生器（纯前端 mock）=====
// 有历史开奖记录的分钟彩（澳门六合彩每天一开，另外处理）
const DRAW_HISTORY_GAMES = ['fast3', 'marksix', 'speedrace', 'ffc', 'lucky28', 'fishcrab', 'baccarat', 'animal'];
// 各游戏进场时画面上显示的开奖号（同时作为历史记录的第一笔）
const INITIAL_DRAW = {
  fast3: [1, 3, 6],
  marksix: [23, 41, 24, 26, 33, 7, 32],
  lhcday: [23, 41, 24, 26, 33, 7, 32],
  speedrace: [1, 2, 7, 9, 4, 10, 6, 5, 8, 3],
  ffc: [3, 8, 1, 6, 0],
  lucky28: [9, 8, 0],
  fishcrab: ['fish', 'coin', 'rooster'],
  // 补牌示例：闲 2♠3♦=5点→补 4♣=9点；庄 4♥A♠=5点，闲三张为4→补 2♦=7点
  baccarat: {
    player: [{ suit: 'spade', rank: '2' }, { suit: 'diamond', rank: '3' }, { suit: 'club', rank: '4' }],
    banker: [{ suit: 'heart', rank: '4' }, { suit: 'spade', rank: 'A' }, { suit: 'diamond', rank: '2' }]
  },
  animal: [3, 1, 5, 2, 6, 4]
};
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// 1~n 洗牌（赛车名次、六合彩不重复号码用）
const rndShuffle = (n) => {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rndInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const BAC_SUITS = ['spade', 'heart', 'diamond', 'club'];
const BAC_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const rndBacCard = () => ({ suit: BAC_SUITS[rndInt(0, 3)], rank: BAC_RANKS[rndInt(0, 12)] });
// 百家乐简化补牌：双方各两张，无例牌(8/9)且点数 ≤5 时补第三张
const rndBacDeal = () => {
  const player = [rndBacCard(), rndBacCard()];
  const banker = [rndBacCard(), rndBacCard()];
  if (bacHandPoints(player) < 8 && bacHandPoints(banker) < 8) {
    if (bacHandPoints(player) <= 5) player.push(rndBacCard());
    if (bacHandPoints(banker) <= 5) banker.push(rndBacCard());
  }
  return { player, banker };
};
// 产生某游戏一期的开奖号
const randomDrawResult = (gameKey) => {
  switch (gameKey) {
    case 'fast3': return [rndInt(1, 6), rndInt(1, 6), rndInt(1, 6)];
    case 'marksix':
    case 'lhcday': return rndShuffle(49).slice(0, 7);
    case 'speedrace': return rndShuffle(10);
    case 'ffc': return Array.from({ length: 5 }, () => rndInt(0, 9));
    case 'lucky28': return Array.from({ length: 3 }, () => rndInt(0, 9));
    case 'fishcrab': return Array.from({ length: 3 }, () => FISH_CRAB_SYMBOLS[rndInt(0, 5)].key);
    case 'baccarat': return rndBacDeal();
    case 'animal': return rndShuffle(6);
    default: return [];
  }
};

export default function ModalVideoPlayer({ embedded = false, onClose, initialGame, matchTitle, sportsBoard } = {}) {
  const {
    balance,
    updateBalance,
    videoPlayerActive,
    setVideoPlayerActive,
    activeVideo,
    setActivePage,
    quickAmounts,
    setEditQuickAmountsActive,
    openBetDetailsModal,
    showToast
  } = useApp();

  // Local state for embedded Fast Three
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(55);
  const [phase, setPhase] = useState('betting'); // 'betting' | 'sealed'（封盘含开奖）
  const [issue, setIssue] = useState(202606041274);
  const [lastDice, setLastDice] = useState(INITIAL_DRAW.fast3);
  const [analysis, setAnalysis] = useState({ sum: 10, size: '小', oe: '双' });
  // 各彩票游戏的历史开奖记录（点抬头开奖结果区展开的弹窗；纯前端 mock）
  const [drawHistoryOpen, setDrawHistoryOpen] = useState(false);
  const [drawHistory, setDrawHistory] = useState(() => {
    const start = 202606041274 - 1; // 上一期起往前推
    const store = {};
    DRAW_HISTORY_GAMES.forEach(key => {
      store[key] = Array.from({ length: 12 }, (_, i) => ({
        period: start - i,
        result: i === 0 ? INITIAL_DRAW[key] : randomDrawResult(key)
      }));
    });
    // 澳门六合彩每天一开，期号用日期往前推
    store.lhcday = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Date.now() - (i + 1) * 86400000);
      return {
        period: `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`,
        result: i === 0 ? INITIAL_DRAW.lhcday : randomDrawResult('lhcday')
      };
    });
    return store;
  });

  // Betting states
  const [activeTab, setActiveTab] = useState('size'); // size, pair, triple, sum, single
  const [selectedOdds, setSelectedOdds] = useState(new Set());
  // 一分快三 专业版盘面（样式同一分分分彩）
  const [f3SimpleMode, setF3SimpleMode] = useState(true); // false=专业版, true=简易版（彩票一律预设简易版）
  const [selectedF3P, setSelectedF3P] = useState(new Set()); // 专业版选中点位 key `${category}|${name}`
  const [f3PlayTab, setF3PlayTab] = useState('army'); // 玩法：army(三军) short(短牌) long(长牌) triple(全骰) sum(和值) ...
  const [betAmount, setBetAmount] = useState(50);
  const [manualAmount, setManualAmount] = useState('');
  const [manualFocused, setManualFocused] = useState(false); // 是否聚焦「输入金额」

  // Mark Six (六合彩) embedded selections: each entry is { name, odds, category }
  const [selectedM6, setSelectedM6] = useState(new Set());
  const [m6ActiveTab, setM6ActiveTab] = useState('two-sides'); // two-sides, color, zodiac, special
  // 六合彩 专业版盘面（依 docs/六合彩玩法结构.md）
  const [m6SimpleMode, setM6SimpleMode] = useState(true); // false=专业版, true=简易版（彩票一律预设简易版）
  const [selectedM6P, setSelectedM6P] = useState(new Set()); // 专业版选中点位 key `${category}|${name}`
  const [m6PlayTab, setM6PlayTab] = useState('temaA'); // 第一层玩法
  const [m6SubTab, setM6SubTab] = useState('num'); // 第二层小类
  // 六合彩盘口（A~D 只整体缩放赔率，不改变任何玩法）
  const [lhcPan, setLhcPan] = useState('A');
  const [lhcPanOpen, setLhcPanOpen] = useState(false);
  // 澳门六合彩（每日一开）用的墙上时钟
  const [nowTs, setNowTs] = useState(() => Date.now());
  // Mark Six last draw result: 6 regular + 1 special number
  const [m6Result, setM6Result] = useState(INITIAL_DRAW.marksix);
  // 澳门六合彩（每天一开）另存一份开奖号，不跟着分钟彩的开奖节奏跳动
  const [lhcDayResult] = useState(INITIAL_DRAW.lhcday);

  // Speed Race (一分极速赛车) embedded selections: key encoded as `${category}|${name}`
  const [selectedSR, setSelectedSR] = useState(new Set());
  const [srActiveTab, setSrActiveTab] = useState('two-sides'); // two-sides, sum, single
  // 专业版盘面（样式同一分分分彩）
  const [srSimpleMode, setSrSimpleMode] = useState(true); // false=专业版, true=简易版（彩票一律预设简易版）
  const [selectedSRP, setSelectedSRP] = useState(new Set()); // 专业版选中点位 key `${category}|${name}`
  const [srPlayTab, setSrPlayTab] = useState('cai'); // 第一层玩法：cai(猜球号), sides(两面盘), sum(冠亚和)
  const [srActivePos, setSrActivePos] = useState('p1'); // 第二层名次：p1~p10 或 sum
  // Speed Race last draw result:排列 1~10
  const [srResult, setSrResult] = useState(INITIAL_DRAW.speedrace);

  // 一分分分彩 (Every-Minute Lottery) selections: key `${category}|${name}`
  const [selectedFFC, setSelectedFFC] = useState(new Set());
  const [ffcActiveTab, setFfcActiveTab] = useState('cai'); // 第一层玩法：cai(猜球号), sides(两面盘), position(前中后)
  const [ffcActivePos, setFfcActivePos] = useState('ball1'); // 第二层：球号(ball1~ball5) 或 区段(front/mid/back)
  const [ffcSimpleMode, setFfcSimpleMode] = useState(true); // 简易版盘面开关：true 时改用一分分分彩2 的盘面（彩票一律预设简易版）
  // 一分分分彩开奖结果：5 颗球 0~9（图标取自 public/分分-ball/）
  const [ffcResult, setFfcResult] = useState(INITIAL_DRAW.ffc);

  // 一分分分彩2 (简易版) selections: key `${category}|${name}`；开奖球与「一分分分彩」相同
  const [selectedFFC2, setSelectedFFC2] = useState(new Set());
  const [ffc2ActiveTab, setFfc2ActiveTab] = useState('wan'); // wan(万位), dragon(龙虎), bai(佰位)

  // 一分幸运28 (Lucky 28) selections: key `${category}|${name}`；开奖 3 颗球 0~9，取自 public/分分-ball/
  const [selectedL28, setSelectedL28] = useState(new Set());
  const [l28ActiveTab, setL28ActiveTab] = useState('sides'); // sides(总和两面), dragon(龙虎豹), triple(三球), sum(总和)
  const [l28Result, setL28Result] = useState(INITIAL_DRAW.lucky28);
  // 一分幸运28 专业版盘面（样式同一分快三专业版）
  const [l28SimpleMode, setL28SimpleMode] = useState(true); // false=专业版, true=简易版（彩票一律预设简易版）
  const [selectedL28P, setSelectedL28P] = useState(new Set()); // 专业版选中点位 key `${category}|${name}`
  const [l28PlayTab, setL28PlayTab] = useState('sum'); // 第一层玩法：sum(总和) side(边球) tail(尾球) dragon(龙虎豹) extreme(极值) triple(三球)
  const [l28SubTab, setL28SubTab] = useState('num'); // 第二层：num(数字) / sides(两面)，仅总和与尾球有

  // 鱼虾蟹 (Fish-Prawn-Crab) embedded selections: key encoded as `${category}|${symbolKey}`
  const [selectedFC, setSelectedFC] = useState(new Set());
  const [fcActiveTab, setFcActiveTab] = useState('single'); // single(单骰), all(全围)
  const [showFcRules, setShowFcRules] = useState(false);
  // 鱼虾蟹 last draw result: three symbol keys
  const [fcResult, setFcResult] = useState(INITIAL_DRAW.fishcrab);

  // 百家乐 (Baccarat) selections: key `${category}|${name}`
  const [selectedBac, setSelectedBac] = useState(new Set());
  const [bacActiveTab, setBacActiveTab] = useState('main'); // main(庄闲), pair(对子), sides(两面)
  const [showBacRules, setShowBacRules] = useState(false);
  // 百家乐当前牌局（初始牌局见 INITIAL_DRAW.baccarat）
  const [bacPlayer, setBacPlayer] = useState(INITIAL_DRAW.baccarat.player);
  const [bacBanker, setBacBanker] = useState(INITIAL_DRAW.baccarat.banker);

  // 体育赛事直播间 selections: key `${category}|${name}`（体育间不切换游戏，无开奖号）
  const [selectedSp, setSelectedSp] = useState(new Set());
  const [spActiveTab, setSpActiveTab] = useState('total'); // total(总分大小), home(主队总分大小), away(客队总分大小)
  const [spSimpleMode, setSpSimpleMode] = useState(true); // true=简易版（大小盘），false=专业版（同体育更多玩法）
  const [spProFilter, setSpProFilter] = useState('hot'); // 专业版筛选：热门/全部/让球&大小/半场/全场/波胆
  const [spExpanded, setSpExpanded] = useState({ handicap: true, ou: true, half_ou: true });

  // 动物运动会 (Animal Sports) selections: key `${category}|${name}`
  const [selectedAnimal, setSelectedAnimal] = useState(new Set());
  const [animalActiveTab, setAnimalActiveTab] = useState('twosides'); // twosides(冠军两面), single(冠军单码)
  // 动物运动会开奖结果：名次排列（T-ball 1~6）
  const [animalResult, setAnimalResult] = useState(INITIAL_DRAW.animal);

  // Restructured Layout States
  const [vpActiveTab, setVpActiveTab] = useState('chatroom'); // chatroom, play, recommend, more-games
  const [activeCarouselGame, setActiveCarouselGame] = useState(initialGame || 'fast3');
  const [carouselOpen, setCarouselOpen] = useState(false); // 短剧模式：切换游戏面板是否展开
  const [activeMoreGamesCat, setActiveMoreGamesCat] = useState('hot');

  // Video details interaction states
  const [likes, setLikes] = useState(198);
  const [hasLiked, setHasLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [favCount, setFavCount] = useState(7);
  const [hasFav, setHasFav] = useState(false);

  // 详情弹窗：显示影片更完整的信息
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Rotating banner index
  const [bannerIdx, setBannerIdx] = useState(0);

  // Player view modes
  const [immersive, setImmersive] = useState(false); // 沉浸式：视频铺满竖屏
  const [landscape, setLandscape] = useState(false);  // 全屏：强制横屏观看
  const [landscapeSize, setLandscapeSize] = useState({ w: 0, h: 0 });
  const overlayRef = useRef(null);

  // Simulated live chatroom messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'join', user: 'h***6', text: '进入了直播间' },
    { id: 2, type: 'win', user: 'H***7', game: '麒麟送宝', prize: '155.27' },
    { id: 3, type: 'win', user: 'k***0', game: '麒麟送宝', prize: '154.16' },
    { id: 4, type: 'join', user: 'e***4', text: '进入了直播间' },
    { id: 5, type: 'win', user: 'Z***6', game: '跳起来', prize: '191.74' },
    { id: 6, type: 'win', user: 'F***4', game: '冰球突破', prize: '34.91' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Slots gameplay simulator states
  const [slotsBetAmount, setSlotsBetAmount] = useState(50);
  const [slotsDisplay, setSlotsDisplay] = useState(['🍒', '🍋', '💎']);
  const [slotsSpinning, setSlotsSpinning] = useState(false);

  // Refs for scroll handling
  const chatEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const gameCarouselRef = useRef(null);
  const m6pBodyRef = useRef(null); // 六合彩专业版盘面滚动容器

  // 打开游戏选单时（仅在开合切换那一刻），把当前选中的游戏滚动到可视中央；
  // 打开期间的重渲染（如倒计时每秒跳动）不再触发，手动滚动不会被弹回。
  useEffect(() => {
    if (!carouselOpen) return;
    const el = gameCarouselRef.current;
    if (!el) return;
    const active = el.querySelector('.vp-game-card.active');
    if (active) {
      el.scrollLeft = active.offsetLeft - (el.clientWidth - active.clientWidth) / 2;
    }
  }, [carouselOpen]);

  // 点击选单以外的任意区域即收合下拉选单
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    const id = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', handler);
    };
  }, [menuOpen]);

  // 投注时长：百家乐 25 秒，其他游戏 55 秒（+ 5 秒封盘含开奖）
  const SEALED_SECONDS = 5;
  const getBettingSeconds = () => (activeCarouselGame === 'baccarat' ? 25 : 55);

  // 切换游戏时重置本期倒计时为该游戏的投注时长，并清空所有游戏的选中点位
  useEffect(() => {
    setPhase('betting');
    setCountdown(activeCarouselGame === 'baccarat' ? 25 : 55);
    setDrawHistoryOpen(false);
    setSelectedOdds(new Set());
    setSelectedF3P(new Set());
    setSelectedM6(new Set());
    setSelectedM6P(new Set());
    setSelectedSR(new Set());
    setSelectedSRP(new Set());
    setSelectedFFC(new Set());
    setSelectedFFC2(new Set());
    setSelectedL28(new Set());
    setSelectedL28P(new Set());
    setSelectedFC(new Set());
    setSelectedBac(new Set());
    setSelectedAnimal(new Set());
    setSelectedSp(new Set());
  }, [activeCarouselGame]);

  // 切换游戏内上方玩法 tab 时，清空该游戏的选中点位
  useEffect(() => { setSelectedOdds(new Set()); }, [activeTab]);
  useEffect(() => { setSelectedF3P(new Set()); }, [f3PlayTab]);
  useEffect(() => { setSelectedM6(new Set()); }, [m6ActiveTab]);
  useEffect(() => {
    setSelectedM6P(new Set());
    // 六合彩专业版内容较长，换玩法时把盘面卷回顶端
    if (m6pBodyRef.current) m6pBodyRef.current.scrollTop = 0;
  }, [m6PlayTab, m6SubTab]);
  useEffect(() => { setSelectedSR(new Set()); }, [srActiveTab]);
  useEffect(() => { setSelectedSRP(new Set()); }, [srPlayTab]);
  useEffect(() => { setSelectedFFC(new Set()); }, [ffcActiveTab]);
  useEffect(() => { setSelectedFFC2(new Set()); }, [ffc2ActiveTab]);
  useEffect(() => { setSelectedL28(new Set()); }, [l28ActiveTab]);
  useEffect(() => { setSelectedL28P(new Set()); }, [l28PlayTab, l28SubTab]);
  useEffect(() => { setSelectedFC(new Set()); }, [fcActiveTab]);
  useEffect(() => { setSelectedBac(new Set()); }, [bacActiveTab]);
  useEffect(() => { setSelectedAnimal(new Set()); }, [animalActiveTab]);
  useEffect(() => { setSelectedSp(new Set()); }, [spActiveTab, spSimpleMode]);

  // 点位区行高（简易版／专业版都套用）：玩法只有一行点位时，该行撑满整个点位区；
  // 超过一行时改用两行撑满（第三行以后照旧滚动）。
  // 各游戏的栏数与间距都写在 inline style 里、彼此不一致，
  // 所以这里直接量测实际布局再回写行高，不逐个游戏硬编码。
  // 没有依赖数组：本组件本来就每秒因倒计时重渲染，切游戏／切玩法后一定会跟着重算。
  // 用 useLayoutEffect 而非 useEffect：要在浏览器 paint 前就把行高写好，
  // 否则切换玩法时会先画一帧旧行高再跳到新行高。
  useLayoutEffect(() => {
    const layoutOddsRows = () => {
      document.querySelectorAll('.vp-odds-area').forEach(area => {
        const areaStyle = getComputedStyle(area);
        const inner = area.clientHeight
          - parseFloat(areaStyle.paddingTop)
          - parseFloat(areaStyle.paddingBottom);
        if (!(inner > 0)) return;

        // 百家乐用自己的盘面（庄/闲 竖跨两行、和/幸运6 中间上下），一并纳入
        const grids = [...area.querySelectorAll(
          '.live-betting-options-grid, .bac-main-grid, .bac-2x2-grid'
        )];
        if (!grids.length) return;

        // 这个点位区一共几行（多段盘面就把每段的行数加起来）
        let totalRows = 0;
        grids.forEach(grid => {
          const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
          totalRows += Math.ceil(grid.children.length / cols);
        });

        const gap = parseFloat(getComputedStyle(grids[0]).rowGap) || 0;
        const rowH = totalRows <= 1 ? inner : (inner - gap) / 2;

        grids.forEach(grid => {
          grid.classList.add('is-fill-rows');
          grid.style.setProperty('--vp-odds-row-h', `${Math.max(0, Math.round(rowH * 10) / 10)}px`);
        });
      });
    };

    layoutOddsRows();
    window.addEventListener('resize', layoutOddsRows);
    return () => window.removeEventListener('resize', layoutOddsRows);
  });

  // 倒计时状态机：投注(倒计时) → 封盘(含开奖, 5秒) → 下一期
  useEffect(() => {
    if (!videoPlayerActive && !embedded) return;
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (phase === 'betting') {
      // 进入封盘并开奖
      performDrawing();
      setPhase('sealed');
      setCountdown(SEALED_SECONDS);
    } else {
      // 封盘结束，进入下一期投注
      setIssue(prev => prev + 1);
      setPhase('betting');
      setCountdown(getBettingSeconds());
    }
    return () => clearTimeout(timer);
  }, [countdown, phase, videoPlayerActive, activeCarouselGame]);

  // 澳门六合彩是每日一开，倒计时跟着墙上时钟走，只在该游戏开着时才计时
  useEffect(() => {
    if (activeCarouselGame !== 'lhcday') return;
    if (!videoPlayerActive && !embedded) return;
    setNowTs(Date.now());
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeCarouselGame, videoPlayerActive, embedded]);

  // 开奖：一次更新所有分钟彩的开奖号（各游戏共用同一期号，切过去时期号才不会断层）
  const performDrawing = () => {
    const draw = {};
    DRAW_HISTORY_GAMES.forEach(key => { draw[key] = randomDrawResult(key); });
    setLastDice(draw.fast3);
    setM6Result(draw.marksix);
    setSrResult(draw.speedrace);
    setFfcResult(draw.ffc);
    setL28Result(draw.lucky28);
    setFcResult(draw.fishcrab);
    setBacPlayer(draw.baccarat.player);
    setBacBanker(draw.baccarat.banker);
    setAnimalResult(draw.animal);
    // 把本期开奖结果记入历史（最新在最上，最多保留 30 期）
    setDrawHistory(prev => {
      const next = { ...prev };
      DRAW_HISTORY_GAMES.forEach(key => {
        next[key] = [{ period: issue, result: draw[key] }, ...prev[key]].slice(0, 30);
      });
      return next;
    });
    const sumVal = draw.fast3[0] + draw.fast3[1] + draw.fast3[2];
    setAnalysis({ sum: sumVal, size: sumVal >= 11 ? '大' : '小', oe: sumVal % 2 === 0 ? '双' : '单' });
  };

  // 倒计时显示：投注中(抬头 + 整组时间同一格) → 已封盘；label 预设「开奖：」，各游戏通用
  const renderCountdown = (label = '开奖：') => {
    if (phase === 'sealed') {
      return <span className="vp-phase-tag vp-phase-sealed">已封盘</span>;
    }
    return (
      <div className="vp-bet-countdown-box">
        <span className="vp-countdown-label">{label}</span>
        <span className="vp-digit-box is-clock">
          {`00:${String(countdown).padStart(2, '0')}`}
        </span>
      </div>
    );
  };

  // ===== 澳门六合彩：每天 14:00 开盘、16:00 封盘、16:30 开奖（纯前端模拟） =====
  const isLhcDay = activeCarouselGame === 'lhcday';
  const isLhcGame = activeCarouselGame === 'marksix' || isLhcDay;
  const lhcDayClock = (() => {
    const now = new Date(nowTs);
    const at = (h, m) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d.getTime(); };
    const open = at(14, 0);
    const close = at(16, 0);
    const draw = at(16, 30);
    if (nowTs < open) return { phase: 'waiting', label: '开盘：', target: open };
    if (nowTs < close) return { phase: 'betting', label: '开奖：', target: draw };
    if (nowTs < draw) return { phase: 'sealed' };
    return { phase: 'waiting', label: '开盘：', target: open + 86400000 };
  })();
  // 期号：每天一期，用当天日期
  const lhcDayIssue = (() => {
    const d = new Date(nowTs);
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  })();
  const renderLhcDayCountdown = () => {
    if (lhcDayClock.phase === 'sealed') {
      return <span className="vp-phase-tag vp-phase-sealed">已封盘</span>;
    }
    const left = Math.max(0, Math.floor((lhcDayClock.target - nowTs) / 1000));
    const parts = [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60];
    return (
      <div className="vp-bet-countdown-box">
        <span className="vp-countdown-label">{lhcDayClock.label}</span>
        <span className="vp-digit-box is-clock">{parts.map(v => String(v).padStart(2, '0')).join(':')}</span>
      </div>
    );
  };

  // ===== 开奖号渲染：抬头（header）与历史弹窗（row）共用一份，各游戏号码样式不变 =====
  const renderDrawBalls = (gameKey, res, size = 'header') => {
    if (!res) return null;
    const big = size === 'header';
    switch (gameKey) {
      case 'fast3': {
        const px = big ? '22px' : '18px';
        return (
          <div className="fast3-draw-balls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {res.map((v, i) => <img key={i} src={`K3-ball/${v}.png`} alt={v} style={{ width: px, height: px }} />)}
          </div>
        );
      }
      case 'marksix':
      case 'lhcday': {
        const px = big ? '20px' : '17px';
        const ball = (n, key) => (
          <img
            key={key}
            className="vp-m6-result-ball-img"
            style={{ width: px, height: px }}
            src={`lhc-ball/num=${String(n).padStart(2, '0')}.png`}
            alt={String(n).padStart(2, '0')}
          />
        );
        return (
          <div className="vp-m6-result-balls">
            {res.slice(0, 6).map((n, i) => ball(n, i))}
            <span className="vp-m6-result-plus">+</span>
            {ball(res[6], 'sp')}
          </div>
        );
      }
      case 'speedrace': {
        // 10 颗球较占位，抬头略缩一号，期号才不会被挤到换行
        const px = big ? '17px' : '15px';
        return (
          <div className="vp-sr-result-balls" style={{ display: 'flex', gap: big ? '2px' : '3px', alignItems: 'center' }}>
            {res.map((n, i) => <img key={i} src={`PK10-ball/num=${n}.png`} alt={n} style={{ width: px, height: px, flexShrink: 0 }} />)}
          </div>
        );
      }
      case 'ffc': {
        const px = big ? '18px' : '16px';
        return (
          <div className="vp-ffc-result-balls" style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {res.map((n, i) => <img key={i} src={`分分-ball/${n}.png`} alt={n} style={{ width: px, height: px }} />)}
          </div>
        );
      }
      case 'lucky28': {
        const px = big ? '20px' : '18px';
        const sum = res.reduce((a, b) => a + b, 0);
        return (
          <div className="vp-ffc-result-balls" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {res.map((n, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ fontWeight: 700, color: '#64748b' }}>+</span>}
                <span style={{ width: px, height: px, borderRadius: '50%', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
              </React.Fragment>
            ))}
            <span style={{ fontWeight: 700, color: '#64748b' }}>=</span>
            <span style={{ minWidth: '22px', height: px, lineHeight: px, textAlign: 'center', padding: '0 5px', borderRadius: '4px', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}>{sum}</span>
          </div>
        );
      }
      case 'fishcrab': {
        const px = big ? '20px' : '18px';
        return (
          <div className="vp-fc-result-row" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {res.map((symKey, i) => {
              const sym = FISH_CRAB_SYMBOLS.find(s => s.key === symKey);
              return sym ? (
                <img key={i} src={sym.icon} alt={sym.label} className="vp-fc-result-img" style={{ width: px, height: px }} />
              ) : null;
            })}
          </div>
        );
      }
      case 'baccarat': {
        const { player = [], banker = [] } = res;
        const cardCls = big ? 'bac-mini-card' : 'bac-mini-card bac-mini-card-sm';
        return (
          <div className="bac-mini-result">
            <span className="bac-mini-pts" style={{ color: BAC_C.player }}>闲{bacHandPoints(player)}</span>
            {/* 闲家：补牌（第三张）放在最左侧，横放 */}
            {(player.length === 3 ? [player[2], player[0], player[1]] : player).map((c, i) => (
              <img key={`p${i}`} className={`${cardCls} ${player.length === 3 && i === 0 ? 'bac-mini-card-h' : ''}`} src={`poker/${c.suit}/${c.rank}.svg`} alt={`${c.suit}-${c.rank}`} />
            ))}
            <span className="bac-mini-sep">|</span>
            {/* 庄家：补牌（第三张）放在最右侧，横放 */}
            {banker.map((c, i) => (
              <img key={`b${i}`} className={`${cardCls} ${banker.length === 3 && i === 2 ? 'bac-mini-card-h' : ''}`} src={`poker/${c.suit}/${c.rank}.svg`} alt={`${c.suit}-${c.rank}`} />
            ))}
            <span className="bac-mini-pts" style={{ color: BAC_C.banker }}>庄{bacHandPoints(banker)}</span>
          </div>
        );
      }
      case 'animal': {
        const w = big ? '22px' : '19px';
        const h = big ? '18px' : '15px';
        return (
          <div className="animal-mini-result">
            {res.map((n, i) => <img key={i} className="animal-mini-ball" style={{ width: w, height: h }} src={`T-ball/T${n}.svg`} alt={`T${n}`} />)}
          </div>
        );
      }
      default:
        return null;
    }
  };

  // 抬头右侧的开奖结果：点一下展开／收合历史开奖弹窗
  const renderDrawResultTrigger = (gameKey, res) => (
    <div
      onClick={() => { setMenuOpen(false); setDrawHistoryOpen(o => !o); }}
      title="查看历史开奖"
      style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', minWidth: 0 }}
    >
      {renderDrawBalls(gameKey, res, 'header')}
      <span
        style={{
          marginLeft: '3px',
          flexShrink: 0,
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '5px solid #94a3b8',
          transform: drawHistoryOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease'
        }}
      />
    </div>
  );

  // 历史开奖记录弹窗：挂在 .vp-bet-header 下缘，点空白处收合
  const renderDrawHistoryPanel = (gameKey) => {
    if (!drawHistoryOpen) return null;
    const rows = drawHistory[gameKey] || [];
    return (
      <>
        <div onClick={() => setDrawHistoryOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #eef2f6' }}>
            <div style={{ flex: '0 0 42%', padding: '9px 12px', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>期号</div>
            <div style={{ flex: 1, padding: '9px 10px', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>开奖号码</div>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {rows.map((row, i) => (
              <div
                key={row.period}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f1f5f9',
                  background: i % 2 ? '#fafbfc' : '#ffffff'
                }}
              >
                <div style={{ flex: '0 0 42%', padding: '8px 12px', fontSize: '0.72rem', color: '#64748b' }}>{row.period}</div>
                <div style={{ flex: 1, padding: '6px 10px', display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  {renderDrawBalls(gameKey, row.result, 'row')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // 盘口：只整体缩放赔率，显示值 = round(基准 × 系数 × 100) / 100
  const LHC_PAN_OPTIONS = [
    { key: 'A', factor: 1 },
    { key: 'B', factor: 0.985 },
    { key: 'C', factor: 0.97 },
    { key: 'D', factor: 0.955 }
  ];
  const lhcPanFactor = LHC_PAN_OPTIONS.find(p => p.key === lhcPan)?.factor ?? 1;
  const lhcOdds = (base) => {
    const n = Number(base);
    if (!Number.isFinite(n)) return base;
    return String(Math.round(n * lhcPanFactor * 100) / 100);
  };
  const renderLhcPanPicker = () => (
    <div className="vp-pan-picker" style={{ position: 'relative', flexShrink: 0 }}>
      <div
        onClick={(e) => { e.stopPropagation(); setLhcPanOpen(o => !o); }}
        title="切换盘口"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1px',
          width: '36px',
          height: '24px',
          boxSizing: 'border-box',
          borderRadius: '6px',
          border: '1px solid #d5dbe4',
          background: '#ffffff',
          fontSize: '0.48rem',
          color: '#64748b',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        {lhcPan}盘
        <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.38rem' }}></i>
      </div>
      {lhcPanOpen && (
        <>
          <div onClick={() => setLhcPanOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 61,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              overflow: 'hidden'
            }}
          >
            {LHC_PAN_OPTIONS.map(opt => (
              <div
                key={opt.key}
                onClick={() => { setLhcPan(opt.key); setLhcPanOpen(false); }}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  color: opt.key === lhcPan ? '#3b82f6' : '#57606f',
                  fontWeight: opt.key === lhcPan ? 700 : 500,
                  background: opt.key === lhcPan ? '#eff6ff' : '#ffffff'
                }}
              >
                {opt.key}盘
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Rotating banner announcements configuration
  const winningAnnouncements = [
    { name: 'q***6', amount: '184.18', game: '亡灵大盗' },
    { name: 'H***7', amount: '155.27', game: '麒麟送宝' },
    { name: 'k***0', amount: '154.16', game: '麒麟送宝' },
    { name: 'Z***6', amount: '191.74', game: '跳起来' },
    { name: 'F***4', amount: '34.91', game: '冰球突破' }
  ];

  // Rotate winning announcement banner every 3 seconds
  useEffect(() => {
    if (!videoPlayerActive) return;
    const bannerInterval = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % winningAnnouncements.length);
    }, 3000);
    return () => clearInterval(bannerInterval);
  }, [videoPlayerActive]);

  // Dynamic simulated chatroom messages
  useEffect(() => {
    if (!videoPlayerActive || vpActiveTab !== 'chatroom') return;
    const userPool = ['a***1', 'b***2', 'c***3', 'd***4', 'u***9', 'x***8', 'y***7', 'z***5'];
    const gamePool = ['麻将胡了2', '赏金船长', '赏金女王', '大富翁', '一分快三', '跳起来', '冰球突破'];
    
    const simulatorInterval = setInterval(() => {
      const isWin = Math.random() > 0.4;
      const randomUser = userPool[Math.floor(Math.random() * userPool.length)];
      
      let newMsg;
      if (isWin) {
        const randomGame = gamePool[Math.floor(Math.random() * gamePool.length)];
        const randomPrize = (Math.random() * 200 + 20).toFixed(2);
        newMsg = {
          id: Date.now(),
          type: 'win',
          user: randomUser,
          game: randomGame,
          prize: randomPrize
        };
      } else {
        newMsg = {
          id: Date.now(),
          type: 'join',
          user: randomUser,
          text: '进入了直播间'
        };
      }
      
      setChatMessages(prev => {
        const next = [...prev, newMsg];
        if (next.length > 50) next.shift();
        return next;
      });
    }, 2500);

    return () => clearInterval(simulatorInterval);
  }, [videoPlayerActive, vpActiveTab]);

  // Auto scroll chatroom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, vpActiveTab]);

  // Like, Dislike, Favorite click handlers
  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setDislikes(prev => prev - 1);
        setHasDisliked(false);
      }
      showToast('感谢点赞！');
    }
  };

  const handleDislike = () => {
    if (hasDisliked) {
      setDislikes(prev => prev - 1);
      setHasDisliked(false);
    } else {
      setDislikes(prev => prev + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLikes(prev => prev - 1);
        setHasLiked(false);
      }
      showToast('我们会继续优化内容！');
    }
  };

  const handleFavorite = () => {
    if (hasFav) {
      setFavCount(prev => prev - 1);
      setHasFav(false);
    } else {
      setFavCount(prev => prev + 1);
      setHasFav(true);
      showToast('已加入您的收藏列表！');
    }
  };

  // Only Fast Three, Mark Six and Speed Race are playable for now
  const playableCarouselGames = ['fast3', 'marksix', 'lhcday', 'speedrace', 'ffc', 'ffc2', 'lucky28', 'animal', 'fishcrab', 'baccarat', 'candy', 'mahjong'];

  // Switch Watch & Play Carousel Game Selector
  const handleCarouselGameClick = (item) => {
    if (!playableCarouselGames.includes(item.key)) return;
    setActiveCarouselGame(item.key);
    setMenuOpen(false);
    setCarouselOpen(false); // 选择游戏后关闭切换面板
  };

  // Close bet area chevron/x
  const handleBetHeaderClose = () => {
    if (embedded) {
      onClose?.();
      return;
    }
    setVpActiveTab('chatroom');
  };

  // Spin/Play slots game simulator
  const handleSlotsSpin = () => {
    if (balance < slotsBetAmount) {
      showToast('余额不足，请先充值！');
      return;
    }
    if (slotsBetAmount <= 0) {
      showToast('请输入有效的下注金额！');
      return;
    }
    updateBalance(-slotsBetAmount);
    setSlotsSpinning(true);

    const slotItems = ['🍒', '🍋', '💎', '🍇', '🔔', '7️⃣'];
    
    let count = 0;
    const interval = setInterval(() => {
      setSlotsDisplay([
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)]
      ]);
      count++;
      
      if (count >= 10) {
        clearInterval(interval);
        
        const finalResults = [
          slotItems[Math.floor(Math.random() * slotItems.length)],
          slotItems[Math.floor(Math.random() * slotItems.length)],
          slotItems[Math.floor(Math.random() * slotItems.length)]
        ];
        setSlotsDisplay(finalResults);
        setSlotsSpinning(false);

        const uniqueItems = new Set(finalResults);
        if (uniqueItems.size === 1) {
          const prize = slotsBetAmount * 10;
          updateBalance(prize);
          showToast(`恭喜！大满贯！获得 ${prize.toFixed(2)} 元！🎉`);
        } else if (uniqueItems.size === 2) {
          const prize = slotsBetAmount * 2;
          updateBalance(prize);
          showToast(`中奖！获得 ${prize.toFixed(2)} 元！⭐`);
        } else {
          showToast('很遗憾未中奖，换个筹码试试！');
        }
      }
    }, 100);
  };

  // Click handler for Recommended videos
  const recommendedVideosList = [
    { 
      id: 101, 
      title: '诺曼底72小时', 
      img: 'assets/sports_cover.png', 
      rating: '8.2', 
      views: '386次播放',
      tags: ['#剧情', '#战争'],
      description: '影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。'
    },
    { 
      id: 102, 
      title: '繁花', 
      img: 'assets/origami.png', 
      rating: '9.5', 
      views: '1.2万次播放',
      tags: ['#剧情', '#商战'],
      description: '阿宝在上海黄河路的传奇商战风云与情感抉择。展现上世纪九十年代初沪上弄潮儿女的奋斗与爱恨。'
    },
    { 
      id: 103, 
      title: '歌手2026', 
      img: 'assets/chat_cover.png', 
      rating: '9.2', 
      views: '8.2万次播放',
      tags: ['#综艺', '#音乐'],
      description: '《歌手2026》迎来年度歌王争霸之夜！各路实力唱将齐聚一堂，带来精彩纷呈的现场Live表演。'
    }
  ];

  const handleRecommendedVideoClick = (vid) => {
    setActiveVideo(vid);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showToast(`正在播放：${vid.title}`);
  };

  // More games categories configuration
  const moreGamesCategories = [
    { id: 'hot', label: '热门' },
    { id: 'video', label: '视讯' },
    { id: 'slots', label: '电子' },
    { id: 'sports', label: '体育' },
    { id: 'lottery', label: '彩票' },
    { id: 'fish', label: '捕鱼' }
  ];

  const moreGamesList = {
    hot: [
      { key: 'fast3', label: '一分快三', img: 'assets/game_fast3.png' },
      { key: 'mahjong', label: '麻将胡了2', img: '游戏图标/麻将湖了2.png' },
      { key: 'captain', label: '赏金船长', img: 'assets/origami.png' },
      { key: 'queen', label: '赏金女王', img: 'assets/sports_cover.png' },
      { key: 'goldcity', label: '寻宝黄金城', img: 'assets/drawing.png' },
      { key: 'richman', label: '大富翁', img: 'assets/chat_cover.png' }
    ],
    video: [
      { key: 'ag', label: 'AG视讯', img: 'assets/science.png' },
      { key: 'bg', label: 'BG视讯', img: 'assets/sports_cover.png' },
      { key: 'bbin', label: 'BBIN视讯', img: 'assets/chat_cover.png' }
    ],
    slots: [
      { key: 'mahjong', label: '麻将胡了2', img: '游戏图标/麻将湖了2.png' },
      { key: 'captain', label: '赏金船长', img: 'assets/origami.png' },
      { key: 'queen', label: '赏金女王', img: 'assets/sports_cover.png' },
      { key: 'goldcity', label: '寻宝黄金城', img: 'assets/drawing.png' }
    ],
    sports: [
      { key: 'shaba', label: '沙巴体育', img: 'assets/sports_cover.png' },
      { key: 'crown', label: '皇冠体育', img: 'assets/lego.png' },
      { key: 'imsports', label: 'IM体育', img: 'assets/drawing.png' }
    ],
    lottery: [
      { key: 'fast3', label: '一分快三', img: 'assets/game_fast3.png' },
      { key: 'marksix', label: '一分澳门六合彩', img: 'assets/mo_mark_six.png' },
      { key: 'racing', label: '一分赛车', img: 'assets/speed_race.png' }
    ],
    fish: [
      { key: 'fish1', label: '财神捕鱼', img: 'assets/chat_cover.png' },
      { key: 'fish2', label: '欢乐捕鱼', img: 'assets/drawing.png' }
    ]
  };

  // Mirror the 边看边玩 menu: only Fast Three, Mark Six and Speed Race are openable.
  // Map a more-games key to its playable carousel console.
  const moreGamesPlayableMap = {
    fast3: 'fast3',
    marksix: 'marksix',
    racing: 'speedrace'
  };

  const handleMoreGamesGameClick = (game) => {
    const target = moreGamesPlayableMap[game.key];
    if (!target) return;
    setActiveCarouselGame(target);
    setVpActiveTab('play');
    showToast(`已为您切入：【${game.label}】`);
  };

  if (!videoPlayerActive && !embedded) return null;

  // Games carousel items
  const carouselGameItems = [
    { key: 'fast3', label: '一分快三', img: '游戏图标/701010.png' },
    { key: 'marksix', label: '一分澳门六合彩', img: '游戏图标/1070110.png' },
    { key: 'lhcday', label: '澳门六合彩', img: '游戏图标/1070110.png' },
    { key: 'speedrace', label: '一分极速赛车', img: '游戏图标/1062010.png' },
    { key: 'ffc', label: '一分分分彩', img: '游戏图标/601010.png' },
    { key: 'ffc2', label: '一分分分彩2', img: '游戏图标/601010.png' },
    { key: 'lucky28', label: '一分幸运28', img: '游戏图标/1069010.png' },
    { key: 'animal', label: '一分动物运动会', img: '游戏图标/1001-D6CpfLEz.png' },
    { key: 'fishcrab', label: '一分鱼虾蟹', img: '游戏图标/一分鱼虾蟹.png' },
    { key: 'baccarat', label: '百家乐A1', img: '游戏图标/百家乐A1.png' },
    { key: 'candy', label: '糖果派对', img: '游戏图标/糖果派对.png' },
    { key: 'mahjong', label: '麻将胡了2', img: '游戏图标/麻将湖了2.png' },
    { key: 'captain', label: '赏金船长', img: 'assets/origami.png' },
    { key: 'queen', label: '赏金女王', img: 'assets/sports_cover.png' },
    { key: 'goldcity', label: '寻宝黄金城', img: 'assets/drawing.png' },
    { key: 'richman', label: '大富翁', img: 'assets/chat_cover.png' }
  ];

  // Odds cards lists
  const oddsData = {
    size: [
      { name: '大', odds: '9.75' },
      { name: '小', odds: '9.75' },
      { name: '单', odds: '9.75' },
      { name: '双', odds: '9.75' }
    ],
    pair: [
      { name: '11', odds: '12.5' }, { name: '22', odds: '12.5' }, { name: '33', odds: '12.5' },
      { name: '44', odds: '12.5' }, { name: '55', odds: '12.5' }, { name: '66', odds: '12.5' }
    ],
    triple: [
      { name: '111', odds: '200.0' }, { name: '222', odds: '200.0' }, { name: '333', odds: '200.0' },
      { name: '444', odds: '200.0' }, { name: '555', odds: '200.0' }, { name: '666', odds: '200.0' },
      { name: '全豹', odds: '35.0' }
    ],
    sum: [
      { name: '和值4', odds: '80.0' }, { name: '和值5', odds: '40.0' }, { name: '和值6', odds: '25.0' },
      { name: '和值7', odds: '16.0' }, { name: '和值8', odds: '12.0' }, { name: '和值9', odds: '9.0' },
      { name: '和值10', odds: '9.0' }, { name: '和值11', odds: '9.0' }, { name: '和值12', odds: '9.0' },
      { name: '和值13', odds: '12.0' }, { name: '和值14', odds: '16.0' }, { name: '和值15', odds: '25.0' },
      { name: '和值16', odds: '40.0' }, { name: '和值17', odds: '80.0' }
    ],
    single: [
      { name: '1', odds: '2.0' }, { name: '2', odds: '2.0' }, { name: '3', odds: '2.0' },
      { name: '4', odds: '2.0' }, { name: '5', odds: '2.0' }, { name: '6', odds: '2.0' }
    ]
  };

  const handleOddsCardClick = (name) => {
    const nextSet = new Set(selectedOdds);
    if (nextSet.has(name)) {
      nextSet.delete(name);
    } else {
      nextSet.add(name);
    }
    setSelectedOdds(nextSet);
  };

  const activeQuickAmount = (manualFocused || manualAmount !== '') ? 0 : betAmount;

  const handleQuickAmountClick = (val) => {
    setBetAmount(val);
    setManualAmount('');
  };

  const currentBetPrice = manualAmount !== '' ? parseFloat(manualAmount) || 0 : betAmount;
  const totalCost = selectedOdds.size * currentBetPrice;

  const handleResetBets = () => {
    setSelectedOdds(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast("余额已刷新为 ¥3000.00！");
  };

  const handleSubmitBet = () => {
    if (selectedOdds.size === 0) {
      showToast("请选择投注盘口！");
      return;
    }
    if (currentBetPrice <= 0) {
      showToast("请输入或选择有效的投注金额！");
      return;
    }
    if (totalCost > balance) {
      showToast("余额不足，请先充值！");
      return;
    }

    const items = Array.from(selectedOdds).map(name => {
      // Find matching odds from configured grids
      let odds = '9.75'; // default
      if (activeTab === 'pair') odds = '12.5';
      if (activeTab === 'triple') odds = name === '全豹' ? '35.0' : '200.0';
      if (activeTab === 'sum') {
        const found = oddsData.sum.find(x => x.name === name);
        odds = found ? found.odds : '9.0';
      }
      if (activeTab === 'single') odds = '2.0';

      return {
        name,
        odds,
        baseVal: currentBetPrice,
        category: activeTab === 'size' ? '大小' : activeTab
      };
    });

    openBetDetailsModal('fast_three_embedded', items);
    // Clear selections locally
    setSelectedOdds(new Set());
  };

  // ===== 一分快三 专业版盘面（样式同一分分分彩） =====
  // 玩法页签（可左右滑动）
  const F3_PLAY_TABS = [
    { cat: 'army', label: '三军' },
    { cat: 'short', label: '短牌' },
    { cat: 'long', label: '长牌' },
    { cat: 'triple', label: '全骰' },
    { cat: 'sum', label: '和值' },
    { cat: 'twosame', label: '二同号' },
    { cat: 'threediff', label: '三不同' }
  ];
  // 三军：单骰 1~6
  const F3_ARMY = ['1', '2', '3', '4', '5', '6'];
  // 短牌：双同号 11~66
  const F3_SHORT = ['11', '22', '33', '44', '55', '66'];
  // 长牌：两颗不同点数的组合（C(6,2)=15）
  const F3_LONG = (() => {
    const list = [];
    for (let a = 1; a <= 6; a++) for (let b = a + 1; b <= 6; b++) list.push(`${a}${b}`);
    return list;
  })();
  // 全骰：三同号 111~666 + 任意全骰
  const F3_TRIPLE = ['111', '222', '333', '444', '555', '666'];
  // 二同号单选：一对 + 一颗不同（6×5=30），编码 `${p}${p}${k}`
  const F3_TWO_SAME = (() => {
    const list = [];
    for (let p = 1; p <= 6; p++) for (let k = 1; k <= 6; k++) if (k !== p) list.push(`${p}${p}${k}`);
    return list;
  })();
  // 三不同单选：三颗不同（C(6,3)=20），编码升序 `${a}${b}${c}`
  const F3_THREE_DIFF = (() => {
    const list = [];
    for (let a = 1; a <= 6; a++) for (let b = a + 1; b <= 6; b++) for (let c = b + 1; c <= 6; c++) list.push(`${a}${b}${c}`);
    return list;
  })();
  // 和值 3~18 赔率（对称）
  const F3_SUM_ODDS = {
    3: '200.88', 4: '69.12', 5: '35.28', 6: '21.16', 7: '14.11', 8: '10',
    9: '8.46', 10: '7.84', 11: '7.84', 12: '8.46', 13: '10', 14: '14.11',
    15: '21.16', 16: '35.28', 17: '69.12', 18: '200.88'
  };
  const f3pOddsOf = (category, name) => {
    if (category === '三军') return '1.96';
    if (category === '短牌') return '13.23';
    if (category === '长牌') return '7';
    if (category === '全骰') return name === '全骰' ? '35.28' : '200.88';
    if (category === '和值') return F3_SUM_ODDS[name] || '10';
    if (category === '二同号') return '69.12';
    if (category === '三不同') return '35.28';
    return '1.96';
  };
  const toggleF3SimpleMode = () => {
    setF3SimpleMode(v => !v);
    setSelectedOdds(new Set());
    setSelectedF3P(new Set());
  };
  const handleF3PCardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedF3P);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedF3P(next);
  };
  const f3pCount = selectedF3P.size;
  const f3pTotalCost = f3pCount * currentBetPrice;
  const handleF3PReset = () => {
    setSelectedF3P(new Set());
    setManualAmount('');
    setBetAmount(50);
  };
  const handleF3PSubmit = () => {
    if (f3pCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (f3pTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedF3P).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: f3pOddsOf(category, name), baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('fast_three_embedded', items);
    setSelectedF3P(new Set());
  };

  // ===== Mark Six (一分六合彩) embedded gameplay =====
  // Each selection key is encoded as `${category}|${name}`
  const handleM6CardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedM6);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedM6(next);
  };

  const m6Count = selectedM6.size;
  const m6TotalCost = m6Count * currentBetPrice;

  const handleM6Reset = () => {
    setSelectedM6(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleM6Submit = () => {
    if (m6Count === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (m6TotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedM6).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: lhcOdds('9.75'), baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('mark_six', items);
    setSelectedM6(new Set());
  };

  // ===== 一分六合彩 专业版盘面（依 docs/六合彩玩法结构.md） =====
  const m6pSubList = M6P_SUB_TABS[m6PlayTab] || null;
  const m6pSub = m6pSubList?.find(s => s.key === m6SubTab) || m6pSubList?.[0] || null;
  const m6pIsCombo = M6P_COMBO_TABS.includes(m6PlayTab);
  // 下注单显示用的玩法名称（玩法名已在第一层，直接用页签文字）
  const m6pCategory = M6P_PLAY_TABS.find(t => t.cat === m6PlayTab)?.label || '六合彩';
  // 数字（01~49）赔率：特码A 47.3 / 特码B 46.5 / 正码 7.46 / 正特 47.3
  const m6pNumOdds = m6PlayTab === 'zhengma' ? '7.46' : m6PlayTab === 'temaB' ? '46.5' : '47.3';
  // 当前玩法的两面点位
  const m6pSideBets = m6PlayTab === 'temaA' || m6PlayTab === 'temaB'
    ? M6P_TEMA_SIDES.map(b => ({ name: b.name, odds: m6PlayTab === 'temaB' ? b.b : b.a }))
    : m6PlayTab === 'zhengma' ? M6P_ZHENGMA_SIDES : M6P_ZHENGTE_SIDES;
  // 生肖 / 尾数 四兄弟的赔率差异（马、0尾 为特例，见 §3.4 §3.5）
  const M6P_XIAO_ODDS = { texiao: ['9.1', '11.55'], zhengxiao: ['1.1245', '1.4891'], yixiao: ['1.1', '1.41'], 'yixiao-no': ['1.54', '1.19'] };
  const M6P_WEI_ODDS = { weishu: ['1.41', '1.1'], 'weishu-no': ['1.19', '1.54'], teweishu: ['11.55', '9.1'] };
  const m6pOddsOf = (category, name) => {
    const isNum = /^\d{2}$/.test(name);
    if (category === '特码A') return isNum ? '47.3' : (M6P_TEMA_SIDES.find(b => b.name === name)?.a || '1.3');
    if (category === '特码B') return isNum ? '46.5' : (M6P_TEMA_SIDES.find(b => b.name === name)?.b || '1.25');
    if (category === '正码') return isNum ? '7.46' : '1.3';
    if (category.startsWith('正特')) return isNum ? '47.3' : (M6P_ZHENGTE_SIDES.find(b => b.name === name)?.odds || '1.3');
    if (category === '特肖') return name === '马' ? M6P_XIAO_ODDS.texiao[0] : M6P_XIAO_ODDS.texiao[1];
    if (category === '正肖') return name === '马' ? M6P_XIAO_ODDS.zhengxiao[0] : M6P_XIAO_ODDS.zhengxiao[1];
    if (category === '一肖') return name === '马' ? M6P_XIAO_ODDS.yixiao[0] : M6P_XIAO_ODDS.yixiao[1];
    if (category === '一肖不中') return name === '马' ? M6P_XIAO_ODDS['yixiao-no'][0] : M6P_XIAO_ODDS['yixiao-no'][1];
    if (category === '尾数') return name === '0尾' ? M6P_WEI_ODDS.weishu[0] : M6P_WEI_ODDS.weishu[1];
    if (category === '尾数不中') return name === '0尾' ? M6P_WEI_ODDS['weishu-no'][0] : M6P_WEI_ODDS['weishu-no'][1];
    if (category === '特尾数') return name === '0尾' ? M6P_WEI_ODDS.teweishu[0] : M6P_WEI_ODDS.teweishu[1];
    if (category === '特头数') return name === '0头' ? '4.74' : '4.2';
    if (category === '半波') return M6P_BANBO.find(b => b.name === name)?.odds || '5.3';
    if (category === '五行') return M6P_WUXING.find(b => b.name === name)?.odds || '4.2';
    if (category === '总肖') return M6P_ZONGXIAO.find(b => b.name === name)?.odds || '1.37';
    if (category === '七色波') return M6P_QISEBO.find(b => b.name === name)?.odds || '2.13';
    return '1.3';
  };
  // 生肖 / 尾数卡的赔率（依大类）
  const m6pXiaoOddsOf = (zodiac) => m6pOddsOf(m6pCategory, zodiac);
  const m6pWeiOddsOf = (tail) => m6pOddsOf(m6pCategory, tail);

  const toggleM6SimpleMode = () => {
    setM6SimpleMode(v => !v);
    setSelectedM6(new Set());
    setSelectedM6P(new Set());
  };
  const handleM6PlayTabClick = (cat) => {
    setM6PlayTab(cat);
    setM6SubTab(M6P_SUB_TABS[cat]?.[0].key || '');
  };
  const handleM6PCardClick = (name) => {
    const key = `${m6pCategory}|${name}`;
    const next = new Set(selectedM6P);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedM6P(next);
  };
  const m6pIsSelected = (name) => selectedM6P.has(`${m6pCategory}|${name}`);
  // 合肖／连码／不中：随机凑满一注
  const handleM6PQuickPick = () => {
    const n = m6pSub?.n || 0;
    const pool = m6PlayTab === 'hexiao' ? [...M6_ZODIACS] : M6P_NUMS.map(m6pPad);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSelectedM6P(new Set(pool.slice(0, n).map(v => `${m6pCategory}|${v}`)));
  };
  // 组合玩法的注数 = C(已选, 每注需选)；其余玩法一个点位一注
  const m6pPicked = selectedM6P.size;
  const m6pCount = m6pIsCombo ? m6pNck(m6pPicked, m6pSub?.n || 0) : m6pPicked;
  const m6pTotalCost = m6pCount * currentBetPrice;
  const handleM6PReset = () => {
    setSelectedM6P(new Set());
    setManualAmount('');
    setBetAmount(50);
  };
  const handleM6PSubmit = () => {
    if (m6pCount === 0) {
      showToast(m6pIsCombo ? `请至少选满 ${m6pSub?.n} 个组成一注！` : '请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (m6pTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    let items;
    if (m6pIsCombo) {
      const picked = Array.from(selectedM6P).map(k => k.split('|')[1]);
      items = m6pCombinations(picked, m6pSub.n).map(combo => ({
        name: combo.join(' '), odds: lhcOdds(m6pSub.odds), baseVal: currentBetPrice, category: m6pSub.label
      }));
    } else {
      items = Array.from(selectedM6P).map(key => {
        const [category, name] = key.split('|');
        return { name, odds: lhcOdds(m6pOddsOf(category, name)), baseVal: currentBetPrice, category };
      });
    }
    openBetDetailsModal('mark_six', items);
    setSelectedM6P(new Set());
  };

  // 型态 C：号码球按钮
  const renderM6PNumBall = (n, odds) => {
    const name = m6pPad(n);
    const isSelected = m6pIsSelected(name);
    return (
      <div
        key={name}
        className={`live-odds-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleM6PCardClick(name)}
        style={{ height: '58px', padding: '2px' }}
      >
        <img src={`lhc-ball/num=${name}.png`} alt={name} style={{ width: '30px', height: '30px', marginBottom: '3px' }} />
        <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>{lhcOdds(odds)}</div>
      </div>
    );
  };
  // 文字点位按钮：上面名称、下面赔率（样式同简易版）；odds 为 null 代表永久停用，灰底 + 显示 --
  const renderM6PBetBtn = (name, odds, colorOverride) => {
    const disabled = odds === null || odds === undefined;
    const isSelected = !disabled && m6pIsSelected(name);
    const color = disabled ? M6P_GRAY : (colorOverride || m6pBetColor(name));
    return (
      <div
        key={name}
        className={`live-odds-card ${isSelected ? 'selected' : ''}`}
        onClick={() => { if (!disabled) handleM6PCardClick(name); }}
        style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px', cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? '#f1f5f9' : undefined }}
      >
        <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color }}>{name}</div>
        <div className="odds-card-val" style={{ fontSize: '0.7rem', color }}>{disabled ? '--' : lhcOdds(odds)}</div>
      </div>
    );
  };
  // ===== Speed Race (一分极速赛车) embedded gameplay =====
  const handleSRCardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedSR);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedSR(next);
  };

  const srCount = selectedSR.size;
  const srTotalCost = srCount * currentBetPrice;

  const handleSRReset = () => {
    setSelectedSR(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleSRSubmit = () => {
    if (srCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (srTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedSR).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: '9.75', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('speed_race', items);
    setSelectedSR(new Set());
  };

  // ===== Speed Race 专业版盘面（样式同一分分分彩） =====
  const SR_PLAY_TABS = [
    { cat: 'cai', label: '猜球号' },
    { cat: 'sides', label: '两面盘' },
    { cat: 'sum', label: '冠亚和' }
  ];
  // 名次（第二层）：冠军 ~ 第十名
  const SR_POSITIONS = [
    { key: 'p1', label: '冠军', num: 1 },
    { key: 'p2', label: '亚军', num: 2 },
    { key: 'p3', label: '第三名', num: 3 },
    { key: 'p4', label: '第四名', num: 4 },
    { key: 'p5', label: '第五名', num: 5 },
    { key: 'p6', label: '第六名', num: 6 },
    { key: 'p7', label: '第七名', num: 7 },
    { key: 'p8', label: '第八名', num: 8 },
    { key: 'p9', label: '第九名', num: 9 },
    { key: 'p10', label: '第十名', num: 10 }
  ];
  const SR_SUM_LAYER = [{ key: 'sum', label: '冠亚和' }];
  // 冠亚和赔率：和值 3~19
  const SR_SUM_ODDS = {
    3: '44.1', 4: '44.1', 5: '22.05', 6: '22.05', 7: '14.7', 8: '14.7',
    9: '11.02', 10: '11.02', 11: '8.82', 12: '11.02', 13: '11.02', 14: '14.7',
    15: '14.7', 16: '22.05', 17: '22.05', 18: '44.1', 19: '44.1'
  };
  const srSecondLayer = srPlayTab === 'sum' ? SR_SUM_LAYER : SR_POSITIONS;
  const srActivePosObj = SR_POSITIONS.find(p => p.key === srActivePos);
  const srPosLabel = srActivePosObj?.label || '冠军';
  const srPosNum = srActivePosObj?.num || 1;
  const handleSrTabClick = (cat) => {
    setSrPlayTab(cat);
    setSrActivePos(cat === 'sum' ? 'sum' : 'p1');
  };
  // 依盘口分类/名称推算赔率
  const srpOddsOf = (category, name) => {
    if (category === '冠亚和') return SR_SUM_ODDS[name] || '9.8';
    if (category.endsWith('两面')) return '1.96';
    return '9.8'; // 猜球号
  };
  const toggleSrSimpleMode = () => {
    setSrSimpleMode(v => !v);
    setSelectedSR(new Set());
    setSelectedSRP(new Set());
  };
  const handleSRPCardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedSRP);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedSRP(next);
  };
  const srpCount = selectedSRP.size;
  const srpTotalCost = srpCount * currentBetPrice;
  const handleSRPReset = () => {
    setSelectedSRP(new Set());
    setManualAmount('');
    setBetAmount(50);
  };
  const handleSRPSubmit = () => {
    if (srpCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (srpTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedSRP).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: srpOddsOf(category, name), baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('speed_race', items);
    setSelectedSRP(new Set());
  };

  // ===== 一分分分彩 (Every-Minute Lottery) embedded gameplay =====
  // 前中后各盘口赔率
  const FFC_POSITION_BETS = [
    { name: '豹子', odds: '150' },
    { name: '顺子', odds: '15' },
    { name: '对子', odds: '3' },
    { name: '杂六', odds: '6' }
  ];
  // 龙虎和盘口赔率
  const FFC_DRAGON_BETS = [
    { name: '龙', odds: '2.22' },
    { name: '虎', odds: '2.22' },
    { name: '和', odds: '10' }
  ];
  // 依盘口分类/名称推算赔率
  const ffcOddsOf = (category, name) => {
    if (category === '总和') return '2';
    if (category === '龙虎和') return FFC_DRAGON_BETS.find(b => b.name === name)?.odds || '2.22';
    if (/^[0-9]$/.test(name)) return '10';           // 猜球号
    if (['大', '小', '单', '双'].includes(name)) return '1.98'; // 两面（各球）
    return FFC_POSITION_BETS.find(b => b.name === name)?.odds || '6'; // 前中后
  };

  // 第一层玩法 / 第二层选择（球号或区段），皆可左右滑动
  const FFC_PLAY_TABS = [
    { cat: 'cai', label: '猜球号' },
    { cat: 'sides', label: '两面盘' },
    { cat: 'position', label: '前中后' }
  ];
  const FFC_BALL_POSITIONS = [1, 2, 3, 4, 5].map(n => ({ key: `ball${n}`, label: `第${n}球` }));
  // 两面盘第二层：各球 + 总和（总和排最后）
  const FFC_SIDES_LAYER = [...FFC_BALL_POSITIONS, { key: 'sum', label: '总和' }];
  // 前中后第二层：龙虎和排最前
  const FFC_POS3_SECTIONS = [
    { key: 'dragon', label: '龙虎和' },
    { key: 'front', label: '前三' },
    { key: 'mid', label: '中三' },
    { key: 'back', label: '后三' }
  ];
  const ffcSecondLayer = ffcActiveTab === 'position'
    ? FFC_POS3_SECTIONS
    : (ffcActiveTab === 'sides' ? FFC_SIDES_LAYER : FFC_BALL_POSITIONS);
  const ffcPosNum = Number(ffcActivePos.replace('ball', '')) || 1;
  const ffcActiveSection = FFC_POS3_SECTIONS.find(s => s.key === ffcActivePos)?.label || '前三';
  const handleFfcTabClick = (cat) => {
    setFfcActiveTab(cat);
    setFfcActivePos(cat === 'position' ? 'dragon' : 'ball1');
  };

  // 简易版 / 专业版 切换：切换时清空两边已选点位（与切换玩法一致）
  const toggleFfcSimpleMode = () => {
    setFfcSimpleMode(v => !v);
    setSelectedFFC(new Set());
    setSelectedFFC2(new Set());
  };

  const handleFFCCardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedFFC);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedFFC(next);
  };

  const ffcCount = selectedFFC.size;
  const ffcTotalCost = ffcCount * currentBetPrice;

  const handleFFCReset = () => {
    setSelectedFFC(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleFFCSubmit = () => {
    if (ffcCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (ffcTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedFFC).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: ffcOddsOf(category, name), baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('ffc', items);
    setSelectedFFC(new Set());
  };

  // ===== 一分分分彩2 (简易版) embedded gameplay =====
  // 三个页签：万位(大小单双) / 龙虎(龙虎和) / 佰位(数字 0~9)
  const FFC2_TABS = [
    { cat: 'wan', label: '万位' },
    { cat: 'dragon', label: '龙虎' },
    { cat: 'bai', label: '佰位' }
  ];
  // 各盘口配色（依图片）
  const FFC2_COLORS = { '大': lotteryColor('大'), '小': lotteryColor('小'), '单': lotteryColor('单'), '双': lotteryColor('双'), '龙': LOTTERY_PINK, '虎': LOTTERY_BLUE, '和': lotteryColor('和') };
  const ffc2OddsOf = (category, name) => {
    if (category === '龙虎') return name === '和' ? '9.0' : '1.97';
    if (['大', '小', '单', '双'].includes(name)) return '1.97';
    return '9.6'; // 佰位数字
  };
  const handleFFC2CardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedFFC2);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedFFC2(next);
  };

  const ffc2Count = selectedFFC2.size;
  const ffc2TotalCost = ffc2Count * currentBetPrice;

  const handleFFC2Reset = () => {
    setSelectedFFC2(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleFFC2Submit = () => {
    if (ffc2Count === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (ffc2TotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedFFC2).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: ffc2OddsOf(category, name), baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('ffc2', items);
    setSelectedFFC2(new Set());
  };

  // ===== 一分幸运28 (Lucky 28) embedded gameplay =====
  // 四个页签：总和两面(大小单双 2) / 龙虎豹(龙虎豹 2.99) / 三球(顺子16.66 豹子100 对子3.7) / 总和(0~27)
  const L28_TABS = [
    { cat: 'sides', label: '总和两面' },
    { cat: 'dragon', label: '龙虎豹' },
    { cat: 'triple', label: '三球' },
    { cat: 'sum', label: '总和' }
  ];
  const L28_SIDES = ['大', '小', '单', '双'];
  const L28_DRAGON = [
    { name: '龙', color: LOTTERY_PINK },
    { name: '虎', color: LOTTERY_BLUE },
    { name: '豹', color: LOTTERY_YELLOW }
  ];
  const L28_TRIPLE = [
    { name: '顺子', odds: '16.66', color: LOTTERY_PINK },
    { name: '豹子', odds: '100', color: LOTTERY_YELLOW },
    { name: '对子', odds: '3.7', color: LOTTERY_BLUE }
  ];
  // 总和 0~27 赔率（对称：n 与 27-n 相同）
  const L28_SUM_ODDS = ['1000', '333.33', '166.66', '100', '66.66', '47.61', '35.71', '27.77', '22.22', '18.18', '15.87', '14.49', '13.69', '13.33'];
  const l28SumOddsOf = (n) => L28_SUM_ODDS[n <= 13 ? n : 27 - n];
  const l28OddsOf = (category, name) => {
    if (category === '总和两面') return '2';
    if (category === '龙虎豹') return '2.99';
    if (category === '三球') return L28_TRIPLE.find(t => t.name === name)?.odds || '3.7';
    if (category === '总和') return l28SumOddsOf(Number(name));
    return '2';
  };
  const l28ColorOf = (category, name) => {
    if (category === '龙虎豹') return L28_DRAGON.find(d => d.name === name)?.color;
    if (category === '三球') return L28_TRIPLE.find(t => t.name === name)?.color;
    return lotteryColor(name) || '#1e293b';
  };

  const handleL28CardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedL28);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedL28(next);
  };

  const l28Count = selectedL28.size;
  const l28TotalCost = l28Count * currentBetPrice;

  const handleL28Reset = () => {
    setSelectedL28(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleL28Submit = () => {
    if (l28Count === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (l28TotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedL28).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: l28OddsOf(category, name), baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('lucky28', items);
    setSelectedL28(new Set());
  };

  // ===== 一分幸运28 专业版盘面（样式同一分快三专业版） =====
  // 第一层玩法（可左右滑动的胶囊）
  const L28P_PLAY_TABS = [
    { cat: 'sum', label: '总和' },
    { cat: 'side', label: '边球' },
    { cat: 'tail', label: '尾球' },
    { cat: 'dragon', label: '龙虎豹' },
    { cat: 'extreme', label: '极值' },
    { cat: 'triple', label: '三球' }
  ];
  // 第二层：仅「总和」「尾球」有数字/两面之分
  const L28P_SUB_TABS = {
    sum: [{ key: 'num', label: '总和' }, { key: 'sides', label: '两面' }],
    tail: [{ key: 'num', label: '数字' }, { key: 'sides', label: '两面' }]
  };
  // 总和 0~27 赔率（对称：n 与 27-n 相同）
  const L28P_SUM_ODDS = ['900', '309.99', '154.99', '96', '63.99', '46.65', '34.99', '27.21', '21.77', '17.81', '15.55', '14.2', '13.41', '13.06'];
  const l28pSumOddsOf = (n) => L28P_SUM_ODDS[n <= 13 ? n : 27 - n];
  // 总和两面
  const L28P_SUM_SIDES = [
    { name: '大', odds: '1.96' }, { name: '小', odds: '1.96' }, { name: '单', odds: '1.96' }, { name: '双', odds: '1.96' },
    { name: '大单', odds: '4.23' }, { name: '小单', odds: '3.63' }, { name: '大双', odds: '3.63' }, { name: '小双', odds: '4.23' }
  ];
  // 边球
  const L28P_SIDE = [
    { name: '边', odds: '2.22' }, { name: '中', odds: '1.74' }, { name: '大边', odds: '4.44' }, { name: '小边', odds: '4.44' }
  ];
  // 尾球数字（总和末位）：仅 1~8，末位为 0 或 9 一律不中奖，故不开放这两个点位
  const L28P_TAIL_NUMS = ['1', '2', '3', '4', '5', '6', '7', '8'];
  // 尾球两面
  const L28P_TAIL_SIDES = [
    { name: '大', odds: '2.45' }, { name: '小', odds: '2.45' }, { name: '单', odds: '2.45' }, { name: '双', odds: '2.45' },
    { name: '大单', odds: '4.9' }, { name: '小单', odds: '4.9' }, { name: '大双', odds: '4.9' }, { name: '小双', odds: '4.9' }
  ];
  const L28P_DRAGON = [
    { name: '龙', odds: '2.93', color: LOTTERY_PINK },
    { name: '虎', odds: '2.93', color: LOTTERY_BLUE },
    { name: '豹', odds: '2.93', color: LOTTERY_YELLOW }
  ];
  const L28P_EXTREME = [{ name: '极大', odds: '17.49' }, { name: '极小', odds: '17.49' }];
  const L28P_TRIPLE = [
    { name: '顺子', odds: '16.32', color: LOTTERY_PINK },
    { name: '豹子', odds: '96', color: LOTTERY_YELLOW },
    { name: '对子', odds: '3.62', color: LOTTERY_BLUE }
  ];
  const l28pOddsOf = (category, name) => {
    if (category === '总和') return l28pSumOddsOf(Number(name));
    if (category === '总和两面') return L28P_SUM_SIDES.find(b => b.name === name)?.odds || '1.96';
    if (category === '边球') return L28P_SIDE.find(b => b.name === name)?.odds || '2.22';
    if (category === '尾球') return '9.8';
    if (category === '尾球两面') return L28P_TAIL_SIDES.find(b => b.name === name)?.odds || '2.45';
    if (category === '龙虎豹') return '2.93';
    if (category === '极值') return '17.49';
    if (category === '三球') return L28P_TRIPLE.find(b => b.name === name)?.odds || '3.62';
    return '1.96';
  };
  // 两面/边球点位配色：大系粉、小系蓝，其余深色
  const l28pSideColor = (name) => (
    name.startsWith('大') ? LOTTERY_PINK : name.startsWith('小') ? LOTTERY_BLUE : (lotteryColor(name) || '#1e293b')
  );
  const toggleL28SimpleMode = () => {
    setL28SimpleMode(v => !v);
    setSelectedL28(new Set());
    setSelectedL28P(new Set());
  };
  const handleL28PlayTabClick = (cat) => {
    setL28PlayTab(cat);
    setL28SubTab('num');
  };
  const handleL28PCardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedL28P);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedL28P(next);
  };
  // 数字点位（圆圈内号码 + 下方赔率）
  const renderL28PNumCard = (category, name, odds) => {
    const isSelected = selectedL28P.has(`${category}|${name}`);
    return (
      <div
        key={name}
        className={`live-odds-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleL28PCardClick(category, name)}
        style={{ height: '80px', padding: '0 4px' }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: `1px solid ${isSelected ? '#1e90ff' : '#cbd5e1'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: isSelected ? '#1e90ff' : '#1e293b',
            marginBottom: '4px'
          }}
        >
          {name}
        </div>
        <div className="odds-card-val" style={{ fontSize: '0.62rem' }}>{odds}</div>
      </div>
    );
  };
  // 文字点位（大小单双 / 龙虎豹 等）
  const renderL28PTextCard = (category, name, odds, color) => {
    const isSelected = selectedL28P.has(`${category}|${name}`);
    return (
      <div
        key={name}
        className={`live-odds-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleL28PCardClick(category, name)}
        style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
      >
        <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color }}>{name}</div>
        <div className="odds-card-val" style={{ fontSize: '0.7rem', color }}>{odds}</div>
      </div>
    );
  };
  const l28pCount = selectedL28P.size;
  const l28pTotalCost = l28pCount * currentBetPrice;
  const handleL28PReset = () => {
    setSelectedL28P(new Set());
    setManualAmount('');
    setBetAmount(50);
  };
  const handleL28PSubmit = () => {
    if (l28pCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (l28pTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedL28P).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: l28pOddsOf(category, name), baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('lucky28', items);
    setSelectedL28P(new Set());
  };

  // ===== 鱼虾蟹 (Fish-Prawn-Crab) embedded gameplay =====
  const FC_ODDS = { single: '1.97', all: '180.0' };
  const handleFCCardClick = (category, symbolKey) => {
    const key = `${category}|${symbolKey}`;
    const next = new Set(selectedFC);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedFC(next);
  };

  const fcCount = selectedFC.size;
  const fcTotalCost = fcCount * currentBetPrice;

  const handleFCReset = () => {
    setSelectedFC(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleFCSubmit = () => {
    if (fcCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (fcTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedFC).map(key => {
      const [category, symbolKey] = key.split('|');
      const sym = FISH_CRAB_SYMBOLS.find(s => s.key === symbolKey);
      return {
        name: sym ? sym.label : symbolKey,
        odds: category === '全围' ? FC_ODDS.all : FC_ODDS.single,
        baseVal: currentBetPrice,
        category
      };
    });
    openBetDetailsModal('fish_crab', items);
    setSelectedFC(new Set());
  };

  // ===== 百家乐 (Baccarat) embedded gameplay =====
  const BAC_ALL = [...BAC_MAIN, ...BAC_PAIR, ...BAC_SIDES];
  const bacCategoryOf = { main: '庄闲', pair: '对子', sides: '两面' };
  // 互斥盘口：选中其一会取消同组其他项（庄/闲，闲单/闲双，庄单/庄双）
  const BAC_EXCLUSIVE = {
    '庄闲|庄': ['庄闲|闲'],
    '庄闲|闲': ['庄闲|庄'],
    '两面|闲单': ['两面|闲双'],
    '两面|闲双': ['两面|闲单'],
    '两面|庄单': ['两面|庄双'],
    '两面|庄双': ['两面|庄单']
  };
  const handleBacCardClick = (name) => {
    const key = `${bacCategoryOf[bacActiveTab]}|${name}`;
    const next = new Set(selectedBac);
    if (next.has(key)) {
      next.delete(key);
    } else {
      (BAC_EXCLUSIVE[key] || []).forEach(k => next.delete(k));
      next.add(key);
    }
    setSelectedBac(next);
  };

  const bacCount = selectedBac.size;
  const bacTotalCost = bacCount * currentBetPrice;

  const handleBacReset = () => {
    setSelectedBac(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleBacSubmit = () => {
    if (bacCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (bacTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedBac).map(key => {
      const [category, name] = key.split('|');
      const def = BAC_ALL.find(b => b.name === name);
      return { name, odds: def ? def.odds : '2.0', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('baccarat', items);
    setSelectedBac(new Set());
  };

  // ===== 动物运动会 (Animal Sports) embedded gameplay =====
  const animalCatOf = { twosides: '冠军两面', single: '冠军单码' };
  const handleAnimalCardClick = (name) => {
    const key = `${animalCatOf[animalActiveTab]}|${name}`;
    const next = new Set(selectedAnimal);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedAnimal(next);
  };

  const animalCount = selectedAnimal.size;
  const animalTotalCost = animalCount * currentBetPrice;

  const handleAnimalReset = () => {
    setSelectedAnimal(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleAnimalSubmit = () => {
    if (animalCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (animalTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedAnimal).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: category === '冠军单码' ? '5.7' : '1.9', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('animal_sports', items);
    setSelectedAnimal(new Set());
  };

  // ===== 体育赛事直播间 gameplay（纯前端，盘口固定）=====
  // 本房间开的大小盘（房间用 sportsBoard 指定，预设只开全场三种）
  const spTabs = SPORTS_BOARDS[sportsBoard] || SPORTS_BOARDS.default;
  const spCurrentTab = spTabs.find(t => t.cat === spActiveTab) || spTabs[0];
  // 赔率查询：简易版看玩法页签，专业版看盘口卡（两边玩法名不重复）
  const spOptionOf = (label, name) =>
    spTabs.find(t => t.label === label)?.options.find(o => o.name === name)
    || SPORTS_PRO_MARKETS.find(m => m.title === label)?.options.find(o => o.name === name);

  // 专业版：依筛选显示的盘口卡
  const spProMarkets = SPORTS_PRO_MARKETS.filter(m => m.filters.includes(spProFilter));
  const toggleSpSection = (key) => setSpExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSpBetClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedSp);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedSp(next);
  };
  const handleSpCardClick = (name) => handleSpBetClick(spCurrentTab.label, name);

  const spCount = selectedSp.size;
  const spTotalCost = spCount * currentBetPrice;

  const handleSpReset = () => {
    setSelectedSp(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleSpSubmit = () => {
    if (spCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (spTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedSp).map(key => {
      const [category, name] = key.split('|');
      const opt = spOptionOf(category, name);
      // 注单上带出盘口数（大 139.5），跟盘面看到的一致
      return { name: `${name} ${opt?.line || ''}`.trim(), odds: opt?.odds || '1.80', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('sports_live', items);
    setSelectedSp(new Set());
  };

  const toggleDropdownMenu = () => {
    setMenuOpen(!menuOpen);
    setDrawHistoryOpen(false); // 菜单与历史开奖弹窗不同时展开
  };

  const handleMenuDropdownItemClick = (label) => {
    setMenuOpen(false);
    if (label === '活动规则') {
      // 已有规则说明的游戏：点击「活动规则」打开对应说明页
      if (activeCarouselGame === 'fishcrab') { setShowFcRules(true); return; }
      if (activeCarouselGame === 'baccarat') { setShowBacRules(true); return; }
    }
    showToast(`提示：【${label}】正在对接中，敬请期待！`);
  };

  // 沉浸式：切换视频铺满竖屏
  const toggleImmersive = () => {
    setImmersive(prev => {
      const next = !prev;
      showToast(next ? '已进入沉浸模式' : '已退出沉浸模式');
      return next;
    });
  };

  // 全屏：强制横屏观看（按播放器容器尺寸旋转 90°）
  const enterLandscape = () => {
    const el = overlayRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setLandscapeSize({ w: r.width, h: r.height });
    }
    setLandscape(true);
  };

  // 边看边玩游戏控制台（视频/短剧共用）
  const renderPlayTab = () => (
              <div className="vp-play-panel">
                {/* Game Carousel Switcher（视频/短剧统一：默认收合，点左上角切换箭头后从上方弹出） */}
                {carouselOpen && (
                <>
                <div className="vp-carousel-backdrop" onClick={() => setCarouselOpen(false)}></div>
                <div className="vp-game-carousel vp-game-carousel-overlay" ref={gameCarouselRef}>
                  {carouselGameItems.map(item => {
                    const isPlayable = playableCarouselGames.includes(item.key);
                    return (
                      <div
                        key={item.key}
                        className={`vp-game-card ${activeCarouselGame === item.key ? 'active' : ''} ${isPlayable ? '' : 'disabled'}`}
                        onClick={() => handleCarouselGameClick(item)}
                      >
                        {item.emoji ? (
                          <span className="vp-game-emoji-icon">{item.emoji}</span>
                        ) : (
                          <img src={item.img} alt={item.label} />
                        )}
                        <span className="vp-game-label-capsule">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
                </>
                )}

                {/* Betting Area - conditional on selected game */}
                {activeCarouselGame === 'fast3' ? (
                  // Fully interactive Fast Three Lottery console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>一分快三</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div 
                              key={opt} 
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="vp-bet-header-row2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            className="vp-f3-mode-switch"
                            onClick={toggleF3SimpleMode}
                            title={f3SimpleMode ? '当前简易版，点击切换专业版' : '当前专业版，点击切换简易版'}
                            style={{
                              flexShrink: 0,
                              position: 'relative',
                              width: '46px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#eef2f6',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                color: '#ffffff',
                                background: f3SimpleMode ? '#22c55e' : '#ef4444',
                                transform: f3SimpleMode ? 'translateX(22px)' : 'translateX(0)',
                                transition: 'transform 0.18s ease, background 0.18s ease'
                              }}
                            >
                              {f3SimpleMode ? '简' : '专'}
                            </span>
                          </div>
                          <span>第 {String(issue).slice(-5)} 期</span>
                        </div>
                        {renderDrawResultTrigger('fast3', lastDice)}
                      </div>

                      {renderDrawHistoryPanel('fast3')}
                    </div>

                    <div className="embedded-game-body">
                      {f3SimpleMode ? (
                      <React.Fragment key="f3-simple">
                      {/* Play tabs */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'size', label: '大小' },
                          { cat: 'pair', label: '对子' },
                          { cat: 'triple', label: '豹子' },
                          { cat: 'sum', label: '总和' },
                          { cat: 'single', label: '单骰' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${activeTab === tab.cat ? 'active' : ''}`}
                            onClick={() => {
                              setActiveTab(tab.cat);
                              setSelectedOdds(new Set());
                            }}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      {/* Betting Options Grid（点位样式与一分六合彩一致） */}
                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {oddsData[activeTab]?.map(card => {
                            const isSelected = selectedOdds.has(card.name);
                            return (
                              <div
                                key={card.name}
                                className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleOddsCardClick(card.name)}
                                style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                              >
                                <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: lotteryColor(card.name) }}>{activeTab === 'sum' ? card.name.replace('和值', '') : renderDiceOptionName(card.name)}</div>
                                <div className="odds-card-val" style={{ fontSize: '0.7rem', color: lotteryColor(card.name) }}>{card.odds}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      </React.Fragment>
                      ) : (
                      <React.Fragment key="f3-pro">
                      {/* 专业版：玩法页签（可左右滑动，样式同一分分分彩的圆角胶囊） */}
                      <div className="sr-scroll-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', background: '#ffffff', padding: '6px 12px', borderBottom: '1px solid #e1e8ed' }}>
                        {F3_PLAY_TABS.map(tab => {
                          const active = f3PlayTab === tab.cat;
                          return (
                            <div
                              key={tab.cat}
                              onClick={() => setF3PlayTab(tab.cat)}
                              style={{
                                flexShrink: 0,
                                minWidth: '58px',
                                textAlign: 'center',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                border: active ? '1px solid transparent' : '1px solid #e1e8ed',
                                // 一律用长写，不要用 background 简写：简写会把 background-clip 重设成
                                // border-box，而切换页签时 React 的 style diff 只更新有变动的属性、
                                // 不会重新写入 backgroundClip，于是渐层渗进 1px 透明边框，
                                // 左缘露出渐层深色端 = 一条深蓝色细线
                                backgroundColor: active ? 'transparent' : '#ffffff',
                                backgroundImage: active ? 'linear-gradient(135deg, #4aa3f7 0%, #2f6fe0 100%)' : 'none',
                                backgroundClip: 'padding-box',
                                WebkitBackgroundClip: 'padding-box',
                                color: active ? '#ffffff' : '#57606f',
                                fontWeight: 500
                              }}
                            >
                              {tab.label}
                            </div>
                          );
                        })}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '10px 12px' }}>
                        {/* 三军：单骰 1~6 */}
                        {f3PlayTab === 'army' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {F3_ARMY.map(name => {
                              const isSelected = selectedF3P.has(`三军|${name}`);
                              return (
                                <div key={name} className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('三军', name)} style={{ height: '92px', padding: '0 4px' }}>
                                  <div style={{ marginBottom: '4px' }}>{renderDiceOptionName(name)}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.65rem' }}>1.96</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 短牌：双同号 11~66 */}
                        {f3PlayTab === 'short' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {F3_SHORT.map(name => {
                              const isSelected = selectedF3P.has(`短牌|${name}`);
                              return (
                                <div key={name} className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('短牌', name)} style={{ height: '92px', padding: '0 4px' }}>
                                  <div style={{ marginBottom: '4px' }}>{renderDiceOptionName(name)}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.65rem' }}>13.23</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 长牌：两颗不同点数 15 组 */}
                        {f3PlayTab === 'long' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {F3_LONG.map(name => {
                              const isSelected = selectedF3P.has(`长牌|${name}`);
                              return (
                                <div key={name} className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('长牌', name)} style={{ height: '92px', padding: '0 4px' }}>
                                  <div style={{ marginBottom: '4px' }}>{renderDiceOptionName(name)}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.65rem' }}>7</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 全骰：三同号 111~666 + 任意全骰 */}
                        {f3PlayTab === 'triple' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {F3_TRIPLE.map(name => {
                              const isSelected = selectedF3P.has(`全骰|${name}`);
                              return (
                                <div key={name} className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('全骰', name)} style={{ height: '92px', padding: '0 4px' }}>
                                  <div style={{ marginBottom: '4px' }}>{renderDiceOptionName(name)}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>200.88</div>
                                </div>
                              );
                            })}
                            {(() => {
                              const isSelected = selectedF3P.has('全骰|全骰');
                              return (
                                <div key="全骰" className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('全骰', '全骰')} style={{ height: '92px', padding: '0 4px' }}>
                                  <div className="odds-card-name" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: LOTTERY_YELLOW }}>全骰</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem', color: LOTTERY_YELLOW }}>35.28</div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* 和值 3~18 */}
                        {f3PlayTab === 'sum' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {Array.from({ length: 16 }, (_, i) => i + 3).map(sum => {
                              const isSelected = selectedF3P.has(`和值|${sum}`);
                              return (
                                <div key={sum} className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('和值', String(sum))} style={{ height: '76px', padding: '0 4px' }}>
                                  <div className="odds-card-name" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px', color: '#1e293b' }}>{sum}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>{F3_SUM_ODDS[sum]}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 二同号：一对 + 一颗不同（30 组） */}
                        {f3PlayTab === 'twosame' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {F3_TWO_SAME.map(name => {
                              const isSelected = selectedF3P.has(`二同号|${name}`);
                              return (
                                <div key={name} className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('二同号', name)} style={{ height: '96px', padding: '0 4px' }}>
                                  <div style={{ marginBottom: '4px' }}>{renderDicePyramid(name)}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>69.12</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 三不同：三颗不同（20 组） */}
                        {f3PlayTab === 'threediff' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {F3_THREE_DIFF.map(name => {
                              const isSelected = selectedF3P.has(`三不同|${name}`);
                              return (
                                <div key={name} className={`live-odds-card ${isSelected ? 'selected' : ''}`} onClick={() => handleF3PCardClick('三不同', name)} style={{ height: '96px', padding: '0 4px' }}>
                                  <div style={{ marginBottom: '4px' }}>{renderDicePyramid(name)}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>35.28</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </React.Fragment>
                      )}

                      {/* Embedded game betting console */}
                      <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                        {/* Top Info Row */}
                        <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                          <div className="info-balance-box">
                            余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                            <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                          </div>
                          <div className="info-selected-box">
                            {!f3SimpleMode && <>共 <span className="console-selected-value">{f3pCount}</span> 注 &nbsp; </>}下注金额: <span className="console-selected-value">{(f3SimpleMode ? totalCost : f3pTotalCost).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Middle Action Row */}
                        <div className="bet-console-action-row" style={{ gap: '6px' }}>
                          <button
                            className="console-edit-amount-btn"
                            onClick={() => setEditQuickAmountsActive(true)}
                          >
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                            {quickAmounts.map(val => (
                              <div
                                key={val}
                                className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                                onClick={() => handleQuickAmountClick(val)}
                                style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                              >
                                {val}
                              </div>
                            ))}
                          </div>
                          <input
                            type="number"
                            className="manual-amount-input"
                            placeholder="输入金额"
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                            style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                          />
                        </div>

                        {/* Bottom Button Row */}
                        <div className="bet-console-buttons-row">
                          <button className="console-cancel-btn" onClick={f3SimpleMode ? handleResetBets : handleF3PReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                            <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                          </button>
                          <button className="console-submit-btn active" onClick={f3SimpleMode ? handleSubmitBet : handleF3PSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                            提交下注
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isLhcGame ? (
                  // Mark Six (一分澳门六合彩 / 澳门六合彩) lottery console —— 两者盘面完全相同，只差开奖节奏
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box is-compact">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>{isLhcDay ? '澳门六合彩' : '一分澳门六合彩'}</span>
                        </div>
                        {isLhcDay ? renderLhcDayCountdown() : renderCountdown('开奖：')}
                        <div className="vp-bet-header-right is-compact">
                          {renderLhcPanPicker()}
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div 
                              key={opt} 
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="vp-bet-header-row2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            className="vp-m6-mode-switch"
                            onClick={toggleM6SimpleMode}
                            title={m6SimpleMode ? '当前简易版，点击切换专业版' : '当前专业版，点击切换简易版'}
                            style={{
                              flexShrink: 0,
                              position: 'relative',
                              width: '46px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#eef2f6',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                color: '#ffffff',
                                background: m6SimpleMode ? '#22c55e' : '#ef4444',
                                transform: m6SimpleMode ? 'translateX(22px)' : 'translateX(0)',
                                transition: 'transform 0.18s ease, background 0.18s ease'
                              }}
                            >
                              {m6SimpleMode ? '简' : '专'}
                            </span>
                          </div>
                          <span>第 {isLhcDay ? lhcDayIssue : String(issue).slice(-5)} 期</span>
                        </div>
                        {renderDrawResultTrigger(isLhcDay ? 'lhcday' : 'marksix', isLhcDay ? lhcDayResult : m6Result)}
                      </div>

                      {renderDrawHistoryPanel(isLhcDay ? 'lhcday' : 'marksix')}
                    </div>

                    <div className="embedded-game-body">
                      {m6SimpleMode ? (
                      <React.Fragment key="m6-simple">
                      {/* Play category tabs */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'two-sides', label: '特码两面' },
                          { cat: 'color', label: '特码色波' },
                          { cat: 'zodiac', label: '特码生肖' },
                          { cat: 'special', label: '特码' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${m6ActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setM6ActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        {/* 两面 */}
                        {m6ActiveTab === 'two-sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['大', '小', '单', '双'].map(name => {
                              const isSelected = selectedM6.has(`两面|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('两面', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: lotteryColor(name) }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: lotteryColor(name) }}>{lhcOdds('9.75')}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 色波 */}
                        {m6ActiveTab === 'color' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {[{ name: '红', color: '#e03131' }, { name: '绿', color: '#2f9e44' }, { name: '蓝', color: '#1c7ed6' }].map(opt => {
                              const isSelected = selectedM6.has(`色波|${opt.name}`);
                              return (
                                <div
                                  key={opt.name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('色波', opt.name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: opt.color }}>{opt.name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>{lhcOdds('9.75')}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 生肖 */}
                        {m6ActiveTab === 'zodiac' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6_ZODIACS.map(name => {
                              const isSelected = selectedM6.has(`生肖|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('生肖', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.9rem', marginBottom: '2px' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>{lhcOdds('9.75')}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 特码 */}
                        {m6ActiveTab === 'special' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {Array.from({ length: 49 }, (_, i) => i + 1).map(n => {
                              const name = n.toString().padStart(2, '0');
                              const isSelected = selectedM6.has(`特码|${name}`);
                              return (
                                <div
                                  key={n}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('特码', name)}
                                  style={{ height: '58px', padding: '2px' }}
                                >
                                  <img className="vp-m6-num-ball-img" src={`lhc-ball/num=${name}.png`} alt={name} style={{ width: '30px', height: '30px', marginBottom: '3px' }} />
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>{lhcOdds('9.75')}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </React.Fragment>
                      ) : (
                      <React.Fragment key="m6-pro">
                      {/* 专业版：第一层玩法大类（可左右滑动的胶囊） */}
                      <div className="sr-scroll-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', background: '#ffffff', padding: '6px 12px', borderBottom: '1px solid #e1e8ed' }}>
                        {M6P_PLAY_TABS.map(tab => {
                          const active = m6PlayTab === tab.cat;
                          return (
                            <div
                              key={tab.cat}
                              onClick={() => handleM6PlayTabClick(tab.cat)}
                              style={{
                                flexShrink: 0,
                                minWidth: '58px',
                                textAlign: 'center',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                border: active ? '1px solid transparent' : '1px solid #e1e8ed',
                                // 一律用长写，不要用 background 简写：简写会把 background-clip 重设成
                                // border-box，而切换页签时 React 的 style diff 只更新有变动的属性、
                                // 不会重新写入 backgroundClip，于是渐层渗进 1px 透明边框，
                                // 左缘露出渐层深色端 = 一条深蓝色细线
                                backgroundColor: active ? 'transparent' : '#ffffff',
                                backgroundImage: active ? 'linear-gradient(135deg, #4aa3f7 0%, #2f6fe0 100%)' : 'none',
                                backgroundClip: 'padding-box',
                                WebkitBackgroundClip: 'padding-box',
                                color: active ? '#ffffff' : '#57606f',
                                fontWeight: 500
                              }}
                            >
                              {tab.label}
                            </div>
                          );
                        })}
                      </div>

                      {/* 第二层小类：特码A/B、特一~特六、合肖/连码/不中 的组合类别 */}
                      {m6pSubList && (
                        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                          <i className="fa-solid fa-chevron-left" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                          <div className="ffc-scroll-row" style={{ display: 'flex', overflowX: 'auto', flex: 1, minWidth: 0 }}>
                            {m6pSubList.map(item => {
                              const active = m6pSub?.key === item.key;
                              return (
                                <div
                                  key={item.key}
                                  onClick={() => setM6SubTab(item.key)}
                                  className={`vp-sub-tab${active ? ' is-active' : ''}`}
                                >
                                  {item.label}
                                </div>
                              );
                            })}
                          </div>
                          <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                        </div>
                      )}

                      <div ref={m6pBodyRef} className="vp-odds-area" style={{ padding: '10px 12px' }}>
                        {/* 特码A/B、正码、正特一~六：数字 或 两面 */}
                        {M6P_NUMBER_TABS.includes(m6PlayTab) && (
                          m6SubTab === 'sides' ? (
                            <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                              {m6pSideBets.map(bet => renderM6PBetBtn(bet.name, bet.odds))}
                            </div>
                          ) : (
                            <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                              {M6P_NUMS.map(n => renderM6PNumBall(n, m6pNumOdds))}
                            </div>
                          )
                        )}

                        {/* 特肖 / 正肖 / 一肖 / 一肖不中：12 个生肖点位 */}
                        {M6P_XIAO_TABS.includes(m6PlayTab) && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {/* 生肖的龙／虎不套两面盘的蓝橘配色，一律深色 */}
                            {M6_ZODIACS.map(z => renderM6PBetBtn(z, m6pXiaoOddsOf(z), '#1e293b'))}
                          </div>
                        )}

                        {/* 尾数 / 尾数不中 / 特尾数：10 个尾数点位 */}
                        {M6P_WEI_TABS.includes(m6PlayTab) && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6P_TAIL_GROUPS.map(g => renderM6PBetBtn(g.name, m6pWeiOddsOf(g.name)))}
                          </div>
                        )}

                        {/* 特头数：5 个头数点位 */}
                        {m6PlayTab === 'tetoushu' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6P_HEAD_GROUPS.map(g => renderM6PBetBtn(g.name, g.name === '0头' ? '4.74' : '4.2'))}
                          </div>
                        )}

                        {/* 半波：30 个组合点位（红 → 蓝 → 绿） */}
                        {m6PlayTab === 'banbo' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6P_BANBO.map(b => renderM6PBetBtn(b.name, b.odds, M6P_BO[b.name[0]]))}
                          </div>
                        )}

                        {/* 五行：5 个点位 */}
                        {m6PlayTab === 'wuxing' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6P_WUXING.map(b => renderM6PBetBtn(b.name, b.odds))}
                          </div>
                        )}

                        {/* 总肖：8 颗 */}
                        {m6PlayTab === 'zongxiao' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6P_ZONGXIAO.map(b => renderM6PBetBtn(b.name, b.odds))}
                          </div>
                        )}

                        {/* 七色波：4 颗 */}
                        {m6PlayTab === 'qisebo' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6P_QISEBO.map(b => renderM6PBetBtn(b.name, b.odds))}
                          </div>
                        )}

                        {/* 合肖 / 连码 / 不中：复选后自动展开成 C(M,N) 注 */}
                        {m6pIsCombo && (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '6px 10px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.68rem', color: '#2563eb' }}>
                                已选 {m6pPicked} {m6PlayTab === 'hexiao' ? '生肖' : '号码'}（{m6pSub?.label}，共 {m6pCount} 注）· 赔率 {lhcOdds(m6pSub?.odds)}
                              </span>
                              <span
                                onClick={handleM6PQuickPick}
                                style={{ flexShrink: 0, fontSize: '0.68rem', color: '#ffffff', background: '#3b82f6', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}
                              >
                                快选
                              </span>
                            </div>
                            {m6PlayTab === 'hexiao' ? (
                              <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                {M6_ZODIACS.map(z => renderM6PBetBtn(z, m6pSub?.odds, '#1e293b'))}
                              </div>
                            ) : (
                              <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                                {M6P_NUMS.map(n => renderM6PNumBall(n, m6pSub?.odds))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      </React.Fragment>
                      )}
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{m6SimpleMode ? m6Count : m6pCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{(m6SimpleMode ? m6TotalCost : m6pTotalCost).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={m6SimpleMode ? handleM6Reset : handleM6PReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={m6SimpleMode ? handleM6Submit : handleM6PSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'speedrace' ? (
                  // Speed Race (一分极速赛车) lottery console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>一分极速赛车</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div 
                              key={opt} 
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="vp-bet-header-row2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            className="vp-sr-mode-switch"
                            onClick={toggleSrSimpleMode}
                            title={srSimpleMode ? '当前简易版，点击切换专业版' : '当前专业版，点击切换简易版'}
                            style={{
                              flexShrink: 0,
                              position: 'relative',
                              width: '46px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#eef2f6',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                color: '#ffffff',
                                background: srSimpleMode ? '#22c55e' : '#ef4444',
                                transform: srSimpleMode ? 'translateX(22px)' : 'translateX(0)',
                                transition: 'transform 0.18s ease, background 0.18s ease'
                              }}
                            >
                              {srSimpleMode ? '简' : '专'}
                            </span>
                          </div>
                          <span>第 {String(issue).slice(-5)} 期</span>
                        </div>
                        {renderDrawResultTrigger('speedrace', srResult)}
                      </div>

                      {renderDrawHistoryPanel('speedrace')}
                    </div>

                    <div className="embedded-game-body">
                      {srSimpleMode ? (
                      <>
                      {/* Play category tabs */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'two-sides', label: '冠军两面' },
                          { cat: 'sum', label: '冠亚和' },
                          { cat: 'single', label: '冠军单码' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${srActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setSrActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        {/* 冠军两面 */}
                        {srActiveTab === 'two-sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['大', '小', '单', '双'].map(name => {
                              const isSelected = selectedSR.has(`冠军两面|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRCardClick('冠军两面', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: lotteryColor(name) }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: lotteryColor(name) }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 冠亚和 */}
                        {srActiveTab === 'sum' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['和大', '和小', '和单', '和双'].map(name => {
                              const isSelected = selectedSR.has(`冠亚和|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRCardClick('冠亚和', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: lotteryColor(name) }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: lotteryColor(name) }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 冠军单码 */}
                        {srActiveTab === 'single' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                              const name = String(num);
                              const isSelected = selectedSR.has(`冠军单码|${name}`);
                              return (
                                <div
                                  key={num}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRCardClick('冠军单码', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <img src={`PK10-ball/num=${num}.png`} alt={num} style={{ width: '26px', height: '26px', marginBottom: '2px' }} />
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </>
                      ) : (
                      <>
                      {/* 专业版：第一层玩法 猜球号/两面盘/冠亚和（样式同一分分分彩） */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {SR_PLAY_TABS.map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${srPlayTab === tab.cat ? 'active' : ''}`}
                            onClick={() => handleSrTabClick(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      {/* 第二层：名次（可左右滑动，两侧箭头） */}
                      <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                        <i className="fa-solid fa-chevron-left" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                        <div className="sr-scroll-row" style={{ display: 'flex', overflowX: 'auto', flex: 1, minWidth: 0 }}>
                          {srSecondLayer.map(item => {
                            const active = srActivePos === item.key;
                            return (
                              <div
                                key={item.key}
                                onClick={() => setSrActivePos(item.key)}
                                className={`vp-sub-tab${active ? ' is-active' : ''}`}
                              >
                                {item.label}
                              </div>
                            );
                          })}
                        </div>
                        <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                      </div>

                      <div className="vp-odds-area" style={{ padding: '10px 12px' }}>
                        {/* 猜球号：所选名次的号码 1~10 */}
                        {srPlayTab === 'cai' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                              const category = `${srPosLabel}猜号`;
                              const isSelected = selectedSRP.has(`${category}|${num}`);
                              return (
                                <div
                                  key={num}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRPCardClick(category, String(num))}
                                  style={{ height: '78px', padding: '0 4px' }}
                                >
                                  <img src={`PK10-ball/num=${num}.png`} alt={num} style={{ width: '26px', height: '26px', marginBottom: '2px' }} />
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>9.8</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 两面盘：大/小/单/双（名次 1~5 另含 龙/虎） */}
                        {srPlayTab === 'sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {[...['大', '小', '单', '双'], ...(srPosNum <= 5 ? ['龙', '虎'] : [])].map(name => {
                              const category = `${srPosLabel}两面`;
                              const isSelected = selectedSRP.has(`${category}|${name}`);
                              const color = name === '龙' ? LOTTERY_PINK : name === '虎' ? LOTTERY_BLUE : lotteryColor(name);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRPCardClick(category, name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color }}>1.96</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 冠亚和：和值 3~19 */}
                        {srPlayTab === 'sum' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {Array.from({ length: 17 }, (_, i) => i + 3).map(sum => {
                              const isSelected = selectedSRP.has(`冠亚和|${sum}`);
                              return (
                                <div
                                  key={sum}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRPCardClick('冠亚和', String(sum))}
                                  style={{ height: '78px', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px', color: '#1e293b' }}>{sum}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>{SR_SUM_ODDS[sum]}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </>
                      )}
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{srSimpleMode ? srCount : srpCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{(srSimpleMode ? srTotalCost : srpTotalCost).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={srSimpleMode ? handleSRReset : handleSRPReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={srSimpleMode ? handleSRSubmit : handleSRPSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'ffc' ? (
                  // 一分分分彩 (Every-Minute Lottery) console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>一分分分彩</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div
                              key={opt}
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="vp-bet-header-row2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            className="vp-ffc-mode-switch"
                            onClick={toggleFfcSimpleMode}
                            title={ffcSimpleMode ? '当前简易版，点击切换专业版' : '当前专业版，点击切换简易版'}
                            style={{
                              flexShrink: 0,
                              position: 'relative',
                              width: '46px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#eef2f6',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                color: '#ffffff',
                                background: ffcSimpleMode ? '#22c55e' : '#ef4444',
                                transform: ffcSimpleMode ? 'translateX(22px)' : 'translateX(0)',
                                transition: 'transform 0.18s ease, background 0.18s ease'
                              }}
                            >
                              {ffcSimpleMode ? '简' : '专'}
                            </span>
                          </div>
                          <span>第 {String(issue).slice(-5)} 期</span>
                        </div>
                        {renderDrawResultTrigger('ffc', ffcResult)}
                      </div>

                      {renderDrawHistoryPanel('ffc')}
                    </div>

                    <div className="embedded-game-body">
                      {ffcSimpleMode ? (
                      <>
                      {/* 简易版：万位 / 龙虎 / 佰位（盘面同一分分分彩2） */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {FFC2_TABS.map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${ffc2ActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setFfc2ActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        {/* 万位：大 / 小 / 单 / 双 */}
                        {ffc2ActiveTab === 'wan' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['大', '小', '单', '双'].map(name => {
                              const isSelected = selectedFFC2.has(`万位|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFC2CardClick('万位', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: FFC2_COLORS[name] }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: FFC2_COLORS[name] }}>1.97</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 龙虎：龙 / 虎 / 和 */}
                        {ffc2ActiveTab === 'dragon' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {['龙', '虎', '和'].map(name => {
                              const isSelected = selectedFFC2.has(`龙虎|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFC2CardClick('龙虎', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: FFC2_COLORS[name] }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: FFC2_COLORS[name] }}>{name === '和' ? '9.0' : '1.97'}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 佰位：数字 0 ~ 9 */}
                        {ffc2ActiveTab === 'bai' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {Array.from({ length: 10 }, (_, i) => String(i)).map(name => {
                              const isSelected = selectedFFC2.has(`佰位|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFC2CardClick('佰位', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px', color: '#1e293b' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>9.6</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </>
                      ) : (
                      <>
                      {/* 第一层：玩法（样式同一分分分彩2） */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {FFC_PLAY_TABS.map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${ffcActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => handleFfcTabClick(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      {/* 第二层：球号/区段（可左右滑动，两侧箭头） */}
                      <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                        <i className="fa-solid fa-chevron-left" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                        <div className="ffc-scroll-row" style={{ display: 'flex', overflowX: 'auto', flex: 1, minWidth: 0 }}>
                          {ffcSecondLayer.map(item => {
                            const active = ffcActivePos === item.key;
                            return (
                              <div
                                key={item.key}
                                onClick={() => setFfcActivePos(item.key)}
                                className={`vp-sub-tab${active ? ' is-active' : ''}`}
                              >
                                {item.label}
                              </div>
                            );
                          })}
                        </div>
                        <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                      </div>

                      <div className="vp-odds-area" style={{ padding: '10px 12px' }}>
                        {/* 猜球号：所选球号的 0~9 */}
                        {ffcActiveTab === 'cai' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {Array.from({ length: 10 }, (_, d) => String(d)).map(d => {
                              const category = `第${ffcPosNum}球`;
                              const isSelected = selectedFFC.has(`${category}|${d}`);
                              return (
                                <div
                                  key={d}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFCCardClick(category, d)}
                                  style={{ height: '78px', padding: '0 4px' }}
                                >
                                  <img src={`分分-ball/${d}.png`} alt={d} style={{ width: '26px', height: '26px', marginBottom: '2px' }} />
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>10</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 两面盘：所选球号的 大/小/单/双，或「总和」的 大/小/单/双 */}
                        {ffcActiveTab === 'sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {['大', '小', '单', '双'].map(name => {
                              const isSum = ffcActivePos === 'sum';
                              const category = isSum ? '总和' : `第${ffcPosNum}球两面`;
                              const isSelected = selectedFFC.has(`${category}|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFCCardClick(category, name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: lotteryColor(name) }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: lotteryColor(name) }}>{isSum ? '2' : '1.98'}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 前中后：「龙虎和」的 龙/虎/和，或前三/中三/后三的 豹子/顺子/对子/杂六 */}
                        {ffcActiveTab === 'position' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {(ffcActivePos === 'dragon' ? FFC_DRAGON_BETS : FFC_POSITION_BETS).map(bet => {
                              const isSelected = selectedFFC.has(`${ffcActiveSection}|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFCCardClick(ffcActiveSection, bet.name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.8rem', marginBottom: '2px', color: bet.name === '龙' ? LOTTERY_PINK : bet.name === '虎' ? LOTTERY_BLUE : lotteryColor(bet.name) }}>{bet.name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.65rem', color: bet.name === '龙' ? LOTTERY_PINK : bet.name === '虎' ? LOTTERY_BLUE : lotteryColor(bet.name) }}>{bet.odds}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </>
                      )}
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{ffcSimpleMode ? ffc2Count : ffcCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{(ffcSimpleMode ? ffc2TotalCost : ffcTotalCost).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={ffcSimpleMode ? handleFFC2Reset : handleFFCReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={ffcSimpleMode ? handleFFC2Submit : handleFFCSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'ffc2' ? (
                  // 一分分分彩2 (简易版) console —— 样式沿用一分极速赛车
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>一分分分彩2</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div
                              key={opt}
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        {renderDrawResultTrigger('ffc', ffcResult)}
                      </div>

                      {renderDrawHistoryPanel('ffc')}
                    </div>

                    <div className="embedded-game-body">
                      {/* Play category tabs：万位 / 龙虎 / 佰位 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {FFC2_TABS.map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${ffc2ActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setFfc2ActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        {/* 万位：大 / 小 / 单 / 双 */}
                        {ffc2ActiveTab === 'wan' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['大', '小', '单', '双'].map(name => {
                              const isSelected = selectedFFC2.has(`万位|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFC2CardClick('万位', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: FFC2_COLORS[name] }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: FFC2_COLORS[name] }}>1.97</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 龙虎：龙 / 虎 / 和 */}
                        {ffc2ActiveTab === 'dragon' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {['龙', '虎', '和'].map(name => {
                              const isSelected = selectedFFC2.has(`龙虎|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFC2CardClick('龙虎', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: FFC2_COLORS[name] }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: FFC2_COLORS[name] }}>{name === '和' ? '9.0' : '1.97'}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 佰位：数字 0 ~ 9 */}
                        {ffc2ActiveTab === 'bai' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {Array.from({ length: 10 }, (_, i) => String(i)).map(name => {
                              const isSelected = selectedFFC2.has(`佰位|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleFFC2CardClick('佰位', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px', color: '#1e293b' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>9.6</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{ffc2Count}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{ffc2TotalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleFFC2Reset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleFFC2Submit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'lucky28' ? (
                  // 一分幸运28 (Lucky 28) console —— 样式沿用一分分分彩2
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>一分幸运28</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div
                              key={opt}
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="vp-bet-header-row2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            className="vp-l28-mode-switch"
                            onClick={toggleL28SimpleMode}
                            title={l28SimpleMode ? '当前简易版，点击切换专业版' : '当前专业版，点击切换简易版'}
                            style={{
                              flexShrink: 0,
                              position: 'relative',
                              width: '46px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#eef2f6',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                color: '#ffffff',
                                background: l28SimpleMode ? '#22c55e' : '#ef4444',
                                transform: l28SimpleMode ? 'translateX(22px)' : 'translateX(0)',
                                transition: 'transform 0.18s ease, background 0.18s ease'
                              }}
                            >
                              {l28SimpleMode ? '简' : '专'}
                            </span>
                          </div>
                          <span>第 {String(issue).slice(-5)} 期</span>
                        </div>
                        {renderDrawResultTrigger('lucky28', l28Result)}
                      </div>

                      {renderDrawHistoryPanel('lucky28')}
                    </div>

                    <div className="embedded-game-body">
                      {l28SimpleMode ? (
                      <React.Fragment key="l28-simple">
                      {/* Play category tabs：总和两面 / 龙虎豹 / 三球 / 总和 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {L28_TABS.map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${l28ActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setL28ActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        {/* 总和两面：大 / 小 / 单 / 双 */}
                        {l28ActiveTab === 'sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {L28_SIDES.map(name => {
                              const isSelected = selectedL28.has(`总和两面|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleL28CardClick('总和两面', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: l28ColorOf('总和两面', name) }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: l28ColorOf('总和两面', name) }}>2</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 龙虎豹：龙 / 虎 / 豹 */}
                        {l28ActiveTab === 'dragon' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {L28_DRAGON.map(bet => {
                              const isSelected = selectedL28.has(`龙虎豹|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleL28CardClick('龙虎豹', bet.name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: bet.color }}>{bet.name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: bet.color }}>2.99</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 三球：顺子 / 豹子 / 对子 */}
                        {l28ActiveTab === 'triple' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {L28_TRIPLE.map(bet => {
                              const isSelected = selectedL28.has(`三球|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleL28CardClick('三球', bet.name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: bet.color }}>{bet.name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: bet.color }}>{bet.odds}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 总和：0 ~ 27，赔率依点数 */}
                        {l28ActiveTab === 'sum' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {Array.from({ length: 28 }, (_, i) => i).map(n => {
                              const isSelected = selectedL28.has(`总和|${n}`);
                              return (
                                <div
                                  key={n}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleL28CardClick('总和', String(n))}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px', color: '#1e293b' }}>{n}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.62rem' }}>{l28SumOddsOf(n)}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </React.Fragment>
                      ) : (
                      <React.Fragment key="l28-pro">
                      {/* 专业版：第一层玩法（可左右滑动的胶囊，样式同一分快三专业版） */}
                      <div className="sr-scroll-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', background: '#ffffff', padding: '6px 12px', borderBottom: '1px solid #e1e8ed' }}>
                        {L28P_PLAY_TABS.map(tab => {
                          const active = l28PlayTab === tab.cat;
                          return (
                            <div
                              key={tab.cat}
                              onClick={() => handleL28PlayTabClick(tab.cat)}
                              style={{
                                flexShrink: 0,
                                minWidth: '58px',
                                textAlign: 'center',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                border: active ? '1px solid transparent' : '1px solid #e1e8ed',
                                // 一律用长写，不要用 background 简写：简写会把 background-clip 重设成
                                // border-box，而切换页签时 React 的 style diff 只更新有变动的属性、
                                // 不会重新写入 backgroundClip，于是渐层渗进 1px 透明边框，
                                // 左缘露出渐层深色端 = 一条深蓝色细线
                                backgroundColor: active ? 'transparent' : '#ffffff',
                                backgroundImage: active ? 'linear-gradient(135deg, #4aa3f7 0%, #2f6fe0 100%)' : 'none',
                                backgroundClip: 'padding-box',
                                WebkitBackgroundClip: 'padding-box',
                                color: active ? '#ffffff' : '#57606f',
                                fontWeight: 500
                              }}
                            >
                              {tab.label}
                            </div>
                          );
                        })}
                      </div>

                      {/* 第二层：数字 / 两面（仅总和、尾球有） */}
                      {L28P_SUB_TABS[l28PlayTab] && (
                        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                          <i className="fa-solid fa-chevron-left" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                          <div className="ffc-scroll-row" style={{ display: 'flex', overflowX: 'auto', flex: 1, minWidth: 0 }}>
                            {L28P_SUB_TABS[l28PlayTab].map(item => {
                              const active = l28SubTab === item.key;
                              return (
                                <div
                                  key={item.key}
                                  onClick={() => setL28SubTab(item.key)}
                                  className={`vp-sub-tab${active ? ' is-active' : ''}`}
                                >
                                  {item.label}
                                </div>
                              );
                            })}
                          </div>
                          <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '0.7rem', padding: '0 8px', flexShrink: 0 }}></i>
                        </div>
                      )}

                      <div className="vp-odds-area" style={{ padding: '10px 12px' }}>
                        {/* 总和 - 数字：0 ~ 27 */}
                        {l28PlayTab === 'sum' && l28SubTab === 'num' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {Array.from({ length: 28 }, (_, i) => String(i)).map(n => renderL28PNumCard('总和', n, l28pSumOddsOf(Number(n))))}
                          </div>
                        )}

                        {/* 总和 - 两面：大小单双 + 大单/小单/大双/小双 */}
                        {l28PlayTab === 'sum' && l28SubTab === 'sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {L28P_SUM_SIDES.map(bet => renderL28PTextCard('总和两面', bet.name, bet.odds, l28pSideColor(bet.name)))}
                          </div>
                        )}

                        {/* 边球：边 / 中 / 大边 / 小边 */}
                        {l28PlayTab === 'side' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {L28P_SIDE.map(bet => renderL28PTextCard('边球', bet.name, bet.odds, l28pSideColor(bet.name)))}
                          </div>
                        )}

                        {/* 尾球 - 数字：1~9 + 0 */}
                        {l28PlayTab === 'tail' && l28SubTab === 'num' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {L28P_TAIL_NUMS.map(n => renderL28PNumCard('尾球', n, '9.8'))}
                          </div>
                        )}

                        {/* 尾球 - 两面 */}
                        {l28PlayTab === 'tail' && l28SubTab === 'sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {L28P_TAIL_SIDES.map(bet => renderL28PTextCard('尾球两面', bet.name, bet.odds, l28pSideColor(bet.name)))}
                          </div>
                        )}

                        {/* 龙虎豹 */}
                        {l28PlayTab === 'dragon' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {L28P_DRAGON.map(bet => renderL28PTextCard('龙虎豹', bet.name, bet.odds, bet.color))}
                          </div>
                        )}

                        {/* 极值：极大 / 极小 */}
                        {l28PlayTab === 'extreme' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {L28P_EXTREME.map(bet => renderL28PTextCard('极值', bet.name, bet.odds, l28pSideColor(bet.name)))}
                          </div>
                        )}

                        {/* 三球：顺子 / 豹子 / 对子 */}
                        {l28PlayTab === 'triple' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {L28P_TRIPLE.map(bet => renderL28PTextCard('三球', bet.name, bet.odds, bet.color))}
                          </div>
                        )}
                      </div>
                      </React.Fragment>
                      )}
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{l28SimpleMode ? l28Count : l28pCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{(l28SimpleMode ? l28TotalCost : l28pTotalCost).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={l28SimpleMode ? handleL28Reset : handleL28PReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={l28SimpleMode ? handleL28Submit : handleL28PSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'fishcrab' ? (
                  // 鱼虾蟹 (Fish-Prawn-Crab) console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>一分鱼虾蟹</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div
                              key={opt}
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        {renderDrawResultTrigger('fishcrab', fcResult)}
                      </div>

                      {renderDrawHistoryPanel('fishcrab')}
                    </div>

                    <div className="embedded-game-body">
                      {/* Play tabs: 单骰 / 全围 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'single', label: '单骰' },
                          { cat: 'all', label: '全围' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${fcActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setFcActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {FISH_CRAB_SYMBOLS.map(sym => {
                            const category = fcActiveTab === 'all' ? '全围' : '单骰';
                            const odds = fcActiveTab === 'all' ? FC_ODDS.all : FC_ODDS.single;
                            const isSelected = selectedFC.has(`${category}|${sym.key}`);
                            return (
                              <div
                                key={sym.key}
                                className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleFCCardClick(category, sym.key)}
                                style={{ height: '90px', padding: '0 4px' }}
                              >
                                <img className="vp-fc-symbol-img" src={sym.icon} alt={sym.label} />
                                <div className="odds-card-val" style={{ fontSize: '0.74rem', color: sym.color, fontWeight: 'bold' }}>{odds}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 玩法/游戏规则 overlay */}
                    {showFcRules && (
                      <div className="vp-fc-rules-overlay" onClick={() => setShowFcRules(false)}>
                        <div className="vp-fc-rules-panel" onClick={(e) => e.stopPropagation()}>
                          <div className="vp-fc-rules-header">
                            <span>鱼虾蟹玩法说明</span>
                            <i className="fa-solid fa-xmark" onClick={() => setShowFcRules(false)}></i>
                          </div>
                          <div className="vp-fc-rules-body">
                            <p>鱼虾蟹，又称鱼虾蟹骰宝，在中国南方民间曾是相当普遍的游戏，直至现在人们仍然经常于新春期间进行作娱乐之用。其型式与赔率跟另壹游戏骰宝玩法基本壹样，不过采用的骰子由鱼、虾、蟹、金钱、葫芦及鸡的图案代替点数。</p>
                            <p className="vp-fc-rules-subtitle">1. 单骰</p>
                            <p>投注每颗骰子 1 至 6 中指定的图案：</p>
                            <ul>
                              <li>图案出现壹次，赔率 1.97</li>
                              <li>图案出现二次，赔率 2.94</li>
                              <li>图案出现三次，赔率 3.92</li>
                            </ul>
                            <p className="vp-fc-rules-subtitle">2. 全围</p>
                            <ul>
                              <li>三颗骰子的图案都壹样视为中奖，赔率 180.0</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{fcCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{fcTotalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleFCReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleFCSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'baccarat' ? (
                  // 百家乐 (Baccarat) console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>百家乐A1</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div
                              key={opt}
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 开奖结果：缩小置于右上角，比照其他游戏 */}
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        {renderDrawResultTrigger('baccarat', { player: bacPlayer, banker: bacBanker })}
                      </div>

                      {renderDrawHistoryPanel('baccarat')}
                    </div>

                    <div className="embedded-game-body">
                      {/* Play tabs: 庄闲 / 对子 / 两面 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'main', label: '庄闲' },
                          { cat: 'pair', label: '对子' },
                          { cat: 'sides', label: '两面' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${bacActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setBacActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '10px 12px' }}>
                        {bacActiveTab === 'main' && (
                          <div className="bac-main-grid">
                            {BAC_MAIN.map(bet => {
                              const isSel = selectedBac.has(`庄闲|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`bac-bet-card bac-area-${bet.area} ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleBacCardClick(bet.name)}
                                >
                                  <span className="bac-bet-name" style={{ color: bet.color }}>{bet.name}</span>
                                  <span className="bac-bet-odds" style={{ color: bet.color }}>{bet.odds}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(bacActiveTab === 'pair' || bacActiveTab === 'sides') && (
                          <div className="bac-2x2-grid">
                            {(bacActiveTab === 'pair' ? BAC_PAIR : BAC_SIDES).map(bet => {
                              const cat = bacActiveTab === 'pair' ? '对子' : '两面';
                              const isSel = selectedBac.has(`${cat}|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`bac-bet-card ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleBacCardClick(bet.name)}
                                >
                                  <span className="bac-bet-name" style={{ color: bet.color }}>{bet.name}</span>
                                  <span className="bac-bet-odds" style={{ color: bet.color }}>{bet.odds}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 游戏规则 overlay */}
                    {showBacRules && (
                      <div className="vp-fc-rules-overlay" onClick={() => setShowBacRules(false)}>
                        <div className="vp-fc-rules-panel" onClick={(e) => e.stopPropagation()}>
                          <div className="vp-fc-rules-header">
                            <span>百家乐游戏规则</span>
                            <i className="fa-solid fa-xmark" onClick={() => setShowBacRules(false)}></i>
                          </div>
                          <div className="vp-fc-rules-body">
                            <p className="vp-fc-rules-subtitle">游戏简介</p>
                            <p>百家乐分为【闲家】和【庄家】，玩家可以下注闲家或庄家，点数总和最接近 9 点者获胜。双方各收到至少两至三张牌，将依照补牌规则多发一张牌。任何一家拿到「例牌」（两张牌合计为 8 或 9 点）时，牌局即结束，不再补牌。</p>
                            <p className="vp-fc-rules-subtitle">点数计算方法</p>
                            <p>10、J、Q、K 的扑克牌算作零点，其他按牌面点数计算。当所有牌的点数总和超过 9 点时，仅算总数中的个位。例，最小点数为 0 点（4+6=10）；最大点数为 9 点（4+5=9）取个位数。</p>
                            <p className="vp-fc-rules-subtitle">例牌</p>
                            <p>庄闲任何一方两牌合计为 8 或 9 点（称为例牌），双方都不需补牌，即定胜负（双方同持 8 点或 9 点为和局）。</p>
                            <p className="vp-fc-rules-subtitle">补牌规则</p>
                            <p>若闲家不需补牌（即闲家首两张牌合计为「6 至 9 点」），庄家以「闲家补牌规则」补牌，即庄首两张牌合计「0 至 5」点要补一张牌，6 点以上不许补牌。</p>
                            <p className="vp-fc-rules-subtitle">赔率</p>
                            <ul>
                              <li>庄 1.95 / 闲 2.0 / 和 9.0 / 庄幸运6 12.0</li>
                              <li>庄对 12.0 / 闲对 12.0 / 任意对子 6.0 / 完美对子 26.0</li>
                              <li>闲单 / 闲双 / 庄单 / 庄双 1.96</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{bacCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{bacTotalCost.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>
                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleBacReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleBacSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'animal' ? (
                  // 动物运动会 (Animal Sports) console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>一分动物运动会</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div
                              key={opt}
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 开奖结果：T-ball 名次排列 */}
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        {renderDrawResultTrigger('animal', animalResult)}
                      </div>

                      {renderDrawHistoryPanel('animal')}
                    </div>

                    <div className="embedded-game-body">
                      {/* Play tabs: 冠军两面 / 冠军单码 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'twosides', label: '冠军两面' },
                          { cat: 'single', label: '冠军单码' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${animalActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setAnimalActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        {animalActiveTab === 'twosides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {ANIMAL_TWOSIDES.map(bet => {
                              const isSel = selectedAnimal.has(`冠军两面|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`live-odds-card ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleAnimalCardClick(bet.name)}
                                  style={{ height: '90px', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: lotteryColor(bet.name) }}>{bet.name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem', color: lotteryColor(bet.name) }}>1.9</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {animalActiveTab === 'single' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {[1, 2, 3, 4, 5, 6].map(n => {
                              const isSel = selectedAnimal.has(`冠军单码|${n}`);
                              return (
                                <div
                                  key={n}
                                  className={`live-odds-card ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleAnimalCardClick(String(n))}
                                  style={{ height: '90px', padding: '0 4px' }}
                                >
                                  <img className="animal-ball-img" src={`T-ball/T${n}.svg`} alt={`T${n}`} style={{ marginBottom: '4px' }} />
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>5.7</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{animalCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{animalTotalCost.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>
                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleAnimalReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleAnimalSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'sports' ? (
                  // 体育赛事直播间：专属房间，不提供切换游戏（抬头只有比赛名 + 选单 + 关闭）
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box vp-sp-title">{matchTitle || '安库德 VS 瓦尔迪维亚'}</div>
                        <div className="vp-bet-header-right is-compact">
                          {/* 简易／专业切换：样式同视频里各彩票游戏的那颗开关 */}
                          <div
                            className="vp-f3-mode-switch"
                            onClick={() => setSpSimpleMode(v => !v)}
                            title={spSimpleMode ? '当前简易版，点击切换专业版' : '当前专业版，点击切换简易版'}
                            style={{
                              flexShrink: 0,
                              position: 'relative',
                              width: '46px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#eef2f6',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                color: '#ffffff',
                                background: spSimpleMode ? '#22c55e' : '#ef4444',
                                transform: spSimpleMode ? 'translateX(22px)' : 'translateX(0)',
                                transition: 'transform 0.18s ease, background 0.18s ease'
                              }}
                            >
                              {spSimpleMode ? '简' : '专'}
                            </span>
                          </div>
                          <img src="text-search.png" className="vp-menu-icon" onClick={toggleDropdownMenu} title="菜单" alt="菜单" />
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '赛事规则'].map(opt => (
                            <div
                              key={opt}
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="embedded-game-body">
                      {spSimpleMode ? (
                      <React.Fragment key="sp-simple">
                      {/* 玩法页签：盘口多时可左右滑动（少的时候仍撑满整列） */}
                      <div className="live-play-tabs-row is-scroll" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {spTabs.map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${spActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setSpActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      {/* 点位：大 / 小，各占一半宽 */}
                      <div className="vp-odds-area" style={{ padding: '8px 12px' }}>
                        <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          {spCurrentTab.options.map(opt => {
                            const isSel = selectedSp.has(`${spCurrentTab.label}|${opt.name}`);
                            return (
                              <div
                                key={opt.name}
                                className={`live-odds-card ${isSel ? 'selected' : ''}`}
                                onClick={() => handleSpCardClick(opt.name)}
                                style={{ height: '112px', padding: '0 4px' }}
                              >
                                {/* 「大 139.5」整串就是玩法名，字级颜色一致 */}
                                <div className="odds-card-name" style={{ color: lotteryColor(opt.name) }}>{`${opt.name} ${opt.line}`}</div>
                                <div className="odds-card-val" style={{ fontSize: '0.78rem', color: lotteryColor(opt.name) }}>{opt.odds}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      </React.Fragment>
                      ) : (
                      <React.Fragment key="sp-pro">
                      {/* 专业版：盘面同「体育」页的更多玩法（筛选列 + 折叠盘口卡） */}
                      <div className="vp-sp-pro-wrap">
                        <div className="moreplay-filter-row">
                          <button className="filter-collapse-btn" onClick={() => setSpProFilter('hot')} title="重置筛选">
                            <i className="fa-solid fa-chevron-up filter-up-icon"></i>
                          </button>
                          <div className="filter-divider"></div>
                          <div className="filter-pills-scroll">
                            {SPORTS_PRO_FILTERS.map(item => (
                              <button
                                key={item.id}
                                className={`filter-pill-item ${spProFilter === item.id ? 'active' : ''}`}
                                onClick={() => setSpProFilter(item.id)}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="vp-sp-pro-scroll">
                          <div className="moreplay-accordions-container">
                            {spProMarkets.map(market => (
                              <div key={market.key} className={`accordion-card ${spExpanded[market.key] ? 'expanded' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSpSection(market.key)}>
                                  <div className="accordion-title">
                                    <i className="fa-solid fa-chevron-down accordion-arrow"></i>
                                    <span>{market.title}</span>
                                  </div>
                                  <button
                                    className="accordion-header-action"
                                    onClick={(e) => { e.stopPropagation(); showToast(`已置顶【${market.title}】`); }}
                                  >
                                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                                  </button>
                                </div>
                                <div className="accordion-content">
                                  <div className="odds-grid-two-cols">
                                    {market.options.map(opt => {
                                      const isSel = selectedSp.has(`${market.title}|${opt.name}`);
                                      return (
                                        <button
                                          key={opt.name}
                                          className={`odds-option-btn ${isSel ? 'selected' : ''}`}
                                          onClick={() => handleSpBetClick(market.title, opt.name)}
                                        >
                                          <span className="odds-option-label">{opt.name}</span>
                                          <span className="odds-option-value">{opt.odds}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {spProMarkets.length === 0 && (
                              <div className="vp-sp-pro-empty">该筛选暂无可投注盘口</div>
                            )}
                          </div>
                        </div>
                      </div>
                      </React.Fragment>
                      )}
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{spCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{spTotalCost.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>
                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleSpReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleSpSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'candy' ? (
                  // 糖果派对 (Candy Party Slot) —— 示意图 mockup
                  // Slot 游戏不显示标题列，改用画面上的浮层按钮（左上切换游戏 / 右上关闭）
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    {/* 糖果派对游戏画面：直接使用示意图（图内无 X，使用可见关闭按钮） */}
                    <div className="vp-slot-stage">
                      <img src="糖果slot示意.png" className="vp-slot-screen" alt="糖果派对" />
                      {/* 左上角：切换游戏按钮（打开游戏选单） */}
                      <img src="左右箭头.png" className="vp-slot-switch" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                      {/* 右上角：关闭 */}
                      <button className="vp-slot-close" onClick={handleBetHeaderClose} title="关闭" aria-label="关闭"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                ) : activeCarouselGame === 'mahjong' ? (
                  // 麻将胡了2 (Mahjong Ways 2 Slot) —— 示意图（图内无 X，使用可见关闭按钮）
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-slot-stage">
                      <img src="麻胡2示意.png" className="vp-slot-screen" alt="麻将胡了2" />
                      {/* 左上角：切换游戏按钮（打开游戏选单） */}
                      <img src="左右箭头.png" className="vp-slot-switch" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                      {/* 右上角：关闭 */}
                      <button className="vp-slot-close" onClick={handleBetHeaderClose} title="关闭" aria-label="关闭"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                ) : (
                  // Interactive slots gameplay panel
                  <div className="vp-slots-betting-box">
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <img src="arrow-left-right.png" className="vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏" alt="切换游戏" />
                          <span>{carouselGameItems.find(g => g.key === activeCarouselGame)?.label || '电子游戏'}</span>
                        </div>
                        <div className="vp-bet-header-right">
                          <img src="x.png" className="vp-close-icon" onClick={handleBetHeaderClose} alt="关闭" />
                        </div>
                      </div>
                    </div>

                    {/* Slots display screen */}
                    <div className="vp-slots-display-grid">
                      <div className={`vp-slots-column ${slotsSpinning ? 'spinning' : ''}`}>
                        {slotsDisplay[0]}
                      </div>
                      <div className={`vp-slots-column ${slotsSpinning ? 'spinning' : ''}`}>
                        {slotsDisplay[1]}
                      </div>
                      <div className={`vp-slots-column ${slotsSpinning ? 'spinning' : ''}`}>
                        {slotsDisplay[2]}
                      </div>
                    </div>

                    {/* Slots betting console */}
                    <div className="vp-slots-console">
                      <div className="vp-slots-info-row">
                        <span>余额: <span style={{ color: '#3b82f6' }}>¥{balance.toFixed(2)}</span></span>
                        <span>投注额: <span style={{ color: '#ef4444' }}>¥{slotsBetAmount}</span></span>
                      </div>

                      <div className="vp-slots-input-row">
                        <label>筹码选择:</label>
                        <div className="vp-slots-amount-select">
                          {[10, 50, 100, 500].map(amt => (
                            <button 
                              key={amt}
                              className={`vp-slots-chip-btn ${slotsBetAmount === amt ? 'active' : ''}`}
                              onClick={() => setSlotsBetAmount(amt)}
                            >
                              {amt}
                            </button>
                          ))}
                        </div>
                        <input 
                          type="number" 
                          className="vp-slots-input"
                          value={slotsBetAmount}
                          onChange={(e) => setSlotsBetAmount(Number(e.target.value))}
                        />
                      </div>

                      <button 
                        className="vp-slots-spin-btn" 
                        onClick={handleSlotsSpin}
                        disabled={slotsSpinning}
                      >
                        {slotsSpinning ? '正在旋转...' : '🎰 旋转拉霸 (开始投注)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
  );

  // 短剧等嵌入场景：只渲染游戏控制台
  if (embedded) {
    return <div className="drama-embedded-games">{renderPlayTab()}</div>;
  }

  return (
    <div className="video-player-overlay active" id="video-player-modal" style={{ display: 'flex' }} ref={overlayRef}>
      <div className={`split-player-container ${immersive ? 'immersive' : ''}`}>

        {/* 1/3 Top Mock Video Player */}
        <div className="mock-player-box">
          <img id="modal-player-still" src={activeVideo?.img || "assets/sports_cover.png"} alt="播放视频" />
          <div className="player-hud-top">
            <button id="btn-close-player" className="player-close-btn" onClick={() => setVideoPlayerActive(false)}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <span className="video-watermark-overlay">影院独播 1080P</span>
          </div>
          <div className="player-hud-center">
            <i className="fa-solid fa-circle-play player-btn-main"></i>
          </div>
          <div className="player-hud-bottom">
            <i className="fa-solid fa-pause"></i>
            <div className="player-progress-track">
              <div className="progress-indicator" style={{ width: '32%' }}></div>
            </div>
            <span className="time-lbl">02:18 / 95:00</span>
            <i className="fa-solid fa-gear player-hud-icon" title="设置" onClick={() => showToast('画质 / 倍速设置开发中')}></i>
            <i className={`fa-solid fa-film player-hud-icon ${immersive ? 'active' : ''}`} title="沉浸式" onClick={toggleImmersive}></i>
            <i className="fa-solid fa-up-right-and-down-left-from-center player-hud-icon" title="全屏" onClick={enterLandscape}></i>
          </div>
        </div>

        {/* 2/3 Scrollable Video Info & Games Content */}
        <div className="player-scroll-content" ref={scrollContainerRef}>
          
          {/* Video Info Block & Tab Bar - Only show when NOT in Watch & Play tab */}
          {vpActiveTab !== 'play' && (
            <>
              {/* Video Info Block */}
              <div className="vp-video-info-block">
                <h3 className="vp-video-title">
                  {activeVideo?.title || "诺曼底72小时"}
                </h3>
                
                {/* Meta stats row */}
                <div className="vp-video-meta-row">
                  <div className="vp-meta-item">
                    <i className="fa-regular fa-clock"></i>
                    <span>{activeVideo?.views ? "3天前" : "昨天 01:00"}</span>
                  </div>
                  <div className="vp-meta-item">
                    <i className="fa-regular fa-eye"></i>
                    <span>{activeVideo?.views || "1.9万"}</span>
                  </div>
                  <div className="vp-meta-item">
                    <i className="fa-solid fa-star meta-star"></i>
                    <span>{activeVideo?.rating || "8.2"}</span>
                  </div>
                </div>

                {/* Tags row */}
                <div className="vp-video-tags-row">
                  {(activeVideo?.tags || ['#剧情', '#战争']).map((tag, idx) => (
                    <span key={idx} className="vp-video-tag">{tag}</span>
                  ))}
                </div>

                {/* Description block */}
                <div className="vp-video-description-box">
                  <div className="vp-desc-text">
                    {activeVideo?.description || "影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。"}
                  </div>
                  <span className="vp-desc-more" onClick={() => setShowDetailsModal(true)}>详情 &gt;</span>
                </div>

                {/* Actions row */}
                <div className="vp-actions-row">
                  <button className={`vp-action-btn ${hasLiked ? 'active' : ''}`} onClick={handleLike}>
                    <i className={`${hasLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`}></i>
                    <span>{likes}</span>
                  </button>
                  <button className={`vp-action-btn ${hasDisliked ? 'active' : ''}`} onClick={handleDislike}>
                    <i className={`${hasDisliked ? 'fa-solid' : 'fa-regular'} fa-thumbs-down`}></i>
                    <span>{dislikes}</span>
                  </button>
                  <button className="vp-action-btn" onClick={() => showToast('评论功能暂未开放')}>
                    <i className="fa-regular fa-comment-dots"></i>
                    <span>0</span>
                  </button>
                  <button className={`vp-action-btn ${hasFav ? 'active' : ''}`} onClick={handleFavorite}>
                    <i className={`${hasFav ? 'fa-solid' : 'fa-regular'} fa-star`}></i>
                    <span>{favCount}</span>
                  </button>
                </div>

                {/* Rotating winning banner */}
                <div className="vp-winning-banner">
                  <div className="vp-banner-left">
                    <span className="vp-banner-badge">恭喜中奖</span>
                    <span className="vp-banner-text">
                      恭喜 <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{winningAnnouncements[bannerIdx].name}</span> 赢的 <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{winningAnnouncements[bannerIdx].amount}</span> 元
                    </span>
                  </div>
                  <div className="vp-banner-right">
                    <span className="vp-banner-game-tag">{winningAnnouncements[bannerIdx].game}</span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Sticky Tab Bar */}
              <div className="vp-tab-bar">
                <button className={`vp-tab-btn ${vpActiveTab === 'chatroom' ? 'active' : ''}`} onClick={() => setVpActiveTab('chatroom')}>
                  聊天室
                </button>
                <button className={`vp-tab-btn ${vpActiveTab === 'play' ? 'active' : ''}`} onClick={() => setVpActiveTab('play')}>
                  边看边玩
                </button>
                <button className={`vp-tab-btn ${vpActiveTab === 'recommend' ? 'active' : ''}`} onClick={() => setVpActiveTab('recommend')}>
                  为您推荐
                </button>
                <button className={`vp-tab-btn ${vpActiveTab === 'more-games' ? 'active' : ''}`} onClick={() => setVpActiveTab('more-games')}>
                  更多游戏
                </button>
              </div>
            </>
          )}

          {/* Compact title bar for 边看边玩：保留标题区，游戏面板不占满高度 */}
          {vpActiveTab === 'play' && (
            <div className="vp-video-info-block vp-play-title-bar">
              <h3 className="vp-video-title">
                {activeVideo?.title || "诺曼底72小时"}
              </h3>
              <div className="vp-video-meta-row">
                <div className="vp-meta-item">
                  <i className="fa-regular fa-clock"></i>
                  <span>{activeVideo?.views ? "3天前" : "昨天 01:00"}</span>
                </div>
                <div className="vp-meta-item">
                  <i className="fa-regular fa-eye"></i>
                  <span>{activeVideo?.views || "1.9万"}</span>
                </div>
                <div className="vp-meta-item">
                  <i className="fa-solid fa-star meta-star"></i>
                  <span>{activeVideo?.rating || "8.2"}</span>
                </div>
              </div>
              <div className="vp-video-tags-row">
                {(activeVideo?.tags || ['#剧情', '#战争']).map((tag, idx) => (
                  <span key={idx} className="vp-video-tag">{tag}</span>
                ))}
              </div>
              <div className="vp-video-description-box">
                <div className="vp-desc-text">
                  {activeVideo?.description || "影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。"}
                </div>
                <span className="vp-desc-more" onClick={() => setShowDetailsModal(true)}>详情 &gt;</span>
              </div>
            </div>
          )}

          {/* Tab Content Panel */}
          <div className={`vp-tab-content ${vpActiveTab === 'play' ? 'vp-play-sheet' : ''}`}>
            {vpActiveTab === 'chatroom' && (
              <div className="vp-chatroom-panel">
                <div className="vp-chat-messages-list">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="vp-chat-msg-row">
                      {msg.type === 'join' ? (
                        <>
                          <span className="vp-msg-badge join">进入</span>
                          <span className="vp-chat-user">{msg.user}</span>
                          <span className="vp-chat-text">{msg.text || '进入了直播间'}</span>
                        </>
                      ) : (
                        <>
                          <span className="vp-msg-badge win">中奖</span>
                          <span className="vp-chat-user">{msg.user}</span>
                          <span className="vp-chat-text">
                            在 <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{msg.game}</span> 中中了 <span className="vp-chat-win-highlight">{msg.prize} 元</span>
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Chat bottom bar */}
                <div className="vp-chatroom-bottom-bar">
                  <div className="vp-chat-input-wrap">
                    <i className="fa-regular fa-comment-dots"></i>
                    <input 
                      type="text" 
                      placeholder="说点什么~" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          setChatMessages(prev => [
                            ...prev, 
                            { id: Date.now(), type: 'join', user: '我', text: chatInput.trim() }
                          ]);
                          setChatInput('');
                        }
                      }}
                    />
                  </div>
                  <button className="vp-chat-bet-btn" onClick={() => setVpActiveTab('play')}>
                    立即下注
                  </button>
                </div>
              </div>
            )}

            {vpActiveTab === 'play' && renderPlayTab()}

            {vpActiveTab === 'recommend' && (
              <div className="vp-recommend-panel">
                {/* Narrow VIP ad banner */}
                <div className="vp-promo-banner" onClick={() => showToast('恭喜！特权赠送活动正在对接中！')}>
                  <div>
                    <span className="vp-promo-badge">VIP</span>
                    <span>开通特权 送钱 畅享全站资源... 可游戏 可提现</span>
                  </div>
                  <span style={{ color: '#f59e0b', fontSize: '0.65rem' }}>立即开通 &gt;&gt;</span>
                </div>

                {/* 3 videos row */}
                <div className="vp-recommend-grid">
                  {recommendedVideosList.map(vid => (
                    <div key={vid.id} className="vp-recommend-card" onClick={() => handleRecommendedVideoClick(vid)}>
                      <div className="vp-recommend-thumb">
                        <img src={vid.img} alt={vid.title} />
                        <span className="vp-recommend-badge-free">免费</span>
                        <div className="vp-recommend-rating">
                          <i className="fa-solid fa-star"></i>
                          <span>{vid.rating}</span>
                        </div>
                        <div className="vp-recommend-views">
                          <i className="fa-regular fa-eye"></i>
                          <span>{vid.views}</span>
                        </div>
                        <div className="vp-recommend-play-overlay">
                          <i className="fa-solid fa-play"></i>
                        </div>
                      </div>
                      <span className="vp-recommend-title">{vid.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vpActiveTab === 'more-games' && (
              <div className="vp-moregames-panel">
                {/* Sub category tabs */}
                <div className="vp-moregames-cats">
                  {moreGamesCategories.map(cat => (
                    <div 
                      key={cat.id}
                      className={`vp-moregames-cat-pill ${activeMoreGamesCat === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveMoreGamesCat(cat.id)}
                    >
                      {cat.label}
                    </div>
                  ))}
                </div>

                {/* Games grid */}
                <div className="vp-moregames-grid">
                  {moreGamesList[activeMoreGamesCat]?.map(game => {
                    const isPlayable = !!moreGamesPlayableMap[game.key];
                    return (
                      <div
                        key={game.key}
                        className={`vp-moregames-item ${isPlayable ? '' : 'disabled'}`}
                        onClick={() => handleMoreGamesGameClick(game)}
                      >
                        <div className="vp-moregames-icon-box">
                          <img src={game.img} alt={game.label} />
                        </div>
                        <span className="vp-moregames-label">{game.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 全屏：强制横屏观看，按容器尺寸旋转 90° 铺满 */}
      {landscape && (
        <div
          className="player-landscape-overlay"
          style={{
            width: landscapeSize.h,
            height: landscapeSize.w,
            left: (landscapeSize.w - landscapeSize.h) / 2,
            top: (landscapeSize.h - landscapeSize.w) / 2,
            transform: 'rotate(90deg)'
          }}
        >
          <img className="landscape-video-img" src={activeVideo?.img || 'assets/sports_cover.png'} alt="横屏播放" />
          <button className="landscape-exit-btn" onClick={() => setLandscape(false)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="video-watermark-overlay">影院独播 1080P</span>
          <div className="landscape-hud-bottom">
            <i className="fa-solid fa-pause"></i>
            <div className="player-progress-track">
              <div className="progress-indicator" style={{ width: '32%' }}></div>
            </div>
            <span className="time-lbl">02:18 / 95:00</span>
            <i className="fa-solid fa-down-left-and-up-right-to-center player-hud-icon" title="退出全屏" onClick={() => setLandscape(false)}></i>
          </div>
        </div>
      )}

      {/* 详情弹窗：点击「详情」后从底部弹出，显示更完整的影片信息 */}
      {showDetailsModal && (
        <div className="vp-details-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="vp-details-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vp-details-header">
              <span className="vp-details-header-title">详情</span>
              <i className="fa-solid fa-xmark" onClick={() => setShowDetailsModal(false)}></i>
            </div>
            <div className="vp-details-scroll">
              <h3 className="vp-details-title">{activeVideo?.title || '诺曼底72小时'}</h3>
              <div className="vp-details-stats">
                <span className="vp-details-hot"><i className="fa-solid fa-fire"></i> {activeVideo?.views || '1.9万'}</span>
                <span className="vp-details-score"><i className="fa-solid fa-star"></i> {activeVideo?.rating || '8.2'}</span>
              </div>
              <div className="vp-details-tags">
                {(activeVideo?.tags || ['#剧情', '#战争']).map((tag, idx) => (
                  <span key={idx} className="vp-details-tag">{tag}</span>
                ))}
              </div>
              <div className="vp-details-crew"><span className="vp-details-crew-label">导演：</span>{activeVideo?.director || '吴家伟'}</div>
              <div className="vp-details-crew"><span className="vp-details-crew-label">主演：</span>{activeVideo?.cast || '蔡洁, 王浩信, 林子善, 岑珈其, 洪浚嘉'}</div>
              <h4 className="vp-details-subhead">简介</h4>
              <p className="vp-details-desc">
                {activeVideo?.description || '影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
