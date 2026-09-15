import type { ResumeParseResponse } from "@/types";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";

type CvBuilderPrefillData = Omit<
  Partial<CvBuilderFormValues>,
  "personalDetails"
> & {
  personalDetails?: Partial<CvBuilderFormValues["personalDetails"]>;
};

type ResumeRecord = Record<string, unknown>;

const asRecord = (value: unknown): ResumeRecord =>
  value && typeof value === "object" ? (value as ResumeRecord) : {};

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(asString).filter(Boolean)
    : typeof value === "string"
      ? value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)
      : [];

const toMonthYear = (value: unknown) => {
  const text = asString(value);
  const match = text.match(/^(\d{4})-(\d{2})$/);
  if (!match) return text;
  const month = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ][Number(match[2]) - 1];
  return month ? `${month},${match[1]}` : text;
};

const extractSection = (text: string, heading: string, nextHeadings: string[]) => {
  const headingIndex = text.toLowerCase().indexOf(heading.toLowerCase());
  if (headingIndex < 0) return "";
  const section = text.slice(headingIndex + heading.length);
  const endIndex = nextHeadings
    .map((nextHeading) => section.toLowerCase().indexOf(nextHeading.toLowerCase()))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  return (endIndex === undefined ? section : section.slice(0, endIndex)).trim();
};

const extractTextSkills = (text: string) => {
  const section = extractSection(text, "Key Skills", ["Languages", "Prepared by"]);
  return section
    .split(/[\n•-]+/)
    .map((item) => item.trim())
    .filter((item) => item && !/^key skills$/i.test(item));
};

const extractTextLanguages = (text: string) => {
  const section = extractSection(text, "Languages", ["Tertiary Education", "Secondary Education", "Prepared by"]);
  return section
    .split(/[\n,;]+/)
    .map((item) => item.replace(/\s*\([^)]*\)/g, "").trim())
    .filter((item) => item && !/^languages$/i.test(item));
};

const compactStrings = <T extends Record<string, string>>(values: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value.trim().length > 0),
  ) as Partial<T>;

export const buildResumePrefillData = (
  response: ResumeParseResponse,
  extractedText: string,
): CvBuilderPrefillData => {
  const personal = asRecord(response.personal_details);
  const education = asRecord(response.education);
  const preferences = asRecord(response.job_preferences);
  const responseRecord = asRecord(response);
  const careerHistory = Array.isArray(response.career_history)
    ? response.career_history.map(asRecord).map((entry) => ({
        companyName: asString(entry.company_name),
        positionHeld: asString(entry.position_held),
        startDate: toMonthYear(entry.start_date),
        endDate: entry.is_current ? "Present" : toMonthYear(entry.end_date),
        isCurrentRole: Boolean(entry.is_current),
        tasks: asStringArray(entry.responsibilities).length
          ? asStringArray(entry.responsibilities)
          : [""],
        projects: asStringArray(entry.projects).length
          ? asStringArray(entry.projects)
          : [""],
      }))
    : [];
  const tertiary = Array.isArray(education.tertiary)
    ? education.tertiary.map(asRecord).map((entry) => ({
        institutionName: asString(entry.institution_name),
        degreeOrCertification: asString(entry.qualification),
        yearCompleted: String(entry.year_completed ?? ""),
      }))
    : [];
  const secondaryValue = asRecord(education.secondary);
  const secondary = secondaryValue.institution_name || secondaryValue.highest_grade_passed
    ? [{
        institutionName: asString(secondaryValue.institution_name),
        highestGradePassed: asString(secondaryValue.highest_grade_passed),
        yearCompleted: String(secondaryValue.year_completed ?? ""),
      }]
    : [];
  const skills = asStringArray(
    responseRecord.skills ?? responseRecord.key_skills ?? responseRecord.suggested_skills,
  ).map((name) => ({ name }));
  const languages = asStringArray(responseRecord.languages);

  const personalDetails = compactStrings({
      fullName: [asString(personal.first_name), asString(personal.last_name)].filter(Boolean).join(" "),
      race: asString(personal.race),
      gender: asString(personal.gender),
      disabilityStatus: asString(personal.disability_status),
      nationality: asString(personal.nationality),
      residentialLocation: asString(personal.residential_location),
      currentCompany: asString(personal.current_company),
      currentPosition: asString(personal.current_position),
      noticePeriod: asString(personal.notice_period) || asString(preferences.availability_code),
    });

  const currentEntry = careerHistory.find((entry) => entry.isCurrentRole);
  if (!personalDetails.currentCompany && currentEntry?.companyName) {
    personalDetails.currentCompany = currentEntry.companyName;
  }
  if (!personalDetails.currentPosition && currentEntry?.positionHeld) {
    personalDetails.currentPosition = currentEntry.positionHeld;
  }

  return {
    personalDetails,
    ...(careerHistory.length ? { careerHistory } : {}),
    ...(tertiary.length ? { tertiaryEducation: tertiary } : {}),
    ...(secondary.length ? { secondaryEducation: secondary } : {}),
    skills: skills.length ? skills : extractTextSkills(extractedText).map((name) => ({ name })),
    languages: languages.length ? languages : extractTextLanguages(extractedText),
  };
};