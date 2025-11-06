// next.config.mjs
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Получаем эквивалент __dirname для ESM-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... существующие настройки
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['better-sqlite3', 'sqlite3'], 

  // ✅ ИСПРАВЛЕНИЕ: Явное разрешение алиасов через Webpack с использованием ESM-синтаксиса
  // Мы используем импортированные функции 'resolve' и '__dirname'
  webpack: (config, { isServer }) => {
    // Устанавливаем алиас '@' на корень проекта
    config.resolve.alias['@'] = resolve(__dirname, '.');

    return config;
  },
};

export default nextConfig;
