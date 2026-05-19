const { execSync } = require('child_process');

const deps = [
  'framer-motion',
  'gsap',
  'lucide-react',
  'clsx',
  'tailwind-merge',
  'class-variance-authority',
  'lucide-react',
  'next-themes',
  'sonner',
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  '@radix-ui/react-tooltip',
  'embla-carousel-react',
  'cmdk',
  'date-fns',
  'input-otp',
  'react-day-picker',
  'react-hook-form',
  'react-resizable-panels',
  'vaul',
  'zod',
  '@hookform/resolvers'
];

try {
  console.log('Installing landing page dependencies in walletly...');
  execSync(`npm install ${deps.join(' ')}`, { stdio: 'inherit' });
  console.log('Installation successful!');
} catch (error) {
  console.error('Installation failed:', error.message);
}
