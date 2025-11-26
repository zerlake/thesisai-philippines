'use client';

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Sun, Moon, Palette } from 'lucide-react';

export default function ThemeSettings() {
  const { preferences, updatePreferences, isLoading } = usePersonalization();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(preferences?.theme?.mode || 'auto');
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large' | 'extra-large'>(preferences?.theme?.fontSize || 'normal');
  const [accentColor, setAccentColor] = useState<string>(preferences?.theme?.accentColor || '#3B82F6');
  const [colorScheme, setColorScheme] = useState<'default' | 'blue' | 'purple' | 'green' | 'custom'>(preferences?.theme?.colorScheme || 'default');

  useEffect(() => {
    if (preferences?.theme) {
      setTheme(preferences.theme.mode);
      setFontSize(preferences.theme.fontSize);
      setAccentColor(preferences.theme.accentColor);
      setColorScheme(preferences.theme.colorScheme);
    } else {
      // Set defaults if no theme preferences exist
      setTheme('auto');
      setFontSize('normal');
      setAccentColor('#3B82F6');
      setColorScheme('default');
    }
  }, [preferences]);

  const handleThemeChange = async (value: 'light' | 'dark' | 'auto') => {
    const currentTheme = preferences?.theme || {
      mode: 'auto',
      colorScheme: 'default',
      accentColor: '#3B82F6',
      reducedMotion: false,
      highContrast: false,
      fontSize: 'normal'
    };

    setTheme(value as 'light' | 'dark' | 'auto');
    await updatePreferences({
      theme: {
        ...currentTheme,
        mode: value as 'light' | 'dark' | 'auto'
      }
    });
  };

  const handleFontSizeChange = (value: 'small' | 'normal' | 'large' | 'extra-large') => {
    const currentTheme = preferences?.theme || {
      mode: 'auto',
      colorScheme: 'default',
      accentColor: '#3B82F6',
      reducedMotion: false,
      highContrast: false,
      fontSize: 'normal'
    };

    setFontSize(value);
    updatePreferences({
      theme: {
        ...currentTheme,
        fontSize: value as 'small' | 'normal' | 'large' | 'extra-large'
      }
    });
  };

  const handleColorSchemeChange = (value: 'default' | 'blue' | 'purple' | 'green' | 'custom') => {
    const currentTheme = preferences?.theme || {
      mode: 'auto',
      colorScheme: 'default',
      accentColor: '#3B82F6',
      reducedMotion: false,
      highContrast: false,
      fontSize: 'normal'
    };

    setColorScheme(value);
    updatePreferences({
      theme: {
        ...currentTheme,
        colorScheme: value as 'default' | 'blue' | 'purple' | 'green' | 'custom'
      }
    });
  };

  const handleColorChange = (color: string) => {
    const currentTheme = preferences?.theme || {
      mode: 'auto',
      colorScheme: 'default',
      accentColor: '#3B82F6',
      reducedMotion: false,
      highContrast: false,
      fontSize: 'normal'
    };

    setAccentColor(color);
    updatePreferences({
      theme: {
        ...currentTheme,
        accentColor: color
      }
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Theme Mode */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Appearance Mode
        </h3>
        <RadioGroup value={theme} onValueChange={handleThemeChange}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center cursor-pointer gap-2 flex-1">
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center cursor-pointer gap-2 flex-1">
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="flex items-center cursor-pointer gap-2 flex-1">
                <Palette className="w-4 h-4" />
                <span>Auto</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Font Size */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Font Size
        </h3>
        <Select value={fontSize} onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="normal">Normal (Default)</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="extra-large">Extra Large</SelectItem>
          </SelectContent>
        </Select>
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded">
          <p className="text-slate-700 dark:text-slate-300">
            This is how your text will appear with the selected font size.
          </p>
        </div>
      </Card>

      {/* Color Scheme */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Color Scheme
        </h3>
        <Select value={colorScheme} onValueChange={handleColorSchemeChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="purple">Purple</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
          Choose a predefined color scheme or create a custom one with the accent color picker below.
        </p>
      </Card>

      {/* Accent Color */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Accent Color
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    accentColor === color
                      ? 'border-slate-900 dark:border-white scale-110'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Selected color: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{accentColor}</code>
          </p>
        </div>
      </Card>
    </div>
  );
}
