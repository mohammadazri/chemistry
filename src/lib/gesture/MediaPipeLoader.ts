import type { MediaPipeResults } from './types';

type ResultsCallback = (results: MediaPipeResults) => void;

/**
 * MediaPipeLoader
 *
 * Handles:
 * 1. Dynamic injection of MediaPipe Holistic + Camera scripts from CDN
 * 2. Acquiring webcam access
 * 3. Running the MediaPipe camera loop
 * 4. Routing landmark data to a caller-supplied callback
 *
 * Design rules:
 * - Scripts are injected only once (deduplication via data-mediapipe attribute)
 * - Webcam stream is released fully on destroy()
 * - No React dependency
 */
export class MediaPipeLoader {
    private camera: any = null;
    private holistic: any = null;
    private videoEl: HTMLVideoElement | null = null;
    private onResults: ResultsCallback | null = null;
    private destroyed = false;

    /** @returns the video element that shows the mirrored webcam feed */
    getVideoElement(): HTMLVideoElement | null {
        return this.videoEl;
    }

    /**
     * Initialize MediaPipe and webcam, then start the tracking loop.
     * Returns a Promise that resolves when the camera is running.
     */
    async startTracking(onResults: ResultsCallback): Promise<void> {
        this.onResults = onResults;

        await this.loadScripts();
        this.videoEl = this.createVideoElement();
        await this.initHolistic();
        this.startCamera();
    }

    /** Stop the camera loop. Holistic stays initialized so restartTracking is fast. */
    stop(): void {
        if (this.camera) {
            this.camera.stop();
        }
    }

    /** Resume after stop(). */
    restart(): void {
        if (this.camera && !this.destroyed) {
            this.camera.start();
        }
    }

    /** Full teardown — releases webcam stream and removes the video element. */
    destroy(): void {
        this.destroyed = true;
        this.stop();

        if (this.videoEl) {
            if (this.videoEl.srcObject) {
                (this.videoEl.srcObject as MediaStream)
                    .getTracks()
                    .forEach((t) => t.stop());
                this.videoEl.srcObject = null;
            }
            this.videoEl.remove();
            this.videoEl = null;
        }

        if (this.holistic) {
            this.holistic.close();
            this.holistic = null;
        }

        this.camera = null;
        this.onResults = null;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private loadScripts(): Promise<void> {
        const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe';
        const scripts = [
            `${CDN}/holistic/holistic.js`,
            `${CDN}/camera_utils/camera_utils.js`,
        ];

        return new Promise((resolve, reject) => {
            let loaded = 0;
            scripts.forEach((src) => {
                // Deduplicate — never inject the same script twice
                if (document.querySelector(`script[data-mediapipe="${src}"]`)) {
                    loaded++;
                    if (loaded === scripts.length) resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = src;
                script.setAttribute('data-mediapipe', src);
                script.crossOrigin = 'anonymous';
                script.onload = () => {
                    loaded++;
                    if (loaded === scripts.length) resolve();
                };
                script.onerror = () =>
                    reject(new Error(`Failed to load MediaPipe script: ${src}`));
                document.head.appendChild(script);
            });

            // All already loaded
            if (loaded === scripts.length) resolve();
        });
    }

    private createVideoElement(): HTMLVideoElement {
        const video = document.createElement('video');
        video.style.display = 'none';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        document.body.appendChild(video);
        return video;
    }

    private async initHolistic(): Promise<void> {
        const win = window as any;

        if (!win.Holistic) {
            throw new Error(
                '[MediaPipeLoader] window.Holistic not found after script load. CDN may be unavailable.'
            );
        }

        this.holistic = new win.Holistic({
            locateFile: (file: string) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });

        this.holistic.setOptions({
            modelComplexity: 1,       // 0=lite, 1=full — good balance
            smoothLandmarks: true,
            enableSegmentation: false, // not needed, save perf
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5,
        });

        this.holistic.onResults((results: MediaPipeResults) => {
            if (!this.destroyed && this.onResults) {
                this.onResults(results);
            }
        });

        await this.holistic.initialize();
    }

    private startCamera(): void {
        const win = window as any;
        if (!win.Camera || !this.videoEl || !this.holistic) return;

        this.camera = new win.Camera(this.videoEl, {
            onFrame: async () => {
                if (!this.destroyed && this.holistic && this.videoEl) {
                    await this.holistic.send({ image: this.videoEl });
                }
            },
            width: 640,
            height: 480,
            facingMode: 'user',
        });

        this.camera.start();
    }
}
