import { useEffect, useState } from "react";
import api from "../../utils/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null); // stores user data from backend
  const [image, setImage] = useState(null); // stores selected profile image preview

  // Fetch user profile when page loads
  useEffect(() => {
    const dashboard = async () => {
      try {
        const res = await api.get("/dashboard"); // API call to backend
        console.log(res.data); // debug response
        setUser(res.data); // save user data in state
      } catch (err) {
        console.log(err); // error handling
      }
    };

    dashboard(); // call function
  }, []);

  // Handle image upload (frontend preview only)
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // get selected file
    if (file) {
      setImage(URL.createObjectURL(file)); // create temporary URL for preview
    }
  };

  return (
    <div className="main_dashboard">
      {/* Dashboard title */}
      <h1 className="title">User Dashboard</h1>

      {/* Only show content when user is loaded */}
      {user && (
        <div className="dashboard_container">
          {/* ================= PROFILE CARD ================= */}
          <div className="profile_card">
            {/* Profile Image Section */}
            <div className="profile_image_box">
              {/* Profile image preview */}
              <img
                src={
                  image ||
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23e0e0e0'/%3E%3Ccircle cx='60' cy='45' r='20' fill='%23bdbdbd'/%3E%3C/svg%3E" // default image
                }
                alt="profile"
                className="profile_img"
              />

              {/* Upload button */}
              <label className="upload_btn">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>

            {/* User basic info */}
            <h2>{user.full_name}</h2>
            <p>{user.email}</p>
          </div>

          {/*  INFO CARD */}
          <div className="info_card">
            {/* Each row shows label + value */}
            <p>
              <span>Full Name:</span> {user.full_name}
            </p>
            <p>
              <span>Email:</span> {user.email}
            </p>
            <p>
              <span>Address:</span> {user.address}
            </p>
            <p>
              <span>Phone:</span> {user.phone}
            </p>
            <p>
              <span>Created At:</span> {user.created_at}
            </p>
            <p>
              <span>Updated At:</span> {user.updated_at}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
