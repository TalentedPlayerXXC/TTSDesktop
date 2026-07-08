import { useState, useCallback, useRef, useEffect } from 'react'
import LogoCanvas from './LogoCanvas'
import LoginAvatar from './LoginAvatar'
import './index.css'

const TAGLINES = [
  "feature 是 bug 的赠品-方休",
  "代码能跑就别动-方休",
  "console.log 治百病-方休",
  "重启一下就好了-方休",
  "这版先顶一顶-方休",
  "我也不知道为什么-方休",
  "能用就行别嫌弃-方休",
  "又没有崩，算什么bug-方休",
  "别问，问就是底层优化-方休",
  "这次真的只改了一行-方休",
  "简历上写精通的那种-方休",
  "Ctrl+C / Ctrl+V 也是技术-方休",
  "测试环境跑得好好的啊-方休",
  "在我电脑上是没问题的-方休",
  "报什么错，这是隐藏功能-方休",
  "昨天还能跑的啊，我什么也没改-方休",
  "这不是 bug，是没文档的特性-方休",
  "AI 写的，有问题找 AI-方休",
  "删库跑路的第……算了不数了-方休",
  "需求太简单了，做出来就这样-方休",
  "代码是人写的，是人就会写 bug-方休",
  "不要慌，先截个图发朋友圈-方休",
  "我寻思着这功能也不难啊……吧-方休",
  "先发布再说，有问题下个版本修-方休",
  "本产品已通过「能动就行」认证-方休",
  "反正也没人用，摆烂了-方休",
  "写得很好，下次别写了-方休",
  "其实我也不会，但是先画个饼-方休",
  "架构没崩，不算事故-方休",
]

function getRandomTagline(): string {
  return TAGLINES[Math.floor(Math.random() * TAGLINES.length)]
}

function LoginComp(props: any) {
  const { theme, user = 'w' } = props;
  const [displayText, setDisplayText] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fullTextRef = useRef('')

  const startTypewriter = useCallback((text: string) => {
    setDisplayText('')
    fullTextRef.current = text
    let i = 0
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      i++
      if (i <= text.length) {
        setDisplayText(text.slice(0, i))
      } else {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }, 40)
  }, [])

  // 初始打字
  useEffect(() => {
    startTypewriter(getRandomTagline())
  }, [startTypewriter])

  const handleClick = () => {
    const next = getRandomTagline()
    // 如果当前正在打字，先清掉
    if (timerRef.current) clearInterval(timerRef.current)
    // 快速清空当前文字
    setDisplayText('')
    setTimeout(() => startTypewriter(next), 100)
  }

  return (
      <div className='loginHead'>
          <div className='logo'>
              <LogoCanvas />
          </div>
          <div className='loginHead-center' onClick={handleClick} style={{ cursor: 'pointer' }}>
              <span style={{
                fontFamily: "'Ma Shan Zheng', cursive, sans-serif",
                fontSize: 15,
                color: 'var(--text-subtitle)',
                letterSpacing: 1,
                minWidth: 160,
                display: 'inline-block',
                whiteSpace: 'nowrap',
              }}>
                {displayText}
                <span style={{ animation: 'cursorBlink 0.8s step-end infinite', fontWeight: 'bold', opacity: 0.7 }}>|</span>
              </span>
          </div>
          <div className='loginHead-right'>
              {
                  user ?
                      <LoginAvatar />
                      : "请登录"
              }
          </div>
      </div>
  );
}
export default LoginComp;
