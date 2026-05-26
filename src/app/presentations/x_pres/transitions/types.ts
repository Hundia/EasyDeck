export interface SceneData {
  id: number;
  video?: string;
  image: string;
  accentColor: string;
  hudLabel: string;
  dataLine?: string;
  panelPosition: string;
  titleEn: string;
}

export interface VideoTransitionProps {
  fromScene: SceneData;
  toScene: SceneData;
  direction: 1 | -1;
  prevVideoRef: React.RefObject<HTMLVideoElement | null>;
  currentVideoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoSwitch: () => void;
  onComplete: () => void;
}
