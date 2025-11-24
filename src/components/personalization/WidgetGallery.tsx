/**
 * Widget Gallery Component
 * Displays available widgets with search, categories, and drag-to-add
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Widget,
  WidgetCategory,
  getAllWidgets,
  getWidgetsByCategories,
  searchWidgets
} from '@/lib/personalization/widget-registry';
import styles from './styles/widget-gallery.module.css';

interface WidgetGalleryProps {
  onWidgetSelect?: (widget: Widget) => void;
  onDragStart?: (widget: Widget, e: React.DragEvent) => void;
  selectedCategory?: WidgetCategory | 'all';
}

const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  analytics: '📊 Analytics',
  productivity: '✍️ Productivity',
  shortcuts: '⚡ Shortcuts',
  news: '📰 News',
  custom: '⚙️ Custom'
};

const CATEGORY_ICONS: Record<WidgetCategory, string> = {
  analytics: '📊',
  productivity: '✍️',
  shortcuts: '⚡',
  news: '📰',
  custom: '⚙️'
};

export function WidgetGallery({
  onWidgetSelect,
  onDragStart,
  selectedCategory = 'all'
}: WidgetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<WidgetCategory | 'all'>(selectedCategory);
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);

  // Filter and search widgets
  const filteredWidgets = useMemo(() => {
    let results: Widget[] = [];

    if (activeCategory === 'all') {
      results = getAllWidgets();
    } else {
      results = Object.values(getWidgetsByCategories()[activeCategory] || []);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query)
      );
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [activeCategory, searchQuery]);

  // Group widgets by category for display
  const widgetsByCategory = useMemo(() => {
    const grouped: Record<WidgetCategory, Widget[]> = {
      analytics: [],
      productivity: [],
      shortcuts: [],
      news: [],
      custom: []
    };

    filteredWidgets.forEach(widget => {
      grouped[widget.category].push(widget);
    });

    return grouped;
  }, [filteredWidgets]);

  const handleDragStart = (widget: Widget, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'widget',
      widget: {
        id: widget.id,
        name: widget.name
      }
    }));

    if (onDragStart) {
      onDragStart(widget, e);
    }
  };

  return (
    <div className={styles.gallery}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Widget Gallery</h2>
        <p className={styles.subtitle}>Drag widgets to your dashboard to add them</p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search widgets..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search widgets"
        />
        {searchQuery && (
          <button
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        <button
          className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.active : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Widgets ({filteredWidgets.length})
        </button>
        {(Object.keys(CATEGORY_LABELS) as WidgetCategory[]).map(category => {
          const count = widgetsByCategory[category].length;
          return (
            <button
              key={category}
              className={`${styles.categoryTab} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => setActiveCategory(category)}
              title={CATEGORY_LABELS[category]}
            >
              {CATEGORY_ICONS[category]} {count}
            </button>
          );
        })}
      </div>

      {/* Widgets Grid */}
      <div className={styles.widgetsContainer}>
        {filteredWidgets.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🔍</p>
            <p className={styles.emptyMessage}>No widgets found</p>
            <p className={styles.emptySubtext}>Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className={styles.widgetsGrid}>
            {filteredWidgets.map(widget => (
              <div
                key={widget.id}
                className={`${styles.widgetCard} ${hoveredWidget === widget.id ? styles.hovered : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(widget, e)}
                onMouseEnter={() => setHoveredWidget(widget.id)}
                onMouseLeave={() => setHoveredWidget(null)}
                onClick={() => onWidgetSelect?.(widget)}
                role="button"
                tabIndex={0}
                aria-label={`${widget.name}, ${widget.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onWidgetSelect?.(widget);
                  }
                }}
              >
                <div className={styles.cardContent}>
                  <div className={styles.icon}>{widget.icon}</div>
                  <h3 className={styles.widgetName}>{widget.name}</h3>
                  <p className={styles.widgetDescription}>{widget.description}</p>
                  
                  <div className={styles.widgetMeta}>
                    <span className={styles.category}>{CATEGORY_ICONS[widget.category]}</span>
                    <span className={styles.size}>
                      {widget.defaultSize.width}×{widget.defaultSize.height}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className={styles.hoverOverlay}>
                  <div className={styles.dragHint}>
                    <span className={styles.dragIcon}>↗</span>
                    <span className={styles.dragText}>Drag to add</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar - Widget Info */}
      {hoveredWidget && (
        <div className={styles.infoPanel}>
          {(() => {
            const widget = filteredWidgets.find(w => w.id === hoveredWidget);
            if (!widget) return null;

            return (
              <div className={styles.infoPanelContent}>
                <h3 className={styles.infoPanelTitle}>{widget.name}</h3>
                <p className={styles.infoPanelDescription}>{widget.description}</p>
                
                <div className={styles.infoPanelSection}>
                  <h4 className={styles.infoPanelSectionTitle}>Default Size</h4>
                  <p className={styles.infoPanelValue}>
                    {widget.defaultSize.width} cols × {widget.defaultSize.height} rows
                  </p>
                </div>

                {widget.minSize && (
                  <div className={styles.infoPanelSection}>
                    <h4 className={styles.infoPanelSectionTitle}>Size Limits</h4>
                    <p className={styles.infoPanelValue}>
                      Min: {widget.minSize.width}×{widget.minSize.height} | 
                      Max: {widget.maxSize.width}×{widget.maxSize.height}
                    </p>
                  </div>
                )}

                <div className={styles.infoPanelSection}>
                  <h4 className={styles.infoPanelSectionTitle}>Features</h4>
                  <ul className={styles.featuresList}>
                    {widget.resizable && <li>✓ Resizable</li>}
                    {widget.configurable && <li>✓ Configurable</li>}
                    {widget.draggable && <li>✓ Draggable</li>}
                    {widget.removable && <li>✓ Removable</li>}
                  </ul>
                </div>

                <p className={styles.dragHintText}>💡 Drag this widget to your dashboard to add it</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Widget Card Component (can be exported separately)
export function WidgetCard({ widget, onDragStart }: {
  widget: Widget;
  onDragStart?: (widget: Widget, e: React.DragEvent) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${styles.widgetCard} ${isHovered ? styles.hovered : ''}`}
      draggable
      onDragStart={(e) => onDragStart?.(widget, e)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.cardContent}>
        <div className={styles.icon}>{widget.icon}</div>
        <h3 className={styles.widgetName}>{widget.name}</h3>
        <p className={styles.widgetDescription}>{widget.description}</p>
      </div>
    </div>
  );
}

// Category Selector Component
export function CategorySelector({
  selected,
  onChange
}: {
  selected: WidgetCategory | 'all';
  onChange: (category: WidgetCategory | 'all') => void;
}) {
  return (
    <div className={styles.categoryTabs}>
      <button
        className={`${styles.categoryTab} ${selected === 'all' ? styles.active : ''}`}
        onClick={() => onChange('all')}
      >
        All
      </button>
      {(Object.entries(CATEGORY_LABELS) as [WidgetCategory, string][]).map(([key, label]) => (
        <button
          key={key}
          className={`${styles.categoryTab} ${selected === key ? styles.active : ''}`}
          onClick={() => onChange(key)}
          title={label}
        >
          {CATEGORY_ICONS[key]}
        </button>
      ))}
    </div>
  );
}

export default WidgetGallery;
