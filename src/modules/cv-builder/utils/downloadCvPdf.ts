import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type DownloadCvPdfOptions = {
  fileName?: string;
  footerTopLine?: string;
  footerBottomLine?: string;
};

const DEFAULT_OPTIONS: Required<DownloadCvPdfOptions> = {
  fileName: "candidate-cv.pdf",
  footerTopLine: "Prepared by THE SKILLS MINE (PTY) LTD",
  footerBottomLine:
    "PLEASE NOTE By receiving this Curriculum Vitae, you automatically agree to our Standard Terms and Conditions",
};

export const generateCvPdfBlob = async (
  documentNode: HTMLElement,
  options: DownloadCvPdfOptions = {},
): Promise<Blob> => {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const exportWidth = Math.ceil(documentNode.getBoundingClientRect().width);
  const exportContainer = document.createElement("div");
  const exportNode = documentNode.cloneNode(true) as HTMLElement;

  exportContainer.style.position = "fixed";
  exportContainer.style.left = "-10000px";
  exportContainer.style.top = "0";
  exportContainer.style.width = `${exportWidth}px`;
  exportContainer.style.padding = "0";
  exportContainer.style.margin = "0";
  exportContainer.style.background = "#ffffff";
  exportContainer.style.pointerEvents = "none";
  exportContainer.style.overflow = "visible";
  exportContainer.appendChild(exportNode);

  exportNode.style.width = `${exportWidth}px`;
  exportNode.style.maxWidth = "none";
  exportNode.style.boxSizing = "border-box";

  document.body.appendChild(exportContainer);

  const outerFramePadding = 8;
  const innerCardPadding = 10;
  const footerReserve = 32;

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });

    const canvas = await html2canvas(exportNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: exportNode.scrollWidth,
      windowHeight: exportNode.scrollHeight,
      width: exportNode.scrollWidth,
      height: exportNode.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const innerCardWidth = pageWidth - outerFramePadding * 2;
    const innerCardHeight = pageHeight - outerFramePadding * 2;
    const contentWidth = innerCardWidth - innerCardPadding * 2;
    const availablePageHeight =
      innerCardHeight - innerCardPadding * 2 - footerReserve;
    const sliceHeightPx = Math.floor(
      (availablePageHeight * canvas.width) / contentWidth,
    );
    const totalSlices = Math.ceil(canvas.height / sliceHeightPx);

    for (let sliceIndex = 0; sliceIndex < totalSlices; sliceIndex += 1) {
      if (sliceIndex > 0) {
        pdf.addPage();
      }

      pdf.setFillColor(11, 74, 141);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(
        outerFramePadding,
        outerFramePadding,
        innerCardWidth,
        innerCardHeight,
        3,
        3,
        "F",
      );

      const sourceY = sliceIndex * sliceHeightPx;
      const remainingSourceHeight = canvas.height - sourceY;
      const currentSliceHeight = Math.min(sliceHeightPx, remainingSourceHeight);
      const pageCanvas = document.createElement("canvas");
      const pageContext = pageCanvas.getContext("2d");

      if (!pageContext) {
        continue;
      }

      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSliceHeight;
      pageContext.fillStyle = "#ffffff";
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        currentSliceHeight,
        0,
        0,
        canvas.width,
        currentSliceHeight,
      );

      const pageImageHeight = (currentSliceHeight * contentWidth) / canvas.width;
      const pageImageData = pageCanvas.toDataURL("image/png");

      pdf.addImage(
        pageImageData,
        "PNG",
        outerFramePadding + innerCardPadding,
        outerFramePadding + innerCardPadding,
        contentWidth,
        pageImageHeight,
      );
    }

    const totalPages = pdf.getNumberOfPages();

    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
      pdf.setPage(pageIndex);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(127, 138, 148);
      pdf.setFontSize(8);
      pdf.text(resolvedOptions.footerTopLine, pageWidth / 2, pageHeight - 20, {
        align: "center",
      });
      pdf.text(resolvedOptions.footerBottomLine, pageWidth / 2, pageHeight - 13, {
        align: "center",
        maxWidth: innerCardWidth,
      });
    }

    return pdf.output("blob");
  } finally {
    exportContainer.remove();
  }
};

export const downloadCvPdf = async (
  documentNode: HTMLElement,
  options: DownloadCvPdfOptions = {},
) => {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const blob = await generateCvPdfBlob(documentNode, options);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = resolvedOptions.fileName;
  link.click();
  URL.revokeObjectURL(blobUrl);
};

