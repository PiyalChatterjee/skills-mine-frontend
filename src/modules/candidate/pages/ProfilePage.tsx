import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  formatProfileLabel,
  ProfileSelectField,
  ProfileTextField,
} from "@/modules/candidate/components/ProfileFormFields";
import { PROFILE_SELECT_OPTIONS } from "@/modules/candidate/pages/profileForm.config";
import { useCandidateProfileViewModel } from "@/modules/candidate/hooks/useCandidateProfileViewModel";
import { usePageTitle } from "@/hooks/usePageTitle";
import cameraPlaceholderIconSrc from "@/assets/icons/camera-placeholder.svg";
import pencilLineIconSrc from "@/assets/icons/pencil-line.svg";
import iconPersonalSrc from "@/assets/profile/icon-personal.svg";
import iconDesiredSrc from "@/assets/profile/icon-desired.svg";
import styles from "./ProfilePage.module.css";

type SectionCardProps = {
  iconSrc: string;
  title: string;
  showEdit?: boolean;
  onEdit?: () => void;
  children: ReactNode;
};

const SectionCard = ({
  iconSrc,
  title,
  showEdit = true,
  onEdit,
  children,
}: SectionCardProps) => (
  <Box className={styles.sectionCard}>
    <Box className={styles.sectionCardHeader}>
      <Box className={styles.sectionCardTitleGroup}>
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          className={styles.sectionIcon}
        />
          <Typography className={styles.sectionCardTitle}>
            {formatProfileLabel(title)}
          </Typography>
      </Box>
      {showEdit && (
        <Button
          variant="outlined"
          className={styles.editButton}
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          title={`Edit ${title}`}
          startIcon={
            <img
              src={pencilLineIconSrc}
              alt=""
              aria-hidden="true"
              className={styles.editButtonIcon}
            />
          }
        >
          Edit
        </Button>
      )}
    </Box>
    <Divider className={styles.sectionDivider} />
    {children}
  </Box>
);

const ProfilePage = () => {
  usePageTitle("Profile");
  const {
    activeProfilePhotoUrl,
    control,
    handleDashboard,
    handleEditDesired,
    handleEditPersonal,
    handleProfilePhotoSelect,
    handleUploadPhotoClick,
    industryOptions,
    isDesiredEditing,
    isDirty,
    isError,
    isFetching,
    isInitialProfileLoading,
    isLoading,
    isMissingUser,
    isPersonalEditing,
    loadErrorMessage,
    profilePhotoInputRef,
  } = useCandidateProfileViewModel();

  if (isMissingUser) {
    return (
      <Box className={styles.pageRoot}>
        <Typography component="p">
          Unable to load profile because no authenticated user is available.
        </Typography>
      </Box>
    );
  }

  if (isInitialProfileLoading) {
    return (
      <Box className={styles.pageRoot}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className={styles.pageRoot}>
        <Alert severity="error">{loadErrorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.pageRoot}>
      <Typography component="h1" className={styles.pageTitle}>
        Profile settings
      </Typography>

      <Box className={styles.layout}>
        <Stack className={styles.formStack}>
          <SectionCard
            iconSrc={iconPersonalSrc}
            title="Personal details"
            onEdit={handleEditPersonal}
          >
            <Box className={styles.fieldsGrid}>
              <ProfileTextField
                control={control}
                name="fullName"
                label="Full name"
                fullWidth
                disabled={!isPersonalEditing}
              />
              <ProfileTextField
                control={control}
                name="email"
                label="Email address"
                disabled={!isPersonalEditing}
              />
              <ProfileTextField
                control={control}
                name="phoneNumber"
                label="Phone number"
                disabled={!isPersonalEditing}
                type="tel"
              />
              <ProfileTextField
                control={control}
                name="alternateEmail"
                label="Alternative email address"
                disabled={!isPersonalEditing}
              />
              <ProfileTextField
                control={control}
                name="alternatePhoneNumber"
                label="Alternative number"
                disabled={!isPersonalEditing}
                type="tel"
              />
              <ProfileTextField
                control={control}
                name="residentialLocation"
                label="Residential location"
                fullWidth
                disabled={!isPersonalEditing}
              />
            </Box>
          </SectionCard>

          <SectionCard
            iconSrc={iconDesiredSrc}
            title="Desired job"
            onEdit={handleEditDesired}
          >
            <Box className={styles.fieldsGrid}>
              <ProfileTextField
                control={control}
                name="preferredJobTitle"
                label="Preferred job title"
                disabled={!isDesiredEditing}
              />
              <ProfileSelectField
                control={control}
                name="targetedIndustries"
                label="Targeted industries"
                options={industryOptions}
                disabled={!isDesiredEditing}
              />
              <ProfileSelectField
                control={control}
                name="preferredWorkType"
                label="Preferred Work Type(s)"
                options={[...PROFILE_SELECT_OPTIONS.preferredWorkType]}
                disabled={!isDesiredEditing}
              />
              <ProfileSelectField
                control={control}
                name="employmentType"
                label="Employment type"
                options={[...PROFILE_SELECT_OPTIONS.employmentType]}
                disabled={!isDesiredEditing}
              />
              <ProfileSelectField
                control={control}
                name="availability"
                label="Availability"
                options={[...PROFILE_SELECT_OPTIONS.availability]}
                disabled={!isDesiredEditing}
              />
            </Box>
          </SectionCard>

          <Box className={styles.footerAction}>
            <Divider className={styles.footerDivider} />
            <Button
              variant="contained"
              className={styles.dashboardButton}
              onClick={handleDashboard}
              disabled={isLoading || isFetching}
            >
              {isDirty ? "Save Changes" : "Go to Your Dashboard"}
            </Button>
          </Box>
        </Stack>

        <Box className={styles.sidebar}>
          <Box className={styles.photoCard}>
            <Box
              className={styles.avatarFrame}
              aria-label="Profile photo frame"
            >
              {activeProfilePhotoUrl ? (
                <img
                  src={activeProfilePhotoUrl}
                  alt="Candidate profile photo"
                  className={styles.avatarPhoto}
                />
              ) : (
                <Box className={styles.avatarPlaceholderIcon}>
                  <img
                    src={cameraPlaceholderIconSrc}
                    alt=""
                    aria-hidden="true"
                  />
                </Box>
              )}
            </Box>
            <input
              ref={profilePhotoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleProfilePhotoSelect}
              className={styles.hiddenFileInput}
            />
            <Button
              variant="text"
              className={styles.uploadLink}
              onClick={handleUploadPhotoClick}
              disableRipple
            >
              Upload profile picture
            </Button>
            <Typography className={styles.photoNote}>
              Note: Your profile picture will not appear on your CV.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
