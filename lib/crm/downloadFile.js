/**
 * Saves a Blob to disk. Uses the File System Access API's native "Save As"
 * dialog when the browser supports it (Chromium-based browsers), so the
 * visitor can pick the location and rename the file before it's written.
 * Falls back to a plain anchor-download everywhere else — the browser's own
 * download settings ("Ask where to save each file") still surface a Save As
 * prompt there if the user has that turned on.
 */
export async function downloadBlob(blob, suggestedName, { description = "PDF document", mimeType = "application/pdf", extension = ".pdf" } = {}) {
  if (typeof window !== "undefined" && window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description, accept: { [mimeType]: [extension] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      if (err?.name === "AbortError") return false; // user cancelled the picker
      // Any other failure (older browser quirks, permissions) — fall through to plain download.
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = suggestedName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
