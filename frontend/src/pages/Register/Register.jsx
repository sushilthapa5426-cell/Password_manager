import { useForm } from "react-hook-form";
//  handles form validation + submission

import { useState } from "react";
//  used for loading state

import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from "lucide-react";
//  UI icons

import { useNavigate } from "react-router-dom";
//  used to redirect user after successful registration

import api from "../../utils/api";
//  axios instance for backend requests

import toast from "react-hot-toast";
// popup messages (success/error/loading)

import "./Register.css";
// styles

export default function Register() {
  const navigate = useNavigate();
  //  navigation after successful registration

  const [loading, setLoading] = useState(false);
  //  disables button while request is running

  // ================= REACT HOOK FORM =================
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      address: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  //  watch password field to compare with confirm password
  const password = watch("password");

  // used for eye icon to view for password for short duration
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //this show the password when we click in eye botton and close after certain interval
  const handleTogglePassword = (type) => {
    //  show password when clicked
    if (type === "password") {
      setShowPassword(true);

      // hide after 2 seconds
      setTimeout(() => {
        setShowPassword(false);
      }, 1500);
    }

    //  show confirm password when clicked
    if (type === "confirm") {
      setShowConfirmPassword(true);

      //  hide after 2 seconds
      setTimeout(() => {
        setShowConfirmPassword(false);
      }, 1500);
    }
  };
  // ================= SUBMIT FUNCTION =================
  const onSubmit = async (data) => {
    const toastId = toast.loading("Creating account...");
    //  shows loading message immediately when form is submitted

    try {
      setLoading(true);
      //  disable button to prevent multiple clicks

      await api.post("/register", data);
      //  send user data to backend

      toast.dismiss(toastId);
      //  remove loading toast

      toast.success("Account created successfully!");
      //  success message

      navigate("/login");
      //  redirect user to login page
    } catch (err) {
      toast.dismiss(toastId);
      //  remove loading toast on error

      const message = err?.response?.data?.message || "Registration failed";

      toast.error(message);
      //  show backend error or default message
    } finally {
      setLoading(false);
      //  re-enable button
    }
    reset();
  };

  // ================= UI =================
  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Register</h2>

        {/* ================= FULL NAME ================= */}
        <div className="input-group">
          <User size={18} className="icon" />
          {/*  user icon */}

          <input
            placeholder="Full Name"
            {...register("fullName", {
              required: "Full name is required",
              minLength: {
                value: 3,
                message: "At least 3 characters required",
              },
            })}
          />
        </div>

        {/*  error message */}
        {errors.fullName && <p className="error">{errors.fullName.message}</p>}

        {/* ================= ADDRESS ================= */}
        <div className="input-group">
          <MapPin size={18} className="icon" />

          <input
            placeholder="Address"
            {...register("address", {
              required: "Address is required",
            })}
          />
        </div>

        {errors.address && <p className="error">{errors.address.message}</p>}

        {/* ================= PHONE ================= */}
        <div className="input-group">
          <Phone size={18} className="icon" />

          <input
            placeholder="Phone Number"
            {...register("phone", {
              required: "Phone is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Must be 10 digits",
              },
            })}
          />
        </div>

        {errors.phone && <p className="error">{errors.phone.message}</p>}

        {/* ================= EMAIL ================= */}
        <div className="input-group">
          <Mail size={18} className="icon" />

          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter valid email",
              },
            })}
          />
        </div>

        {errors.email && <p className="error">{errors.email.message}</p>}

        {/* ================= PASSWORD ================= */}
        <div className="input-group">
          <Lock size={18} className="icon" />

          <input
            type={showPassword ? "text" : "password"}
            //  toggles between visible and hidden password

            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Minimum 8 characters",
              },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
                message:
                  "Must include uppercase, lowercase, number, special character",
              },
            })}
          />
          {/* ================= EYE ICON ================= */}
          {/* <span
            className="eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
            //  toggles password visibility
            style={{ cursor: "pointer" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span> */}
          <span
            className="eye-icon"
            onClick={() => handleTogglePassword("password")}
            style={{ cursor: "pointer" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {errors.password && <p className="error">{errors.password.message}</p>}

        {/* ================= CONFIRM PASSWORD ================= */}
        <div className="input-group">
          <Lock size={18} className="icon" />

          <input
            // type="password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              required: "Confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          {/* <span
            className="eye-icon"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            // 👉 toggles password visibility
            style={{ cursor: "pointer" }}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span> */}
          <span
            className="eye-icon"
            onClick={() => handleTogglePassword("confirm")}
            style={{ cursor: "pointer" }}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword.message}</p>
        )}

        {/* ================= BUTTON ================= */}
        <button type="submit" disabled={loading}>
          {/* 👉 show loading text when API is running */}
          {loading ? "Registering..." : "Register"}
        </button>

        {/* ================= LINK ================= */}
        <div className="links">
          <a href="/login">Already have an account?</a>
        </div>
      </form>
    </div>
  );
}
