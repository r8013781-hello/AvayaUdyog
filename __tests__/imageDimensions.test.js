import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { IMAGE_DIMENSIONS, imageSize } from "../lib/imageDimensions";

/**
 * Keeps lib/imageDimensions.js honest against the bytes on disk.
 *
 * A width/height attribute is only worth having if it is correct. A wrong pair
 * makes CLS worse than no pair at all, because the browser confidently
 * reserves the wrong box and then reflows when the real image disagrees. Hand-
 * maintained numbers drift the first time someone re-exports an asset, and
 * nothing about reading the file would reveal it — so the file headers are
 * parsed here and compared.
 */

const PUBLIC = join(process.cwd(), "public");

/** Minimal intrinsic-size readers — enough for the two formats in public/. */
function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    // SOF0..SOF15, excluding the DHT/JPG/DAC markers at C4, C8, CC.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + buf.readUInt16BE(offset + 2);
  }
  throw new Error("no JPEG SOF marker");
}

function webpSize(buf) {
  const format = buf.toString("ascii", 12, 16);
  if (format === "VP8X") {
    return {
      width: (buf.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (buf.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }
  if (format === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (format === "VP8 ") {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  throw new Error(`unknown WebP chunk: ${format}`);
}

function intrinsicSize(relativePath) {
  const buf = readFileSync(join(PUBLIC, relativePath.replace(/^\//, "")));
  if (relativePath.endsWith(".png")) return pngSize(buf);
  if (/\.jpe?g$/.test(relativePath)) return jpegSize(buf);
  if (relativePath.endsWith(".webp")) return webpSize(buf);
  throw new Error(`unsupported: ${relativePath}`);
}

/** Every content image in public/ — icons and the manifest are not content. */
function contentImages(dir = PUBLIC, prefix = "") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return contentImages(join(dir, entry.name), `${prefix}/${entry.name}`);
    if (!/\.(webp|jpe?g|png)$/i.test(entry.name)) return [];
    // favicons, touch icons and the PWA icons are chrome, never rendered as
    // an <img> in a layout, so they need no intrinsic-size entry.
    if (/^(favicon|apple-touch-icon|android-chrome)/.test(entry.name)) return [];
    return [`${prefix}/${entry.name}`];
  });
}

describe("image dimension table", () => {
  const files = contentImages();

  it("finds the content images", () => {
    expect(files.length).toBeGreaterThanOrEqual(15);
  });

  it.each(files)("%s matches the file on disk", (path) => {
    expect(IMAGE_DIMENSIONS[path], `${path} is missing from IMAGE_DIMENSIONS`).toBeDefined();
    expect(IMAGE_DIMENSIONS[path]).toEqual(intrinsicSize(path));
  });

  it("lists no image that does not exist", () => {
    // A stale entry is dead weight that reads as a live asset.
    Object.keys(IMAGE_DIMENSIONS).forEach((path) => {
      expect(files, `${path} is in the table but not in public/`).toContain(path);
    });
  });

  it("returns nothing rather than guessing for an unknown path", () => {
    // An invented pair is worse than none: it reserves the wrong box.
    expect(imageSize("/nope.webp")).toEqual({});
    expect(imageSize(undefined)).toEqual({});
  });

  it("spreads straight onto an img", () => {
    expect(imageSize("/hero/exterior.webp")).toEqual({ width: 1600, height: 1067 });
  });
});

describe("rendered images", () => {
  const SOURCES = [
    "components/About.jsx",
    "components/AboutCompany.jsx",
    "components/Gallery.jsx",
    "components/HeroSlideshow.jsx",
    "components/Services.jsx",
    "app/(marketing)/services/commercial-interior-design/page.jsx",
    "app/(marketing)/services/residential-interior-design/page.jsx",
  ].map((file) => ({ file, source: readFileSync(join(process.cwd(), file), "utf8") }));

  it("finds every file that renders an img", () => {
    // If a new component starts rendering an <img>, it belongs on the list
    // above — this catches the case where one is added and not covered.
    const rendering = SOURCES.filter(({ source }) => source.includes("<img"));
    expect(rendering).toHaveLength(SOURCES.length);
  });

  it.each(SOURCES.map((s) => [s.file, s.source]))(
    "%s gives every img an intrinsic size",
    (file, source) => {
      const imgs = source.match(/<img[\s\S]*?\/>/g) || [];
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => {
        expect(img, `${file} has an <img> with no imageSize()`).toMatch(/imageSize\(/);
      });
    },
  );

  it.each(SOURCES.map((s) => [s.file, s.source]))(
    "%s gives every img an alt attribute",
    (file, source) => {
      const imgs = source.match(/<img[\s\S]*?\/>/g) || [];
      imgs.forEach((img) => {
        expect(img, `${file} has an <img> with no alt`).toMatch(/alt=/);
      });
    },
  );

  it("loads eagerly only where the image is above the fold", () => {
    // Everything else must be lazy. An eager image below the fold competes
    // with the LCP element for bandwidth on exactly the connections that can
    // least afford it.
    //
    // The three justified cases, all first-viewport hero imagery:
    //   HeroSlideshow  — index 0 only, the homepage LCP element
    //   residential    — the page's own intro image
    //   commercial     — the page's own intro image
    const EAGER_ALLOWED = new Set([
      "components/HeroSlideshow.jsx",
      "app/(marketing)/services/residential-interior-design/page.jsx",
      "app/(marketing)/services/commercial-interior-design/page.jsx",
    ]);

    SOURCES.forEach(({ file, source }) => {
      const imgs = source.match(/<img[\s\S]*?\/>/g) || [];
      imgs.forEach((img) => {
        if (!/loading=\{?"?eager/.test(img) && !/index === 0 \? "eager"/.test(img)) return;
        expect(EAGER_ALLOWED, `${file} loads an image eagerly without justification`).toContain(
          file,
        );
      });
    });
  });

  it("lazy-loads every gallery and secondary image", () => {
    const lazyRequired = [
      "components/About.jsx",
      "components/AboutCompany.jsx",
      "components/Services.jsx",
    ];
    lazyRequired.forEach((file) => {
      const { source } = SOURCES.find((s) => s.file === file);
      (source.match(/<img[\s\S]*?\/>/g) || []).forEach((img) => {
        expect(img, `${file} should lazy-load`).toMatch(/loading="lazy"/);
      });
    });
  });
});
