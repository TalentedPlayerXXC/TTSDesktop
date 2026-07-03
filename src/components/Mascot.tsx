import { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Input, message } from 'antd';
import './Mascot.css';

interface Sparkle {
  x: number;
  y: number;
  r: number;
  life: number;
  maxLife: number;
}

function Mascot() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [messageApi, msgHolder] = message.useMessage();
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleClosing, setBubbleClosing] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      setBubbleVisible(true);
      setBubbleClosing(false);
    } else if (bubbleVisible) {
      setBubbleClosing(true);
      const t = setTimeout(() => {
        setBubbleVisible(false);
        setBubbleClosing(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [menuOpen, bubbleVisible]);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 118;
    const h = 100;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    let id = 0;
    let blinkTimer = 0;
    let blinking = false;
    let sparkles: Sparkle[] = [];

    function spawnSparkle() {
      if (sparkles.length > 6) return;
      const a = Math.random() * Math.PI * 2;
      const d = 40 + Math.random() * 19;
      sparkles.push({
        x: 55 + Math.cos(a) * d,
        y: 43 + Math.sin(a) * d,
        r: Math.random() * 1 + 0.4,
        life: 0,
        maxLife: 50 + Math.random() * 60,
      });
    }

    function drawFace() {
      ctx!.beginPath();
      ctx!.arc(55, 43, 37, 0, Math.PI * 2);
      const g = ctx!.createRadialGradient(52, 40, 14, 55, 43, 37);
      g.addColorStop(0, '#fffdf8');
      g.addColorStop(1, '#fce4d6');
      ctx!.fillStyle = g;
      ctx!.fill();
    }

    function drawHair(time: number) {
      ctx!.beginPath();
      ctx!.arc(55, 43, 37, Math.PI, 0);
      ctx!.fillStyle = '#6d28d9';
      ctx!.fill();

      const hg = ctx!.createLinearGradient(55, 6, 55, 43);
      hg.addColorStop(0, '#8b5cf6');
      hg.addColorStop(1, '#7c3aed');
      ctx!.beginPath();
      ctx!.arc(55, 43, 37, Math.PI + 0.3, 2 * Math.PI - 0.3);
      ctx!.fillStyle = hg;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.moveTo(22, 37);
      ctx!.quadraticCurveTo(33, 13, 50, 8);
      ctx!.quadraticCurveTo(66, 5, 75, 10);
      ctx!.quadraticCurveTo(87, 18, 90, 37);
      ctx!.lineTo(85, 28);
      ctx!.quadraticCurveTo(70, 5, 55, 3);
      ctx!.quadraticCurveTo(38, 5, 27, 28);
      ctx!.closePath();
      ctx!.fillStyle = '#7c3aed';
      ctx!.fill();

      ctx!.beginPath();
      ctx!.moveTo(22, 40);
      ctx!.quadraticCurveTo(12, 62, 18, 74);
      ctx!.quadraticCurveTo(22, 68, 24, 60);
      ctx!.closePath();
      ctx!.fillStyle = '#8b5cf6';
      ctx!.fill();

      ctx!.beginPath();
      ctx!.moveTo(88, 40);
      ctx!.quadraticCurveTo(98, 62, 92, 74);
      ctx!.quadraticCurveTo(88, 68, 86, 60);
      ctx!.closePath();
      ctx!.fill();

      ctx!.save();
      ctx!.translate(55, 6);
      ctx!.rotate(Math.sin(time * 0.005) * 0.18);
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.quadraticCurveTo(5, -24, 1, -28);
      ctx!.quadraticCurveTo(0, -26, -2.5, -19);
      ctx!.quadraticCurveTo(-1, -12, 0, 0);
      const ag = ctx!.createLinearGradient(0, -28, 0, 0);
      ag.addColorStop(0, '#a78bfa');
      ag.addColorStop(1, '#7c3aed');
      ctx!.fillStyle = ag;
      ctx!.fill();
      ctx!.restore();
    }

    function drawEyes(bln: boolean, excited: boolean) {
      const y = 41;
      const h = bln ? 1 : excited ? 13 : 12;
      drawEye(40, y, h, excited);
      drawEye(70, y, h, excited);
    }

    function drawEye(cx: number, cy: number, h: number, excited: boolean) {
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, 9, h, 0, 0, Math.PI * 2);
      ctx!.fillStyle = '#1a0a2e';
      ctx!.fill();
      if (h < 3) return;

      const ir = ctx!.createRadialGradient(cx - 1, cy - 3, 1.5, cx, cy, 8);
      ir.addColorStop(0, '#7c3aed');
      ir.addColorStop(0.5, '#4c1d95');
      ir.addColorStop(1, '#1a0a2e');
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, 7.5, h - 0.8, 0, 0, Math.PI * 2);
      ctx!.fillStyle = ir;
      ctx!.fill();

      const sx = cx - 3;
      const sy = cy - 5;
      ctx!.beginPath();
      ctx!.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx!.fillStyle = '#fff';
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(cx + 3.5, cy + 3.5, 1.6, 0, Math.PI * 2);
      ctx!.fillStyle = '#fff';
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(cx + 5.5, cy - 3, 0.8, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(255,255,255,0.8)';
      ctx!.fill();
    }

    function drawEyebrows(bln: boolean) {
      const by = bln ? 28 : 24;
      ctx!.strokeStyle = '#5b3a6e';
      ctx!.lineWidth = 1.6;
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      ctx!.moveTo(32, by - 1);
      ctx!.quadraticCurveTo(40, by - 6, 46, by);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.moveTo(78, by - 1);
      ctx!.quadraticCurveTo(70, by - 6, 64, by);
      ctx!.stroke();
    }

    function drawBlush() {
      for (const [x, y] of [
        [32, 52],
        [78, 52],
      ] as [number, number][]) {
        const g = ctx!.createRadialGradient(x, y, 1, x, y, 8);
        g.addColorStop(0, 'rgba(255, 140, 140, 0.45)');
        g.addColorStop(0.5, 'rgba(255, 160, 160, 0.15)');
        g.addColorStop(1, 'rgba(255, 160, 160, 0)');
        ctx!.beginPath();
        ctx!.arc(x, y, 8, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();
      }
    }

    function drawMouth(open: boolean) {
      ctx!.beginPath();
      if (open) {
        ctx!.arc(55, 58, 5, 0, Math.PI * 2);
        ctx!.fillStyle = '#e88';
        ctx!.fill();
      } else {
        ctx!.moveTo(50, 57);
        ctx!.quadraticCurveTo(53, 60, 55, 57);
        ctx!.quadraticCurveTo(57, 60, 60, 57);
        ctx!.strokeStyle = '#e88';
        ctx!.lineWidth = 1.3;
        ctx!.lineCap = 'round';
        ctx!.stroke();
      }
    }

    function drawSparkles() {
      for (const s of sparkles) {
        const p = s.life / s.maxLife;
        const fade = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(167, 139, 250, ${fade * 0.55})`;
        ctx!.fill();
      }
    }

    function updateSparkles() {
      sparkles = sparkles.filter((s) => {
        s.life++;
        return s.life <= s.maxLife;
      });
    }

    function frame(time: number) {
      ctx!.clearRect(0, 0, w, h);
      if (!blinking && time - blinkTimer > 2500 + Math.random() * 2000) {
        blinking = true;
        blinkTimer = time;
      }
      if (blinking && time - blinkTimer > 100) {
        blinking = false;
        blinkTimer = time;
      }
      if (Math.random() < 0.05) spawnSparkle();
      updateSparkles();

      ctx!.save();
      const cx = 55,
        cy = 48;
      ctx!.translate(cx, cy);
      const breath = 1 + Math.sin(time * 0.002) * 0.03;
      ctx!.scale(breath, breath);
      ctx!.rotate(Math.sin(time * 0.0012) * 0.02);
      ctx!.translate(-cx, -cy);

      drawFace();
      drawSparkles();
      drawHair(time);
      drawBlush();
      drawEyes(blinking, menuOpen);
      drawEyebrows(blinking);
      drawMouth(menuOpen);
      ctx!.restore();
      id = requestAnimationFrame(frame);
    }
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [menuOpen]);
  const handleGitHub = useCallback(() => {
    window.open(
      'https://github.com/TalentedPlayerXXC/TTSDesktop/issues',
      '_blank',
    );
    setMenuOpen(false);
  }, []);

  const handleBug = useCallback(() => {
    setBugOpen(true);
    setMenuOpen(false);
  }, []);

  const handleBugSubmit = useCallback(() => {
    if (!bugTitle.trim()) {
      messageApi.warning('请填写问题标题');
      return;
    }
    messageApi.success('感谢反馈！我们会尽快处理');
    setBugTitle('');
    setBugDesc('');
    setBugOpen(false);
  }, [bugTitle, bugDesc, messageApi]);

  return (
    <div
      ref={wrapperRef}
      className='mascot-container'
    >
      {msgHolder}

      {bubbleVisible && (
        <div
          className={`mascot-bubble ${bubbleClosing ? 'm-bubble-out' : 'm-bubble-in'}`}
        >
          有什么问题需要反馈吗？
          <div className='mascot-bubble-arrow' />
        </div>
      )}

      <div className={`m-wheel-cluster ${menuOpen ? 'open' : ''}`}>
        <div className='m-wheel-item'>
          <button
            onClick={handleGitHub}
            title='GitHub'
            data-label='GitHub'
          >
            <svg
              viewBox='0 0 24 24'
              width='18'
              height='18'
              fill='currentColor'
            >
              <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z' />
            </svg>
          </button>
        </div>
        <div className='m-wheel-item'>
          <button
            onClick={handleBug}
            title='Bug 反馈'
            data-label='反馈'
          >
            🐛
          </button>
        </div>
      </div>

      <canvas
        ref={ref}
        className='mascot-canvas'
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
      />

      <Modal
        title={<span>🐛 问题反馈</span>}
        open={bugOpen}
        onCancel={() => setBugOpen(false)}
        onOk={handleBugSubmit}
        okText='提交'
        cancelText='取消'
        centered
      >
        <div className='bug-modal-content'>
          <div className='bug-modal-field'>问题标题</div>
          <Input
            placeholder='请简要描述问题'
            value={bugTitle}
            onChange={(e) => setBugTitle(e.target.value)}
          />
        </div>
        <div>
          <div className='bug-modal-field'>详细描述</div>
          <Input.TextArea
            className='bug-modal-textarea'
            placeholder='请描述问题的详细信息'
            value={bugDesc}
            onChange={(e) => setBugDesc(e.target.value)}
             autoSize={{ minRows: 5, maxRows: 5 }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Mascot;
