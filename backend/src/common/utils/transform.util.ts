import { pipeline } from '@xenova/transformers';

export async function textToVector(text: string) {
  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
  );
  const output = await extractor(text);
  const vector = new Array(output.dims[2]).fill(0);
  for (let i = 0; i < output.dims[1]; ++i) {
    for (let j = 0; j < output.dims[2]; ++j) {
      vector[j] += output.data[j + i * output.dims[2]];
    }
  }
  for (let i = 0; i < output.dims[2]; ++i) {
    vector[i] /= output.dims[1];
  }
  return vector;
}
