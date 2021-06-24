export default async function SequenceExporter() {
  let dir;
  try {
    dir = await window.showDirectoryPicker();
  } catch (err) {
    console.error(err);
    if (err.code === 20 || err.name === "AbortError") {
      // don't warn on abort
      return null;
    } else {
      throw err;
    }
  }

  return async (canvas, frameIndex, totalFrames) => {
    const url = canvas.toDataURL("image/png");
    const extension = ".png";
    const prefix = "";
    const type = "image/png";
    const frameDigitCount = String(totalFrames).length;
    const curFrameName = String(frameIndex).padStart(frameDigitCount, "0");
    const curFrameFile = `${prefix}${curFrameName}${extension}`;

    const fh = await dir.getFileHandle(curFrameFile, { create: true });
    const fw = await fh.createWritable();

    let blob = createBlobFromDataURL(url);
    await fw.write(blob);
    await fw.close();
  };
}

function createBlobFromDataURL(dataURL) {
  const splitIndex = dataURL.indexOf(",");
  if (splitIndex === -1) {
    return new Blob();
  }
  const base64 = dataURL.slice(splitIndex + 1);
  const byteString = atob(base64);
  const type = dataURL.slice(0, splitIndex);
  const mimeMatch = /data:([^;]+)/.exec(type);
  const mime = (mimeMatch ? mimeMatch[1] : "") || undefined;
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}
