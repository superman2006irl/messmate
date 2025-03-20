import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { parseISO } from "date-fns";

const PaymentModal = ({
  isOpen,
  onClose,
  user,
  markPayment,
  markOverseas,
  deletePayment,
}) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1; // Payments are always for the previous year

  const [year, setYear] = useState(lastYear);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isOverseas, setIsOverseas] = useState(false);
  const [validYears, setValidYears] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (user) {
      // Extract the joined year correctly
      const joinedYear = user.joinedDate
        ? parseInt(user.joinedDate.split("-")[0]) // Extract year from joinedDate
        : 2012; // Default to 2012 if no joinedDate exists

      // Ensure start year is at least 2012
      const startYear = Math.max(joinedYear, 2012);

      // ✅ Generate valid years from `startYear` to `lastYear`
      let availableYears = Array.from(
        { length: lastYear - startYear + 1 },
        (_, i) => startYear + i
      );

      // **🚀 Exempt members who joined on/after October 1st**
      availableYears = availableYears.filter(
        (yr) => !isExempt(user.joinedDate, yr)
      );

      setValidYears(availableYears);
      if (availableYears.length > 0) {
        setYear(availableYears[availableYears.length - 1]); // Default to latest available year
      }

      // ✅ Generate Payment History Table Data
      const history = availableYears.map((yr) => ({
        year: yr,
        status: user.fees?.[yr]?.status || "Due",
        payments: user.fees?.[yr]?.payments || [], // Ensure payments array exists
        isExempt: isExempt(user.joinedDate, yr),
        isOverseas: user.fees?.[yr]?.status === "overseas",
      }));

      setPaymentHistory(history);
    }
  }, [user]);

  /**
   * Function to check if a member is **exempt** for a given year.
   * Exempt if they **joined on or after October 1st**.
   */
  const isExempt = (joinedDate, year) => {
    if (!joinedDate) return false;

    const joinDateObj = parseISO(joinedDate);
    const joinYear = joinDateObj.getFullYear();
    const joinMonth = joinDateObj.getMonth() + 1; // **Months are 0-based, so add 1**

    return joinYear === year && joinMonth >= 10; // ✅ Exempt if joined in October or later
  };

  /**
   * Function to determine **correct fee** based on rank & overseas status
   */
  const getFeeAmount = (year) => {
    const isNCO = [
      "Sgt Maj",
      "BQMS/RQMS",
      "CS/BS",
      "CQMS/BQMS",
      "Sgt",
      "Cpl",
    ].includes(user.rank);
    const fullFee = isNCO ? 20 : 10;

    const payments = user.fees?.[year]?.payments || [];
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return totalPaid >= fullFee
      ? `${fullFee} (Paid)`
      : `${fullFee - totalPaid} Due`;
  };

  const handleSave = async () => {
    if (amount > 0) {
      await markPayment(
        user.armyNo,
        year,
        parseFloat(amount),
        paymentMethod,
        isOverseas
      );

      // ✅ Refresh payment history after saving
      setPaymentHistory((prev) =>
        prev.map((entry) =>
          entry.year === year
            ? {
                ...entry,
                payments: [
                  ...entry.payments,
                  {
                    amount: parseFloat(amount),
                    method: paymentMethod,
                    date: new Date().toISOString().split("T")[0],
                  },
                ],
                status: "Partial",
              }
            : entry
        )
      );

      onClose();
    } else {
      alert("Enter a valid amount.");
    }
  };

  const handleMarkOverseas = async () => {
    const response = await markOverseas(user.armyNo, year);
    if (response.success) {
      setPaymentHistory((prev) =>
        prev.map((entry) =>
          entry.year === year
            ? { ...entry, status: response.updatedFees[year].status }
            : entry
        )
      );
    }
  };

  const handleDeletePayment = async (year, paymentIndex) => {
    if (
      window.confirm(
        `Are you sure you want to delete this payment for ${year}?`
      )
    ) {
      const response = await deletePayment(user.armyNo, year, paymentIndex);
      if (response.success) {
        setPaymentHistory((prev) =>
          prev.map((entry) =>
            entry.year === year
              ? {
                  ...entry,
                  payments: entry.payments.filter((_, i) => i !== paymentIndex),
                  status: entry.payments.length === 1 ? "Due" : entry.status,
                }
              : entry
          )
        );
      }
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
          Payment Breakdown for {user.firstName} {user.surname}
        </h3>

        {/* Payment Breakdown Table */}
        <table className="min-w-full border border-gray-300 mb-4 text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2 text-left">Year</th>
              <th className="p-2 text-left">Amount (€)</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map(
              ({ year, status, isOverseas, payments = [] }) => (
                <tr key={year} className="border-t">
                  <td className="p-2">{year}</td>
                  <td className="p-2">
                    {isOverseas
                      ? `€${getFeeAmount(year, true)} (Overseas)`
                      : `€${getFeeAmount(year, false)}`}
                  </td>
                  <td
                    className={`p-2 ${
                      status === "Paid" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {status}
                  </td>
                  <td className="p-2">
                    {payments.length > 0 ? (
                      <ul>
                        {payments.map((p, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center text-xs border-b py-1"
                          >
                            {p.date}: €{p.amount} ({p.method})
                            <button
                              onClick={() => handleDeletePayment(year, index)}
                              className="text-red-600 ml-2 text-sm font-bold"
                              title="Delete Payment"
                            >
                              ❌
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">No payments yet</span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* Payment Entry */}
        <label className="block text-sm font-semibold">Year:</label>
        <select
          className="border p-2 w-full mb-2"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {validYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <label className="block text-sm font-semibold">Amount (€):</label>
        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <label className="block text-sm font-semibold">Payment Method:</label>
        <select
          className="border p-2 w-full mb-4"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </select>

        {/* ✅ Mark as Overseas Checkbox */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isOverseas}
            onChange={() => setIsOverseas(!isOverseas)}
          />
          <span className="text-sm font-semibold">Mark as Overseas</span>
        </label>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Save Payment
          </button>
          <button
            onClick={handleMarkOverseas}
            className="bg-orange-500 text-white px-4 py-2 rounded w-full"
          >
            Mark Overseas
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

export default PaymentModal;
