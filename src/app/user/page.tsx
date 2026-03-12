'use client';

import { useState } from "react";
import { createUser, loginUser, isUserLoggedIn, getUserData, logoutUser } from "@/lib/storage"
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";

export default function UserPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedIn());
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSignUp = async (email: string, password: string) => {
    const isCreated = await createUser(email, password);
    if (!isCreated) return;

    setIsLoggedIn(true);
    setShowSignup(false);
  }

  const handleLogin = async (email: string, password: string) => {
    const loggedIn = await loginUser(email, password);
    if (!loggedIn) return;

    setIsLoggedIn(true);
    setShowLogin(false);
  }

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
  }

  if (isLoggedIn) {
    return (
      <>
        <p className="user-email"><span>Email:</span> {getUserData()}</p>
        <button className="btn btn-primary" onClick={() => handleLogout()}>Log Out</button>
      </>
    )
  }

  return (
    <>
      <section className="login">
        <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
          Log In
        </button>
        <button className="btn btn-primary" onClick={() => setShowSignup(true)}>
          Sign Up
        </button>
      </section>
      {showLogin && <LoginForm onSubmit={handleLogin} onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupForm onSubmit={handleSignUp} onClose={() => setShowSignup(false)} />}
    </>
  )
}
