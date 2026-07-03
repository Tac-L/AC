import { useState } from 'react';
import { useApp } from '../context/AppContext';

// Rich database of 25 detailed items covering all categories
const allVideos = [
  { 
    id: 1, 
    category: 'domestic', 
    title: '流浪地球2', 
    fullTitle: '【科幻神作】流浪地球2：人类面临太阳危机，携手拯救地球家园', 
    views: '5,062', 
    rating: '99%', 
    duration: '173分钟', 
    img: 'assets/video_swimsuit_pool.png', 
    isFree: true, 
    adBadge: "开通特权送钱",
    tags: ['#科幻', '#灾难', '#冒险'],
    description: '太阳即将毁灭，人类为了自救开启“移山计划”，在地球表面建造巨型行星发动机，将地球推离太阳系，寻找新的家园。在旅途中，面临重重危机与挑战，人类不得不做出艰难抉择。'
  },
  { 
    id: 2, 
    category: 'selfie', 
    title: '川西秘境自驾游Vlog', 
    fullTitle: '【旅行日记】川西秘境自驾游：探索雪山与海子的绝美自然风光', 
    views: '2,891,854', 
    rating: '98%', 
    duration: '28分钟', 
    img: 'assets/drama_still1.png', 
    isFree: true,
    tags: ['#旅行', '#自驾', '#Vlog'],
    description: '自驾川西环线，沿途经过折多山、新都桥、理塘等地。用镜头记录下巍峨的雪山、碧绿的海子以及纯朴的藏区风情，带你足不出户感受大自然的鬼斧神工与心灵洗礼。'
  },
  { 
    id: 3, 
    category: 'domestic', 
    title: '繁花 极清珍藏版', 
    fullTitle: '【热播大剧】繁花：阿宝在上海黄河路的传奇商战风云与情感抉择', 
    views: '1,234,812', 
    rating: '95%', 
    duration: '45分钟', 
    img: 'assets/origami.png',
    tags: ['#剧情', '#商战', '#年代'],
    description: '上世纪九十年代初，风起云涌的上海。阿宝从一个普通青年，在爷叔的指点下，抓住机遇跻身商界新宠，改名宝总。故事围绕他与黄河路商贾、几位红颜知己之间的商业角逐与情感纠葛展开。'
  },
  { 
    id: 4, 
    category: 'selfie', 
    title: '数码好物开箱评测', 
    fullTitle: '【极客分享】最新旗舰手机深度测评：影像与性能的终极对决', 
    views: '3,921,085', 
    rating: '97%', 
    duration: '15分钟', 
    img: 'assets/science.png', 
    isFree: true,
    tags: ['#科技', '#数码', '#测评'],
    description: '本期带来最新发布的高端旗舰手机深度拆解与上手评测。从屏幕素质、镜头解析度、处理器极限跑分到续航表现进行全面对比，客观指出优缺点，帮助你选择最合适自己的数码装备。'
  },
  { 
    id: 5, 
    category: 'gossip', 
    title: '歌手2026巅峰对决', 
    fullTitle: '【王牌综艺】歌手2026：全球顶尖唱将同台竞技，现场Live震撼听觉', 
    views: '829,310', 
    rating: '92%', 
    duration: '120分钟', 
    img: 'assets/chat_cover.png',
    tags: ['#综艺', '#音乐', '#现场'],
    description: '《歌手2026》迎来年度歌王争霸之夜！各路实力唱将齐聚一堂，带来精彩纷呈的现场Live表演。华丽的舞美设计与震撼的音响效果，为观众呈现一场无与伦比的音乐饕餮盛宴。'
  },
  { 
    id: 6, 
    category: 'gossip', 
    title: '脱口秀大会爆笑名场面', 
    fullTitle: '【喜剧综艺】脱口秀大会：演员金句频出，吐槽职场与生活的辛酸', 
    views: '1,432,019', 
    rating: '94%', 
    duration: '90分钟', 
    img: 'assets/sports_cover.png',
    tags: ['#综艺', '#搞笑', '#脱口秀'],
    description: '汇集本季脱口秀大会最搞笑的高能名场面！选手们针对职场内卷、买房压力、恋爱矛盾等社会热点进行犀利吐槽，用幽默消解焦虑，金句频出，让你一次性笑个够。'
  },
  { 
    id: 7, 
    category: 'japanese', 
    title: '铃芽之旅', 
    fullTitle: '【新海诚力作】铃芽之旅：少女与闭门师的拯救世界奇幻之旅', 
    views: '5,123,040', 
    rating: '99%', 
    duration: '122分钟', 
    img: 'assets/lego.png',
    tags: ['#动画', '#奇幻', '#冒险'],
    description: '生活在九州小镇的17岁少女铃芽，遇到了寻找“门”的年轻闭门师草太。为了阻止灾难在全国蔓延，铃芽踏上了关闭废墟中一扇扇“灾难之门”的旅程，并在途中获得爱与成长。'
  },
  { 
    id: 8, 
    category: 'japanese', 
    title: '小偷家族', 
    fullTitle: '【戛纳金棕榈】小偷家族：边缘群体的无血缘温情，感人至深', 
    views: '3,204,500', 
    rating: '96%', 
    duration: '121分钟', 
    img: 'assets/drawing.png',
    tags: ['#剧情', '#家庭', '#文艺'],
    description: '在东京的破旧平房里，住着依靠偷窃和微薄收入勉强糊口的一家人。虽然他们没有血缘关系，但在寒冷的都市角落里，他们彼此取暖，用畸形却真挚的爱对抗世界的残酷与冷漠。'
  },
  { 
    id: 9, 
    category: 'western', 
    title: '欧美大片：沙丘2 震撼巨制', 
    fullTitle: '【科幻史诗】沙丘2：保罗·厄崔迪的复仇之路与沙丘帝国的崛起', 
    views: '980,450', 
    rating: '91%', 
    duration: '166分钟', 
    img: 'assets/science.png',
    tags: ['#科幻', '#动作', '#史诗'],
    description: '保罗·厄崔迪携手契妮和弗雷曼人，向毁灭他家族的阴谋家发起复仇。面对关于宇宙命运的抉择，他必须在他所爱的女人与已知宇宙的命运之间做出选择，努力阻止只有他能预见的惨烈未来。'
  },
  { 
    id: 10, 
    category: 'selfie', 
    title: '萌宠猫咪的温馨日常', 
    fullTitle: '【治愈时光】布偶猫的可爱一天：和铲屎官的趣味互动瞬间', 
    views: '2,510,480', 
    rating: '95%', 
    duration: '12分钟', 
    img: 'assets/drama_still1.png',
    tags: ['#萌宠', '#治愈', '#猫咪'],
    description: '记录超萌布偶猫的悠闲生活日常：清晨的伸懒腰叫醒服务、午后的疯狂跑酷追逐红点，以及晚上依偎在主人怀里呼噜呼噜的解压时刻。画面超级治愈，拯救所有不开心。'
  },
  { 
    id: 11, 
    category: 'domestic', 
    title: '长安三万里', 
    fullTitle: '【国漫巨制】长安三万里：高适与李白的一生情谊与盛唐诗卷', 
    views: '1,902,481', 
    rating: '97%', 
    duration: '168分钟', 
    img: 'assets/origami.png',
    tags: ['#动画', '#历史', '#传记'],
    description: '安史之乱爆发后数年，吐蕃大军攻打西南。高适困守孤城，向监军太监回忆起自己与李白的一生往事。从鲜衣怒马的江南相识，到暮年的世事沧桑，铺展开一幅波澜壮阔的盛唐诗歌画卷。'
  },
  { 
    id: 12, 
    category: 'selfie', 
    title: '户外徒步露营挑战', 
    fullTitle: '【荒野求生】挑战独自在森林露营：搭建帐篷与自制野炊晚餐', 
    views: '3,110,482', 
    rating: '94%', 
    duration: '45分钟', 
    img: 'assets/sports_cover.png',
    tags: ['#户外', '#露营', '#探险'],
    description: '独自深入原始森林，开启两天一夜的无电野外露营挑战。从寻找水源、搭建防风帐篷、用柴火烹饪热腾腾的野外晚餐，到深夜聆听虫鸣鸟叫，体验真正回归自然的极简生活方式。'
  },
  { 
    id: 13, 
    category: 'gossip', 
    title: '大侦探第十季案情解析', 
    fullTitle: '【悬疑烧脑】大侦探：明星嘉宾高能推理，揭秘古宅连环悬案', 
    views: '2,450,128', 
    rating: '93%', 
    duration: '110分钟', 
    img: 'assets/chat_cover.png',
    tags: ['#综艺', '#推理', '#悬疑'],
    description: '大侦探第十季强势回归！本期嘉宾来到一座百年古宅，遭遇离奇的连环案件。高能的剧本设定、错综复杂的人物关系，明星侦探们抽丝剥茧，现场还原作案手法，找出隐藏的真凶。'
  },
  { 
    id: 14, 
    category: 'japanese', 
    title: '千与千寻 经典重温', 
    fullTitle: '【宫崎骏神作】千与千寻：少女千寻的神隐冒险与成长蜕变', 
    views: '4,218,903', 
    rating: '98%', 
    duration: '125分钟', 
    img: 'assets/drawing.png',
    tags: ['#动画', '#奇幻', '#经典'],
    description: '10岁少女千寻在与父母搬家的途中，误入了一个神灵歇脚的神秘小镇。父母因贪吃变成猪，千寻在少年哈尔的帮助下，在汤婆婆的神奇浴场里辛勤工作，最终救出父母，找回自我。'
  },
  { 
    id: 15, 
    category: 'western', 
    title: '欧美大片：奥本海默', 
    fullTitle: '【诺兰执导】奥本海默：原子弹之父的荣耀与争议，震撼人心的历史篇章', 
    views: '870,412', 
    rating: '90%', 
    duration: '180分钟', 
    img: 'assets/lego.png',
    tags: ['#剧情', '#传记', '#历史'],
    description: '影片聚焦美国“原子弹之父”罗伯特·奥本海默主导研制世界上第一颗原子弹的历程。展现了曼哈顿计划的紧张筹备、三位一体核试验的震撼成功，以及战后他在冷战政治风暴中所遭受的迫害与内心挣扎。'
  },
  { 
    id: 16, 
    category: 'gossip', 
    title: '乘风破浪的姐姐精彩舞台', 
    fullTitle: '【音综盛典】姐姐们的高光时刻：燃炸全场的合作秀与个人solo', 
    views: '3,180,450', 
    rating: '94%', 
    duration: '85分钟', 
    img: 'assets/drawing.png',
    tags: ['#综艺', '#歌舞', '#励志'],
    description: '精选本季《乘风破浪的姐姐》最精彩的舞台对决！姐姐们突破自我，挑战高难度唱跳、古典国风以及激情摇滚，展现成熟女性的独特魅力与拼搏精神，舞台视听效果堪称顶级大秀。'
  },
  { 
    id: 17, 
    category: 'selfie', 
    title: '极简主义房间改造指南', 
    fullTitle: '【空间设计】用低预算打造极简温馨卧室：收纳与软装分享', 
    views: '2,940,185', 
    rating: '96%', 
    duration: '22分钟', 
    img: 'assets/science.png',
    tags: ['#家居', '#改造', '#极简'],
    description: '手把手教你如何用超低预算将杂乱 of 卧室改造成日式极简温馨风。包含去繁从简的断舍离收纳技巧、高性价比软装好物推荐，以及利用柔和灯光营造卧室温馨氛围的实用小妙招。'
  },
  { 
    id: 18, 
    category: 'domestic', 
    title: '诺曼底72小时', 
    fullTitle: '【战争剧情】诺曼底72小时：盟军登陆前夕的极度紧张对决', 
    views: '1,670,480', 
    rating: '95%', 
    duration: '95分钟', 
    img: 'assets/sports_cover.png',
    tags: ['#剧情', '#战争'],
    description: '影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。'
  },
  { 
    id: 19, 
    category: 'japanese', 
    title: '寄生虫', 
    fullTitle: '【奥斯卡最佳】寄生虫：贫富差距的辛辣讽刺，反转不断的惊悚之作', 
    views: '5,890,321', 
    rating: '99%', 
    duration: '132分钟', 
    img: 'assets/lego.png',
    tags: ['#剧情', '#悬疑', '#黑色幽默'],
    description: '住在廉价半地下室的穷困一家人，通过伪造学历和精湛演技，一步步“寄生”进富裕的朴社长家中工作。然而，一个隐藏在豪宅地底的惊人秘密被无意中撞破，导致局面走向不可控制的深渊。'
  },
  { 
    id: 20, 
    category: 'western', 
    title: '欧美大片：星际穿越 4K极清', 
    fullTitle: '【科幻神作】星际穿越：穿越虫洞拯救人类，超越时空的父女深情', 
    views: '1,120,490', 
    rating: '92%', 
    duration: '169分钟', 
    img: 'assets/origami.png',
    tags: ['#科幻', '#冒险', '#温情'],
    description: '未来的地球面临黄沙肆虐与作物枯萎的绝境。前宇航员库珀告别年幼的女儿，与其他科学家一起踏上穿越虫洞的星际航行，在浩瀚宇宙中为人类寻找一线生机，谱写了一段跨越时空的宏大史诗。'
  },
  { 
    id: 21, 
    category: 'domestic', 
    title: '封神第一部：朝歌风云', 
    fullTitle: '【神话史诗】封神第一部：昆仑仙人携封神榜下山，商王殷寿无道', 
    views: '2,310,490', 
    rating: '96%', 
    duration: '148分钟', 
    img: 'assets/chat_cover.png',
    tags: ['#奇幻', '#动作', '#史诗'],
    description: '商王殷寿暴虐无道，引发天谴。昆仑仙人姜子牙携封神榜下山寻找天下共主。西伯侯之子姬发在发现殷寿的残暴真面目后，觉醒反抗，逃出朝歌，踏上了反商的英雄崛起之路。'
  },
  { 
    id: 22, 
    category: 'selfie', 
    title: '周末探店：首尔美食打卡', 
    fullTitle: '【美食地图】首尔街头必吃传统小吃与网红咖啡厅深度体验', 
    views: '1,890,340', 
    rating: '95%', 
    duration: '18分钟', 
    img: 'assets/drama_still1.png',
    tags: ['#美食', '#探店', '#旅行'],
    description: '带你打卡首尔本地人超爱的街头美食：辣炒年糕、参鸡汤、明洞烤肉，还有藏身在韩屋村里的高颜值复古咖啡厅。一整天吃吃喝喝不停歇，奉上最真实的美食红黑榜。'
  },
  { 
    id: 23, 
    category: 'gossip', 
    title: '经典老歌金曲串烧', 
    fullTitle: '【怀旧时光】那些陪伴我们长大的华语乐坛黄金时代经典金曲', 
    views: '3,450,120', 
    rating: '94%', 
    duration: '60分钟', 
    img: 'assets/science.png',
    tags: ['#音乐', '#怀旧', '#歌单'],
    description: '精选上世纪八九十年代至千禧之初的华语乐坛黄金金曲，包括张国荣、周杰伦、陈奕迅等巨星的经典之作。旋律响起，瞬间勾起青春的回忆，适合深夜静静聆听的经典歌单。'
  },
  { 
    id: 24, 
    category: 'japanese', 
    title: '情书', 
    fullTitle: '【经典纯爱】情书：岩井俊二经典美学，关于暗恋的极致浪漫', 
    views: '3,670,120', 
    rating: '97%', 
    duration: '117分钟', 
    img: 'assets/drawing.png',
    tags: ['#爱情', '#文艺', '#经典'],
    description: '渡边博子因思念未婚夫藤井树，寄往他天国旧址的一封信，竟然收到了同名同姓女孩的回信。随着两人信件的往来，一段尘封在中学时代的、关于同名藤井树的青涩暗恋往事被渐渐揭开。'
  },
  { 
    id: 25, 
    category: 'western', 
    title: '欧美重磅：阿凡达：水之道', 
    fullTitle: '【3D视觉盛宴】阿凡达：水之道：重返潘多拉星球，开启海洋部落全新冒险', 
    views: '1,560,980', 
    rating: '93%', 
    duration: '192分钟', 
    img: 'assets/sports_cover.png',
    tags: ['#科幻', '#动作', '#冒险'],
    description: '杰克·萨利与奈蒂莉在潘多拉星球育有子女，过着平静生活。然而，人类的威胁再度降临。为了保护家人，他们被迫离开森林家园，前往偏远的海洋部落寻求庇护，并学习与海洋生物和谐共处。'
  }
];

