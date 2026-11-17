import { mandateApiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import type { Industry, SuccessEnvelope } from "@/types/api";

type IndustryItem = {
  industryId: string;
  industryName: string;
  bizCommunityIndustryId?: number | null;
};

export const industryApi = {
  getIndustries() {
    return mandateApiClient
      .get<IndustryItem[]>(apiEndpoints.industries.list)
      .then((response): SuccessEnvelope<Industry[]> => ({
        success: true,
        statusCode: 200,
        message: "Industries retrieved.",
        data: response.data.map((industry) => ({
          industryId: industry.industryId,
          name: industry.industryName,
          bizCommunityIndustryId: industry.bizCommunityIndustryId ?? undefined,
        })),
      }));
  },
};

// Resolves an industry display name to its backend id; falls back to the
// original name if no match is found so the caller still has a value to send.
export const resolveIndustryId = async (
  industryName?: string,
): Promise<string | undefined> => {
  if (!industryName) {
    return undefined;
  }

  const { data: industries } = await industryApi.getIndustries();
  const match = industries.find(
    (industry) => industry.name.toLowerCase() === industryName.toLowerCase(),
  );
  return match?.industryId ?? industryName;
};

export const resolveIndustryIds = async (
  industryNames: string[],
): Promise<string[]> => {
  if (industryNames.length === 0) {
    return [];
  }

  const { data: industries } = await industryApi.getIndustries();
  return industryNames.map((industryName) => {
    const match = industries.find(
      (industry) => industry.name.toLowerCase() === industryName.toLowerCase(),
    );
    return match?.industryId ?? industryName;
  });
};

// Resolves an industry display name to its BizCommunity industry id, if any.
export const resolveBizCommunityIndustryId = async (
  industryName?: string,
): Promise<number | undefined> => {
  if (!industryName) return undefined;

  const { data: industries } = await industryApi.getIndustries();
  return industries.find(
    (industry) => industry.name.toLowerCase() === industryName.toLowerCase(),
  )?.bizCommunityIndustryId;
};

// Resolves a BizCommunity industry id to its display name, if any.
export const resolveBizCommunityIndustryName = async (
  bizCommunityIndustryId?: number,
): Promise<string | undefined> => {
  if (bizCommunityIndustryId == null) return undefined;

  const { data: industries } = await industryApi.getIndustries();
  return industries.find(
    (industry) =>
      Number(industry.bizCommunityIndustryId) === Number(bizCommunityIndustryId),
  )?.name;
};

export const resolveIndustryName = async (
  industryId?: string,
): Promise<string | undefined> => {
  if (!industryId) return undefined;

  const { data: industries } = await industryApi.getIndustries();
  return industries.find((industry) => industry.industryId === industryId)?.name;
};
