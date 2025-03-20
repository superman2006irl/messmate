import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

const EditUserModal = ({
  isOpen,
  onClose,
  user,
  updateUserField,
  ranks,
  units,
  roles,
  currentUserRole, // The role of the logged-in user
}) => {
  const [editableUser, setEditableUser] = useState(user);

  useEffect(() => {
    setEditableUser(user); // Sync state when modal opens
  }, [user]);

  if (!editableUser) return null;

  const handleInputChange = (field, value) => {
    setEditableUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleSaveChanges = () => {
    Object.keys(editableUser).forEach((field) => {
      if (editableUser[field] !== user[field]) {
        updateUserField(user.id, field, editableUser[field]);
      }
    });

    onClose();
  };

  // ✅ Ensure `currentUserRole` is always a string
  const normalizedCurrentUserRole = (currentUserRole || "").toLowerCase();

  const isSuperAdmin = normalizedCurrentUserRole === "super admin";
  const isMessExecutive = [
    "mess president",
    "mess secretary",
    "mess treasurer",
  ].some((role) => normalizedCurrentUserRole.includes(role));
  const isEditingSuperAdmin =
    (editableUser.role || "").toLowerCase() === "super admin";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h3 className="text-xl font-bold mb-4">Edit User</h3>

        {/* Army No */}
        <label className="block text-sm font-semibold">Army No:</label>
        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={editableUser.armyNo || ""}
          onChange={(e) => handleInputChange("armyNo", e.target.value)}
        />

        {/* First Name */}
        <label className="block text-sm font-semibold">First Name:</label>
        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={editableUser.firstName || ""}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
        />

        {/* Surname */}
        <label className="block text-sm font-semibold">Surname:</label>
        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={editableUser.surname || ""}
          onChange={(e) => handleInputChange("surname", e.target.value)}
        />

        {/* Email */}
        <label className="block text-sm font-semibold">Email:</label>
        <input
          type="email"
          className="border p-2 w-full mb-2"
          value={editableUser.email || ""}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />

        {/* Rank Dropdown */}
        <label className="block text-sm font-semibold">Rank:</label>
        <select
          className="border p-2 w-full mb-2"
          value={editableUser.rank || ""}
          onChange={(e) => handleInputChange("rank", e.target.value)}
        >
          {ranks.map((rank) => (
            <option key={rank} value={rank}>
              {rank}
            </option>
          ))}
        </select>

        {/* Unit Dropdown */}
        <label className="block text-sm font-semibold">Unit:</label>
        <select
          className="border p-2 w-full mb-2"
          value={editableUser.unit || ""}
          onChange={(e) => handleInputChange("unit", e.target.value)}
        >
          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        {/* Role Dropdown */}
        <label className="block text-sm font-semibold">Role:</label>
        <select
          className="border p-2 w-full mb-2"
          value={editableUser.role || ""}
          onChange={(e) => handleInputChange("role", e.target.value)}
          disabled={isMessExecutive && isEditingSuperAdmin && !isSuperAdmin}
        >
          {roles
            .filter(
              (role) =>
                isSuperAdmin
                  ? true // ✅ Super Admins see all roles
                  : role.toLowerCase() !== "super admin" // ❌ Mess Executives can't assign Super Admin
            )
            .map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
        </select>

        {/* Save & Close Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleSaveChanges}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default EditUserModal;