// Helper to select random videos
const selectVideosForBlock = (catId, count, excludeList = []) => {
  let pool = catId === 'recommend' 
    ? allVideos 
    : allVideos.filter(v => v.category === catId);
  
  if (pool.length === 0) {
    pool = allVideos;
  }

  let available = pool.filter(v => !excludeList.includes(v.id));
  if (available.length < count) {
    available = pool; 
  }

  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper to construct initial layout blocks data
const initBlocksData = (catId, categoriesList) => {
  const label = categoriesList.find(c => c.id === catId)?.label || '推荐';

  // Block 1
  const v1 = selectVideosForBlock(catId, 5, []);
  const block1 = {
    id: `block-${catId}-1`,
    categoryName: label,
    titleSubText: '最近更新',
    adBanner: 'assets/video_invite_banner.png',
    bannerLink: '邀請好友成功！無限觀影特權已開啟！',
    bigVideo: v1[0],
    smallVideos: v1.slice(1, 5)
  };

  // Block 2
  const v2 = selectVideosForBlock(catId, 5, v1.map(v => v.id));
  const block2 = {
    id: `block-${catId}-2`,
    categoryName: label,
    titleSubText: '热门推荐',
    adBanner: 'assets/video_mahjong_banner.png',
    bannerLink: '超級巨獎挑戰中！祝您好運連連！',
    bigVideo: v2[0],
    smallVideos: v2.slice(1, 5)
  };

  return [block1, block2];
};

export default function PageVideos() {
  const { 
    setActivePage, 
    setActiveGameCategory, 
    setAutoOpenGameId, 
    setActiveVideo,
    setVideoPlayerActive,
    showToast,
    openActivityPage,
    openGameDetailModal,
    immersiveMode,
    setImmersiveMode
  } = useApp();

  const [activeCat, setActiveCat] = useState('recommend');

  const categories = [
    { id: 'recommend', label: '推荐' },
    { id: 'gossip', label: '综艺娱乐' },
    { id: 'domestic', label: '华语电影' },
    { id: 'selfie', label: '生活Vlog' },
    { id: 'japanese', label: '日韩电影' },
    { id: 'western', label: '欧美大片' }
  ];

  // Initialize state synchronously with helper function
  const [layoutBlocks, setLayoutBlocks] = useState(() => initBlocksData('recommend', categories));

  // 8 portals (4 per row)
  const portals = [
    { type: 'gameDetail', value: 'queen', label: '赏金女王 PG', img: 'assets/game_mahjong.png' },
    { type: 'deposit', value: '新人福利', label: '新人福利', img: 'assets/drawing.png' },
    { type: 'deposit', value: '充值入口', label: '充值入口', img: 'assets/sports_cover.png' },
    { type: 'activity', value: 'rebate', label: '活动中心', img: 'assets/drawing.png' },
    { type: 'gameDetail', value: 'bg', label: 'BG视讯', img: 'assets/science.png' },
    { type: 'gameDetail', value: 'bbin', label: 'BBIN视讯', img: 'assets/science.png' },
    { type: 'gameDetail', value: 'gold_city', label: '寻宝黄金城 PG', img: 'assets/origami.png' },
    { type: 'gameDetail', value: 'undead', label: '亡灵大盗 PG', img: 'assets/lego.png' }
  ];

  // Click handlers
  const handleSlotClick = (slot) => {
    if (slot.type === 'game') {
      if (slot.value === 'fast3') {
        setActivePage('page-games');
        setActiveGameCategory('lottery');
        setAutoOpenGameId('fast_three');
      } else if (slot.value === 'pg') {
        setActivePage('page-games');
        setActiveGameCategory('pg');
        setAutoOpenGameId(null);
      } else if (slot.value === 'wali') {
        setActivePage('page-games');
        setActiveGameCategory('wali');
        setAutoOpenGameId(null);
      }
    } else if (slot.type === 'gameDetail') {
      openGameDetailModal({ name: slot.label.replace(/\s*PG$/, ''), img: slot.img });
    } else if (slot.type === 'deposit') {
      setActivePage('page-deposit');
    } else if (slot.type === 'activity') {
      openActivityPage(slot.value);
    } else {
      showToast(`提示：【${slot.value}】正在對接中，敬請期待！`);
    }
  };

  const handleVideoClick = (vid) => {
    setActiveVideo(vid);
    setVideoPlayerActive(true);
  };

  const handleSearch = () => {
    showToast('提示：【搜索功能】正在對接中，敬請期待！');
  };

  const handleHeaderIcon = (iconName) => {
    showToast(`提示：【${iconName}】功能正在接入中！`);
  };

  // "看更多" handler - appends a new block
  const handleViewMore = () => {
    const nextIdx = layoutBlocks.length + 1;
    const label = categories.find(c => c.id === activeCat)?.label || '推荐';

    // Exclude all currently visible videos in the blocks to avoid duplicates
    const excludeIds = layoutBlocks.flatMap(b => [b.bigVideo.id, ...b.smallVideos.map(v => v.id)]);
    const vNext = selectVideosForBlock(activeCat, 5, excludeIds);

    const banners = [
      { img: 'assets/banner.png', link: '點擊廣告：今日存，明日送！首充紅利狂歡中！' },
      { img: 'assets/video_invite_banner.png', link: '邀請好友成功！無限觀影特權已開啟！' },
      { img: 'assets/video_mahjong_banner.png', link: '超級巨獎挑戰中！祝您好運連連！' }
    ];
    const selectedBanner = banners[nextIdx % banners.length];

    const subTexts = ['精彩推荐', '猜你喜欢', '人气排行', '今日精选'];
    const subText = subTexts[(nextIdx - 1) % subTexts.length];

    const newBlock = {
      id: `block-${activeCat}-${Date.now()}`,
      categoryName: label,
      titleSubText: subText,
      adBanner: selectedBanner.img,
      bannerLink: selectedBanner.link,
      bigVideo: vNext[0],
      smallVideos: vNext.slice(1, 5)
    };

    setLayoutBlocks([...layoutBlocks, newBlock]);
    showToast('已加載更多精選內容！');
  };

  // "换一换" handler - refreshes the video content of a specific block
  const handleRefreshBlock = (blockId) => {
    setLayoutBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;

      // Select 5 new random videos
      const vNew = selectVideosForBlock(activeCat, 5, []);
      return {
        ...block,
        bigVideo: vNew[0],
        smallVideos: vNew.slice(1, 5)
      };
    }));
    showToast('內容已刷新！');
  };

  const handleCategoryChange = (catId) => {
    setActiveCat(catId);
    setLayoutBlocks(initBlocksData(catId, categories));
  };

  return (
    <div className="app-page active" id="page-videos">
      {/* Video Header Bar */}
      {!immersiveMode && (
        <div className="video-header-bar">
          <div className="lobby-logo-title">
            <img src="assets/logo.svg" className="lobby-brand-logo" alt="LOGO" />
          </div>
          <div className="search-bar-middle" onClick={handleSearch}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="极品专区" readOnly />
          </div>
          <div className="header-immersive-btn" onClick={() => setImmersiveMode(true)} style={{ marginLeft: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', height: '100%', color: '#ffa751' }} title="进入沉浸模式">
            <i className="fa-solid fa-expand" style={{ fontSize: '1rem' }}></i>
          </div>
        </div>
      )}

      {/* Categories scroll bar */}
      <div className="video-categories-bar">
        <div className="scroll-categories">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className={`category-pill ${activeCat === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Scrollable Content Container */}
      <div className="scroll-content" style={{ padding: '0 0 80px 0' }}>
        {/* Marquee Announcement */}
        <div className="video-marquee-announcement" style={{ margin: '0 12px' }}>
          <i className="fa-solid fa-bullhorn text-orange announcement-icon"></i>
          <div className="marquee-text-container">
            <div className="marquee-text">欢迎光临AC娛樂视频！全球顶级观影app，无限看片，全部免费！首充即送300%红利...</div>
          </div>
          <i className="fa-regular fa-envelope marquee-mail-icon" onClick={() => setActivePage('page-mail')} title="站内信"></i>
        </div>

        {/* Repeating Layout Blocks */}
        {layoutBlocks.map((block) => (
          <div key={block.id} className="video-group-block">
            {/* 1. Ad Banner */}
            <div className="video-group-banner-wrapper" onClick={() => showToast(block.bannerLink)}>
              <img src={block.adBanner} className="video-group-banner-img" alt="Ad Banner" />
              {/* Pagination dots indicator */}
              <div className="video-banner-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>

            {/* 2. Small entry portals (10 slots in 2 rows of 5) */}
            <div className="video-group-portals-grid">
              {portals.map((slot, idx) => (
                <div key={idx} className="video-game-slot" onClick={() => handleSlotClick(slot)}>
                  <div className="game-icon-box">
                    <img src={slot.img} alt={slot.label} />
                  </div>
                  <span>{slot.label}</span>
                </div>
              ))}
            </div>

            {/* 3. Section Title Row */}
            <div className="video-section-title-row">
              <div className="title-left">
                <span className="red-bar">|</span>
                <h3>{block.categoryName}</h3>
              </div>
              <span className="title-right" onClick={() => showToast('正在為您加載更多內容...')}>
                {block.titleSubText} <i className="fa-solid fa-chevron-right"></i>
              </span>
            </div>

            {/* 4. One Big Video */}
            {block.bigVideo && (
              <div className="video-big-card" onClick={() => handleVideoClick(block.bigVideo)}>
                <div className="video-thumb-large">
                  <img src={block.bigVideo.img} alt={block.bigVideo.title} />
                  <i className="fa-solid fa-play play-overlay-icon"></i>
                  {block.bigVideo.isFree && <span className="badge-free">免费</span>}
                  {block.bigVideo.adBadge && <span className="badge-ad-privilege">{block.bigVideo.adBadge}</span>}
                  <span className="duration-label">{block.bigVideo.duration}</span>
                </div>
                <div className="video-desc-large">
                  <h4>{block.bigVideo.fullTitle}</h4>
                  <p><i className="fa-regular fa-eye"></i> {block.bigVideo.views}次播放 · {block.bigVideo.rating}好评</p>
                </div>
              </div>
            )}

            {/* 5. 4-grid Small Videos (2x2 grid) */}
            <div className="video-small-grid-layout">
              {block.smallVideos.map((vid, idx) => (
                <div key={idx} className="video-small-card" onClick={() => handleVideoClick(vid)}>
                  <div className="video-thumb-small">
                    <img src={vid.img} alt={vid.title} />
                    <i className="fa-solid fa-play play-overlay-icon-small"></i>
                    <span className="duration-label-small">{vid.duration}</span>
                  </div>
                  <div className="video-desc-small">
                    <h4>{vid.title}</h4>
                    <p>{vid.views}次播放</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 6. View More / Change buttons */}
            <div className="video-group-actions-row">
              <button className="video-action-btn-pill" onClick={handleViewMore}>
                <i className="fa-regular fa-face-smile"></i> 看更多
              </button>
              <button className="video-action-btn-pill" onClick={() => handleRefreshBlock(block.id)}>
                <i className="fa-solid fa-arrows-rotate"></i> 换一换
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
