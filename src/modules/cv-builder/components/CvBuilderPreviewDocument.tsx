import { Box, Typography } from '@mui/material'
import previewHeaderImage from '@/assets/cv-builder/cv-preview-header.png'
import type {
	CareerHistoryEntry,
	Language,
	PersonalDetailsFormState,
	SecondaryEducationEntry,
	SkillEntry,
	TertiaryEducationEntry,
} from '../types/cvBuilder'
import styles from '../pages/CvBuilderPage.module.css'

type CvBuilderPreviewDocumentProps = {
	size: 'compact' | 'full'
	formValues: PersonalDetailsFormState
	careerHistory: CareerHistoryEntry[]
	skills: SkillEntry[]
	tertiaryEducation: TertiaryEducationEntry[]
	secondaryEducation: SecondaryEducationEntry[]
	selectedLanguages: Set<Language>
}

const CvBuilderPreviewDocument = ({
	size,
	formValues,
	careerHistory,
	skills: _skills,
	tertiaryEducation,
	secondaryEducation,
	selectedLanguages,
}: CvBuilderPreviewDocumentProps) => {
	const previewFullName = formValues.fullName || 'Candidate'
	const previewRole = formValues.currentPosition || 'Role not provided'
	const previewCompany = formValues.currentCompany || 'Company not provided'
	const employmentEquityStatus = [formValues.race, formValues.gender].filter(Boolean).join(' ') || 'Not provided'

	const yearsOfExperience = `${Math.max(careerHistory.length, 1)} Years`
	const highestQualification =
		tertiaryEducation.find((entry) => entry.degreeOrCertification.trim())?.degreeOrCertification || 'Not provided'
	const industryExperience =
		careerHistory
			.flatMap((entry) => entry.projects)
			.map((project) => project.trim())
			.filter(Boolean)
			.slice(0, 3)
			.join(', ') || 'Not provided'
	const languageSummary = Array.from(selectedLanguages).join(', ') || 'Not provided'

	const fullDocument = (
		<Box className={`${styles.previewPageDocument} ${size === 'compact' ? styles.previewPageDocumentCompact : ''}`}>
			<Box className={styles.previewPageHeroCard}>
				<Box component="img" src={previewHeaderImage} alt="CV preview header" className={styles.previewPageHeaderImage} />
			</Box>

			<Box className={styles.previewPageBody}>
				<Typography className={styles.previewPageCvTitle}>Curriculum Vitae</Typography>
				<Typography className={styles.previewPageName}>{previewFullName}</Typography>

				<Typography className={styles.previewPageSectionTitle}>Personal Profile</Typography>
				<Box className={styles.previewPageGrid}>
					<Typography>Job Application</Typography>
					<Typography>{previewRole}</Typography>
					<Typography>Full Name</Typography>
					<Typography>{previewFullName}</Typography>
					<Typography>Employment Equity Status</Typography>
					<Typography>{employmentEquityStatus}</Typography>
					<Typography>Disability</Typography>
					<Typography>{formValues.disabilityStatus || 'Not provided'}</Typography>
					<Typography>Nationality</Typography>
					<Typography>{formValues.nationality || 'Not provided'}</Typography>
					<Typography>Residential Location</Typography>
					<Typography>{formValues.residentialLocation || 'Not provided'}</Typography>
					<Typography>Current Company</Typography>
					<Typography>{previewCompany}</Typography>
					<Typography>Current Position</Typography>
					<Typography>{previewRole}</Typography>
					<Typography>Notice Period</Typography>
					<Typography>{formValues.noticePeriod || 'Not provided'}</Typography>
				</Box>

				<Typography className={styles.previewPageSectionTitle}>Candidate Overview</Typography>
				<Box className={styles.previewPageOverviewLines}>
					<Box className={styles.previewPageOverviewRow}>
						<Typography className={styles.previewPageOverviewLabel}>Years of experience</Typography>
						<Typography>Overall: {yearsOfExperience}</Typography>
					</Box>
					<Box className={styles.previewPageOverviewRow}>
						<Typography className={styles.previewPageOverviewLabel}>Highest Qualification</Typography>
						<Typography>{highestQualification}</Typography>
					</Box>
					<Box className={styles.previewPageOverviewRow}>
						<Typography className={styles.previewPageOverviewLabel}>Industry Experience</Typography>
						<Typography>{industryExperience}</Typography>
					</Box>
					<Box className={styles.previewPageOverviewRow}>
						<Typography className={styles.previewPageOverviewLabel}>Languages</Typography>
						<Typography>{languageSummary}</Typography>
					</Box>
				</Box>

				<Typography className={styles.previewPageSectionTitle}>Tertiary Education</Typography>
				<Box className={styles.previewPageEducationHeadingRow}>
					<Typography>Institution</Typography>
					<Typography>Year Completed</Typography>
					<Typography>Degree / Certificate Name</Typography>
				</Box>
				{tertiaryEducation.map((entry) => (
					<Box key={entry.id} className={styles.previewPageEducationRow}>
						<Typography>{entry.institutionName || 'Not provided'}</Typography>
						<Typography>{entry.yearCompleted || 'Not provided'}</Typography>
						<Typography>{entry.degreeOrCertification || 'Not provided'}</Typography>
					</Box>
				))}

				<Typography className={styles.previewPageSectionTitle}>Secondary Education</Typography>
				<Box className={styles.previewPageEducationHeadingRow}>
					<Typography>Institution</Typography>
					<Typography>Year Completed</Typography>
					<Typography>Highest grade passed</Typography>
				</Box>
				{secondaryEducation.map((entry) => (
					<Box key={entry.id} className={styles.previewPageEducationRow}>
						<Typography>{entry.institutionName || 'Not provided'}</Typography>
						<Typography>{entry.yearCompleted || 'Not provided'}</Typography>
						<Typography>{entry.highestGradePassed || 'Not provided'}</Typography>
					</Box>
				))}
			</Box>
		</Box>
	)

	if (size === 'compact') {
		return (
			<Box className={styles.reviewPreviewMiniViewport}>
				<Box className={styles.reviewPreviewMiniScale}>{fullDocument}</Box>
			</Box>
		)
	}

	return fullDocument
}

export default CvBuilderPreviewDocument
