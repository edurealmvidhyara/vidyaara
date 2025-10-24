import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { FALLBACK_MP4_URL } from "./constants";
const VideoSection = ({
  playerRef,
  url,
  playing,
  volume,
  onProgress,
  onEnded,
  onError,
  onPlay,
  style,
  envKey = "36mrodnubvtrefm5q27tgktlm",
}) => {
  const localRef = useRef(null);

  // Expose video ref outward
  useEffect(() => {
    if (playerRef && localRef.current) {
      playerRef.current = localRef.current;
    }
  }, [playerRef, localRef.current]);

  // Wire basic events
  useEffect(() => {
    const video = localRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!onProgress) return;
      const played = video.duration ? video.currentTime / video.duration : 0;
      onProgress({ played, playedSeconds: video.currentTime });
    };

    const handlePlay = () => onPlay && onPlay();
    const handleEnded = () => onEnded && onEnded();
    const handleError = () => onError && onError(new Error("video error"));

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [onProgress, onPlay, onEnded, onError]);

  // Set volume and play/pause reactively
  useEffect(() => {
    const video = localRef.current;
    if (!video) return;
    if (typeof volume === "number") video.volume = volume;
    if (playing) {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [playing, volume]);

  // mux-embed monitoring (dynamic import to avoid hard dependency)
  useEffect(() => {
    const video = localRef.current;
    if (!video) return;
    let mux;
    let monitored = false;
    const init = async () => {
      try {
        const mod = await import("mux-embed");
        mux = mod.default || mod;
        mux.monitor(video, {
          debug: true,
          data: {
            env_key: envKey,
            player_name: "Main Player",
            player_init_time: Date.now(),
          },
        });
        monitored = true;
      } catch (_) {
        // ignore if mux-embed is not available
      }
    };
    init();
    return () => {
      // no explicit unmonitor API in mux-embed; GC will clean up
      monitored = false;
    };
  }, [envKey, url]);

  return (
    <ReactPlayer
      ref={localRef}
      src={url}
      controls
      playsInline
      style={{ ...style, width: "100%", height: "100%" }}
      width="100%"
      height="100%"
    />
  );
};

export default VideoSection;
