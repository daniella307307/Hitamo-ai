import { KeyboardEvent, useState, CSSProperties } from "react";
import { useAuth } from "../context/AuthContext";

const TEAL = "#1a8a7a";

// ─── Style helpers ────────────────────────────────────────────────────────────

const page: CSSProperties = {
   display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f5f5f5",
    padding:"1em",
    boxSizing: "border-box" as const,
};

const leftPanel: CSSProperties = {
  width: "30%",
  background: TEAL,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 0",
  position: "relative",
  borderRadius: "30px 0 0 30px",
};

const leftContent: CSSProperties = {
  paddingLeft: "40px",
  color: "#fff",
};

const leftTitleStyle: CSSProperties = {
  fontSize: "30px",
  fontWeight: 800,
  marginBottom: "12px",
  lineHeight: 1.2,
};

const leftSubStyle: CSSProperties = {
  fontSize: "15px",
  opacity: 0.8,
  maxWidth: "200px",
  lineHeight: 1.6,
  
};

const illustrationStyle: CSSProperties = {
  marginTop: "40px",
  width: "160px",
  height: "160px",
};

const rightPanel: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  background: "#fff",
  padding: "40px",
  borderRadius: "0 30px 30px 0",
};

const card: CSSProperties = {
  width: "100%",
  maxWidth: "480px",
};

const backBtnStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: TEAL,
  fontWeight: 600,
  fontSize: "14px",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  marginBottom: "32px",
  letterSpacing: "0.02em",
};

const stepIndicatorStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  marginBottom: "32px",
};

const dot = (active: boolean, done: boolean): CSSProperties => ({
  width: active ? "28px" : "10px",
  height: "10px",
  borderRadius: "5px",
  background: active || done ? TEAL : "#ddd",
  transition: "all 0.3s ease",
});

const titleStyle: CSSProperties = {
  fontSize: "30px",
  fontWeight: 800,
  color: "#111",
  marginBottom: "8px",
};

const subtitleStyle: CSSProperties = {
  color: "#888",
  marginBottom: "32px",
  fontSize: "15px",
  lineHeight: 1.6,
};

const fieldGroup: CSSProperties = {
  marginBottom: "20px",
  width: "100%",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "#999",
  marginBottom: "6px",
  fontWeight: 500,
};

const inputWrap = (focused: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  border: `1.5px solid ${focused ? TEAL : "#ddd"}`,
  borderRadius: "12px",
  padding: "14px 16px",
  background: "#fafafa",
  transition: "border-color 0.2s",
});

const inputStyle: CSSProperties = {
  flex: 1,
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: "15px",
  color: "#333",
};

const otpRow: CSSProperties = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  marginBottom: "8px",
};

const otpInput = (focused: boolean): CSSProperties => ({
  width: "56px",
  height: "64px",
  textAlign: "center",
  fontSize: "22px",
  fontWeight: 700,
  border: `2px solid ${focused ? TEAL : "#ddd"}`,
  borderRadius: "14px",
  background: "#fafafa",
  outline: "none",
  color: "#111",
  transition: "border-color 0.2s",
});

const resendStyle: CSSProperties = {
  textAlign: "center",
  fontSize: "13px",
  color: "#aaa",
  marginBottom: "28px",
};

const resendBtn: CSSProperties = {
  color: TEAL,
  fontWeight: 700,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "13px",
};

const btn = (disabled: boolean): CSSProperties => ({
  width: "100%",
  background: disabled ? "#aaa" : TEAL,
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  padding: "18px",
  fontSize: "16px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "background 0.2s",
  marginTop: "8px",
});

const errorStyle: CSSProperties = {
  color: "#e53e3e",
  fontSize: "13px",
  marginTop: "4px",
  marginLeft: "4px",
};

const successBox: CSSProperties = {
  textAlign: "center",
  padding: "20px 0",
};

const successIcon: CSSProperties = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "#e8f5f3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const ArrowLeft = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#bbb" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

interface EyeIconProps {
  open: boolean;
  onClick: () => void;
}

