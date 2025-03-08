import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProfileView from '../components/profile/ProfileView';

export default function Profile() {
  const { user } = useAuth();
  const { id } = useParams();
  
  // If no ID is provided in the URL, show the current user's profile
  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;
  
  return (
    <div className="page profile-page">
      <div className="container">
        {isOwnProfile ? (
          <h1>My Profile</h1>
        ) : (
          <h1>User Profile</h1>
        )}
        
        <ProfileView 
          userId={profileId} 
          isOwnProfile={isOwnProfile} 
        />
      </div>
    </div>
  );
}