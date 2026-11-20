import type { ResumeParseResponse } from "@/types";
import type { CvBuilderFormValues } from "@/app/validation.schema";
import { LANGUAGES_LIST } from "../types/cvBuilder";

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

// Map language codes/short names to full display names from LANGUAGES_LIST
// Keys are lowercase for case-insensitive matching
const languageCodeToDisplayName: Record<string, string> = {
  "afrikaans": "Afrikaans",
  "sesotho": "Sesotho (Southern Sotho)",
  "southern sotho": "Sesotho (Southern Sotho)",
  "siswati": "siSwati (Swazi)",
  "swazi": "siSwati (Swazi)",
  "english": "English",
  "sepedi": "Sepedi (Northern Sotho)",
  "northern sotho": "Sepedi (Northern Sotho)",
  "isindebele": "isiNdebele",
  "ndebele": "isiNdebele",
  "isixhosa": "isiXhosa",
  "xhosa": "isiXhosa",
  "tshivenda": "Tshivenda (Venda)",
  "venda": "Tshivenda (Venda)",
  "xitsonga": "Xitsonga",
  "tsonga": "Xitsonga",
  "isizulu": "isiZulu",
  "zulu": "isiZulu",
  "setswana": "Setswana (Tswana)",
  "tswana": "Setswana (Tswana)",
  "south african sign": "South African Sign",
  "sasl": "South African Sign",
};

const normalizeLanguage = (language: string): string => {
  const normalized = language.trim().toLowerCase();
  return languageCodeToDisplayName[normalized] || language.trim();
};

// The UI tracks month/year only, so any day component in the parsed date is dropped.
const toMonthYear = (value: unknown) => {
  const text = asString(value);
  const match = text.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!match) return text;
  const month = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ][Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : text;
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
  const parsedLanguages = asStringArray(responseRecord.languages);
  const languages = parsedLanguages.length ? parsedLanguages : extractTextLanguages(extractedText);
  
  // Normalize language codes to display names
  const normalizedLanguages = languages.map(normalizeLanguage);
  
  // Separate known and unknown languages
  const knownLanguages = normalizedLanguages.filter((language) => LANGUAGES_LIST.includes(language as never));
  const otherLanguages = normalizedLanguages.filter((language) => !LANGUAGES_LIST.includes(language as never));

  const personalDetails = compactStrings({
      fullName: [asString(personal.first_name), asString(personal.last_name)].filter(Boolean).join(" "),
      email: asString(personal.email),
      phoneNumber: asString(personal.phone_number),
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
    languages: otherLanguages.length ? [...knownLanguages, "Other"] : knownLanguages,
    otherLanguage: otherLanguages.join(", "),
  };
};