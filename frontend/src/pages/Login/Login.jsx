import { useForm } from "react-hook-form";
// 👉 Handles form state + validation

import { Mail, Lock } from "lucide-react";
// 👉 Icons for UI

import { useNavigate, Link } from "react-router-dom";
// 👉 navigate = redirect user
// 👉 Link = SPA navigation (no page reload)

import api, { saveAuth } from "../../utils/api";
// 👉 api = axios instance (backend requests)
// 👉 saveAuth = store token + user in localStorage

import toast from "react-hot-toast";
// 👉 toast notifications (success/error messages)

import "./Login.css";
// 👉 styling

export default function Login() {
  const navigate = useNavigate();
  // 👉 used to redirect user after login

  // ================= REACT HOOK FORM =================
  const {
    register, //connects input filed with react hook form
    handleSubmit, //handle form submission
    reset, //when user input invalid credentials, it reset the text field with zero word
    formState: { errors }, //stores validation errors
  } = useForm({
    defaultValues: {
      // with invalid credintials
      email: "", // when invalid credintials, it reset email text field
      password: "",
    },
  });

  // ================= LOGIN FUNCTION =================
  const onSubmit = async (data) => {
    // 👉 data = { email, password }

    const loadingToast = toast.loading("Checking credentials...");
    // 👉 shows loading message while request is processing

    try {
      // 👉 send login request to backend
      const res = await api.post("/login", data);

      const { token, user } = res.data;
      // 👉 extract token + user from backend response

      saveAuth(token, user);
      // 👉 store login session in localStorage

      toast.dismiss(loadingToast);
      // 👉 remove loading toast

      toast.success("Login successful!");
      // 👉 success message

      navigate("/dashboard");
      // 👉 redirect user to dashboard
    } catch (err) {
      toast.dismiss(loadingToast);
      // 👉 remove loading toast if error happens

      console.log(err?.response?.status);
      console.log(err?.response?.data?.detail);

      toast.error("Invalid email or password");
      // 👉 error message

      reset();
    }
  };

  return (
    <div className="login-container">
      {/* ================= TOAST CONTAINER IS IN APP.JSX ================= */}

      <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Login</h2>

        {/* ================= EMAIL ================= */}
        <div className="input-group">
          <Mail size={18} className="icon" />
          {/* 👉 email icon */}

          <input
            type="text"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />
        </div>

        {/* 👉 email error */}
        {errors.email && <p className="error">{errors.email.message}</p>}

        {/* ================= PASSWORD ================= */}
        <div className="input-group">
          <Lock size={18} className="icon" />
          {/* 👉 password icon */}

          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Minimum 6 characters",
              },
            })}
          />
        </div>

        {/* 👉 password error */}
        {errors.password && <p className="error">{errors.password.message}</p>}

        {/* ================= LOGIN BUTTON ================= */}
        <button type="submit">Login</button>

        {/* ================= LINKS ================= */}
        <div className="links">
          <Link to="/forgot-password">Forgot Password?</Link>

          <Link to="/register">Signup</Link>
        </div>
      </form>
    </div>
  );
}
