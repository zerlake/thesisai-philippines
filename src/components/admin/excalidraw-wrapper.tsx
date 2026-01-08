"use client";

import { useEffect, useState } from "react";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";

interface ExcalidrawWrapperProps {
  onChange?: (api: any) => void;
  initialData?: any;
}

export default function ExcalidrawWrapper({ onChange, initialData }: ExcalidrawWrapperProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    // Notify parent when API is ready
    if (excalidrawAPI && onChange) {
      // Check if the API is actually ready to accept operations
      const checkReady = () => {
        try {
          // Try to get scene elements to verify the API is fully functional
          if (excalidrawAPI.getSceneElements) {
            onChange(excalidrawAPI);
          } else {
            // If not ready, try again after a short delay
            setTimeout(checkReady, 100);
          }
        } catch (error) {
          // If there's an error, try again
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    }
  }, [excalidrawAPI, onChange]);

  return (
    <div style={{ height: "700px", width: "100%" }}>
      <Excalidraw
        ref={(api: any) => {
          if (api) {
            setExcalidrawAPI(api);
          }
        }}
        initialData={initialData}
        viewModeEnabled={false}
        zenModeEnabled={false}
        gridModeEnabled={true}
        theme="light"
      >
        <MainMenu>
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveToActiveFile />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}
