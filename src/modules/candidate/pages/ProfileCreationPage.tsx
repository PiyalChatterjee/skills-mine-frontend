import ProfileCreationWizard from '@/modules/candidate/components/profile-creation/ProfileCreationWizard'
import { usePageTitle } from '@/hooks/usePageTitle'

const ProfileCreationPage = () => {
  usePageTitle('Create Your Profile')
  return <ProfileCreationWizard />
}

export default ProfileCreationPage