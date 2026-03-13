// ═══════════════════════════════════════════════════
//  eye.js — Eye / face tracking module
// ═══════════════════════════════════════════════════

window.EyeTracker = (() => {
  let stream = null, interval = null, detector = null;
  let noFaceFrames = 0, faceFrames = 0;
  let onLookAway = null, onLookBack = null;
  const vid = document.getElementById('eyeVid');
  const cvs = document.getElementById('eyeCvs');
  const ctx = cvs.getContext('2d');

  async function start(awayCallback, backCallback) {
    onLookAway = awayCallback;
    onLookBack = backCallback;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 160, height: 120 }
      });
      vid.srcObject = stream;
      await vid.play().catch(() => {});
      cvs.width = 80; cvs.height = 60;

      if ('FaceDetector' in window) {
        try { detector = new FaceDetector({ maxDetectedFaces: 1, fastMode: true }); } catch {}
      }

      interval = setInterval(tick, 350);
      return true;
    } catch {
      return false;
    }
  }

  async function tick() {
    if (!stream) return;
    let faceFound;
    try {
      if (detector) {
        const faces = await detector.detect(vid);
        faceFound = faces.length > 0;
      } else {
        ctx.drawImage(vid, 0, 0, 80, 60);
        const d = ctx.getImageData(0, 0, 80, 60).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) sum += (d[i] + d[i+1] + d[i+2]) / 3;
        faceFound = (sum / (d.length / 4)) > 15;
      }
      if (!faceFound) {
        noFaceFrames++; faceFrames = 0;
        if (noFaceFrames >= 3) onLookAway?.();
      } else {
        faceFrames++; noFaceFrames = 0;
        if (faceFrames >= 2) onLookBack?.();
      }
    } catch {}
  }

  function stop() {
    if (interval) { clearInterval(interval); interval = null; }
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    detector = null; noFaceFrames = 0; faceFrames = 0;
  }

  return { start, stop };
})();
