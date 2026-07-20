
import {
    Routes,
    Route,
} from 'react-router'
import TTSComponentBeta from '../TTSComponentBeta';
import TTSComponent from '../TTSComponent';
import VoiceDesign from '../VoiceDesign';
import SoundWorkshop from '../SoundWorkshop';
import Settings from '../SettingsComponent';
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
            <Route path="/sound-workshop" element={<SoundWorkshop />} />
            <Route path="/settings" element={<Settings />} />
        </Routes>
    )
}
export default Routers;
