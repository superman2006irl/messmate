import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

// Define Rank Categories
const ncoRanks = ["Sgt Maj", "BQMS/RQMS", "CS/BS", "CQMS/BQMS", "Sgt", "Cpl"];
const privateRanks = ["PTE", "Gnr", "Sgm", "Trp"];

const UsersTable = ({
  users,
  searchQuery,
  userRole,
  userUnit, // The unit of the logged-in user
  openEditModal,
  deleteUser,
}) => {
  const [activeTab, setActiveTab] = useState("NCO Mess");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userRole) {
      setIsLoading(false);
    }
  }, [userRole]);

  /** ✅ Dynamically construct `unitPermission` */
  const normalizedRole = userRole ? userRole.toLowerCase() : "";
  const normalizedUnit = userUnit ? userUnit.toLowerCase() : "none";
  const unitPermission = `${normalizedRole} ${normalizedUnit}`.trim(); // Combines Role + Unit

  useEffect(() => {
    if (
      ["mess president", "mess secretary", "mess treasurer"].some((role) =>
        normalizedRole.includes(role)
      )
    ) {
      setActiveTab(
        normalizedRole.includes("pte") ? "Privates Mess" : "NCO Mess"
      );
    }
  }, [normalizedRole, normalizedUnit]);

  /** ✅ Function to check if the user is a Unit Manager */
  const isUnitManager = () => {
    return normalizedRole.startsWith("unit manager");
  };

  let filteredUsers = users;

  // ✅ Unit Managers should only see users from their assigned unit
  if (isUnitManager()) {
    filteredUsers = users.filter(
      (user) =>
        user.unit.toLowerCase() === normalizedUnit && // Match unit
        (ncoRanks.includes(user.rank) || privateRanks.includes(user.rank)) // See both NCOs & Privates
    );
  }

  // ✅ Mess Presidents, Secretaries, Treasurers should only view their respective mess
  if (
    ["mess president", "mess secretary", "mess treasurer"].some((role) =>
      normalizedRole.includes(role)
    )
  ) {
    filteredUsers = filteredUsers.filter((user) =>
      normalizedRole.includes("pte")
        ? privateRanks.includes(user.rank)
        : ncoRanks.includes(user.rank)
    );
  }

  filteredUsers = filteredUsers.filter(
    (user) =>
      user.armyNo.includes(searchQuery) ||
      (user.surname &&
        user.surname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const ncoUsers = filteredUsers.filter((user) => ncoRanks.includes(user.rank));
  const privateUsers = filteredUsers.filter((user) =>
    privateRanks.includes(user.rank)
  );

  const groupByUnit = (userList) => {
    return userList.reduce((acc, user) => {
      if (!acc[user.unit]) {
        acc[user.unit] = [];
      }
      acc[user.unit].push(user);
      return acc;
    }, {});
  };

  const groupedNCOs = groupByUnit(ncoUsers);
  const groupedPrivates = groupByUnit(privateUsers);

  /** ✅ Function to check if the user can edit/delete */
  const canModifyUsers = (unit) => {
    if (normalizedRole === "super admin") return true;

    // ✅ Mess Presidents, Secretaries, Treasurers can modify users in their own unit
    if (
      ["mess president", "mess secretary", "mess treasurer"].some((role) =>
        normalizedRole.includes(role)
      )
    ) {
      return unit.toLowerCase() === normalizedUnit;
    }

    // ✅ Unit Managers cannot modify users, only view them
    return false;
  };

  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* ✅ Super Admin gets both tabs */}
          {normalizedRole === "super admin" && (
            <div className="flex space-x-4 mb-4">
              <button
                className={`px-4 py-2 rounded ${
                  activeTab === "NCO Mess"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("NCO Mess")}
              >
                NCO Mess
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  activeTab === "Privates Mess"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("Privates Mess")}
              >
                Privates Mess
              </button>
            </div>
          )}

          {/* ✅ Unit Managers see both NCO & Privates, but only in their unit */}
          {isUnitManager() && (
            <h2 className="text-xl font-bold bg-gray-700 text-white p-3">
              Viewing: {userUnit} (NCO & Privates)
            </h2>
          )}

          {/* Show the relevant table based on the active tab */}
          {Object.entries(
            isUnitManager() // ✅ If Unit Manager, show all users in the unit
              ? {
                  [userUnit]: [
                    ...(groupedNCOs[userUnit] || []),
                    ...(groupedPrivates[userUnit] || []),
                  ],
                }
              : activeTab === "Privates Mess"
              ? groupedPrivates
              : groupedNCOs
          ).map(([unit, unitUsers]) => (
            <div key={unit} className="mb-6">
              <h3 className="text-lg font-bold bg-gray-200 p-2">{unit}</h3>
              <table className="min-w-full bg-white border table-fixed">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-2 text-left w-1/6">Army No.</th>
                    <th className="p-2 text-left w-1/6">Name</th>
                    <th className="p-2 text-left w-1/6">Rank</th>
                    <th className="p-2 text-left w-1/6">Role</th>
                    <th className="p-2 text-left w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unitUsers.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">{user.armyNo}</td>
                      <td className="p-2">
                        {user.firstName} {user.surname}
                      </td>
                      <td className="p-2">{user.rank}</td>
                      <td className="p-2">{user.role}</td>
                      <td className="p-2 w-1/6 flex space-x-2">
                        {canModifyUsers(user.unit) && (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-green-500 hover:text-green-700"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default UsersTable;
