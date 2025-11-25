'use client';

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Eye, Zap, Type, Keyboard, AudioWaveform, Focus } from 'lucide-react';
import { AccessibilityPreferences } from '@/lib/personalization/types';

// Default values for accessibility preferences
const getDefaultAccessibilityPreferences = (): AccessibilityPreferences => ({
  screenReaderEnabled: false,
  keyboardNavigationOnly: false,
  reducedAnimations: false,
  highContrast: false,
  fontSize: 100, // percentage
  lineHeight: 1.5, // multiplier
  letterSpacing: 0, // pixels
  dyslexiaFriendlyFont: false,
  focusIndicatorSize: 'normal',
  captions: false,
  textToSpeech: false,
});

export default function AccessibilitySettings() {
  const { preferences, updatePreferences, isLoading } = usePersonalization();
  const [settings, setSettings] = useState<AccessibilityPreferences>(preferences?.accessibility || getDefaultAccessibilityPreferences());

  useEffect(() => {
    if (preferences?.accessibility) {
      setSettings(preferences.accessibility);
    } else {
      setSettings(getDefaultAccessibilityPreferences());
    }
  }, [preferences]);

  const handleChange = async (key: string, value: any) => {
    // Get current accessibility preferences or use defaults
    const currentAccessibility = preferences?.accessibility || getDefaultAccessibilityPreferences();

    let updated: AccessibilityPreferences;
    if (key === 'largerText') {
      // Map largerText to fontSize: default is 100, larger is 120
      updated = { ...currentAccessibility, fontSize: value ? 120 : 100 };
    } else if (key === 'reduceMotion') {
      // Map reduceMotion to reducedAnimations
      updated = { ...currentAccessibility, reducedAnimations: value };
    } else if (key === 'keyboardNavigation') {
      // Map keyboardNavigation to keyboardNavigationOnly
      updated = { ...currentAccessibility, keyboardNavigationOnly: value };
    } else if (key === 'focusIndicators') {
      // Map focusIndicators to focusIndicatorSize ('normal' if false, 'large' if true)
      updated = {
        ...currentAccessibility,
        focusIndicatorSize: value ? 'large' : 'normal' as const
      };
    } else if (key === 'screenReaderOptimized') {
      // Map screenReaderOptimized to screenReaderEnabled
      updated = { ...currentAccessibility, screenReaderEnabled: value };
    } else {
      updated = { ...currentAccessibility, [key]: value };
    }

    setSettings(updated);
    await updatePreferences({
      accessibility: updated
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Vision */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Vision
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                High Contrast Mode
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Increases contrast for better readability
              </p>
            </div>
            <Switch
              checked={settings.highContrast ?? false}
              onCheckedChange={(value) => handleChange('highContrast', value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                Larger Text
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Increases default font size throughout the app
              </p>
            </div>
            <Switch
              checked={settings.fontSize > 100}
              onCheckedChange={(value) => handleChange('largerText', value)}
            />
          </div>
        </div>
      </Card>

      {/* Motion */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Motion
        </h3>

        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <div>
            <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
              Reduce Motion
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Minimizes animations and transitions
            </p>
          </div>
          <Switch
            checked={settings.reducedAnimations ?? false}
            onCheckedChange={(value) => handleChange('reduceMotion', value)}
          />
        </div>
      </Card>

      {/* Input & Navigation */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Input & Navigation
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                Keyboard Navigation
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Navigate using keyboard alone
              </p>
            </div>
            <Switch
              checked={settings.keyboardNavigationOnly ?? false}
              onCheckedChange={(value) => handleChange('keyboardNavigation', value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                Enhanced Focus Indicators
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                More visible focus outlines for keyboard users
              </p>
            </div>
            <Switch
              checked={settings.focusIndicatorSize === 'large'}
              onCheckedChange={(value) => handleChange('focusIndicators', value)}
            />
          </div>
        </div>
      </Card>

      {/* Screen Reader */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AudioWaveform className="w-5 h-5" />
          Screen Reader
        </h3>

        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <div>
            <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
              Optimize for Screen Reader
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Improves compatibility with screen readers
            </p>
          </div>
          <Switch
            checked={settings.screenReaderEnabled ?? false}
            onCheckedChange={(value) => handleChange('screenReaderOptimized', value)}
          />
        </div>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Keyboard Shortcuts
        </h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-700/30 rounded">
            <div>
              <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs font-mono">
                Alt + S
              </code>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Save</p>
            </div>
            <div>
              <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs font-mono">
                Alt + K
              </code>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Command Palette</p>
            </div>
            <div>
              <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs font-mono">
                Alt + /
              </code>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Help</p>
            </div>
            <div>
              <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs font-mono">
                Tab
              </code>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Navigate</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Accessibility Info */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-300">
          ♿ <strong>Accessibility:</strong> These settings help make the application more accessible. If you need additional accessibility features, please contact support.
        </p>
      </div>

      {/* Accessibility Resources */}
      <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Learn More</h4>
        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li>• <a href="#" className="text-blue-600 hover:underline">Accessibility Guide</a></li>
          <li>• <a href="#" className="text-blue-600 hover:underline">Keyboard Shortcuts Reference</a></li>
          <li>• <a href="#" className="text-blue-600 hover:underline">Accessibility Statement</a></li>
        </ul>
      </div>
    </div>
  );
}
