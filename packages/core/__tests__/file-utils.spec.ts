import test from 'ava';
import { getArrayBufFromBlobs, sliceFile } from '../src/utils'

// 辅助函数：创建一个模拟的 File 对象
function createMockFile(content: string, name: string = 'mock.txt', type: string = 'text/plain'): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

test('sliceFile should split file into chunks of given size', t => {
  const fileContent = 'a'.repeat(3 * 1024 * 1024); // 3 MB
  const file = createMockFile(fileContent);
  const chunkSizeMB = 1;
  const chunks = sliceFile(file, chunkSizeMB);

  t.is(chunks.length, 3);
  t.is(chunks[0].size, 1 * 1024 * 1024);
  t.is(chunks[1].size, 1 * 1024 * 1024);
  t.is(chunks[2].size, 1 * 1024 * 1024);
});

test('sliceFile should handle file smaller than chunk size', t => {
  const fileContent = 'a'.repeat(512 * 1024); // 512 KB
  const file = createMockFile(fileContent);
  const chunkSizeMB = 1;
  const chunks = sliceFile(file, chunkSizeMB);

  t.is(chunks.length, 1);
  t.is(chunks[0].size, 512 * 1024);
});

test('sliceFile should handle file exactly the size of one chunk', t => {
  const fileContent = 'a'.repeat(1 * 1024 * 1024); // 1 MB
  const file = createMockFile(fileContent);
  const chunkSizeMB = 1;
  const chunks = sliceFile(file, chunkSizeMB);

  t.is(chunks.length, 1);
  t.is(chunks[0].size, 1 * 1024 * 1024);
});

test('getArrayBufFromBlobs should convert chunks to ArrayBuffer', async t => {
  const fileContent = 'a'.repeat(3 * 1024 * 1024); // 3 MB
  const file = createMockFile(fileContent);
  const chunks = sliceFile(file, 1);

  const arrayBuffers = await getArrayBufFromBlobs(chunks);

  t.is(arrayBuffers.length, 3);
  arrayBuffers.forEach((buffer, index) => {
    t.is(buffer.byteLength, 1 * 1024 * 1024);
    t.is(new TextDecoder().decode(buffer), 'a'.repeat(1 * 1024 * 1024));
  });
});
