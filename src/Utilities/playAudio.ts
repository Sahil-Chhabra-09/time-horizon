export const playAudio = async (
  url: string,
  urgency: number,
  maxDuration = 8
) => {
  try {
    const audioCtx = new AudioContext();
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to load audio from ${url}: ${response.statusText}`);
      return;
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Clamp urgency between 0 and 10 for safety
    const clampedUrgency = Math.max(0, Math.min(urgency, 10));

    // Map urgency (0–10) to playback duration (0–maxDuration)
    // For example, urgency 10 → maxDuration, urgency 5 → ~half of maxDuration
    const playDuration = (clampedUrgency / 10) * maxDuration;

    // Create the source and gain node
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    // Connect the nodes
    source.connect(gainNode).connect(audioCtx.destination);

    // Compute fade-in/out durations (10% of total play time each)
    const fadeTime = Math.min(playDuration * 0.1, 0.5); // cap fades at 0.5s each
    const now = audioCtx.currentTime;

    // Fade in
    gainNode.gain.linearRampToValueAtTime(1, now + fadeTime);

    // Sustain full volume
    const sustainEnd = now + playDuration - fadeTime;

    // Fade out
    gainNode.gain.setValueAtTime(1, sustainEnd);
    gainNode.gain.linearRampToValueAtTime(0, sustainEnd + fadeTime);

    // Start playback
    source.start(now);
    // Stop after playDuration + fade-out (so fade completes)
    source.stop(sustainEnd + fadeTime);

    // Clean up once finished
    source.onended = () => {
      audioCtx.close();
    };
  } catch (error) {
    console.warn(`Error playing audio from ${url}:`, error);
  }
};
