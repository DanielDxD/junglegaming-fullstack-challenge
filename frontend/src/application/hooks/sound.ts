import { useCallback, useEffect, useRef } from "react";

interface SoundOptions {
    loop?: boolean;
    autoPlay?: boolean;
}

export function useSound(path: string, options: SoundOptions = { autoPlay: true, loop: true }) {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio(path);
        audioRef.current.loop = options.loop ?? true;

        if (options?.autoPlay) {
            audioRef.current.play();
        }

        return () => {
            audioRef.current?.pause();
            audioRef.current?.removeEventListener('ended', () => { });
        };
    }, [path, options])

    const play = useCallback(() => {
        audioRef.current?.play();
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const stop = useCallback(() => {
        audioRef.current?.pause();
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    }, []);

    return {
        play,
        pause,
        stop
    }
}