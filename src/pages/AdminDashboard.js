import React, { useEffect, useState } from "react";
import EditUserModal from "../components/EditUserModal";
import UsersTable from "../components/UsersTable";
import { auth, db } from "../firebase"; // Ensure Firebase is imported
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import {
  fetchUsers,
  updateUserField,
  approveUser,
  deleteUser,
} from "../utils/adminUtils";
import { ranks, units, roles } from "../constants/globalData";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("All Users");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userUnit, setUserUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      const usersList = await fetchUsers();
      setUsers(usersList);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const fetchedRole = userSnap.data().role;
          const fetchedUnit = userSnap.data().unit;
          setUserRole(fetchedRole);
          setUserUnit(fetchedUnit);
        } else {
          console.log("❌ User document not found in Firestore.");
        }
      } else {
        setUserRole(null);
        setUserUnit(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading user role...</p>;
  }

  if (!userRole) {
    return <p>Error: Unable to retrieve user role.</p>;
  }

  // ✅ Count the number of new users
  const newUsersCount = users.filter((user) => user.role === "Temp").length;

  const filteredUsers = users.filter((user) =>
    activeTab === "New Users" ? user.role === "Temp" : user.role !== "Temp"
  );

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "New Users" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("New Users")}
        >
          {/* ✅ Show the count of new users dynamically */}
          New Users ({newUsersCount})
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "All Users" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("All Users")}
        >
          All Users
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Army No. or Surname..."
        className="border p-2 mb-4 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <UsersTable
        users={filteredUsers}
        searchQuery={searchQuery}
        userRole={userRole}
        userUnit={userUnit}
        openEditModal={openEditModal}
        approveUser={(userId) => approveUser(userId, setUsers, users)}
        deleteUser={(userId) => deleteUser(userId, setUsers, users)}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        updateUserField={(userId, field, value) =>
          updateUserField(userId, field, value, setUsers, users)
        }
        ranks={ranks}
        units={units}
        roles={roles}
        currentUserRole={userRole}
      />
    </div>
  );
};

export default AdminDashboard;
