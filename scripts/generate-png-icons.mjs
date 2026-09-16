import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const chunkType = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([chunkType, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, chunkType, data, crc]);
}

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  // Raw pixels: each row starts with filter byte 0, followed by width * 4 bytes
  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(rowLen * height);

  const cx = width / 2;
  const cy = height / 2;
  const shieldWidth = width * 0.72;
  const shieldHeight = height * 0.78;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base background: Dark Slate
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Distance from center
      const dx = Math.abs(x - cx);

      // Shield region check
      const halfW = shieldWidth / 2;
      const isTop = y >= (cy - shieldHeight * 0.45) && y < cy;
      const isBottom = y >= cy && y <= (cy + shieldHeight * 0.48);

      let inShield = false;
      if (isTop && dx <= halfW) {
        inShield = true;
      } else if (isBottom) {
        const bottomProgress = (y - cy) / (shieldHeight * 0.48);
        const curHalfW = halfW * (1 - Math.pow(bottomProgress, 1.8));
        if (dx <= curHalfW) inShield = true;
      }

      if (inShield) {
        // Forest green gradient
        const gradT = y / height;
        r = Math.round(20 + 4 * gradT);
        g = Math.round(83 + 22 * (1 - gradT));
        b = Math.round(45 + 10 * gradT);

        // Gold border
        const isBorder = (isTop && Math.abs(dx - halfW) <= width * 0.02) ||
                         (isBottom && dx >= halfW * (1 - Math.pow((y - cy)/(shieldHeight*0.48), 1.8)) - width*0.025);
        if (isBorder) {
          r = 234;
          g = 179;
          b = 8;
        }

        // Tree Crown (center circular cluster)
        const dTree = Math.sqrt((x - cx)*(x - cx) + (y - (cy - height*0.12))*(y - (cy - height*0.12)));
        if (dTree < width * 0.18) {
          r = 34;
          g = 197;
          b = 94;
        }

        // Scales of justice beam (horizontal gold line)
        if (Math.abs(y - (cy + height * 0.02)) <= Math.max(1, height * 0.015) && dx <= width * 0.22) {
          r = 254;
          g = 240;
          b = 138;
        }

        // Scales center pillar (vertical gold line)
        if (dx <= Math.max(1, width * 0.015) && y >= cy - height*0.08 && y <= cy + height*0.22) {
          r = 254;
          g = 240;
          b = 138;
        }

        // Left & Right scale bowls
        const dLeftBowl = Math.sqrt((x - (cx - width*0.18))*(x - (cx - width*0.18)) + (y - (cy + height*0.12))*(y - (cy + height*0.12)));
        const dRightBowl = Math.sqrt((x - (cx + width*0.18))*(x - (cx + width*0.18)) + (y - (cy + height*0.12))*(y - (cy + height*0.12)));
        if (dLeftBowl <= width * 0.05 || dRightBowl <= width * 0.05) {
          r = 234;
          g = 179;
          b = 8;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = writeChunk('IDAT', deflated);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180));

console.log('Successfully generated PWA and Apple Touch PNG icons in /public');
