import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // Import Firestore database
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { Link, useNavigate } from "react-router-dom";
import { ranks, units } from "../constants/globalData";

const Register = () => {
  const [armyNo, setArmyNo] = useState("");
  const [rank, setRank] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [unit, setUnit] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Register the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Save user details in Firestore `users` collection
      await setDoc(doc(db, "users", user.uid), {
        armyNo,
        rank,
        firstName,
        surname,
        unit,
        email,
        role: "Temp", // Default role
        createdAt: new Date(), // Timestamp
      });

      alert("Registration Successful!");
      navigate("/login"); // Redirect to login after successful registration
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">MessMate</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Army No."
            value={armyNo}
            onChange={(e) => setArmyNo(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />

          <select
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          >
            <option value="">Select Rank</option>
            {ranks.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />

          <input
            type="text"
            placeholder="Surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />

          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />

          <button className="w-full bg-green-500 text-white p-2 rounded mt-2">
            Register
          </button>
        </form>
        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
