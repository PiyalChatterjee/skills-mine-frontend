type JobIdentifierSource = {
  jobId: string;
  jobProfileId?: string;
};

export const getJobOperationId = ({
  jobId,
  jobProfileId,
}: JobIdentifierSource): string => jobProfileId ?? jobId;