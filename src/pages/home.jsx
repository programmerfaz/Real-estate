// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { auth } from "../firebase";

const Home = () => {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Real Estate App!</h1>
      {userEmail ? (
        <p>You are logged in as: <strong>{userEmail}</strong></p>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
};

export default Home;
