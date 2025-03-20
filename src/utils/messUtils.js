import { db } from "../firebase";
import { parseISO } from "date-fns";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";

/**
 * Function to fetch all mess users (NCOs & Privates) from Firestore
 * @returns {Promise<Array>} - List of users with mess details
 */
export const fetchMessUsers = async () => {
  try {
    const usersCollection = collection(db, "subscriptions");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map((doc) => ({
      armyNo: doc.id,
      ...doc.data(),
    }));

    return usersList;
  } catch (error) {
    console.error("Error fetching mess users:", error);
    return [];
  }
};

/**
 * Function to update a user's subscription status (e.g., Paid, Unpaid)
 * @param {string} armyNo - The unique army number of the user
 * @param {number} year - The subscription year
 * @param {string} status - New subscription status (e.g., "Paid", "Unpaid")
 * @param {number} amount - Amount paid
 * @param {string} updatedBy - Role of the user updating the status
 */

export const deletePayment = async (armyNo, year, paymentIndex) => {
  try {
    const userRef = doc(db, "subscriptions", armyNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User record not found.");
      return { success: false, error: "User record not found." };
    }

    let userData = userSnap.data();
    if (
      !userData.fees ||
      !userData.fees[year] ||
      !userData.fees[year].payments
    ) {
      console.error("No payment record found for the selected year.");
      return { success: false, error: "No payment record found." };
    }

    // ✅ Remove only the selected payment
    userData.fees[year].payments.splice(paymentIndex, 1);

    // ✅ If no payments remain, change status to "Due"
    if (userData.fees[year].payments.length === 0) {
      userData.fees[year].status = "Due";
    }

    // ✅ Update Firestore
    await updateDoc(userRef, { fees: userData.fees });

    console.log(
      `Deleted payment for Army No: ${armyNo}, Year: ${year}, Payment Index: ${paymentIndex}`
    );
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error };
  }
};

export const markOverseas = async (armyNo, year) => {
  try {
    const userRef = doc(db, "subscriptions", armyNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User record not found.");
      return { success: false, error: "User record not found." };
    }

    let userData = userSnap.data();
    if (!userData.fees) {
      userData.fees = {};
    }

    if (!userData.fees[year]) {
      userData.fees[year] = {};
    }

    // ✅ Toggle overseas status
    userData.fees[year].status =
      userData.fees[year].status === "overseas" ? "Due" : "overseas";

    // ✅ Update Firestore
    await updateDoc(userRef, { fees: userData.fees });

    console.log(
      `Updated Army No: ${armyNo} for Year: ${year}, Status: ${userData.fees[year].status}`
    );
    return { success: true, updatedFees: userData.fees };
  } catch (error) {
    console.error("Error marking user as overseas:", error);
    return { success: false, error };
  }
};

export const markPayment = async (
  armyNo,
  year,
  amount,
  paymentMethod,
  isOverseas,
  rank
) => {
  try {
    const userRef = doc(db, "subscriptions", armyNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    let userData = userSnap.data();
    if (!userData.fees) userData.fees = {};
    if (!userData.fees[year]) userData.fees[year] = { payments: [] };

    // ✅ Append the new payment to the payments array
    userData.fees[year].payments.push({
      amount,
      method: paymentMethod,
      date: new Date().toISOString().split("T")[0],
    });

    // ✅ Recalculate total amount paid
    const totalPaid = userData.fees[year].payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const totalOwed = getFeeAmount(year, isOverseas, rank);

    // ✅ Update status if fully paid
    userData.fees[year].status = totalPaid >= totalOwed ? "Paid" : "Partial";

    await updateDoc(userRef, { fees: userData.fees });
  } catch (error) {
    console.error("Error marking payment:", error);
  }
};

export const calculateTotalOwed = (user) => {
  if (!user || !user.fees) return 0;

  const currentYear = new Date().getFullYear();
  let totalOwed = 0;

  let joinedYear = user.joinedDate
    ? new Date(user.joinedDate).getFullYear()
    : 2012;

  if (joinedYear < 2012) {
    joinedYear = 2012;
  }

  for (let year = joinedYear; year < currentYear; year++) {
    const feeData = user.fees?.[year] || {};
    const isOverseas = feeData.status === "overseas";
    const isPromoted =
      feeData.promotedDate &&
      new Date(feeData.promotedDate).getFullYear() === year;

    const joinedDate = user.fees?.[year]?.joinedDate
      ? parseISO(user.fees[year].joinedDate)
      : user.joinedDate
      ? parseISO(user.joinedDate)
      : null;

    const joinedAfterOctober =
      joinedDate &&
      joinedDate.getFullYear() === year &&
      joinedDate.getMonth() >= 9;

    if ((joinedAfterOctober && year === joinedYear) || isPromoted) {
      continue;
    }

    const isNCO = [
      "Sgt Maj",
      "BQMS/RQMS",
      "CS/BS",
      "CQMS/BQMS",
      "Sgt",
      "Cpl",
    ].includes(user.rank);
    let yearlyFee = isNCO ? 20 : 10;
    if (isOverseas) yearlyFee /= 2;

    // ✅ Subtract payments made
    const totalPaid = feeData.payments
      ? feeData.payments.reduce((sum, p) => sum + p.amount, 0)
      : 0;

    if (totalPaid < yearlyFee) {
      totalOwed += yearlyFee - totalPaid;
    }
  }

  return totalOwed;
};

export const getFeeAmount = (year, isOverseas, rank) => {
  const isNCO = [
    "Sgt Maj",
    "BQMS/RQMS",
    "CS/BS",
    "CQMS/BQMS",
    "Sgt",
    "Cpl",
  ].includes(rank);
  const fullFee = isNCO ? 20 : 10;

  return isOverseas ? fullFee / 2 : fullFee; // ✅ Apply 50% discount if overseas
};
