import { useState, useEffect } from 'react';
import { auth } from '../Firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserRole } from '../Firebaseconfig';
import { ROLES } from '../config/roles';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const role = await getUserRole(user.uid);
        setIsAdmin(role === ROLES.ADMIN);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    // Return the unsubscribe function directly
    return unsubscribe;
  }, []);

  return { isAdmin, loading };
};

// Example usage in a component:
/*
function AdminComponent() {
  const { isAdmin, loading } = useAdmin();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }
  
  return (
    <div>
      // Admin-only content
    </div>
  );
}
*/
