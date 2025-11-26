/**
 * Widget Settings Modal
 * Modal for configuring widget-specific settings with live preview
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import { getWidget, WidgetSettings } from '@/lib/personalization/widget-registry';
import { useDebounce } from '@/lib/performance/event-delegation';
import styles from './styles/widget-settings-modal.module.css';

interface WidgetSettingsModalProps {
  widgetLayoutId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({
  widgetLayoutId,
  isOpen,
  onClose,
}) => {
  const { currentLayout, updateWidgetSettings } = useDashboardStore();

  const widgetLayout = currentLayout.widgets.find((w: any) => w.id === widgetLayoutId);
  if (!widgetLayout) return null;

  const widget = getWidget(widgetLayout.widgetId);
  if (!widget) return null;

  const [settings, setSettings] = useState<WidgetSettings>({
    ...widget.defaultSettings,
    ...widgetLayout.settings,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Debounced preview update
  const debouncedPreview = useDebounce(
    useCallback((newSettings: WidgetSettings) => {
      // Live preview update would happen here
      // For now, just update state
    }, []),
    300
  );

  const handleSettingChange = useCallback(
    (key: string, value: any) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      setHasChanges(true);
      debouncedPreview(newSettings);
    },
    [settings, debouncedPreview]
  );

  const handleSave = useCallback(() => {
    updateWidgetSettings(widgetLayoutId, settings);
    setHasChanges(false);
    onClose();
  }, [settings, widgetLayoutId, updateWidgetSettings, onClose]);

  const handleReset = useCallback(() => {
    setSettings({ ...widget.defaultSettings });
    setHasChanges(true);
  }, [widget]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.icon}>{widget.icon}</span>
            <div>
              <h2>{widget.name} Settings</h2>
              <p className={styles.description}>{widget.description}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Settings form */}
          <div className={styles.settingsForm}>
            {widget.settingsComponent ? (
              <widget.settingsComponent
                settings={settings}
                onSave={(newSettings) => {
                  setSettings(newSettings);
                  setHasChanges(true);
                }}
                onCancel={onClose}
              />
            ) : (
              <DefaultSettingsForm
                widget={widget}
                settings={settings}
                onChange={handleSettingChange}
              />
            )}
          </div>

          {/* Preview */}
          <div className={styles.preview}>
            <h3>Preview</h3>
            <div className={styles.previewContent}>
              <widget.previewComponent settings={settings} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={`${styles.btn} ${styles.secondary}`}
            onClick={handleReset}
            title="Reset to default settings"
          >
            ⟲ Reset to Defaults
          </button>

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.secondary}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Default settings form for widgets without custom settings component
 */
interface DefaultSettingsFormProps {
  widget: any;
  settings: WidgetSettings;
  onChange: (key: string, value: any) => void;
}

const DefaultSettingsForm: React.FC<DefaultSettingsFormProps> = ({
  widget,
  settings,
  onChange,
}) => {
  // Generate form fields based on default settings structure
  const settingKeys = Object.keys(widget.defaultSettings || {});

  if (settingKeys.length === 0) {
    return (
      <div className={styles.emptySettings}>
        <p>No configurable settings for this widget</p>
      </div>
    );
  }

  return (
    <div className={styles.formFields}>
      {settingKeys.map((key) => {
        const value = settings[key] ?? widget.defaultSettings[key];
        const defaultValue = widget.defaultSettings[key];
        const type = typeof defaultValue;

        return (
          <div key={key} className={styles.formGroup}>
            <label htmlFor={key} className={styles.label}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>

            {type === 'boolean' ? (
              <input
                id={key}
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(key, e.target.checked)}
                className={styles.checkbox}
              />
            ) : type === 'number' ? (
              <input
                id={key}
                type="number"
                value={value}
                onChange={(e) => onChange(key, parseInt(e.target.value))}
                className={styles.input}
              />
            ) : Array.isArray(defaultValue) ? (
              <input
                id={key}
                type="text"
                value={Array.isArray(value) ? value.join(', ') : value}
                onChange={(e) =>
                  onChange(
                    key,
                    e.target.value
                      .split(',')
                      .map((v) => v.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Comma-separated values"
                className={styles.input}
              />
            ) : (
              <input
                id={key}
                type="text"
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                className={styles.input}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WidgetSettingsModal;
