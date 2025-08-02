import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState("");
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e) => {
          console.log("email", email);
          e.preventDefault();
          setError("");
          setLoading(true);
          try {
            console.log("email", email);
            const response = await axios.post("http://localhost:8080/auth/login", {
              username: email,
              password: password,
              userType: "ADMIN",
            });
            localStorage.setItem('token', response.data.token); // Store JWT token
            setLoading(false);
            onLogin();
          } catch (err) {
            setLoading(false);
            if (err.response && err.response.data) {
              setError(err.response.data);
            } else {
              setError("Login failed. Please try again.");
            }
          }
        };

        return (
          <div className="flex items-center justify-center min-h-screen bg-orange-500 px-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-semibold mb-6 text-orange-600 text-center">
                Admin Login
              </h2>
              {error && (
                <div className="mb-4 text-red-600 font-medium text-center">
                  {error}
                </div>
              )}
              <label className="block mb-2 font-medium text-gray-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="admin@foodapp.com"
                />
              </label>
              <label className="block mb-4 font-medium text-gray-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="********"
                />
              </label>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-md transition-colors"
                // disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        );
      }
      export default Login;