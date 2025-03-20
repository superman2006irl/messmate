import React, { useEffect, useState } from "react";
import MessTable from "../components/MessTable";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { fetchMessUsers, markPayment } from "../utils/messUtils";
import { ranks, units } from "../constants/globalData";

const MessManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userUnit, setUserUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    armyNo: "",
    firstName: "",
    surname: "",
    rank: "",
    unit: "",
    joinedDate: "",
    fees: {
      [new Date().getFullYear()]: {
        status: "",
        promotedDate: "",
        joinedDate: "",
      },
    },
  });

  useEffect(() => {
    const loadUsers = async () => {
      const usersList = await fetchMessUsers();
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
          setUserRole(userSnap.data().role);
          setUserUnit(userSnap.data().unit);
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
    return <p>Loading mess data...</p>;
  }

  if (!userRole) {
    return <p>Error: Unable to retrieve user role.</p>;
  }

  // Function to handle payment updates
  const handleMarkPayment = async (armyNo, year, amount, paymentMethod) => {
    await markPayment(armyNo, year, amount, paymentMethod);
    // Refresh user list after payment update
    const updatedUsers = await fetchMessUsers();
    setUsers(updatedUsers);
  };

  const normalizedRole = userRole.toLowerCase();
  const isAuthorized =
    normalizedRole.includes("super admin") ||
    ["mess president", "mess secretary", "mess treasurer"].some((role) =>
      normalizedRole.includes(role)
    );

  const filteredUsers = users.filter((user) => {
    if (normalizedRole === "super admin") {
      return true;
    }
    if (
      ["mess president", "mess secretary", "mess treasurer"].some((role) =>
        normalizedRole.includes(role)
      )
    ) {
      return normalizedRole.includes("pte")
        ? ["PTE", "Gnr", "Sgm", "Trp"].includes(user.rank)
        : ["Sgt Maj", "BQMS/RQMS", "CS/BS", "CQMS/BQMS", "Sgt", "Cpl"].includes(
            user.rank
          );
    }
    if (normalizedRole.includes("unit manager")) {
      return user.unit === userUnit;
    }
    return false;
  });

  const handleAddMember = async () => {
    if (
      !newMember.armyNo ||
      !newMember.firstName ||
      !newMember.surname ||
      !newMember.rank ||
      !newMember.unit ||
      !newMember.joinedDate
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const userRef = doc(db, "subscriptions", newMember.armyNo);
    await setDoc(userRef, newMember);
    setUsers([...users, newMember]);

    setNewMember({
      armyNo: "",
      firstName: "",
      surname: "",
      rank: "",
      unit: "",
      joinedDate: "",
      fees: {},
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mess Management</h2>

      {isAuthorized && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add New Member
        </button>
      )}

      <MessTable
        users={filteredUsers}
        searchQuery={searchQuery}
        userRole={userRole}
        userUnit={userUnit}
        markPayment={handleMarkPayment}
      />

      {/* New Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-bold mb-4">Add New Member</h3>
            <label className="block text-sm font-semibold">Army No:</label>
            <input
              type="text"
              className="border p-2 w-full mb-2"
              value={newMember.armyNo}
              onChange={(e) =>
                setNewMember({ ...newMember, armyNo: e.target.value })
              }
            />

            <label className="block text-sm font-semibold">First Name:</label>
            <input
              type="text"
              className="border p-2 w-full mb-2"
              value={newMember.firstName}
              onChange={(e) =>
                setNewMember({ ...newMember, firstName: e.target.value })
              }
            />

            <label className="block text-sm font-semibold">Surname:</label>
            <input
              type="text"
              className="border p-2 w-full mb-2"
              value={newMember.surname}
              onChange={(e) =>
                setNewMember({ ...newMember, surname: e.target.value })
              }
            />

            <label className="block text-sm font-semibold">Rank:</label>
            <select
              className="border p-2 w-full mb-2"
              value={newMember.rank}
              onChange={(e) =>
                setNewMember({ ...newMember, rank: e.target.value })
              }
            >
              <option value="">Select Rank</option>
              {ranks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>

            <label className="block text-sm font-semibold">Unit:</label>
            <select
              className="border p-2 w-full mb-2"
              value={newMember.unit}
              onChange={(e) =>
                setNewMember({ ...newMember, unit: e.target.value })
              }
            >
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            <label className="block text-sm font-semibold">Joined Date:</label>
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={newMember.joinedDate}
              onChange={(e) =>
                setNewMember({ ...newMember, joinedDate: e.target.value })
              }
            />

            <div className="flex space-x-2">
              <button
                onClick={handleAddMember}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              >
                Add Member
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessManagement;
