import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Divider,
	Stack,
	Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { useZodForm } from "@/hooks/useZodForm";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { saveProfileThunk } from "@/store/slices/candidateThunks";
import {
	ProfileSelectField,
	ProfileTextField,
} from "@/modules/candidate/components/ProfileFormFields";
import {
	getCandidateProfileUpdatePayload,
	getProfileFormValues,
	PROFILE_SELECT_OPTIONS,
	profileFormSchema,
} from "@/modules/candidate/pages/profileForm.config";
import { useCandidateProfileQuery, useCandidateResourceId, useUserProfile } from "@/modules/candidate/hooks/useCandidateQueries";
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
	children: React.ReactNode;
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
				<Typography className={styles.sectionCardTitle}>{title}</Typography>
			</Box>
			{showEdit && (
				<Button
					variant="outlined"
					className={styles.editButton}
					onClick={onEdit}
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
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { user } = useAuth();
	const userId = user?.userId;
	const candidateId = useCandidateResourceId();
	const {
		data: candidateProfile,
		isLoading,
		isFetching,
		isError,
		error,
	} = useCandidateProfileQuery(candidateId, userId, Boolean(candidateId));
	const { data: userProfile } = useUserProfile(userId);
	const resolvedCandidateProfile = candidateProfile ?? null;
	const {
		control,
		formState: { isDirty },
		getValues,
		reset,
		trigger,
	} = useZodForm(profileFormSchema, {
		defaultValues: getProfileFormValues(null),
	});
	const [isPersonalEditing, setIsPersonalEditing] = useState(false);
	const [isDesiredEditing, setIsDesiredEditing] = useState(false);
	const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<
		string | null
	>(null);
	const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const formValues = getProfileFormValues(resolvedCandidateProfile);
		reset({
			...formValues,
			password: userProfile?.authentication?.password ?? formValues.password,
		});
	}, [resolvedCandidateProfile, userProfile, reset]);

	const handleEditPersonal = () => {
		setIsPersonalEditing(true);
	};

	const handleEditDesired = () => {
		setIsDesiredEditing(true);
	};

	const handleUploadPhotoClick = () => {
		profilePhotoInputRef.current?.click();
	};

	const handleProfilePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const nextPreviewUrl = URL.createObjectURL(file);
		setProfilePhotoPreviewUrl((previousUrl) => {
			if (previousUrl) {
				URL.revokeObjectURL(previousUrl);
			}
			return nextPreviewUrl;
		});
		event.target.value = "";
	};

	useEffect(() => {
		return () => {
			if (profilePhotoPreviewUrl) {
				URL.revokeObjectURL(profilePhotoPreviewUrl);
			}
		};
	}, [profilePhotoPreviewUrl]);

	const handleDashboard = async () => {
		if (!userId || isLoading || isFetching) {
			return;
		}

		if (isDirty) {
			const isFormValid = await trigger();
			if (!isFormValid) {
				return;
			}

			const payload = getCandidateProfileUpdatePayload(
				getValues(),
				resolvedCandidateProfile,
			);

			try {
				const updatedProfile = await dispatch(
					saveProfileThunk({ userId, payload }),
				).unwrap();

				reset(getProfileFormValues(updatedProfile));
				setIsPersonalEditing(false);
				setIsDesiredEditing(false);
				navigate(ROUTE_PATHS.candidateDashboard);
			} catch {
				return;
			}

			return;
		}
		navigate(ROUTE_PATHS.candidateDashboard);
	};

	const activeProfilePhotoUrl =
		profilePhotoPreviewUrl ?? resolvedCandidateProfile?.personalDetails?.profileImageUrl ?? null;

	if (!userId) {
		return (
			<Box className={styles.pageRoot}>
				<Typography component="p">
					Unable to load profile because no authenticated user is available.
				</Typography>
			</Box>
		);
	}

	if ((isLoading || isFetching) && !resolvedCandidateProfile) {
		return (
			<Box className={styles.pageRoot}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		const message =
			typeof error === "object" && error !== null && "message" in error
				? String((error as { message?: unknown }).message ?? "Failed to load profile.")
				: "Failed to load profile.";

		return (
			<Box className={styles.pageRoot}>
				<Alert severity="error">{message}</Alert>
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
								maxLength={10}
							/>
							<ProfileSelectField
								control={control}
								name="residentialLocation"
								label="Residential location"
								options={[...PROFILE_SELECT_OPTIONS.residentialLocation]}
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
								options={[...PROFILE_SELECT_OPTIONS.targetedIndustries]}
								disabled={!isDesiredEditing}
							/>
							<ProfileSelectField
								control={control}
								name="preferredLocations"
								label="Preferred location(s)"
								options={[...PROFILE_SELECT_OPTIONS.preferredLocations]}
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
