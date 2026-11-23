import {Composition} from 'remotion';
import {BAR, Promo} from './Promo';

export const RemotionRoot: React.FC = () => (
  <Composition id="PromoTeen" component={Promo} durationInFrames={BAR + 6 * 2 * BAR + 2 * BAR} fps={30} width={1080} height={1920} />
);
