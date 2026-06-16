import { useEffect } from 'react';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import LoginComp from './LoginComp';
import IconTTSStatic from './components/IconTTSStatic';
import IconCloneStatic from './components/IconCloneStatic';
import IconDesignStatic from './components/IconDesignStatic';
import Mascot from './components/Mascot';
import SidebarMenu from './components/SidebarMenu';
import './App.css';
import Routers from './routes';

const items = [
  {
    key: '/tts',
    label: '配音',
    // icon: <IconTTSStatic />,
  },
  {
    key: '/tts-beta',
    label: '一句话克隆(beta)',
    // icon: <IconCloneStatic />,
  },
  {
    key: '/voice-design',
    label: '声音设计(beta)',
    // icon: <IconDesignStatic />,
  },
  {
    key: '/settings',
    label: '设置',
  },
];

function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const selectedKey = items.some((item) => item.key === pathname)
    ? pathname
    : '/tts';

  useEffect(() => {
    if (!items.find((item) => item.key === pathname)) {
      navigate('/tts');
    }
  }, [pathname, navigate]);

  return (
    <div className='app'>
      <LoginComp />
          <SidebarMenu
            currentPath={selectedKey}
            onNavigate={navigate}
          />
      <div className='contentwrap'>
        {/* <Menu
          className='menuclass'
          selectedKeys={[selectedKey]}
          mode="inline"
          items={items}
          onClick={e => navigate(e.key)}
        /> */}
        <Routers />
        <Mascot />
      </div>
    </div>
  );
}

export default App;
