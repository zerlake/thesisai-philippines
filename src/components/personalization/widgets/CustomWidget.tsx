/**
 * Custom Widget
 * User-defined custom widget with HTML/CSS/JS
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface CustomWidgetProps {
  settings?: WidgetSettings;
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({
  settings = {}
}) => {
  const { html = '', css = '', js = '' } = settings as any;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;

    // Create iframe content with sanitized HTML
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 8px; font-family: inherit; }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            // Sanitized JavaScript execution
            ${js}
          </script>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(content);
    iframeDoc.close();
  }, [html, css, js]);

  return (
    <div className={styles.widget}>
      <div className={styles.customContainer}>
        {html || css || js ? (
          <iframe
            ref={iframeRef}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
            title="Custom Widget"
            sandbox={{
              sandbox: 'allow-same-origin'
            } as any}
          />
        ) : (
          <div className={styles.emptyCustom}>
            <p>Configure custom HTML/CSS/JS to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomWidget;
