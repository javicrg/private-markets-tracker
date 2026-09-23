'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Button } from '@/app/ui/shadcn/ui/button';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme: Theme =
      savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : prefersDark
          ? 'dark'
          : 'light';

    root.classList.toggle('dark', nextTheme === 'dark');
    root.style.colorScheme = nextTheme;
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  function updateTheme(nextTheme: Theme) {
    const root = document.documentElement;
    root.classList.toggle('dark', nextTheme === 'dark');
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-center gap-2 md:w-auto"
      >
        <SunIcon className="h-4 w-4" />
        Tema
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full justify-center gap-2 border-border/80 bg-card/80 md:w-auto"
      onClick={() => updateTheme(isDark ? 'light' : 'dark')}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
      {isDark ? 'Modo claro' : 'Modo oscuro'}
    </Button>
  );
}
