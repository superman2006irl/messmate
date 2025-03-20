import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

// Fetch all users from Firestore
export const fetchUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Update a specific field for a user in Firestore
export const updateUserField = async (
  userId,
  field,
  value,
  setUsers,
  users
) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { [field]: value });
  setUsers(
    users.map((user) =>
      user.id === userId ? { ...user, [field]: value } : user
    )
  );
};

// Approve a user by changing their role from Temp to User
export const approveUser = async (userId, setUsers, users) => {
  await updateUserField(userId, "role", "User", setUsers, users);
};

// Delete a user from Firestore
export const deleteUser = async (userId, setUsers, users) => {
  if (window.confirm("Are you sure you want to delete this user?")) {
    await deleteDoc(doc(db, "users", userId));
    setUsers(users.filter((user) => user.id !== userId));
  }
};
