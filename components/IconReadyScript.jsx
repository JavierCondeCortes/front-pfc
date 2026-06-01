'use client';

import { useEffect } from 'react';

export default function IconReadyScript() {
    useEffect(() => {
        let cancelled = false;
        let attempts = 0;
        let timer = null;

        const isFontReady = () => (
            document.fonts?.check?.('24px "Material Symbols Outlined"') ||
            document.fonts?.check?.('1em "Material Symbols Outlined"')
        );

        const markReadyWhenLoaded = async () => {
            if (cancelled) return;

            try {
                if (document.fonts?.load) {
                    await document.fonts.load('24px "Material Symbols Outlined"');
                }
            } catch {
                // Keep the loader visible and retry below.
            }

            if (isFontReady()) {
                document.documentElement.classList.remove('icons-loading');
                return;
            }

            attempts += 1;
            if (attempts < 40) {
                timer = window.setTimeout(markReadyWhenLoaded, 250);
            }
        };

        markReadyWhenLoaded();

        return () => {
            cancelled = true;
            if (timer) window.clearTimeout(timer);
        };
    }, []);

    return null;
}
