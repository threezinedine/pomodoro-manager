import { useCallback, useRef } from 'react';

export const useAudio = (src?: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(
        src ? new Audio(src) : null,
    );

    const play = useCallback(() => {
        audioRef.current?.play().catch(() => {
            // Audio play can fail silently if autoplay is blocked
        });
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    }, []);

    return { play, pause, stop, setVolume, element: audioRef.current };
};