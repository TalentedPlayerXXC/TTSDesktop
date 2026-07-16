import { useEffect, useCallback, useState } from 'react';
import { ConfigProvider, theme as antTheme, message } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import LoginComp from './LoginComp';
import Mascot from './components/Mascot';
import SidebarMenu from './components/SidebarMenu';
import CyberpunkLoading from './components/CyberpunkLoading';
import ModelDownload from './components/ModelDownload';
import DisclaimerModal from './components/DisclaimerModal';
import ErrorBoundary from './components/ErrorBoundary';
import { SettingsProvider, useSettings } from './services/SettingsContext';
import { ensureModelLoaded, loadModel, setCurrentModel } from './services/index';
import { updateServerPort } from './services/request';
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
    key: '/sound-workshop',
    label: '声音工坊',
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
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingModelName, setLoadingModelName] = useState('');

  const handleModelLoad = async () => {
    setModelLoading(true)
    setLoadingMessage('🏃 配音员正在赶来的路上...')
    setLoadingModelName('TTS')
    try {
      const res = await loadModel({ model: 'tts' })
      if (res.data?.success) {
        setCurrentModel('tts')
      }
    } catch {}
    setModelLoading(false)
  }

  const isDark = settings.theme === 'dark'
    || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    updateServerPort()
    // 同步主进程预载的模型
    ;(window as any).electronAPI?.getStartupModel?.().then((model: string | null) => {
      if (model === 'tts') setCurrentModel('tts')
    })
    // 后端日志转发到渲染进程控制台
    const cleanup = (window as any).electronAPI?.onBackendLog?.((data: { level: string; text: string }) => {
      console.log(`[后端${data.level === 'stderr' ? ' ❌' : ''}] ${data.text}`)
    })
    return () => cleanup?.()
  }, [])

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
      setLoadingMessage('🎛️ 调音师拧了拧旋钮...');
      setLoadingModelName('VoxCPM2');

      const ok = await ensureModelLoaded('voxcpm2');
      setModelLoading(false);

      if (!ok) {
        message.error('模型加载失败，请稍后重试');
        return;
      }
    } else if (path === '/tts' || path === '/tts-beta') {
      setModelLoading(true);
      setLoadingMessage('🏃 配音员正在赶来的路上...');
      setLoadingModelName('TTS');

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
        {!disclaimerAgreed && <DisclaimerModal onAgree={() => setDisclaimerAgreed(true)} />}
        <ModelDownload onComplete={handleModelLoad} />
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
