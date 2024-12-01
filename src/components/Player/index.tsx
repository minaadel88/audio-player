import { useMediaQuery } from '../../lib/hooks/useMediaQuery';
import DesktopPlayer from './DesktopPlayer';
import MobilePlayer from './MobilePlayer';

export default function Player() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobilePlayer /> : <DesktopPlayer />;
}