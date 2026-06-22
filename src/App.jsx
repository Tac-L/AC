import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import PhoneContainer from './components/PhoneContainer';
import BottomNav from './components/BottomNav';

// Pages
import PageHome from './components/PageHome';
import PageVideos from './components/PageVideos';
import PageDramas from './components/PageDramas';
import PageChats from './components/PageChats';
import PageSports from './components/PageSports';
import PageGames from './components/PageGames';
import PageProfile from './components/PageProfile';
import PageLogin from './components/PageLogin';
import PageRegister from './components/PageRegister';
import PageDeposit from './components/PageDeposit';
import PageWithdraw from './components/PageWithdraw';
import PageRebate from './components/PageRebate';
import PagePlatformBalance from './components/PagePlatformBalance';
import PageMail from './components/PageMail';
import PageBetRecords from './components/PageBetRecords';
import PageActivity from './components/PageActivity';
import PageOffers from './components/PageOffers';
import PageSettings from './components/PageSettings';
import PageAccountSettings from './components/PageAccountSettings';
import PageBindPhone from './components/PageBindPhone';

// Sub games
import SubGameMarkSix from './components/SubGameMarkSix';
import SubGameFastThree from './components/SubGameFastThree';
import SubGameSpeedRace from './components/SubGameSpeedRace';
import PageSportsPlatforms from './components/PageSportsPlatforms';

// Modals
import ModalBetDetails from './components/ModalBetDetails';
import ModalVideoPlayer from './components/ModalVideoPlayer';
import ModalsConfig from './components/ModalsConfig';
import ModalGameDetail from './components/ModalGameDetail';
import ModalPgGame from './components/ModalPgGame';

function MainApp() {
  const { activePage, activeSubGame } = useApp();

  // Determine active view inside Phone container
  const renderActivePage = () => {
    if (activeSubGame === 'mark_six') {
      return <SubGameMarkSix />;
    }
    if (activeSubGame === 'fast_three') {
      return <SubGameFastThree />;
    }
    if (activeSubGame === 'speed_race') {
      return <SubGameSpeedRace />;
    }
    if (activeSubGame === 'sports_platforms') {
      return <PageSportsPlatforms />;
    }

    switch (activePage) {
      case 'page-home':
        return <PageHome />;
      case 'page-videos':
        return <PageVideos />;
      case 'page-dramas':
        return <PageDramas />;
      case 'page-chats':
        return <PageChats />;
      case 'page-sports':
        return <PageSports />;
      case 'page-games':
        return <PageGames />;
      case 'page-profile':
        return <PageProfile />;
      case 'page-login':
        return <PageLogin />;
      case 'page-register':
        return <PageRegister />;
      case 'page-deposit':
        return <PageDeposit />;
      case 'page-withdraw':
        return <PageWithdraw />;
      case 'page-rebate':
        return <PageRebate />;
      case 'page-platform-balance':
        return <PagePlatformBalance />;
      case 'page-mail':
        return <PageMail />;
      case 'page-bet-records':
        return <PageBetRecords />;
      case 'page-activity':
        return <PageActivity />;
      case 'page-offers':
        return <PageOffers />;
      case 'page-settings':
        return <PageSettings />;
      case 'page-account-settings':
        return <PageAccountSettings />;
      case 'page-bind-phone':
        return <PageBindPhone />;
      default:
        return <PageDramas />;
    }
  };

  return (
    <div className="simulator-desktop-container">
      {/* 1. Sidebar Panel */}
      <Sidebar />

      {/* 2. Device Shell container */}
      <PhoneContainer>
        {renderActivePage()}
        
        {/* Bottom Navigation is hidden when playing a sub-game or visiting deposit/withdraw */}
        {!activeSubGame && activePage !== 'page-deposit' && activePage !== 'page-withdraw' && activePage !== 'page-rebate' && activePage !== 'page-platform-balance' && activePage !== 'page-bet-records' && activePage !== 'page-activity' && activePage !== 'page-offers' && activePage !== 'page-settings' && activePage !== 'page-account-settings' && activePage !== 'page-bind-phone' && activePage !== 'page-login' && activePage !== 'page-register' && <BottomNav />}

        {/* 3. Global Overlays / Modals */}
        <ModalBetDetails />
        <ModalVideoPlayer />
        <ModalsConfig />
        <ModalGameDetail />
        <ModalPgGame />
      </PhoneContainer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
