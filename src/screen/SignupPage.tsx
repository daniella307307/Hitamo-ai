import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const TEAL = "#1a8a7a";
const TEAL_DARK = "#156b5e";
const TEAL_LIGHT = "#e8f5f3";

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f5f5f5",
    padding: "1em",
    boxSizing: "border-box" as const,
  },
  leftPanel: {
    width: "40%" as const,
    background: TEAL,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "30px 0 0 30px",
  },
  tab: (active: any) => ({
    background: active ? "#fff" : "transparent",
    color: active ? "#222" : "#fff",
    borderRadius: active ? "30px 0 0 30px" : "0",
    padding: "20px 40px 20px 32px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "8px",
    alignSelf: "flex-end",
    width: "80%",
    border: "none",
    textAlign: "left",
    letterSpacing: "0.01em",
  }),
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "0 30px 30px 0",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#111",
    marginBottom: "6px",
  },
  subtitle: {
    color: "#888",
    marginBottom: "36px",
    fontSize: "15px",
  },
  fieldGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#999",
    marginBottom: "4px",
    fontWeight: "500",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #ddd",
    borderRadius: "12px",
    padding: "12px 16px",
    background: "#fafafa",
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "15px",
    color: "#333",
  },
  icon: {
    color: "#bbb",
    fontSize: "18px",
    marginLeft: "8px",
  },
  forgot: {
    color: TEAL,
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "0.05em",
    textDecoration: "none",
    cursor: "pointer",
    display: "block",
    marginBottom: "28px",
    background: "none",
    border: "none",
    padding: 0,
  },
  loginBtn: {
    width: "100%",
    background: TEAL,
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "18px",
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  error: {
    color: "#e53e3e",
    fontSize: "13px",
    marginTop: "4px",
    marginLeft: "4px",
  },
  globalError: {
    color: "#e53e3e",
    textAlign: "center" as const,
    fontSize: "14px",
    marginTop: "16px",
  },
};

// Icons as simple SVG components
const MailIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#bbb" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#bbb" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#bbb" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="4" />
    <path d="M2 21c0-5.523 4.477-10 10-10s10 4.477 10 10" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" fill="none" stroke="#bbb" strokeWidth="1.8" viewBox="0 0 24 24" style={{ cursor: "pointer" }}>
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const PhoneIcon = () => (
    <svg width="18" height="18" fill="none" stroke="#bbb" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.21 5.18 2 2 0 0 1 5.23 3h3a2 2 0 0 1 2 1.72c.13 1.21.37 2.39.72 3.53a2 2 0 0 1-.45 1.95l-2.11 2.11a16 16 0 0 0 6.58 6.58l2.11-2.11a2 2 0 0 1 1.95-.45c1.14.35 2.32.59 3.53.72A2 2 0 0 1 22 16.92z" />
    </svg>
);

export default function SignupPage() {
  const [tab, setTab] = useState("signup"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" , firstName:"", lastName:"", phone:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const errors = { email: "", password: "", firstName: "", lastName: "", phone: "" };
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!firstName) errors.firstName = "First Name is required";
    if (!lastName) errors.lastName = "Last Name is required";
    if (!phone) errors.phone = "Phone is required";
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setError("");
    setLoading(true);
    try {
      // Replace with your auth logic
      await register(email, password, firstName, lastName);
      navigate("/dashboard"); // Redirect after successful signup
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return "Weak";
    if (pwd.length < 10) return "Medium";
    return "Strong";
    };
    const getPasswordColor = (strength: string) => {
    switch (strength) {
        case "Weak":
        return "#e53e3e";
        case "Medium":
        return "#d69e2e";
        case "Strong":
        return "#38a169";
        default:
        return "#bbb";
    }
    };
     const passwordStrength = checkPasswordStrength(password);
    const passwordColor = getPasswordColor(passwordStrength);

    const confirmPass = (password:string, confirmPassword:string) => {
        if (password !== confirmPassword) {
            return "Passwords do not match";
        }
        return "";
    };

  return (
    <div style={styles.page}>
      {/* LEFT PANEL */}
      <div style={styles.leftPanel as any}>
        <button style={styles.tab(tab === "login") as any} onClick={() => { setTab("login"); navigate("/login"); }}>
          Login
        </button>
        <button style={styles.tab(tab === "signup") as any} onClick={() => { setTab("signup"); navigate("/signup"); }}>
          Sign Up
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome</h1>
          <p style={styles.subtitle}>enter your details</p>
          <div>
            {/* First Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>First Name</label>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Daniella"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <UserIcon />
              </div>
              {fieldErrors.firstName && <p style={styles.error}>{fieldErrors.firstName}</p>}
            </div>
            {/* Last Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Last Name</label>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Ganza"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <UserIcon />
              </div>
              {fieldErrors.lastName && <p style={styles.error}>{fieldErrors.lastName}</p>}
            </div>
           
          </div>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type="email"
                placeholder="danieaa@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MailIcon />
            </div>
            {fieldErrors.email && <p style={styles.error}>{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="xxxxxxxxxxxx"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                <EyeIcon open={showPassword} />
              </span>
            </div>
            {fieldErrors.password && <p style={styles.error}>{fieldErrors.password}</p>}
          </div>
          {/* Confirm Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="xxxxxxxxxxxx"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                <EyeIcon open={showPassword} />
              </span>
            </div>
            {fieldErrors.password && <p style={styles.error}>{fieldErrors.password}</p>}
          </div>
          
              {/* Phone */}
            <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone</label>
                <div style={styles.inputWrap}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="+1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <PhoneIcon />
                </div>
                {fieldErrors.phone && <p style={styles.error}>{fieldErrors.phone}</p>}
            </div>

          
          {/* Login Button */}
          <button
            style={{
              ...styles.loginBtn,
              background: loading ? TEAL_DARK : TEAL,
              opacity: loading ? 0.8 : 1,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "SIGN UP"}
          </button>

          {error && <p style={styles.globalError}>{error}</p>}
        </div>
      </div>
    </div>
  );
}