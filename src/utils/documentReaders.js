const OCR_LANGUAGE = 'eng';
const OCR_CORE_PATH = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@6/tesseract-core-simd.wasm.js';
const OCR_WORKER_PATH = 'https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/worker.min.js';
const OCR_LANG_PATH = 'https://tessdata.projectnaptha.com/4.0.0';

let pdfRuntimePromise;
let ocrWorkerPromise;

export async function readPdfText(file) {
  const { getDocument } = await getPdfRuntime();
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .reduce(
        (state, item) => {
          if (!item.str?.trim()) return state;

          const y = Math.round(item.transform[5]);
          const shouldBreak =
            state.lastY !== null &&
            Math.abs(y - state.lastY) > 2;

          if (shouldBreak || item.hasEOL) {
            state.parts.push('\n');
          } else if (state.parts.length > 0 && !state.parts.at(-1)?.endsWith('\n')) {
            state.parts.push(' ');
          }

          state.parts.push(item.str.trim());
          state.lastY = y;
          return state;
        },
        { parts: [], lastY: null }
      )
      .parts
      .join('')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (pageText) pages.push(pageText);
  }

  return pages.join('\n\n');
}

export async function readImageText(file) {
  const worker = await getOcrWorker();
  const result = await worker.recognize(file);
  return result.data.text?.trim() || '';
}

async function getPdfRuntime() {
  if (!pdfRuntimePromise) {
    pdfRuntimePromise = (
      typeof window === 'undefined'
        ? import('pdfjs-dist/legacy/build/pdf.mjs')
        : import('pdfjs-dist')
    ).then((pdfjs) => {
      if (typeof window !== 'undefined') {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
      }

      return pdfjs;
    });
  }

  return pdfRuntimePromise;
}

async function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = import('tesseract.js').then(async ({ createWorker }) => {
      const options =
        typeof window === 'undefined'
          ? undefined
          : {
              corePath: OCR_CORE_PATH,
              workerPath: OCR_WORKER_PATH,
              langPath: OCR_LANG_PATH,
              logger: () => {},
            };

      return options
        ? createWorker(OCR_LANGUAGE, 1, options)
        : createWorker(OCR_LANGUAGE);
    });
  }

  return ocrWorkerPromise;
}
