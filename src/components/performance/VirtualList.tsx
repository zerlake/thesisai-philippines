/**
 * Virtual List Component
 * Efficiently render large lists with smooth scrolling
 * Only renders visible items to the DOM
 */

'use client';

import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import styles from './styles/virtual-list.module.css';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  overscan?: number; // Extra items to render outside viewport
  width?: number | string;
  height?: number | string;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  estimatedItemSize?: number;
  getKey?: (item: T, index: number) => string | number;
}

interface ItemMetadata {
  offset: number;
  size: number;
}

/**
 * VirtualList component with dynamic sizing support
 */
export const VirtualList = React.forwardRef<
  HTMLDivElement,
  VirtualListProps<any>
>(({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  width = '100%',
  height = 400,
  className = '',
  onScroll,
  estimatedItemSize = 0,
  getKey = (_, i) => i
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(0);

  // Use fixed or dynamic item heights
  const isFixedHeight = typeof itemHeight === 'number';

  // Calculate item metadata
  const itemMetadata = useMemo(() => {
    const metadata: ItemMetadata[] = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      const size = isFixedHeight ? itemHeight : (itemHeight as (item: any, index: number) => number)(items[i], i);
      metadata.push({ offset, size });
      offset += size;
    }

    return metadata;
  }, [items, itemHeight, isFixedHeight]);

  // Get total height
  const totalHeight = useMemo(() => {
    if (itemMetadata.length === 0) return 0;
    const last = itemMetadata[itemMetadata.length - 1];
    return last.offset + last.size;
  }, [itemMetadata]);

  // Find visible range
  const getVisibleRange = useCallback(() => {
    if (itemMetadata.length === 0) return { start: 0, end: 0 };

    let startIndex = 0;
    let endIndex = itemMetadata.length - 1;

    // Binary search for start
    let low = 0;
    let high = itemMetadata.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (itemMetadata[mid].offset < scrollTop) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    startIndex = Math.max(0, low - 1);

    // Find end
    const visibleBottom = scrollTop + containerHeight;
    for (let i = startIndex; i < itemMetadata.length; i++) {
      if (itemMetadata[i].offset >= visibleBottom) {
        endIndex = i;
        break;
      }
    }

    // Add overscan
    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(itemMetadata.length - 1, endIndex + overscan)
    };
  }, [itemMetadata, scrollTop, containerHeight, overscan]);

  const { start, end } = getVisibleRange();
  const visibleItems = items.slice(start, end + 1);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    onScroll?.(target.scrollTop);
  }, [onScroll]);

  // Update container height on resize
  useEffect(() => {
    if (!scrollerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      setContainerHeight(scrollerRef.current?.clientHeight || 0);
    });

    resizeObserver.observe(scrollerRef.current);

    // Initial height
    setContainerHeight(scrollerRef.current.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  // Merge refs
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const offsetY = itemMetadata[start]?.offset || 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{
        width,
        height,
        overflow: 'hidden'
      }}
    >
      <div
        ref={mergedRef}
        className={styles.scroller}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflow: 'auto',
          contain: 'strict'
        }}
      >
        {/* Top spacer */}
        <div
          style={{
            height: offsetY,
            pointerEvents: 'none'
          }}
        />

        {/* Visible items */}
        <div className={styles.content}>
          {visibleItems.map((item, i) => {
            const index = start + i;
            const meta = itemMetadata[index];
            const itemStyle: React.CSSProperties = {
              position: 'absolute',
              top: meta.offset - offsetY,
              left: 0,
              right: 0,
              height: meta.size,
              contain: 'layout'
            };

            return (
              <div key={getKey(item, index)} style={itemStyle}>
                {renderItem(item, index, itemStyle)}
              </div>
            );
          })}
        </div>

        {/* Bottom spacer */}
        <div
          style={{
            height: Math.max(0, totalHeight - offsetY - (containerHeight > 0 ? containerHeight - offsetY : 0)),
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

/**
 * Simpler fixed-height version for better performance
 */
export const FixedSizeList = React.forwardRef<
  HTMLDivElement,
  Omit<VirtualListProps<any>, 'itemHeight'> & {
    itemHeight: number;
  }
>(({ itemHeight, ...props }, ref) => (
  <VirtualList
    ref={ref}
    itemHeight={itemHeight}
    {...props}
  />
));

FixedSizeList.displayName = 'FixedSizeList';

/**
 * Grid layout with virtual scrolling
 */
export const VirtualGrid = React.forwardRef<
  HTMLDivElement,
  VirtualListProps<any> & {
    columnCount: number;
  }
>(({
  items,
  itemHeight,
  renderItem,
  columnCount,
  ...props
}, ref) => {
  const itemsPerRow = columnCount;
  const rows = Math.ceil(items.length / itemsPerRow);

  return (
    <VirtualList
      ref={ref}
      items={items}
      itemHeight={typeof itemHeight === 'number' ? itemHeight * 1.2 : itemHeight}
      renderItem={(item, index, style) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;

        return (
          <div
            style={{
              ...style,
              display: 'flex',
              justifyContent: 'space-around',
              padding: '8px'
            }}
          >
            {renderItem(item, index, {
              width: `${100 / columnCount}%`,
              height: typeof itemHeight === 'number' ? itemHeight : undefined
            })}
          </div>
        );
      }}
      {...props}
    />
  );
});

VirtualGrid.displayName = 'VirtualGrid';

/**
 * Hook for virtual list state management
 */
export function useVirtualList<T>(
  items: T[],
  options: {
    itemHeight: number | ((item: T, index: number) => number);
    containerHeight: number;
    overscan?: number;
  }
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { itemHeight, containerHeight, overscan = 3 } = options;
  const isFixedHeight = typeof itemHeight === 'number';

  // Calculate visible range
  const visibleRange = React.useMemo(() => {
    let offset = 0;
    let startIndex = 0;
    let endIndex = items.length - 1;

    for (let i = 0; i < items.length; i++) {
      const size = isFixedHeight ? itemHeight : (itemHeight as Function)(items[i], i);
      
      if (offset <= scrollTop && scrollTop < offset + size) {
        startIndex = i;
      }
      
      if (offset + size > scrollTop + containerHeight) {
        endIndex = i;
        break;
      }
      
      offset += size;
    }

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
      offset: scrollTop
    };
  }, [items, itemHeight, isFixedHeight, scrollTop, containerHeight, overscan]);

  return {
    containerRef,
    scrollTop,
    setScrollTop,
    visibleRange,
    visibleItems: items.slice(visibleRange.start, visibleRange.end + 1),
    visibleIndices: {
      start: visibleRange.start,
      end: visibleRange.end
    }
  };
}

export default VirtualList;
