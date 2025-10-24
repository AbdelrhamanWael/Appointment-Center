// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";


import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { ROLES, PERMISSIONS  } from './config/roles';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBohl10msdM0t6kilIXSMq7BWiUI17Ol8s",
  authDomain: "appoiment-center.firebaseapp.com",
  databaseURL: "https://appoiment-center-default-rtdb.firebaseio.com",
  projectId: "appoiment-center",
  storageBucket: "appoiment-center.firebasestorage.app",
  messagingSenderId: "261277053551",
  appId: "1:261277053551:web:d0aac1422fb7325afad39a",   
  measurementId: "G-N6H732Y8RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;
    
    // Check if user exists in Firestore
    const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
    
    // If user doesn't exist, create a new user document
    if (userDoc.empty) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || '',
        role: ROLES.USER,
        createdAt: Timestamp.now()
      });
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { success: false, error };
  }
};

export default app;

export const registerUser = async (email, password, profile = {}, role = ROLES.USER) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email,
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      role,
      createdAt: Timestamp.now()
    });
    return { success: true, user };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error };
  }
};

export const loginUser = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, error };
  }
};

export const getUserRole = async (uid) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData.role;
    }
    return ROLES.USER; // default role
  } catch (error) {
    console.error("Error getting user role:", error);
    return ROLES.USER;
  }
};

export const checkPermission = async (uid, permission) => {
  try {
    const role = await getUserRole(uid);
    const rolePermissions = PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error };
  }
};

export const getUserData = async (uid) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const createAppointment = async (appointmentData, uid) => {
  const appointmentsRef = collection(db, "appointments");
  const doctorsRef = doc(db, "Doctors", appointmentData.doctorId || "unknown");
  
  try {
    // Add appointment with fee
    const newAppointmentRef = doc(appointmentsRef);
    const fee = Number(appointmentData.fee) || 50; // Ensure numeric fee with default
    
    await setDoc(newAppointmentRef, {
      ...appointmentData,
      uid,
      patientId: appointmentData.patientId || uid,
      status: appointmentData.status || 'pending',
      fee: fee,
      paid: false, // Track if the fee is paid
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Update doctor's active status and last active time
    if (appointmentData.doctorId) {
      await updateDoc(doctorsRef, {
        isActive: true,
        lastActive: Timestamp.now()
      });
    }
    
    return { success: true, appointmentId: newAppointmentRef.id };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error };
  }
};

// Mark appointment as paid
export const markAppointmentAsPaid = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      paid: true,
      paidAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking appointment as paid:", error);
    return { success: false, error };
  }
};

// Get total revenue
export const getTotalRevenue = async () => {
  try {
    const q = query(collection(db, "appointments"), where("paid", "==", true));
    const querySnapshot = await getDocs(q);
    let total = 0;
    querySnapshot.forEach((snap) => {
      total += Number(snap.data().fee) || 0;
    });
    return { success: true, total };
  } catch (error) {
    console.error("Error calculating revenue:", error);
    return { success: false, error };
  }
};

// Get active doctors (active within last 30 days)
export const getActiveDoctors = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const q = query(
      collection(db, "doctors"),
      where("lastActive", ">=", Timestamp.fromDate(thirtyDaysAgo))
    );
    const querySnapshot = await getDocs(q);
    return { success: true, count: querySnapshot.size };
  } catch (error) {
    console.error("Error getting active doctors:", error);
    return { success: false, error };
  }
};
