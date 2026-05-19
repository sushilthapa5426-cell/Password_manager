import React from "react";
import { AppWindow, Mail, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import "./AddPassword.css";

const AddPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      application_name: "",
      registered_email: "",
      registered_password: "",
    },
  });

  const onSave = async (data) => {
    const toastId = toast.loading("Saving Your Information...");

    try {
      setLoading(true);
      await api.post("/add-password", data);
      toast.dismiss(toastId);
      toast.success("Information saved successfully!");
      reset();
      navigate("/add-password");
    } catch (err) {
      toast.dismiss(toastId);
      const message =
        err?.response?.data?.message || "Failed to save the information";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="add-password-container">
      <h2 className="form-title">Add New Password</h2>

      <form className="password-form" onSubmit={handleSubmit(onSave)}>
        <div className="form-group">
          <label htmlFor="appName">Application Name:</label>
          <div className="input-box">
            <AppWindow size={20} className="input-icon" />
            <input
              type="text"
              id="appName"
              placeholder="Enter application name"
              {...register("application_name", {
                required: "Application name is required",
                minLength: {
                  value: 3,
                  message: "At least 3 characters required",
                },
              })}
            />
          </div>
          {errors.application_name && (
            <span className="error-message">
              {errors.application_name.message}
            </span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email">Registered Email:</label>
          <div className="input-box">
            <Mail size={20} className="input-icon" />
            <input
              type="email"
              id="email"
              placeholder="Enter registered email "
              {...register("registered_email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter valid email",
                },
              })}
            />
          </div>
          {errors.registered_email && (
            <span className="error-message">
              {errors.registered_email.message}
            </span>
          )}
        </div>
        {/* used password */}
        <div className="form-group">
          <label htmlFor="password">Registered Password:</label>
          <div className="input-box">
            <LockKeyhole size={20} className="input-icon" />
            <input
              type="password"
              id="password"
              placeholder="Enter registered password"
              {...register("registered_password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
          </div>
          {errors.registered_password && (
            <span className="error-message">
              {errors.registered_password.message}
            </span>
          )}
        </div>
        <button type="submit" className="submit_button" disabled={loading}>
          {loading ? "Saving..." : ""}
          Save Information
        </button>
      </form>
    </div>
  );
};

export default AddPassword;
