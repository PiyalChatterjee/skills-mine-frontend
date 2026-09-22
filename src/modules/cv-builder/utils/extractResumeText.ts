import mammoth from "mammoth/mammoth.browser";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const getExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

const loadPdfDocument = async (data: Uint8Array) => {
  try {
    return await pdfjs.getDocument({ data: data.slice() }).promise;
  } catch {
    const workerModule = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs");
    (globalThis as typeof globalThis & { pdfjsWorker?: unknown }).pdfjsWorker =
      workerModule;
    return pdfjs
      .getDocument({ data: data.slice(), worker: new pdfjs.PDFWorker() })
      .promise;
  }
};

const extractPdfText = async (file: File): Promise<string> => {
  const data = new Uint8Array(await file.arrayBuffer());
  const document = await loadPdfDocument(data);
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean)
        .join(" "),
    );
  }

  return pages.join("\n").trim();
};

const extractDocxText = async (file: File): Promise<string> => {
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  return result.value.trim();
};

export const extractResumeText = async (file: File): Promise<string> => {
  const extension = getExtension(file.name);
  const text =
    extension === "pdf"
      ? await extractPdfText(file)
      : extension === "docx"
        ? await extractDocxText(file)
        : file.type.startsWith("text/")
          ? await file.text()
          : "";

  if (!text.trim()) {
    throw new Error("The selected resume does not contain extractable text.");
  }

  return text.trim();
};