import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, Easing, Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import './fonts';

export const BEAT = 12; // кадров на долю: 150 BPM при 30 fps
export const BAR = 4 * BEAT;
const YEL = '#FFD60A';
const INK = '#080A0E';

const pulse = (frame: number) => 1 + 0.025 * Math.exp(-((frame % BEAT) / BEAT) * 9);

const Background: React.FC = () => (
  <AbsoluteFill
    style={{background: 'radial-gradient(ellipse 60% 45% at 50% 62%, #0B5058 0%, #07090C 70%)'}}
  />
);

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4], [0.55, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: 'white', opacity: o}} />;
};

/** Строка, «выстреливающая» с увеличением. hl — чёрным по жёлтой плашке. */
const PopLine: React.FC<{text: string; delay: number; hl?: boolean; size: number; font?: string}> = ({text, delay, hl, size, font = 'Unbounded'}) => {
  const frame = useCurrentFrame() - delay;
  if (frame < 0) return <div style={{height: size * 1.35}} />;
  const s = interpolate(frame, [0, 5], [1.25, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const o = interpolate(frame, [0, 2], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', justifyContent: 'center', transform: `scale(${s})`, opacity: o}}>
      <span
        style={{
          fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, letterSpacing: -1,
          color: hl ? INK : 'white', background: hl ? YEL : 'transparent',
          padding: hl ? '10px 30px 14px' : 0, borderRadius: 14, whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );
};

type Tap = {at: number; x: number; y: number};

const Ripples: React.FC<{taps: Tap[]}> = ({taps}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {taps.map((t, i) => {
        const k = (frame - t.at) / 14;
        if (k < 0 || k > 1) return null;
        const r = 24 + 70 * Easing.out(Easing.cubic)(k);
        return (
          <div key={i} style={{position: 'absolute', left: `${t.x * 100}%`, top: `${t.y * 100}%`}}>
            <div style={{position: 'absolute', width: r * 2, height: r * 2, left: -r, top: -r, borderRadius: '50%', border: `9px solid ${YEL}`, opacity: 1 - k}} />
            <div style={{position: 'absolute', width: 44, height: 44, left: -22, top: -22, borderRadius: '50%', background: 'white', opacity: 0.7 * (1 - k)}} />
          </div>
        );
      })}
    </>
  );
};

/** Запись экрана в рамке телефона: срезан статус-бар, удар-зум на старте и пульс на каждую долю. */
type Clip = {src: string; trim: number; rate: number; srcW: number; srcH: number; cropTop: number; taps: Tap[]};

const Phone: React.FC<Clip> = ({src, trim, rate, srcW, srcH, cropTop, taps}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const PH = 1360;
  const scale = PH / (srcH - cropTop);
  const pw = srcW * scale;
  const punch = interpolate(frame, [0, 7], [1.1, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div
      style={{
        position: 'absolute', left: (1080 - pw) / 2, top: 470, width: pw, height: PH, borderRadius: 50, overflow: 'hidden',
        transform: `scale(${punch * pulse(frame)})`, boxShadow: '0 40px 90px rgba(0,0,0,.7)', background: 'black',
      }}
    >
      <Video src={staticFile(src)} trimBefore={Math.round(trim * fps)} playbackRate={rate} muted style={{position: 'absolute', width: pw, height: srcH * scale, top: -cropTop * scale}} />
      <Ripples taps={taps} />
    </div>
  );
};

export const Shot: React.FC<Clip & {title: string; highlight: string}> = ({title, highlight, ...clip}) => (
  <AbsoluteFill>
    <Background />
    <Phone {...clip} />
    <div style={{position: 'absolute', top: 100, width: '100%', display: 'grid', gap: 22}}>
      <PopLine text={title} delay={0} size={100} />
      <PopLine text={highlight} delay={BEAT / 2} size={86} hl />
    </div>
    <Flash />
  </AbsoluteFill>
);

const TextCard: React.FC<{lines: {text: string; size: number; hl?: boolean; font?: string}[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{justifyContent: 'center', transform: `scale(${1 + (pulse(frame) - 1) * 2})`}}>
        <div style={{display: 'grid', gap: 28}}>
          {lines.map((l, i) => <PopLine key={i} text={l.text} size={l.size} hl={l.hl} font={l.font} delay={(i * BEAT) / 2} />)}
        </div>
      </AbsoluteFill>
      <Flash />
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries name="Сцены">
        <TransitionSeries.Sequence name="Хук" durationInFrames={BAR}>
          <TextCard lines={[{text: 'ХВАТИТ', size: 120}, {text: 'ЗУБРИТЬ', size: 104, hl: true}, {text: 'АНГЛИЙСКИЙ', size: 60, font: 'Onest'}]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Тест уровня" durationInFrames={2 * BAR}>
          <Shot title="УРОВЕНЬ" highlight="ЗА 1 МИНУТУ" src="v1.mp4" trim={12.4} rate={1.5} srcW={592} srcH={1280} cropTop={80}
            taps={[{at: 56, x: 0.5, y: 0.36}, {at: 73, x: 0.5, y: 0.92}]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Ответы" durationInFrames={2 * BAR}>
          <Shot title="БЕЗ" highlight="ЗУБРЁЖКИ" src="v1.mp4" trim={30.8} rate={1.0625} srcW={592} srcH={1280} cropTop={80}
            taps={[{at: 15, x: 0.5, y: 0.355}, {at: 26, x: 0.5, y: 0.88}]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Новые слова" durationInFrames={2 * BAR}>
          <Shot title="СЛОВА С" highlight="ОЗВУЧКОЙ" src="v1.mp4" trim={53} rate={1.625} srcW={592} srcH={1280} cropTop={80}
            taps={[{at: 53, x: 0.48, y: 0.66}]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Пары" durationInFrames={2 * BAR}>
          <Shot title="ТРЕНИРУЙ" highlight="РЕАКЦИЮ" src="v1.mp4" trim={96} rate={1.875} srcW={592} srcH={1280} cropTop={80}
            taps={[{at: 40, x: 0.25, y: 0.45}, {at: 58, x: 0.75, y: 0.45}]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Карта" durationInFrames={2 * BAR}>
          <Shot title="ОТКРЫВАЙ" highlight="НОВЫЕ МИРЫ" src="v1.mp4" trim={107} rate={1.9375} srcW={592} srcH={1280} cropTop={80} taps={[]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Ачивки" durationInFrames={2 * BAR}>
          <Shot title="СОБИРАЙ" highlight="АЧИВКИ" src="v2.mp4" trim={4} rate={1.25} srcW={576} srcH={1246} cropTop={76} taps={[]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Финал" durationInFrames={2 * BAR}>
          <TextCard lines={[{text: 'ЗАЛЕТАЙ', size: 120}, {text: '@finderdsfg3bot', size: 70, hl: true}, {text: 'бесплатно в Telegram', size: 56, font: 'Onest'}]} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Html5Audio src={staticFile('beat.m4a')} />
    </AbsoluteFill>
  );
};
