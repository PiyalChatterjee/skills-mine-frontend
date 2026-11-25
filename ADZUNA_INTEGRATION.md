# Adzuna API Integration Guide

This document describes the Adzuna API integration in the Skills Mine frontend application.

## Overview

The Adzuna integration allows recruiters to publish job postings to the Adzuna job board, manage published listings, and synchronize job data between Skills Mine and Adzuna.

## Architecture

### Service Layer

**Location:** `src/services/api/adzunaApi.ts`

The core service module provides low-level API client methods:

```typescript
export const adzunaApi = {
  getAdzunaPrefill(jobProfileId: string)
  publishToAdzuna(body: PublishAdzunaJobRequest)
  getAdzunaJobsAsJson()
  updateAdzunaJob(jobId: string, body: UpdateAdzunaJobRequest)
  deleteAdzunaJob(jobId: string)
  listAdzunaPublishes(params?: AdzunaPublishesParams)
}
```

### Redux RTK Query Integration

**Location:** `src/store/api/apiSlice.ts`

The Redux slice exposes Adzuna endpoints via RTK Query hooks:

```typescript
// Hooks available for use in components
useGetAdzunaPrefillQuery
usePublishToAdzunaMutation
useGetAdzunaJobsAsJsonQuery
useUpdateAdzunaJobMutation
useDeleteAdzunaJobMutation
useListAdzunaPublishesQuery
```

### API Endpoints

**Base URL:** Configured via environment variable `VITE_EXTERNAL_JOBS_API_BASE_URL`

**Endpoints:** (see `src/services/api/endpoints.ts`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/external-jobs/publish/adzuna/prefill` | Get prefilled data for a job profile |
| POST | `/external-jobs/publish/adzuna` | Publish a job to Adzuna |
| GET | `/external-jobs/adzuna/publishes` | Get published jobs as JSON |
| GET | `/external-jobs/adzuna/job-publish` | List Adzuna publish records |
| PUT | `/external-jobs/adzuna/jobs/{jobId}` | Update an existing job |
| DELETE | `/external-jobs/adzuna/jobs/{jobId}` | Delete (deactivate) a job |

## Type Definitions

### Request/Response Types

**AdzunaPrefillResponse:**
```typescript
{
  job_profile_id: string
  missing_fields: string[]
  warnings: string[]
  prefill: AdzunaPrefill
}
```

**PublishAdzunaJobRequest:**

The Adzuna form sends `category` as a numeric ID (1–29), not its display label.
It uses a supported Adzuna prefill category first; otherwise, it maps recognized job
industries or defaults to Other/General Jobs (29). Recruiters can change the selection.

The application URL is not editable in the form. Publish and update requests retain
the prefilled URL, falling back to the public job-details URL when unavailable.
Certification, salary benchmark messaging, publishing readiness, and synergy panels
are not displayed. The UI-only Work Field dropdown is also removed.

Create loads `/external-jobs/publish/adzuna/prefill`. Edit loads the saved advert
from `/external-jobs/adzuna/publishes?job_id=<id>` and populates the same form from
`job_data`; it does not call the create prefill endpoint.
Edit does not request mandate-service job details. Create retains that request for
job-profile defaults.
Saved descriptions are split into the existing description, requirements, and perks
fields to prevent duplication on update. Country and Publication Date have dedicated
fields; publication date is not listing expiry. Saved remote strings are normalized
to numeric values and mapped to Working Model (0 = On-site, 1 = Remote). The API has
no distinct Hybrid value; Hybrid is sent as 0. Updates are blocked if the saved
advert cannot be loaded.

The publish/update request does not include recruiter contact, recruiter email,
or listing expiry, so the form does not collect or validate these fields. Refer to
`PublishAdzunaJobRequest` in `src/services/api/adzunaApi.ts` for the request type.

**AdzunaPublishRecord:**
```typescript
{
  publish_id: string
  job_profile_id_ref: string
  adzuna_job_id?: string
  operation: "INSERT" | "UPDATE" | "DELETE"
  status: "PENDING" | "PUBLISHED" | "FAILED" | "CANCELLED"
  job_title: string
  job_description: string
  // ... additional fields
  created_at: string
  completed_at?: string
}
```

## Usage Examples

### In Components

#### 1. Get Prefilled Data

```typescript
import { useGetAdzunaPrefillQuery } from "@/store/api/apiSlice";

function AdzunaPublishForm({ jobProfileId }: { jobProfileId: string }) {
  const { data: prefill, isLoading, error } = useGetAdzunaPrefillQuery(jobProfileId);

  if (isLoading) return <div>Loading prefilled data...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <form>
      {/* Form fields populated with prefill data */}
    </form>
  );
}
```

#### 2. Publish a Job

```typescript
import { usePublishToAdzunaMutation } from "@/store/api/apiSlice";

