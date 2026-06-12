import { useState } from 'react';
import { useApp } from '../context/AppContext';

// Rich database of 25 detailed items covering all categories
const allVideos = [
  { id: 1, category: 'domestic', title: '91CM-124 三胎计划 林妙可', fullTitle: '91CM-124 三胎计划 林妙可：与绝美尤物开启生三胎挑战', views: '5,062', rating: '99%', duration: '48分钟', img: 'assets/video_swimsuit_pool.png', isFree: true, adBadge: "开通特权送钱" },
  { id: 2, category: 'selfie', title: '迷奸高中女教师 (偷拍系列)', fullTitle: '迷奸高中女教师：女教师被下药迷奸内射 (震撼流出)', views: '2,891,854', rating: '98%', duration: '98分钟', img: 'assets/drama_still1.png', isFree: true },
  { id: 3, category: 'domestic', title: '清纯校花私密交易实录', fullTitle: '【精品传媒】清纯校花与豪门大少爷的私密恋情交易实拍', views: '1,234,812', rating: '95%', duration: '115分钟', img: 'assets/origami.png' },
  { id: 4, category: 'selfie', title: '更衣室隐蔽镜头无码自拍', fullTitle: '【自拍流出】更衣室隐蔽角度无码自拍泄露 (日本无码)', views: '3,921,085', rating: '97%', duration: '85分钟', img: 'assets/science.png', isFree: true },
  { id: 5, category: 'gossip', title: '网红主播深夜户外野战流出', fullTitle: '【瓜田速递】某平台百万粉丝女网红反差深夜户外露天野战流出', views: '829,310', rating: '92%', duration: '22分钟', img: 'assets/chat_cover.png' },
  { id: 6, category: 'gossip', title: '知名女星KTV包厢奢华私密派对', fullTitle: '【独家猛料】知名女星与多名富商KTV包厢奢华私密派对实拍', views: '1,432,019', rating: '94%', duration: '45分钟', img: 'assets/sports_cover.png' },
  { id: 7, category: 'japanese', title: '东京热：超人气女优水原沙耶香', fullTitle: '【东京热】超人气专属女优水原沙耶香极致私密挑逗巨制', views: '5,123,040', rating: '99%', duration: '120分钟', img: 'assets/lego.png' },
  { id: 8, category: 'japanese', title: '一本道：熟女教师家庭访问', fullTitle: '【一本道】人妻熟女教师家庭访问：课后私人专属一对一辅导', views: '3,204,500', rating: '96%', duration: '135分钟', img: 'assets/drawing.png' },
  { id: 9, category: 'western', title: '欧美精品：金发尤物激情碰撞', fullTitle: '【Vixen】金发豪乳尤物海边度假豪宅极致双人激情碰撞大作', views: '980,450', rating: '91%', duration: '110分钟', img: 'assets/science.png' },
  { id: 10, category: 'selfie', title: '黑丝空姐酒店密会富二代', fullTitle: '【自拍偷拍】性感黑丝空姐酒店房间密会富二代激情偷拍流出', views: '2,510,480', rating: '95%', duration: '64分钟', img: 'assets/drama_still1.png' },
  { id: 11, category: 'domestic', title: '麻豆传媒之初夏的诱惑', fullTitle: '【麻豆精品】初夏的诱惑：邻家小姐姐借宿发生的不可思议事件', views: '1,902,481', rating: '97%', duration: '92分钟', img: 'assets/origami.png' },
  { id: 12, category: 'selfie', title: '探花流出：高颜值白领高端约会', fullTitle: '【精品探花】高颜值白领高端私人订制约会实录 (超清泄露)', views: '3,110,482', rating: '94%', duration: '75分钟', img: 'assets/sports_cover.png' },
  { id: 13, category: 'gossip', title: '百万粉丝女网红反差曝光', fullTitle: '【大瓜落地】某平台百万粉丝纯欲风女网红反差视频流出曝光', views: '2,450,128', rating: '93%', duration: '18分钟', img: 'assets/chat_cover.png' },
  { id: 14, category: 'japanese', title: 'S1专属新人首秀极致体贴', fullTitle: '【S1精品】专属新人首秀：极致温柔体贴的感官盛宴 (无码)', views: '4,218,903', rating: '98%', duration: '140分钟', img: 'assets/drawing.png' },
  { id: 15, category: 'western', title: '欧美狂野：维纳斯女神双重冲击', fullTitle: '【Tushy】维纳斯双重冲击：欧美顶级名模联袂奉献感官挑战', views: '870,412', rating: '90%', duration: '95分钟', img: 'assets/lego.png' },
  { id: 16, category: 'gossip', title: '某高校校花与体育生露天实拍', fullTitle: '【校园爆料】某知名高校校花与体育部社长操场露天私密实拍', views: '3,180,450', rating: '94%', duration: '28分钟', img: 'assets/drawing.png' },
  { id: 17, category: 'selfie', title: '海归名媛高档住宅私人派对', fullTitle: '【夜色探秘】海归名媛高档住宅深夜聚会狂欢自拍流出 (超清)', views: '2,940,185', rating: '96%', duration: '50分钟', img: 'assets/science.png' },
  { id: 18, category: 'domestic', title: '天美传媒：职场女强人的双面人生', fullTitle: '【天美精品】职场女强人的双面人生：白领主管深夜的秘密邂逅', views: '1,670,480', rating: '95%', duration: '108分钟', img: 'assets/sports_cover.png' },
  { id: 19, category: 'japanese', title: 'SOD魔镜号街头突袭企划', fullTitle: '【SOD】魔镜号街头突袭企划：寻找愿意配合的素人小姐姐', views: '5,890,321', rating: '99%', duration: '150分钟', img: 'assets/lego.png' },
  { id: 20, category: 'western', title: '欧美精品：超模巨星海滩邂逅', fullTitle: '【Vixen】超模巨星海滩浪漫邂逅：阳光沙滩下的感官碰撞', views: '1,120,490', rating: '92%', duration: '100分钟', img: 'assets/origami.png' },
  { id: 21, category: 'domestic', title: '天美传媒：女仆咖啡厅的特别服务', fullTitle: '【天美精品】女仆咖啡厅的特别服务：专属包厢一对一私密体验', views: '2,310,490', rating: '96%', duration: '88分钟', img: 'assets/chat_cover.png' },
  { id: 22, category: 'selfie', title: '自拍偷拍：情侣酒店镜面自拍', fullTitle: '【情侣自拍】情侣主题酒店浴室大镜子面前的甜蜜互动过程记录', views: '1,890,340', rating: '95%', duration: '72分钟', img: 'assets/drama_still1.png' },
  { id: 23, category: 'gossip', title: '某金融女高管与下属关系曝光', fullTitle: '【金融圈大瓜】某知名投行金融女高管与新入职下属私密聊天曝光', views: '3,450,120', rating: '94%', duration: '32分钟', img: 'assets/science.png' },
  { id: 24, category: 'japanese', title: 'Prestige经典护士系列重温', fullTitle: '【P-Group】经典重温：白衣天使包厢里的贴心护理与服侍', views: '3,670,120', rating: '97%', duration: '118分钟', img: 'assets/drawing.png' },
  { id: 25, category: 'western', title: '欧美重磅：Vixen全景超清大作', fullTitle: '【Vixen】全景超清重磅大作：金发名模奢华寝室性感交融', views: '1,560,980', rating: '93%', duration: '125分钟', img: 'assets/sports_cover.png' }
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
    showToast 
  } = useApp();

  const [activeCat, setActiveCat] = useState('recommend');

  const categories = [
    { id: 'recommend', label: '推荐' },
    { id: 'gossip', label: '网暴吃瓜' },
    { id: 'domestic', label: '国产传媒' },
    { id: 'selfie', label: '自拍偷拍' },
    { id: 'japanese', label: '日本无码' },
    { id: 'western', label: '欧美精品' }
  ];

  // Initialize state synchronously with helper function
  const [layoutBlocks, setLayoutBlocks] = useState(() => initBlocksData('recommend', categories));

  // 10 portals configured exactly matching the screenshot
  const portals = [
    { type: 'game', value: 'pg', label: '赏金女王 PG', img: 'assets/game_mahjong.png' },
    { type: 'deposit', value: '新人福利', label: '新人福利', img: 'assets/drawing.png' },
    { type: 'deposit', value: '充值入口', label: '充值入口', img: 'assets/sports_cover.png' },
    { type: 'toast', value: '在线客服', label: '在线客服', img: 'assets/chat_cover.png' },
    { type: 'toast', value: '活动中心', label: '活动中心', img: 'assets/drawing.png' },
    { type: 'toast', value: 'BG视讯', label: 'BG视讯', img: 'assets/science.png' },
    { type: 'toast', value: 'BBIN视讯', label: 'BBIN视讯', img: 'assets/science.png' },
    { type: 'game', value: 'pg', label: '寻宝黄金城 PG', img: 'assets/origami.png' },
    { type: 'game', value: 'wali', label: '抢庄牛牛', img: 'assets/game_fast3.png' },
    { type: 'game', value: 'pg', label: '亡灵大盗 PG', img: 'assets/lego.png' }
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
    } else if (slot.type === 'deposit') {
      setActivePage('page-deposit');
    } else {
      showToast(`提示：【${slot.value}】正在對接中，敬請期待！`);
    }
  };

  const handleVideoClick = (vid) => {
    setActiveVideo({ title: vid.title, img: vid.img });
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
      <div className="video-header-bar">
        <div className="lobby-logo-title">
          <img src="assets/black_panther_logo.png" className="lobby-logo-avatar" alt="LOGO" />
          <div>
            <h4>黑豹视频</h4>
            <span>1068.tv</span>
          </div>
        </div>
        <div className="search-bar-middle" onClick={handleSearch}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="极品专区" readOnly />
        </div>
      </div>

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
        <div className="video-marquee-announcement" style={{ margin: '10px 12px' }}>
          <i className="fa-solid fa-bullhorn text-orange announcement-icon"></i>
          <div className="marquee-text-container">
            <div className="marquee-text">欢迎光临黑豹视频！全球顶级观影app，无限看片，全部免费！首充即送300%红利...</div>
          </div>
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
