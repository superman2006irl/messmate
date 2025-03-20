import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const MessSubscriptionModal = ({ isOpen, onClose, user }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2011 },
    (_, i) => currentYear - i
  );
  const [feesData, setFeesData] = useState(user.fees || {});

  const handleCheckboxChange = (year) => {
    setFeesData((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        status: prev[year]?.status === "overseas" ? "" : "overseas",
      },
    }));
  };

  const handleAmountChange = (year, value) => {
    setFeesData((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        amountPaid: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const userRef = doc(db, "subscriptions", user.armyNo);
      await updateDoc(userRef, { fees: feesData });
      onClose();
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          Edit Subscription for {user.firstName} {user.surname}
        </h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2">Year</th>
              <th className="p-2">Overseas</th>
              <th className="p-2">Amount Paid (€)</th>
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year} className="border">
                <td className="p-2 text-center">{year}</td>
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={feesData[year]?.status === "overseas"}
                    onChange={() => handleCheckboxChange(year)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    className="border p-1 w-full"
                    value={feesData[year]?.amountPaid || ""}
                    onChange={(e) => handleAmountChange(year, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleSaveChanges}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Save
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

export default MessSubscriptionModal;
