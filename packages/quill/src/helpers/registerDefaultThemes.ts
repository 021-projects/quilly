import Quill from '@/main';
import BubbleTheme from '@/themes/bubble';
import SnowTheme from '@/themes/snow';
import TinyTheme from '@/themes/tiny';

export default function registerDefaultThemes() {
  Quill.register(
    {
      'themes/bubble': BubbleTheme,
      'themes/snow': SnowTheme,
      'themes/tiny': TinyTheme,
    },
    true,
  );
}
