import { useState } from 'react';
import { Input, Slider, Button, message, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  UndoOutlined,
  SoundOutlined,
  FileTextOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import IconDesign from '../components/IconDesign'
import './index.css';

const { TextArea } = Input;

const DEFAULT_PROMPTS = [
  '温柔知性的成熟女声，说话节奏舒缓，语调自然亲切',
  '深沉富有磁性的男声，带有轻微的沙哑感，适合故事旁白',
  '活泼元气的少女音，语调轻快上扬，充满青春气息',
  '稳重庄重的新闻播音腔，字正腔圆，语速均匀',
  '慵懒随性的氛围感声音，带些许气泡音，松弛自然',
  '清澈明亮的少年音，充满朝气，咬字清晰有力',
  '低沉性感的烟嗓女声，微微沙哑，情感饱满',
  '儒雅温和的书卷气男声，语速偏慢，沉稳有韵味',
];

const VoiceDesign = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [voicePrompt, setVoicePrompt] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleSynthesize = async () => {
    if (!voicePrompt.trim()) {
      messageApi.warning('请输入语音风格提示词');
      return;
    }
    setLoading(true);
    messageApi.success('开始合成...');

    setLoading(false);
    messageApi.success('合成完成！');
  };

  const resetParams = () => {
    setSpeed(1.0);
    setVolume(1.0);
  };

  return (
    <div className='voice-design'>
      {contextHolder}

      <div className='voice-design-header'>
        <h2 className='voice-design-title'>
          <IconDesign /> 声音设计
        </h2>
        <p className='voice-design-subtitle'>调整声音参数，设计专属语音风格</p>
      </div>

      <div className='voice-design-body'>
        <div className='voice-design-controls'>
          <div className='voice-design-section'>
            <div className='voice-design-section-title'><><FileTextOutlined /> 语音风格提示词</></div>
            <TextArea
              className='voice-design-prompt-input'
              placeholder='描述你想要的语音风格，例如：温柔知性的成熟女声，说话节奏舒缓'
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
              maxLength={200}
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
            <div className='voice-design-text-footer'>
              {voicePrompt.length} / 200
            </div>
            <div className='voice-design-default-prompts'>
              {DEFAULT_PROMPTS.map((p) => (
                <span
                  key={p}
                  className={`voice-design-prompt-tag${voicePrompt === p ? ' active' : ''}`}
                  onClick={() => setVoicePrompt(p)}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className='voice-design-section'>
            <div
              className='voice-design-section-title'
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span><><SlidersOutlined /> 参数微调</></span>
              <Tooltip title='重置语速和音量到默认值'>
                <UndoOutlined
                  className='voice-design-reset-icon'
                  onClick={resetParams}
                />
              </Tooltip>
            </div>

            <div className='voice-design-param'>
              <div className='voice-design-param-header'>
                <span className='voice-design-param-label'>语速</span>
                <span className='voice-design-param-value'>
                  {speed.toFixed(1)}x
                </span>
              </div>
              <Slider
                min={0.5}
                max={2.0}
                step={0.1}
                value={speed}
                onChange={setSpeed}
              />
            </div>

            <div
              className={`voice-design-param${volume >= 1.5 ? ' volume-high' : ''}${volume < 1.0 ? ' volume-low' : ''}`}
            >
              <div className='voice-design-param-header'>
                <span className='voice-design-param-label'>音量</span>
                <span className='voice-design-param-value'>
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={volume}
                onChange={setVolume}
              />
              {volume >= 1.5 && (
                <div className='voice-design-volume-tip warning'>
                  音量过高，可能导致声音失真或影响听感
                </div>
              )}
              {volume < 1.0 && (
                <div className='voice-design-volume-tip info'>
                  音量偏低，输出声音可能偏小
                </div>
              )}
            </div>
          </div>

        </div>

        <div className='voice-design-preview'>
          <div className='voice-design-actions'>
            <Button
              type='primary'
              size='large'
              icon={<PlayCircleOutlined />}
              onClick={handleSynthesize}
              loading={loading}
              className='voice-design-btn-primary'
            >
              合成试听
            </Button>
          </div>
          <div className='voice-design-preview-center'>
            {!audioUrl ? (
              <div className='voice-design-preview-placeholder'>
                <SoundOutlined className='voice-design-preview-icon' />
                <p>合成后音频将在此处播放</p>
              </div>
            ) : (
              <audio src={audioUrl} controls className='voice-design-audio' />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDesign;
