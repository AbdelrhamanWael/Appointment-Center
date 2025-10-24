import React, { useEffect, useState } from "react";
import { Edit, Trash2, Eye, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../Firebaseconfig";

// ---------------- Firestore Helpers ---------------- //
export const addDoctor = async (doctorData) => {
  try {
    if (!doctorData.name || !doctorData.email || !doctorData.specialization) {
      throw new Error("Missing required fields");
    }

    const docRef = await addDoc(collection(db, "Doctors"), {
      ...doctorData,
      experience: doctorData.experience
        ? parseInt(doctorData.experience, 10)
        : 0,
      active: doctorData.active !== undefined ? doctorData.active : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding doctor:", error);
    return { success: false, error: error.message };
  }
};

export const getAllDoctors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Doctors"));
    const doctors = [];
    querySnapshot.forEach((d) => doctors.push({ id: d.id, ...d.data() }));
    return { success: true, data: doctors };
  } catch (error) {
    console.error("Firebase Error (getAllDoctors):", error);
    return { success: false, error: error.message || "Failed to load doctors" };
  }
};

export const getDoctorById = async (id) => {
  try {
    const ref = doc(db, "Doctors", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { success: true, data: { id: snap.id, ...snap.data() } };
    }
    return { success: false, error: "No such doctor!" };
  } catch (error) {
    console.error("Firebase Error (getDoctorById):", error);
    return { success: false, error: error.message };
  }
};

export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const ref = doc(db, "Doctors", doctorId);
    await updateDoc(ref, {
      ...doctorData,
      experience: doctorData.experience
        ? parseInt(doctorData.experience, 10)
        : 0,
      active: doctorData.active !== undefined ? doctorData.active : true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor:", error);
    return { success: false, error: error.message };
  }
};

export const deleteDoctor = async (doctorId) => {
  try {
    await deleteDoc(doc(db, "Doctors", doctorId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return { success: false, error: error.message };
  }
};

// ---------------- DoctorsTable Component ---------------- //
export default function DoctorsTable() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await getAllDoctors();
      if (res.success) {
        const activeDoctors = res.data.filter(
          (doctor) => doctor.active !== false
        );
        setDoctors(activeDoctors);
      } else {
        toast.error("Error loading doctors: " + res.error);
      }
    } catch (err) {
      console.error("Unexpected error in loadDoctors:", err);
      toast.error("Unexpected error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleInfo = (doctor) => {
    setSelectedDoctor(doctor);
    setShowInfoModal(true);
  };

  const handleEdit = (doctor) => {
    navigate("/dashboard/add-doctor", { state: { editing: true, doctor } });
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      const res = await deleteDoctor(doctorId);
      if (res.success) {
        await loadDoctors();
        toast.success("Doctor deleted successfully!");
      } else {
        toast.error("Error deleting doctor: " + res.error);
      }
    }
  };

  // ---------------- Render ---------------- //
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Name",
                "Email",
                "Phone",
                "Department",
                "Specialization",
                "Experience",
                "Active",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {doctor.name}
                </td>
                <td className="px-4 py-3 text-gray-700 break-all">
                  {doctor.email}
                </td>
                <td className="px-4 py-3 text-gray-700">{doctor.phone}</td>
                <td className="px-4 py-3 text-gray-700">
                  {doctor.department || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {doctor.specialization || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {doctor.experience || 0}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.active !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {doctor.active !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInfo(doctor)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center"
                    >
                      <Eye size={14} className="mr-1" /> Info
                    </button>
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs flex items-center"
                    >
                      <Edit size={14} className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center"
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doctor.active !== false
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {doctor.active !== false ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Email:</strong> {doctor.email}
              </p>
              <p>
                <strong>Phone:</strong> {doctor.phone}
              </p>
              <p>
                <strong>Department:</strong> {doctor.department || "—"}
              </p>
              <p>
                <strong>Specialization:</strong> {doctor.specialization || "—"}
              </p>
              <p>
                <strong>Experience:</strong> {doctor.experience || 0} years
              </p>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => handleInfo(doctor)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center"
              >
                <Eye size={14} className="mr-1" /> Info
              </button>
              <button
                onClick={() => handleEdit(doctor)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs flex items-center"
              >
                <Edit size={14} className="mr-1" /> Edit
              </button>
              <button
                onClick={() => handleDelete(doctor.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center"
              >
                <Trash2 size={14} className="mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Modal */}
      {showInfoModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Doctor Details
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm md:text-base">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Name", selectedDoctor.name],
                  ["Email", selectedDoctor.email],
                  ["Phone", selectedDoctor.phone],
                  ["Department", selectedDoctor.department],
                  ["Specialization", selectedDoctor.specialization],
                  ["Experience", `${selectedDoctor.experience || "N/A"} years`],
                  ["Gender", selectedDoctor.gender],
                  ["Qualification", selectedDoctor.qualification],
                  ["Consultation Fee", selectedDoctor.consultationFee],
                ].map(([label, value]) => (
                  <div key={label}>
                    <strong>{label}:</strong> {value || "N/A"}
                  </div>
                ))}
              </div>
              <div>
                <strong>Biography:</strong>
                <p className="mt-1 text-gray-700">
                  {selectedDoctor.biography || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
