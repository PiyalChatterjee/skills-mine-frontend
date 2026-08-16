import styles from '@/modules/candidate/pages/ProfileCreationPage.module.css'
import {
  ProfileCreationJobDetailsSection,
  ProfileCreationPersonalDetailsSection,
} from './ProfileCreationSections'

const ProfileCreationBasicStep = () => {
  return (
    <div className={styles.sectionsStack}>
      <ProfileCreationPersonalDetailsSection />
      <ProfileCreationJobDetailsSection />
    </div>
  )
}

export default ProfileCreationBasicStep