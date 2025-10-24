import { useEffect, useState } from 'react';
import { auth } from '../Firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserRole } from '../Firebaseconfig';
import { ROLES } from '../config/roles';

export const usePermissions = (requiredPermission) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        const role = await getUserRole(user.uid);
        setUserRole(role);
        
        // Check permissions based on role
        const permissions = {
          [ROLES.ADMIN]: ['all'], // Admins have all permissions
          [ROLES.DOCTOR]: [
            'view:patients',
            'view:appointments',
            'update:appointments',
            'view:profile',
            'update:profile'
          ],
          [ROLES.USER]: [
            'view:appointments',
            'book:appointment',
            'view:profile',
            'update:profile',
            'cancel:appointment'
          ]
        };

        const hasRequiredPermission = 
          permissions[role]?.includes('all') || 
          permissions[role]?.includes(requiredPermission) || 
          false;
          
        setHasPermission(hasRequiredPermission);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [requiredPermission]);

  return { hasPermission, loading, userRole };
};

// Example usage in a component:
// Example usage in a component:
/*
function SomeComponent() {
  const { hasPermission, loading } = usePermissions('edit:patients');
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!hasPermission) {
    return <div>You don't have permission to view this content.</div>;
  }
  
  return (
    <div>
      // Protected content
    </div>
  );
}
*/
