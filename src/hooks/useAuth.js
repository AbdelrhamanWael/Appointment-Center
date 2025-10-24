import { useState, useEffect } from 'react';
import { auth, getUserRole, checkPermission } from '../Firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRole = await getUserRole(user.uid);
        setUser(user);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const hasPermission = async (permission) => {
    if (!user) return false;
    return await checkPermission(user.uid, permission);
  };

  return { user, role, loading, hasPermission };
};
