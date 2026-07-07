import { useEffect, useCallback, useState } from 'react';
import { ConfigProvider, theme as antTheme, message } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import LoginComp from './LoginComp';
import Mascot from './components/Mascot';
import SidebarMenu from './components/SidebarMenu';
import CyberpunkLoading from './components/CyberpunkLoading';
import ErrorBoundary from './components/ErrorBoundary';
import { SettingsProvider, useSettings } from './services/SettingsContext';
import { ensureModelLoaded } from './services/index';
import './App.css';
import Routers from './routes';

const items = [
  {
    key: '/tts',
    label: '配音',
  },
  {
    key: '/tts-beta',
    label: '一句话克隆(beta)',
  },
  {
    key: '/voice-design',
    label: '声音设计(beta)',
  },
  {
    key: '/settings',
    label: '设置',
  },
];

const { defaultAlgorithm, darkAlgorithm } = antTheme

function AppContent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { settings } = useSettings();

  const [modelLoading, setModelLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingModelName, setLoadingModelName] = useState('');

  const isDark = settings.theme === 'dark'
    || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const selectedKey = items.some((item) => item.key === pathname)
    ? pathname
    : '/tts';

  useEffect(() => {
    if (!items.find((item) => item.key === pathname)) {
      navigate('/tts');
    }
  }, [pathname, navigate]);

  const handleNavigate = useCallback(async (path: string) => {
    if (path === '/voice-design') {
      setModelLoading(true);
      setLoadingMessage('正在加载 VoxCPM2 模型...');
      setLoadingModelName('VoxCPM2');

      const ok = await ensureModelLoaded('voxcpm2');
      setModelLoading(false);

      if (!ok) {
        message.error('模型加载失败，请稍后重试');
        return;
      }
    } else if (path === '/tts' || path === '/tts-beta') {
      setModelLoading(true);
      setLoadingMessage('正在加载 Qwen3 TTS 模型...');
      setLoadingModelName('Qwen3 TTS');

      const ok = await ensureModelLoaded('tts');
      setModelLoading(false);

      if (!ok) {
        message.error('模型加载失败，请稍后重试');
        return;
      }
    }
    navigate(path);
  }, [navigate]);

  return (
    <ConfigProvider theme={{ algorithm: isDark ? darkAlgorithm : defaultAlgorithm }}>
      <div className='app'>
        <LoginComp />
        <SidebarMenu
          currentPath={selectedKey}
          onNavigate={handleNavigate}
        />
        <div className='contentwrap'>
          <ErrorBoundary onNavigate={navigate}>
            <Routers />
          </ErrorBoundary>
          <Mascot />
        </div>

        <CyberpunkLoading
          visible={modelLoading}
          message={loadingMessage}
          modelName={loadingModelName}
        />
      </div>
    </ConfigProvider>
  )
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}

export default App;
