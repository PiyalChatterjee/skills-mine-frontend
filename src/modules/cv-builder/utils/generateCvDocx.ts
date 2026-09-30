import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  type IParagraphOptions,
} from "docx";
import dayjs from "dayjs";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import type { SaveBuildMyCvRequest } from "@/types";

// ── Constants matching the PDF footer ────────────────────────────────────────

const FOOTER_TOP = "Prepared by THE SKILLS MINE (PTY) LTD";
const FOOTER_BOTTOM =
  "PLEASE NOTE By receiving this Curriculum Vitae, you automatically agree to our Standard Terms and Conditions";

// ── Brand colours (hex without #) ────────────────────────────────────────────

const BRAND_BLUE = "0B4A8D";   // section title blue (matches jsPDF rgb 11,74,141)
const ACCENT_BLUE = "2D97D3";  // heading accent (matches jsPDF rgb 45,151,211)
const TEXT_DARK = "232A30";    // label text (matches jsPDF rgb 35,42,48)
const TEXT_BODY = "484E54";    // value text (matches jsPDF rgb 72,78,84)
const TEXT_MUTED = "7F8A94";   // footer text (matches jsPDF rgb 127,138,148)

// ── Date helpers (same logic as downloadCvPdf.ts) ────────────────────────────

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

// ── Paragraph builders ────────────────────────────────────────────────────────

const SECTION_SPACING: IParagraphOptions["spacing"] = { before: 240, after: 80 };
const ROW_SPACING: IParagraphOptions["spacing"] = { before: 0, after: 60 };
const FOOTER_SPACING: IParagraphOptions["spacing"] = { before: 400, after: 0 };

/** Bold blue section heading — e.g. "Personal Profile" */
const sectionTitle = (text: string): Paragraph =>
  new Paragraph({
    spacing: SECTION_SPACING,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_BLUE, space: 4 },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,       // 14pt
        color: ACCENT_BLUE,
        font: "Calibri",
      }),
    ],
  });

/** "Label    value" row — label in dark bold, value in body grey */
const dataRow = (label: string, value: unknown): Paragraph | null => {
  const displayValue = String(
    typeof value === "string" ? formatEnumLabel(value) : (value ?? ""),
  ).trim();
  if (!displayValue) return null;

  const runs: TextRun[] = [];
  if (label) {
    runs.push(
      new TextRun({
        text: `${label}:   `,
        bold: true,
        size: 20,       // 10pt
        color: TEXT_DARK,
        font: "Calibri",
      }),
    );
  }
  runs.push(
    new TextRun({
      text: displayValue,
      size: 20,
      color: TEXT_BODY,
      font: "Calibri",
    }),
  );

  return new Paragraph({ spacing: ROW_SPACING, children: runs });
};

/** Bullet-style list item — "- value" */
const listItem = (value: string): Paragraph =>
  new Paragraph({
    spacing: ROW_SPACING,
    children: [
      new TextRun({
        text: `- ${formatEnumLabel(value)}`,
        size: 20,
        color: TEXT_BODY,
        font: "Calibri",
      }),
    ],
  });

/** Centred title paragraph */
const centredText = (
  text: string,
  opts: { size: number; bold?: boolean; color?: string },
): Paragraph =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({
        text,
        bold: opts.bold ?? false,
        size: opts.size,
        color: opts.color ?? TEXT_DARK,
        font: "Calibri",
      }),
    ],
  });

/** Footer line — centred, muted */
const footerLine = (text: string, topSpacing = 0): Paragraph =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: topSpacing, after: 0 },
    children: [
      new TextRun({
        text,
        size: 14,       // 7pt
        color: TEXT_MUTED,
        font: "Calibri",
        italics: true,
      }),
    ],
  });

// ── Image loader ─────────────────────────────────────────────────────────────

const fetchImageAsArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch header image: ${response.status}`);
  return response.arrayBuffer();
};

// ── Main export ───────────────────────────────────────────────────────────────

export const generateCvDocxBlob = async (
  payloadText: string,
  headerImageSrc: string,
): Promise<Blob> => {
  const payload = JSON.parse(payloadText) as SaveBuildMyCvRequest;

  const personalDetails = payload.personalDetails;
  const tertiaryEducation = payload.education?.tertiaryEducation ?? [];
  const secondaryEducation = payload.education?.secondaryEducation ?? [];
  const careerHistory = payload.careerHistory ?? [];
  const skills = payload.skills ?? [];
  const languages = payload.languages ?? [];

  const formatJoinedValues = (
    values: Array<string | null | undefined>,
    separator: string,
  ) => values.map(formatEnumLabel).filter(Boolean).join(separator);

  // ── Fetch header image ────────────────────────────────────────────────────

  let headerImageBuffer: ArrayBuffer | null = null;
  try {
    headerImageBuffer = await fetchImageAsArrayBuffer(headerImageSrc);
  } catch {
    // Header image is non-critical — continue without it
  }

  // ── Build paragraphs ──────────────────────────────────────────────────────

  const paragraphs: Paragraph[] = [];

  // Header image (full width ≈ 160mm → 9072 EMU per mm → ~9072*160 = 1,451,520 EMU wide)
  // docx uses twips for image width: 1 inch = 1440 twips; A4 content width ≈ 16.5cm ≈ 6.496 in
  // Use pixel dimensions: image is ~1200×300 native — maintain aspect ratio at 620px wide
  if (headerImageBuffer) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 0, after: 160 },
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            // docx v8 requires `type` for browser ArrayBuffer
            type: "png",
            data: headerImageBuffer,
            transformation: { width: 620, height: 155 },
            floating: undefined,
          }),
        ],
      }),
    );
  } else {
    // Fallback text header if image fails
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
        children: [
          new TextRun({
            text: "THE SKILLS MINE — GLOBAL TALENT ACQUISITION SPECIALIST",
            bold: true,
            size: 22,
            color: BRAND_BLUE,
            font: "Calibri",
          }),
        ],
      }),
    );
  }

  // CV title + candidate name
  paragraphs.push(centredText("Curriculum Vitae", { size: 48, bold: true, color: ACCENT_BLUE }));
  paragraphs.push(
    centredText(
      `${personalDetails?.firstName ?? ""} ${personalDetails?.lastName ?? ""}`.trim(),
      { size: 32, bold: true, color: TEXT_DARK },
    ),
  );

  // ── Personal Profile ──────────────────────────────────────────────────────

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
    paragraphs.push(sectionTitle("Personal Profile"));
    const rows = [
      dataRow("Job Application", personalDetails?.currentPosition),
      dataRow("Full Name", `${personalDetails?.firstName ?? ""} ${personalDetails?.lastName ?? ""}`),
      dataRow("Employment Equity Status", formatJoinedValues([personalDetails?.race, personalDetails?.gender], " ")),
      dataRow("Disability", personalDetails?.disabilityStatus),
      dataRow("Nationality", personalDetails?.nationality),
      dataRow("Residential Location", personalDetails?.location),
      dataRow("Current Company", personalDetails?.currentCompany),
      dataRow("Current Position", personalDetails?.currentPosition),
      dataRow("Notice Period", personalDetails?.noticePeriod),
    ];
    for (const row of rows) if (row) paragraphs.push(row);
  }

  // ── Candidate Overview ────────────────────────────────────────────────────

  if (tertiaryEducation[0]?.qualification || languages.length > 0) {
    paragraphs.push(sectionTitle("Candidate Overview"));
    const r1 = dataRow("Highest Qualification", tertiaryEducation[0]?.qualification);
    if (r1) paragraphs.push(r1);
    const r2 = dataRow("Languages", formatJoinedValues(languages.map((e) => e.language), ", "));
    if (r2) paragraphs.push(r2);
  }

  // ── Tertiary Education ────────────────────────────────────────────────────

  if (tertiaryEducation.length > 0) {
    paragraphs.push(sectionTitle("Tertiary Education"));
    for (const entry of tertiaryEducation) {
      const rows = [
        dataRow("Institution", entry.institution),
        dataRow("Year Completed", entry.yearCompleted),
        dataRow("Degree / Certificate Name", entry.qualification),
      ];
      for (const row of rows) if (row) paragraphs.push(row);
    }
  }

  // ── Secondary Education ───────────────────────────────────────────────────

  if (secondaryEducation.length > 0) {
    paragraphs.push(sectionTitle("Secondary Education"));
    for (const entry of secondaryEducation) {
      const rows = [
        dataRow("Institution", entry.schoolName || entry.institution),
        dataRow("Year Completed", entry.yearCompleted),
        dataRow("Highest Grade Passed", entry.qualification || entry.highestGradePassed),
      ];
      for (const row of rows) if (row) paragraphs.push(row);
    }
  }

  // ── Career Overview ───────────────────────────────────────────────────────

  if (careerHistory.length > 0) {
    paragraphs.push(sectionTitle("Career Overview"));
    for (const entry of careerHistory) {
      const rows = [
        dataRow("Company", entry.company),
        dataRow("Period", formatCvPeriod(entry.startDate, entry.endDate)),
        dataRow("Position Held", entry.jobTitle),
      ];
      for (const row of rows) if (row) paragraphs.push(row);
    }
  }

  // ── Key Skills ────────────────────────────────────────────────────────────

  if (skills.length > 0) {
    paragraphs.push(sectionTitle("Key Skills"));
    for (const skill of skills) paragraphs.push(listItem(skill));
  }

  // ── Languages ─────────────────────────────────────────────────────────────

  if (languages.length > 0) {
    paragraphs.push(sectionTitle("Languages"));
    const formatted = languages
      .map((entry) => {
        const lang = formatEnumLabel(entry.language);
        const prof = formatEnumLabel(entry.proficiency);
        return prof ? `${lang} (${prof})` : lang;
      })
      .filter(Boolean)
      .join(", ");
    const row = dataRow("", formatted);
    if (row) paragraphs.push(row);
  }

  // ── Work Experience ───────────────────────────────────────────────────────

  if (careerHistory.length > 0) {
    paragraphs.push(sectionTitle("Work Experience"));
    for (const entry of careerHistory) {
      const rows = [
        dataRow("Company Name", entry.company),
        dataRow("Position Held", entry.jobTitle),
        dataRow("Period", formatCvPeriod(entry.startDate, entry.endDate)),
        dataRow("Description", entry.responsibilities),
      ];
      for (const row of rows) if (row) paragraphs.push(row);
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────

  paragraphs.push(footerLine(FOOTER_TOP, FOOTER_SPACING.before as number));
  paragraphs.push(footerLine(FOOTER_BOTTOM));

  // ── Assemble document ─────────────────────────────────────────────────────

  const doc = new Document({
    creator: "The Skills Mine",
    title: "Curriculum Vitae",
    description: "CV generated by The Skills Mine CV Builder",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 1008, right: 1008 }, // ~1.27cm margins
          },
        },
        children: paragraphs,
      },
    ],
  });

  return Packer.toBlob(doc);
};
