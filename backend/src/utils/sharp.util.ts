import * as sharp from 'sharp';

export async function hasSignature(signatureUrl: string): Promise<boolean> {
  const { data, info } = await sharp(signatureUrl)
    .greyscale()
    .threshold(240)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const inkPixels = data.filter((v) => v < 250).length;
  const totalPixels = info.width * info.height;
  return inkPixels / totalPixels > 0.01;
}
