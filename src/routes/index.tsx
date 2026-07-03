
import {
    Routes,
    Route,
} from 'react-router'
import TTSComponentBeta from '../TTSComponentBeta';
import TTSComponent from '../TTSComponent';
import VoiceDesign from '../VoiceDesign';
import Settings from '../SettingsCompontent';
import CrashTest from '../components/CrashTest';
// 路由配置 
// home
// tts配音 

// 试验性功能 tts-beta 一句话生成

// 试验性功能 voice-design 声音设计
// const router = createBrowserRouter([
//     {
//         path: "/",
//         Component: TTSComponent,
//     },
//     {
//         path: "/tts",
//         Component: TTSComponent,
//     },
//     {
//         path: "/tts-beta",
//         Component: TTSComponentBeta,
//     },
// ]);
function Routers() {
    return (
        <Routes>
            <Route path="/" element={<TTSComponent />} />
            <Route path="/tts" element={<TTSComponent />} />
            <Route path="/tts-beta" element={<TTSComponentBeta />} />
            <Route path="/voice-design" element={<VoiceDesign />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/crash-test" element={<CrashTest />} />
        </Routes>
    )
}
export default Routers;
