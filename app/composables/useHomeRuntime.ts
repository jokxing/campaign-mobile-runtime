import type { HomeConfig } from '~/types/home';
import { defaultHomeConfig } from '~~/mock/data/home';

export function useHomeRuntime() {
  const homeConfig = useState<HomeConfig>('mobile-home-runtime-config', () => structuredClone(defaultHomeConfig));
  return { homeConfig };
}
