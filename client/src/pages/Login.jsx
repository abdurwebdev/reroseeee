import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Login = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-8">Sign In</h1>
        <div className="flex flex-col items-center gap-4 mt-6">
          <a
            href="http://localhost:5000/api/auth/google"
            className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-md shadow-lg w-96 justify-center hover:bg-gray-800 transition-all"
          >
            <span className="text-xl">🔵</span> Continue with Google
          </a>
        </div>
        <p className="mt-8 text-gray-400 text-center w-96">Email/password login is disabled. Please use Google to sign in.</p>
        <Footer />
      </div>
    </>
  );
};

export default Login;