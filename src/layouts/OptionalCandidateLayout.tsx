import { useAuth } from "@/app/auth/AuthContext";
import { CandidateLayout } from "./CandidateLayout";
import { PublicLayout } from "./PublicLayout";

export const OptionalCandidateLayout = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <CandidateLayout /> : <PublicLayout />;
};