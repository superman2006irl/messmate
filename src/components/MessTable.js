import React, { useState } from "react";
import { FiCheckSquare, FiUserPlus } from "react-icons/fi";
import {
  calculateTotalOwed,
  deletePayment,
  markOverseas,
} from "../utils/messUtils";
import PaymentModal from "./PaymentModal";

const MessTable = ({
  users,
  userRole,
  userUnit,
  markPayment,
  addNewMember,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizedRole = userRole.toLowerCase();

  let filteredUsers = users.filter(
    (user) =>
      user.armyNo.includes(searchQuery) ||
      (user.surname &&
        user.surname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by Army No. or Surname..."
          className="border p-2 w-full md:w-1/2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {normalizedRole.includes("super admin") && (
          <button
            onClick={addNewMember}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 md:mt-0 flex items-center"
          >
            <FiUserPlus className="mr-2" /> Add Member
          </button>
        )}
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-800 text-white text-sm md:text-base">
            <th className="p-2 text-left">Army No.</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left hidden md:table-cell">Rank</th>
            <th className="p-2 text-left hidden md:table-cell">Unit</th>
            <th className="p-2 text-left">Total Owed (€)</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.armyNo} className="border-t text-sm md:text-base">
              <td className="p-2">{user.armyNo}</td>
              <td className="p-2">
                {user.firstName} {user.surname}
              </td>
              <td className="p-2 hidden md:table-cell">{user.rank}</td>
              <td className="p-2 hidden md:table-cell">{user.unit}</td>
              <td className="p-2 text-red-600 font-bold">
                €{calculateTotalOwed(user)}
              </td>
              <td className="p-2 flex space-x-2">
                {(normalizedRole.includes("mess president") ||
                  normalizedRole.includes("mess secretary") ||
                  normalizedRole.includes("mess treasurer") ||
                  normalizedRole.includes("super admin")) && (
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsModalOpen(true);
                    }}
                    className="text-green-500 hover:text-green-700"
                    title="Mark as Paid"
                  >
                    <FiCheckSquare size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Modal */}
      {selectedUser && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          markPayment={markPayment}
          deletePayment={deletePayment}
          markOverseas={markOverseas}
        />
      )}
    </div>
  );
};

export default MessTable;
