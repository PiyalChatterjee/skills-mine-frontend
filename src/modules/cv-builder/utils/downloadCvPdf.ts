import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import skillsMineCVHeroImg from "@/assets/cv-builder/skills-mine-cv-hero-img.png";
import type { SaveBuildMyCvRequest } from "@/types";

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

const pxToMm = (pixels: number) => (pixels * 25.4) / 96;
const isoMonthOrDatePattern = /^(19|20)\d{2}-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/;

const formatCvPeriodDate = (value: unknown): string => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!isoMonthOrDatePattern.test(normalized)) return normalized;

  return dayjs(`${normalized.slice(0, 7)}-01`).format("MMMM YYYY");
};

const formatCvPeriod = (startDate: unknown, endDate: unknown): string => {
  const start = formatCvPeriodDate(startDate);
  const end = formatCvPeriodDate(endDate) || "Current";
  return start ? `${start} - ${end}` : end;
};

const loadImageElement = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load CV header image"));
    image.src = src;
  });

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

export const generateCvPdfBlobFromText = async (text: string): Promise<Blob> => {
  const payload = JSON.parse(text) as SaveBuildMyCvRequest;
  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const outerPadding = 8;
  const contentLeft = 24;
  const contentRight = pageWidth - 24;
  const valueLeft = 76;
  const contentWidth = contentRight - contentLeft;
  const sectionTitleTopPadding = pxToMm(16);
  const sectionTitleBottomPadding = pxToMm(8);
  const sectionTitleLineHeight = 7;
  const cvHeaderImage = await loadImageElement(skillsMineCVHeroImg);
  let yPosition = 34;

  const drawPage = () => {
    pdf.setFillColor(11, 74, 141);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(
      outerPadding,
      outerPadding,
      pageWidth - outerPadding * 2,
      pageHeight - outerPadding * 2,
      3,
      3,
      "F",
    );
    yPosition = 34;
  };

  const addPageIfNeeded = (height = 10) => {
    if (yPosition + height <= pageHeight - 34) return;
    pdf.addPage();
    drawPage();
  };

  const formatValue = (value: unknown) =>
    typeof value === "string" ? formatEnumLabel(value) : value;

  const formatJoinedValues = (
    values: Array<string | null | undefined>,
    separator: string,
  ) => values.map(formatEnumLabel).filter(Boolean).join(separator);

  const addSectionTitle = (title: string) => {
    addPageIfNeeded(
      sectionTitleTopPadding + sectionTitleLineHeight + sectionTitleBottomPadding,
    );
    yPosition += sectionTitleTopPadding;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.setTextColor(45, 151, 211);
    pdf.text(title, contentLeft, yPosition);
    yPosition += sectionTitleLineHeight + sectionTitleBottomPadding;
  };

  const addRow = (label: string, value: unknown) => {
    const displayValue = String(formatValue(value) ?? "").trim();
    if (!displayValue) return;
    const valueX = label ? valueLeft : contentLeft;
    const lines = pdf.splitTextToSize(displayValue, contentRight - valueX);
    addPageIfNeeded(Math.max(8, lines.length * 5));
    if (label) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(35, 42, 48);
      pdf.text(label, contentLeft, yPosition);
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(72, 78, 84);
    pdf.text(lines, valueX, yPosition);
    yPosition += Math.max(8, lines.length * 5);
  };

  const addList = (values: string[]) => {
    for (const value of values) {
      const lines = pdf.splitTextToSize(formatEnumLabel(value), contentWidth - 6);
      addPageIfNeeded(Math.max(6, lines.length * 5));
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10.5);
      pdf.setTextColor(72, 78, 84);
      pdf.text(`- ${lines[0]}`, contentLeft + 2, yPosition);
      if (lines.length > 1) {
        pdf.text(lines.slice(1), contentLeft + 5, yPosition + 5);
      }
      yPosition += Math.max(6, lines.length * 5);
    }
  };

  const addFooter = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(127, 138, 148);
    pdf.text(DEFAULT_OPTIONS.footerTopLine, pageWidth / 2, pageHeight - 20, {
      align: "center",
    });
    pdf.text(DEFAULT_OPTIONS.footerBottomLine, pageWidth / 2, pageHeight - 13, {
      align: "center",
      maxWidth: pageWidth - outerPadding * 2,
    });
  };

  drawPage();
  const headerWidth = pageWidth - outerPadding * 2;
  const headerHeight = (cvHeaderImage.height * headerWidth) / cvHeaderImage.width;
  pdf.addImage(
    cvHeaderImage,
    "PNG",
    outerPadding,
    outerPadding,
    headerWidth,
    headerHeight,
  );
  yPosition = outerPadding + headerHeight + 14;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(25);
  pdf.setTextColor(45, 151, 211);
  pdf.text("Curriculum Vitae", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 11;
  pdf.setFontSize(17);
  pdf.setTextColor(35, 42, 48);
  pdf.text(
    `${payload.personalDetails?.firstName ?? ""} ${payload.personalDetails?.lastName ?? ""}`.trim(),
    pageWidth / 2,
    yPosition,
    { align: "center" },
  );
  yPosition += 20;

  const personalDetails = payload.personalDetails;
  const tertiaryEducation = payload.education?.tertiaryEducation ?? [];
  const secondaryEducation = payload.education?.secondaryEducation ?? [];
  const careerHistory = payload.careerHistory ?? [];
  const skills = payload.skills ?? [];
  const languages = payload.languages ?? [];

  const hasPersonalProfile = Boolean(
    personalDetails?.currentPosition ||
      personalDetails?.firstName ||
      personalDetails?.lastName ||
      personalDetails?.race ||
      personalDetails?.gender ||
      personalDetails?.disabilityStatus ||
      personalDetails?.nationality ||
      personalDetails?.location ||
      personalDetails?.currentCompany ||
      personalDetails?.noticePeriod,
  );

  if (hasPersonalProfile) {
    addSectionTitle("Personal Profile");
    addRow("Job Application", personalDetails?.currentPosition);
    addRow(
      "Full Name",
      `${personalDetails?.firstName ?? ""} ${personalDetails?.lastName ?? ""}`,
    );
    addRow(
      "Employment Equity Status",
      formatJoinedValues([personalDetails?.race, personalDetails?.gender], " "),
    );
    addRow("Disability", personalDetails?.disabilityStatus);
    addRow("Nationality", personalDetails?.nationality);
    addRow("Residential Location", personalDetails?.location);
    addRow("Current Company", personalDetails?.currentCompany);
    addRow("Current Position", personalDetails?.currentPosition);
    addRow("Notice Period", personalDetails?.noticePeriod);
  }

  if (tertiaryEducation[0]?.qualification || languages.length > 0) {
    addSectionTitle("Candidate Overview");
    addRow("Highest Qualification", tertiaryEducation[0]?.qualification);
    addRow(
      "Languages",
      formatJoinedValues(
        languages.map((entry) => entry.language),
        ", ",
      ),
    );
  }

  if (tertiaryEducation.length > 0) {
    addSectionTitle("Tertiary Education");
    for (const entry of tertiaryEducation) {
      addRow("Institution", entry.institution);
      addRow("Year Completed", entry.yearCompleted);
      addRow("Degree / Certificate Name", entry.qualification);
    }
  }

  if (secondaryEducation.length > 0) {
    addSectionTitle("Secondary Education");
    for (const entry of secondaryEducation) {
      addRow("Institution", entry.schoolName || entry.institution);
      addRow("Year Completed", entry.yearCompleted);
      addRow("Highest grade passed", entry.qualification || entry.highestGradePassed);
    }
  }

  if (careerHistory.length > 0) {
    addSectionTitle("Career Overview");
    for (const entry of careerHistory) {
      addRow("Company", entry.company);
      addRow("Period", formatCvPeriod(entry.startDate, entry.endDate));
      addRow("Position Held", entry.jobTitle);
    }
  }

  if (skills.length > 0) {
    addSectionTitle("Key Skills");
    addList(skills);
  }

  if (languages.length > 0) {
    addSectionTitle("Languages");
    addRow(
      "",
      languages
        .map((entry) =>
          [
            formatEnumLabel(entry.language),
            formatEnumLabel(entry.proficiency),
          ].filter(Boolean),
        )
        .filter((entry) => entry.length > 0)
        .map(([language, proficiency]) =>
          proficiency ? `${language} (${proficiency})` : language,
        )
        .join(", "),
    );
  }

  if (careerHistory.length > 0) {
    addSectionTitle("Work Experience");
    for (const entry of careerHistory) {
      addRow("Company Name", entry.company);
      addRow("Position Held", entry.jobTitle);
      addRow("Period", formatCvPeriod(entry.startDate, entry.endDate));
      addRow("Description", entry.responsibilities);
    }
  }

  for (let pageIndex = 1; pageIndex <= pdf.getNumberOfPages(); pageIndex += 1) {
    pdf.setPage(pageIndex);
    addFooter();
  }

  return pdf.output("blob");
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

