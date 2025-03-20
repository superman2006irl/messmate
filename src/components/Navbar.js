import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Firestore
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { FiMenu, FiX } from "react-icons/fi"; // Mobile menu icons

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Store user role
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid)); // Fetch role from Firestore
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Set role state
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">MessMate</h1>

        {/* Hamburger Menu Button */}
        <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden sm:flex space-x-4">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>

          {/* Developer Access */}
          {role === "Super Admin" && (
            <>
              <Link to="/admin" className="hover:text-gray-300">
                Admin Panel
              </Link>
              <Link to="/mess-management" className="hover:text-gray-300">
                Mess Management
              </Link>
            </>
          )}

          {/* Mess Admins (NCO & Pte Presidents, Secretaries, Treasurers) */}
          {role?.includes("Mess President") ||
          role?.includes("Mess Secretary") ||
          role?.includes("Mess Treasurer") ? (
            <Link to="/mess-management" className="hover:text-gray-300">
              Mess Management
            </Link>
          ) : null}

          {/* Unit Managers (Read-Only) */}
          {role?.includes("Unit Manager") && (
            <Link to="/unit-dashboard" className="hover:text-gray-300">
              Unit Dashboard
            </Link>
          )}

          {/* Regular Users (Personal Profile) */}
          {role === "User" && (
            <Link to="/profile" className="hover:text-gray-300">
              My Profile
            </Link>
          )}

          {user ? (
            <>
              <span className="text-gray-300">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col mt-2 space-y-2">
          <Link
            to="/"
            className="hover:text-gray-300"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          {/* Developer Access */}
          {role === "Developer" && (
            <>
              <Link
                to="/admin"
                className="hover:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                Admin Panel
              </Link>
              <Link
                to="/mess-management"
                className="hover:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                Mess Management
              </Link>
            </>
          )}

          {/* Mess Admins (NCO & Pte Presidents, Secretaries, Treasurers) */}
          {role?.includes("Mess President") ||
          role?.includes("Mess Secretary") ||
          role?.includes("Mess Treasurer") ? (
            <Link
              to="/mess-management"
              className="hover:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              Mess Management
            </Link>
          ) : null}

          {/* Unit Managers (Read-Only) */}
          {role === "Unit Manager" && (
            <Link
              to="/unit-dashboard"
              className="hover:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              Unit Dashboard
            </Link>
          )}

          {/* Regular Users (Personal Profile) */}
          {role === "User" && (
            <Link
              to="/profile"
              className="hover:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              My Profile
            </Link>
          )}

          {user ? (
            <>
              <span className="text-gray-300">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
