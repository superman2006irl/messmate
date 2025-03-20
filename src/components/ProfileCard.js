import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const ProfileCard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-sm mx-auto">
      <h3 className="text-lg font-bold mb-2 text-center">
        Profile Information
      </h3>
      {userData ? (
        <ul className="text-gray-700">
          <li>
            <strong>Army No:</strong> {userData.armyNo}
          </li>
          <li>
            <strong>Rank:</strong> {userData.rank}
          </li>
          <li>
            <strong>Name:</strong> {userData.firstName} {userData.surname}
          </li>
          <li>
            <strong>Unit:</strong> {userData.unit}
          </li>
          <li>
            <strong>Email:</strong> {userData.email}
          </li>
        </ul>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default ProfileCard;
