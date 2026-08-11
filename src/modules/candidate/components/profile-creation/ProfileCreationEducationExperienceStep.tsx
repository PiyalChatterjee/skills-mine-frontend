import creationStyles from '@/modules/candidate/pages/ProfileCreationPage.module.css'
import {
  ProfileCreationEducationSection,
  ProfileCreationExperienceSection,
} from './ProfileCreationSections'

const ProfileCreationEducationExperienceStep = () => {
  return (
    <div className={creationStyles.sectionsStack}>
      <ProfileCreationEducationSection />
      <ProfileCreationExperienceSection />
    </div>
  )
}

export default ProfileCreationEducationExperienceStep