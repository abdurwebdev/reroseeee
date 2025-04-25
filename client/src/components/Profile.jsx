import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, { withCredentials: true });
        setUser(response.data.user);
        setEnrolledCourses(response.data.enrolledCourses);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, []);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <h3 className="text-2xl font-bold mt-6">Enrolled Courses</h3>
      {enrolledCourses.length > 0 ? (
        <ul className="mt-4">
          {enrolledCourses.map((course) => (
            <li key={course._id} className="p-3 border-b">{course.name}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">You are not enrolled in any courses yet.</p>
      )}
    </div>
  );
}