function AdzunaPublishButton({ jobProfileId }: { jobProfileId: string }) {
  const [publish, { isLoading }] = usePublishToAdzunaMutation();

  const handlePublish = async (formData: PublishAdzunaJobRequest) => {
    try {
      await publish(formData).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return <button onClick={() => handlePublish(data)}>Publish to Adzuna</button>;
}
```

#### 3. List Published Jobs

```typescript
import { useListAdzunaPublishesQuery } from "@/store/api/apiSlice";

function AdzunaPublishedList() {
  const { data: publishes, isLoading } = useListAdzunaPublishesQuery();

  return (
    <ul>
      {publishes?.map((item) => (
        <li key={item.publish_id}>{item.job_title}</li>
      ))}
    </ul>
  );
}
```

#### 4. Update a Published Job

```typescript
import { useUpdateAdzunaJobMutation } from "@/store/api/apiSlice";

function AdzunaJobEditor({ jobId }: { jobId: string }) {
  const [updateJob, { isLoading }] = useUpdateAdzunaJobMutation();

  const handleUpdate = async (updates: UpdateAdzunaJobRequest) => {
    try {
      await updateJob({ jobId, payload: updates }).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return <button onClick={() => handleUpdate(updates)}>Update</button>;
}
```

#### 5. Delete a Published Job

```typescript
import { useDeleteAdzunaJobMutation } from "@/store/api/apiSlice";

function AdzunaJobDelete({ jobId }: { jobId: string }) {
  const [deleteJob, { isLoading }] = useDeleteAdzunaJobMutation();

  const handleDelete = async () => {
    try {
      await deleteJob(jobId).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Error Handling

All Adzuna API calls are wrapped with `withMappedApiError` for consistent error handling. Errors are transformed into the standard `ApiError` type.

```typescript
// Example error structure
{
  code: string
  message: string
  details?: unknown
}
```

## Caching & Cache Invalidation

RTK Query automatically handles caching for queries and mutations:

- **Queries** are cached and reused when called with the same arguments
- **Mutations** invalidate related tags to force cache refresh:
  - `publishToAdzuna` invalidates: `AdzunaPublishes`, `AdzunaJobs`
  - `updateAdzunaJob` invalidates: `AdzunaJobs`, `AdzunaPublishes`
  - `deleteAdzunaJob` invalidates: `AdzunaJobs`, `AdzunaPublishes`

## Configuration

### Environment Variables

Add to `.env.development.local` or deployment configuration:

```
VITE_EXTERNAL_JOBS_API_BASE_URL=https://your-api-base-url
```

### Timeout Configuration

Adzuna API calls have a 30-second timeout (`ADZUNA_TIMEOUT_MS = 30000`) to account for external service latency.

## Implementation Path

The Adzuna integration follows the existing external job integration pattern already in place for:

- **BizCommunity** (similar structure)
- **PNet** (similar structure)

This consistency ensures maintainability and leverages established patterns in the codebase.

## Related Files

- **Service Layer:** `src/services/api/adzunaApi.ts`
- **Redux Integration:** `src/store/api/apiSlice.ts`
- **API Endpoints:** `src/services/api/endpoints.ts`
- **Index Export:** `src/services/api/index.ts`

## Testing

When testing Adzuna integration:

1. Mock the RTK Query hooks in your component tests
2. Use the existing test patterns from `crmApi.test.ts` and `excoApi.test.ts`
3. Test error scenarios, loading states, and success states

Example mock setup:

```typescript
vi.mock("@/store/api/apiSlice", () => ({
  usePublishToAdzunaMutation: () => [
    vi.fn(),
    { isLoading: false }
  ]
}));
```

## Future Enhancements

- Add Adzuna-specific field validation
- Implement bulk publish/update operations
- Add webhook support for job publish status updates
- Create UI components for Adzuna publishing workflow