const EyeIcon = ({ open, onClick }: EyeIconProps) => (
  <svg
    onClick={onClick}
    width="18"
    height="18"
    fill="none"
    stroke="#bbb"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
    style={{ cursor: "pointer" }}
  >
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

const CheckIcon = () => (
  <svg width="40" height="40" fill="none" stroke={TEAL} strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// ─── Left panel illustration ──────────────────────────────────────────────────

interface LeftIllustrationProps {
  step: number;
}

const LeftIllustration = ({ step }: LeftIllustrationProps) => {
  if (step === 0) return (
    <svg viewBox="0 0 160 160" style={illustrationStyle}>
      <circle cx="80" cy="80" r="60" fill="rgba(255,255,255,0.1)" />
      <rect x="40" y="55" width="80" height="60" rx="8" fill="rgba(255,255,255,0.2)" />
      <path d="M40 65l40 28 40-28" stroke="#fff" strokeWidth="2" fill="none" />
      <circle cx="80" cy="40" r="14" fill="rgba(255,255,255,0.25)" />
      <path d="M74 40l4 4 8-8" stroke="#fff" strokeWidth="2" fill="none" />
    </svg>
  );
  if (step === 1) return (
    <svg viewBox="0 0 160 160" style={illustrationStyle}>
      <circle cx="80" cy="80" r="60" fill="rgba(255,255,255,0.1)" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={28 + i * 28} y="62" width="20" height="36" rx="6" fill="rgba(255,255,255,0.25)" />
      ))}
      <path d="M50 100 Q80 120 110 100" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
  return (
    <svg viewBox="0 0 160 160" style={illustrationStyle}>
      <circle cx="80" cy="80" r="60" fill="rgba(255,255,255,0.1)" />
      <rect x="48" y="60" width="64" height="50" rx="8" fill="rgba(255,255,255,0.2)" />
      <rect x="58" y="50" width="16" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <rect x="86" y="50" width="16" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <circle cx="80" cy="90" r="8" fill="rgba(255,255,255,0.4)" />
      <rect x="78" y="90" width="4" height="10" rx="2" fill={TEAL} />
    </svg>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────

interface StepMeta {
  label: string;
}

const STEPS: StepMeta[] = [
  { label: "Email" },
  { label: "OTP" },
  { label: "Reset" },
];

interface LeftCopy {
  title: string;
  sub: string;
}

const LEFT_COPY: LeftCopy[] = [
  { title: "Forgot Your\nPassword?", sub: "No worries! Enter your email and we'll send you a reset code." },
  { title: "Check Your\nInbox",       sub: "We've sent a 4-digit code to your email address." },
  { title: "Almost\nThere!",          sub: "Create a new strong password to secure your account." },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ForgotPasswordPageProps {
  onBack?: () => void;
}

interface FieldErrors {
  new: string;
  confirm: string;
}

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [step, setStep]                   = useState<number>(0);
  const [email, setEmail]                 = useState<string>("");
  const [emailFocused, setEmailFocused]   = useState<boolean>(false);
  const [emailError, setEmailError]       = useState<string>("");

  const [otp, setOtp]                     = useState<string[]>(["", "", "", ""]);
  const [otpFocused, setOtpFocused]       = useState<number>(-1);
  const [otpError, setOtpError]           = useState<string>("");

  const [newPassword, setNewPassword]         = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNew, setShowNew]                 = useState<boolean>(false);
  const [showConfirm, setShowConfirm]         = useState<boolean>(false);
  const [pwFocused, setPwFocused]             = useState<string>("");
  const [pwErrors, setPwErrors]               = useState<FieldErrors>({ new: "", confirm: "" });
  const { passwordReset , resetPassword} = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [done, setDone]       = useState<boolean>(false);

  // Step 0 – send OTP
  const handleSendOtp = async (): Promise<void> => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setEmailError("");
    setLoading(true);
    const response = await passwordReset(email);
    localStorage.setItem('ver', email); // Store email as verification token for demo purposes
    setLoading(false);
    setStep(1);
  };

  // Step 1 – verify OTP
  const handleVerifyOtp = async (): Promise<void> => {
    if (otp.some((d) => d === "")) {
      setOtpError("Please enter the full 4-digit code");
      return;
    }
    setOtpError("");
    setLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1000)); // Simulate API call
    setLoading(false);
    setStep(2);
  };

  const handleOtpChange = (val: string, idx: number): void => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) {
      (document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null)?.focus();
    }
  };

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number): void => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      (document.getElementById(`otp-${idx - 1}`) as HTMLInputElement | null)?.focus();
    }
  };

  // Step 2 – reset password
  const handleReset = async (): Promise<void> => {
    const errors: FieldErrors = { new: "", confirm: "" };
    if (newPassword.length < 8) errors.new = "Password must be at least 8 characters";
    if (newPassword !== confirmPassword) errors.confirm = "Passwords do not match";
    setPwErrors(errors);
    if (errors.new || errors.confirm) return;
    setLoading(true);
    const ver = localStorage.getItem('ver') || '';
    await resetPassword(ver, newPassword);
    setLoading(false);
    setDone(true);
  };

  const handleBack = (): void => {
    if (step === 0) {
        if (onBack) onBack();
        navigation.navigate("/login");
    } else {
      setStep((s) => s - 1);
    }
  };

  const copy: LeftCopy = LEFT_COPY[step];

  return (
    <div style={page}>
      {/* LEFT PANEL */}
      <div style={leftPanel}>
        <div style={leftContent}>
          <p style={leftTitleStyle}>
            {copy.title.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </p>
          <p style={leftSubStyle}>{copy.sub}</p>
          <LeftIllustration step={step} />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={rightPanel}>
        <div style={card}>

          {/* Back button */}
          <button style={backBtnStyle} onClick={handleBack}>
            <ArrowLeft />
            {step === 0 ? "Back to Login" : "Go Back"}
          </button>

          {/* Step indicator */}
          <div style={stepIndicatorStyle}>
            {STEPS.map((_, i) => (
              <div key={i} style={dot(i === step, i < step)} />
            ))}
          </div>

          {/* ── STEP 0: Email ── */}
          {step === 0 && !done && (
            <>
              <h1 style={titleStyle}>Reset Password</h1>
              <p style={subtitleStyle}>
                Enter the email associated with your account and we'll send a verification code.
              </p>

              <div style={fieldGroup}>
                <label style={labelStyle}>Email Address</label>
                <div style={inputWrap(emailFocused)}>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="danieaa@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendOtp(); }}
                  />
                  <MailIcon />
                </div>
                {emailError && <p style={errorStyle}>{emailError}</p>}
              </div>

              <button style={btn(loading)} onClick={handleSendOtp} disabled={loading}>
                {loading ? "SENDING..." : "SEND CODE"}
              </button>
            </>
          )}

          {/* ── STEP 1: OTP ── */}
          {step === 1 && !done && (
            <>
              <h1 style={titleStyle}>Enter Code</h1>
              <p style={subtitleStyle}>
                We sent a 4-digit code to{" "}
                <strong style={{ color: "#333" }}>{email}</strong>. It expires in 10 minutes.
              </p>

              <div style={otpRow}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    style={otpInput(otpFocused === i)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    onFocus={() => setOtpFocused(i)}
                    onBlur={() => setOtpFocused(-1)}
                  />
                ))}
              </div>

              {otpError && (
                <p style={{ ...errorStyle, textAlign: "center", marginBottom: "12px" }}>{otpError}</p>
              )}

              <p style={resendStyle}>
                Didn't receive it?{" "}
                <button style={resendBtn} onClick={() => alert("Code resent!")}>
                  Resend Code
                </button>
              </p>

              <button style={btn(loading)} onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "VERIFYING..." : "VERIFY CODE"}
              </button>
            </>
          )}

          {/* ── STEP 2: New Password ── */}
          {step === 2 && !done && (
            <>
              <h1 style={titleStyle}>New Password</h1>
              <p style={subtitleStyle}>Create a strong password you haven't used before.</p>

              <div style={fieldGroup}>
                <label style={labelStyle}>New Password</label>
                <div style={inputWrap(pwFocused === "new")}>
                  <input
                    style={inputStyle}
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setPwFocused("new")}
                    onBlur={() => setPwFocused("")}
                  />
                  <EyeIcon open={showNew} onClick={() => setShowNew((v) => !v)} />
                </div>

                {/* Password strength bar */}
                {newPassword.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        style={{
                          flex: 1,
                          height: "4px",
                          borderRadius: "2px",
                          background:
                            newPassword.length >= lvl * 2
                              ? lvl <= 1 ? "#e53e3e"
                              : lvl <= 2 ? "#ed8936"
                              : lvl <= 3 ? "#ecc94b"
                              : TEAL
                              : "#eee",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                )}
                {pwErrors.new && <p style={errorStyle}>{pwErrors.new}</p>}
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={inputWrap(pwFocused === "confirm")}>
                  <input
                    style={inputStyle}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setPwFocused("confirm")}
                    onBlur={() => setPwFocused("")}
                    onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }}
                  />
                  <EyeIcon open={showConfirm} onClick={() => setShowConfirm((v) => !v)} />
                </div>
                {pwErrors.confirm && <p style={errorStyle}>{pwErrors.confirm}</p>}
              </div>

              <button style={btn(loading)} onClick={handleReset} disabled={loading}>
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </>
          )}

          {/* ── SUCCESS ── */}
          {done && (
            <div style={successBox}>
              <div style={successIcon}><CheckIcon /></div>
              <h1 style={{ ...titleStyle, textAlign: "center" }}>Password Reset!</h1>
              <p style={{ ...subtitleStyle, textAlign: "center" }}>
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <button style={btn(false)} onClick={() => onBack?.()}>
                BACK TO LOGIN
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}