import { useState, CSSProperties } from "react";
import toast from "react-hot-toast";
import { jobService, type EmploymentType } from "../service/job";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL       = "#1a7a6e";
const TEAL_DARK  = "#0f6e56";
const TEAL_MID   = "#5dcaa5";
const TEAL_LIGHT = "#e1f5ee";
const FIELD_BG   = "#ffffff";
const PAGE_BG    = "#f5f7f7";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1Data {
  country: string;
  province: string;
  district: string;
  vision: string;
  mission: string;
}

interface Step2Data {
  position: string;
  jobDesc: string;
  responsibilities: string;
  qualifications: string;
  skills: string;
  employmentType: EmploymentType;
  isRemote: boolean;
  salaryMin: string;
  salaryMax: string;
  currency: string;
}

interface Step3Data {
  extraInfo: string;
  docs: string[];
  linkedin: boolean;
  github: boolean;
}

interface Step4Data {
  interview: boolean;
  deadline: string;
  slots: number;
  pipelineStages: string;
  aiCriteria: string;
  notes: string;
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, l: "Company details" },
  { n: 2, l: "Position details" },
  { n: 3, l: "Requirements" },
  { n: 4, l: "Final settings" },
];

const DOCS = ["CV", "Resume", "Portfolio", "Cover letter"];
const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full-time",
  "part-time",
  "contract",
  "internship",
];
const CURRENCIES = ["USD", "RWF", "KES", "UGX", "TZS"];

const splitEntries = (value: string): string[] =>
  value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const buildJobPayload = (
  step1: Step1Data,
  step2: Step2Data,
  step3: Step3Data,
  step4: Step4Data
) => ({
  title: step2.position.trim(),
  description: step2.jobDesc.trim(),
  requirements: [
    ...splitEntries(step2.qualifications),
    ...step3.docs.map((doc) => `${doc} required`),
    ...splitEntries(step3.extraInfo),
  ],
  responsibilities: splitEntries(step2.responsibilities),
  skills: splitEntries(step2.skills),
  location: [step1.district, step1.province, step1.country].filter(Boolean).join(", "),
  isRemote: step2.isRemote,
  employmentType: step2.employmentType,
  salaryMin: step2.salaryMin ? Number(step2.salaryMin) : undefined,
  salaryMax: step2.salaryMax ? Number(step2.salaryMax) : undefined,
  currency: step2.currency,
  applicationDeadline: step4.deadline || undefined,
  aiScreeningEnabled: step4.interview,
  aiScreeningCriteria: step4.interview
    ? step4.aiCriteria.trim() || undefined
    : undefined,
  pipelineStages: splitEntries(step4.pipelineStages),
});

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const BellIcon = () => (
  <svg width="15" height="15" fill="none" stroke="#9aaba8" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" fill="none" stroke="#8fa3a0" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill={TEAL} />
    <path d="M7 10v7M7 7v.5M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#5a7874" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const BigCheckIcon = () => (
  <svg width="26" height="26" fill="none" stroke={TEAL} strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const LogoutIcon      = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>;
// ─── Shared styles ────────────────────────────────────────────────────────────

const fieldLabel: CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  color: "#8fa3a0",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: "5px",
};

const fieldInput: CSSProperties = {
  width: "100%",
  background: FIELD_BG,
  border: `1.5px solid #e4eceb`,
  borderRadius: "10px",
  padding: "11px 14px",
  fontSize: "13px",
  color: "#1a1f1e",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const sectionTitle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#1a1f1e",
  marginBottom: "14px",
  letterSpacing: "-0.1px",
};

const divider: CSSProperties = {
  height: "1px",
  background: "#eaf0ef",
  margin: "16px 0",
};

const grid2: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginBottom: "13px",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: "13px" }}>
    <label style={fieldLabel}>{label}</label>
    {children}
  </div>
);

const TextInput = ({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={fieldInput}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = TEAL;
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,122,110,0.10)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#e4eceb";
      e.currentTarget.style.boxShadow = "none";
    }}
  />
);

const SelectInput = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div style={{ position: "relative" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...fieldInput, appearance: "none", paddingRight: "34px", cursor: "pointer" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = TEAL;
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,122,110,0.10)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e4eceb";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
      <ChevronDown />
    </span>
  </div>
);

const TextArea = ({
  placeholder,
  value,
  onChange,
  rows = 3,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    style={{ ...fieldInput, resize: "vertical", lineHeight: 1.55 }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = TEAL;
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,122,110,0.10)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#e4eceb";
      e.currentTarget.style.boxShadow = "none";
    }}
  />
);

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div
    onClick={onToggle}
    style={{
      width: "42px", height: "23px", borderRadius: "12px",
      background: on ? TEAL : "#d6e0df",
      position: "relative", cursor: "pointer",
      transition: "background 0.2s", flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute", top: "2.5px",
      left: on ? "21.5px" : "2.5px",
      width: "18px", height: "18px", borderRadius: "50%",
      background: "#fff", transition: "left 0.2s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    }} />
  </div>
);

const FooterButtons = ({
  onBack,
  onNext,
  nextLabel = "Continue →",
  isSubmit = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isSubmit?: boolean;
}) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
    {onBack && (
      <button
        onClick={onBack}
        style={{
          background: "#fff", color: "#5a7874",
          border: "1.5px solid #dce8e6", borderRadius: "10px",
          padding: "11px 22px", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#9aaba8")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#dce8e6")}
      >
        ← Back
      </button>
    )}
    <button
      onClick={onNext}
      style={{
        background: isSubmit ? TEAL_DARK : TEAL,
        color: "#fff", border: "none", borderRadius: "10px",
        padding: "11px 32px", fontSize: "13px", fontWeight: 700,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = TEAL_DARK)}
      onMouseLeave={(e) => (e.currentTarget.style.background = isSubmit ? TEAL_DARK : TEAL)}
    >
      {nextLabel}
    </button>
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SubmitFooterButtons = ({
  onBack,
  onNext,
  nextLabel,
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  disabled: boolean;
}) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
    <button
      onClick={onBack}
      disabled={disabled}
      style={{
        background: "#fff",
        color: "#5a7874",
        border: "1.5px solid #dce8e6",
        borderRadius: "10px",
        padding: "11px 22px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      Back
    </button>
    <button
      onClick={onNext}
      disabled={disabled}
      style={{
        background: TEAL_DARK,
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "11px 32px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {nextLabel}
    </button>
  </div>
);

const Sidebar = ({ current }: { current: number }) => (
  <aside style={{
    width: "214px", flexShrink: 0, background: TEAL,
    display: "flex", flexDirection: "column", padding: "28px 0",
  }}>
    <div style={{
      fontSize: "17px", fontWeight: 800, color: "#fff",
      padding: "0 22px 22px", marginBottom: "20px",
      borderBottom: "1px solid rgba(255,255,255,0.13)",
      letterSpacing: "-0.3px",
    }}>
     <button onClick={()=>{}}> H— <span style={{ fontWeight: 400, opacity: 0.6 }}>Hitamo AI</span></button>
    </div>
    <div style={{
      fontSize: "10px", fontWeight: 700, letterSpacing: "1px",
      textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
      padding: "0 22px", marginBottom: "16px",
    }}>
      Hiring process
    </div>
    <div style={{ padding: "0 14px", display: "flex", flexDirection: "column" }}>
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={s.n}>
            <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "0 8px" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, flexShrink: 0,
                background: done ? TEAL_DARK : active ? "#fff" : "transparent",
                border: `2px solid ${done ? TEAL_DARK : active ? "#fff" : "rgba(255,255,255,0.28)"}`,
                color: done ? "#fff" : active ? TEAL : "rgba(255,255,255,0.38)",
                transition: "all 0.25s",
              }}>
                {done ? <CheckIcon /> : s.n}
              </div>
              <span style={{
                fontSize: "13px", transition: "all 0.25s",
                color: done || active ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: done || active ? 600 : 400,
              }}>
                {s.l}
              </span>
            </div>
            {!isLast && (
              <div style={{
                width: "2px", height: "26px", borderRadius: "2px",
                margin: "2px 0 2px 23px",
                background: done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  </aside>
);

// ─── Topbar ───────────────────────────────────────────────────────────────────

const Topbar = () => (
  <div style={{
    background: "#fff", padding: "15px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid #eff1f1", flexShrink: 0,
  }}>
    <div>
      <h1 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1f1e", margin: 0 }}>New hiring process</h1>
      <p style={{ fontSize: "11px", color: "#9aaba8", margin: "2px 0 0" }}>Complete each section to publish your role</p>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <button style={{
        width: "33px", height: "33px", borderRadius: "50%",
        background: "#f0f3f3", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <BellIcon />
        <span style={{
          position: "absolute", top: "6px", right: "6px",
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#e53935", border: "1.5px solid #fff",
        }} />
      </button>
      <div style={{
        width: "33px", height: "33px", borderRadius: "50%",
        background: "linear-gradient(135deg,#f97316,#ef4444)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: "11px", cursor: "pointer",
      }}>
        DA
      </div>
    </div>
  </div>
);

// ─── Step 1 ───────────────────────────────────────────────────────────────────

const Step1 = ({ data, onChange, onNext }: {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  onNext: () => void;
}) => (
  <div>
    <p style={sectionTitle}>Organization location</p>
    <div style={grid2}>
      <FieldGroup label="Country">
        <SelectInput value={data.country} onChange={(v) => onChange({ ...data, country: v })} options={["Rwanda", "Uganda", "Kenya", "Tanzania"]} />
      </FieldGroup>
      <FieldGroup label="Province">
        <SelectInput value={data.province} onChange={(v) => onChange({ ...data, province: v })} options={["Gasabo", "Kicukiro", "Nyarugenge"]} />
      </FieldGroup>
    </div>
    <div style={{ width: "calc(50% - 6px)", marginBottom: "13px" }}>
      <FieldGroup label="District">
        <SelectInput value={data.district} onChange={(v) => onChange({ ...data, district: v })} options={["Gasabo", "Remera", "Kimironko"]} />
      </FieldGroup>
    </div>

    <div style={divider} />

    <p style={sectionTitle}>Vision &amp; mission</p>
    <FieldGroup label="Vision statement">
      <TextArea placeholder="What is your organization striving to achieve long-term?" value={data.vision} onChange={(v) => onChange({ ...data, vision: v })} />
    </FieldGroup>
    <FieldGroup label="Mission statement">
      <TextArea placeholder="How does your organization create value today?" value={data.mission} onChange={(v) => onChange({ ...data, mission: v })} />
    </FieldGroup>

    <FooterButtons onNext={onNext} />
  </div>
);

// ─── Step 2 ───────────────────────────────────────────────────────────────────

const Step2 = ({ data, onChange, onBack, onNext }: {
  data: Step2Data;
  onChange: (d: Step2Data) => void;
  onBack: () => void;
  onNext: () => void;
}) => (
  <div>
    <p style={sectionTitle}>Role information</p>
    <FieldGroup label="Position title">
      <TextInput placeholder="e.g. Senior Product Designer" value={data.position} onChange={(v) => onChange({ ...data, position: v })} />
    </FieldGroup>
    <div style={grid2}>
      <FieldGroup label="Employment type">
        <SelectInput
          value={data.employmentType}
          onChange={(v) => onChange({ ...data, employmentType: v as EmploymentType })}
          options={EMPLOYMENT_TYPES}
        />
      </FieldGroup>
      <FieldGroup label="Work setup">
        <SelectInput
          value={data.isRemote ? "Remote" : "On-site"}
          onChange={(v) => onChange({ ...data, isRemote: v === "Remote" })}
          options={["On-site", "Remote"]}
        />
      </FieldGroup>
    </div>
    <FieldGroup label="Job description">
      <TextArea placeholder="Describe the key responsibilities and day-to-day tasks for this role..." value={data.jobDesc} onChange={(v) => onChange({ ...data, jobDesc: v })} rows={4} />
    </FieldGroup>
    <FieldGroup label="Responsibilities">
      <TextArea
        placeholder="List each responsibility on a new line or separate them with commas..."
        value={data.responsibilities}
        onChange={(v) => onChange({ ...data, responsibilities: v })}
        rows={4}
      />
    </FieldGroup>

    <div style={divider} />

    <p style={sectionTitle}>Candidate expectations</p>
    <FieldGroup label="Required qualifications">
      <TextArea placeholder="e.g. BSc in Computer Science, 3+ years experience..." value={data.qualifications} onChange={(v) => onChange({ ...data, qualifications: v })} />
    </FieldGroup>
    <FieldGroup label="Required skills">
      <TextArea
        placeholder="e.g. React, Figma, stakeholder management..."
        value={data.skills}
        onChange={(v) => onChange({ ...data, skills: v })}
        rows={2}
      />
    </FieldGroup>
    <div style={grid2}>
      <FieldGroup label="Salary minimum">
        <TextInput
          type="number"
          placeholder="e.g. 1200"
          value={data.salaryMin}
          onChange={(v) => onChange({ ...data, salaryMin: v })}
        />
      </FieldGroup>
      <FieldGroup label="Salary maximum">
        <TextInput
          type="number"
          placeholder="e.g. 2500"
          value={data.salaryMax}
          onChange={(v) => onChange({ ...data, salaryMax: v })}
        />
      </FieldGroup>
    </div>
    <div style={{ width: "calc(50% - 6px)" }}>
      <FieldGroup label="Currency">
        <SelectInput
          value={data.currency}
          onChange={(v) => onChange({ ...data, currency: v })}
          options={CURRENCIES}
        />
      </FieldGroup>
    </div>

    <FooterButtons onBack={onBack} onNext={onNext} />
  </div>
);

// ─── Step 3 ───────────────────────────────────────────────────────────────────

const Step3 = ({ data, onChange, onBack, onNext }: {
  data: Step3Data;
  onChange: (d: Step3Data) => void;
  onBack: () => void;
  onNext: () => void;
}) => {
  const toggleDoc = (doc: string) => {
    const docs = data.docs.includes(doc)
      ? data.docs.filter((d) => d !== doc)
      : [...data.docs, doc];
    onChange({ ...data, docs });
  };

  const toggleRow = (
    icon: React.ReactNode,
    label: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "10px 14px", background: "#fff",
      border: "1.5px solid #e4eceb", borderRadius: "10px",
      marginBottom: "9px", cursor: "pointer",
    }} onClick={onToggle}>
      <span style={{ flexShrink: 0, opacity: 0.75 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: "13px", color: "#2d3d3a", fontWeight: 500 }}>{label}</span>
      <Toggle on={value} onToggle={onToggle} />
    </div>
  );

  return (
    <div>
      <p style={sectionTitle}>Required documents</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "13px" }}>
        {DOCS.map((doc) => {
          const on = data.docs.includes(doc);
          return (
            <button
              key={doc}
              onClick={() => toggleDoc(doc)}
              style={{
                borderRadius: "8px", padding: "8px 14px",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                border: `1.5px solid ${on ? TEAL_MID : "#dce8e6"}`,
                background: on ? TEAL_LIGHT : "#fff",
                color: on ? TEAL_DARK : "#5a7874",
              }}
            >
              {doc}
            </button>
          );
        })}
      </div>
      <FieldGroup label="Additional requirements">
        <TextArea placeholder="Any other submission requirements or instructions for applicants..." value={data.extraInfo} onChange={(v) => onChange({ ...data, extraInfo: v })} rows={2} />
      </FieldGroup>

      <div style={divider} />

      <p style={sectionTitle}>Profile scraping</p>
      <p style={{ fontSize: "12px", color: "#9aaba8", marginBottom: "10px" }}>
        Automatically pull candidate data from external profiles
      </p>
      {toggleRow(<LinkedInIcon />, "LinkedIn profiles", data.linkedin, () => onChange({ ...data, linkedin: !data.linkedin }))}
      {toggleRow(<GitHubIcon />, "GitHub activity", data.github, () => onChange({ ...data, github: !data.github }))}

      <FooterButtons onBack={onBack} onNext={onNext} />
    </div>
  );
};

// ─── Step 4 ───────────────────────────────────────────────────────────────────

const Step4 = ({ data, onChange, onBack, onSubmit, isSubmitting }: {
  data: Step4Data;
  onChange: (d: Step4Data) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => {
  const RadioOption = ({
    value,
    title,
    desc,
  }: {
    value: boolean;
    title: string;
    desc: string;
  }) => {
    const on = data.interview === value;
    return (
      <div
        onClick={() => onChange({ ...data, interview: value })}
        style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 14px", background: on ? TEAL_LIGHT : "#fff",
          border: `1.5px solid ${on ? TEAL_MID : "#e4eceb"}`,
          borderRadius: "10px", marginBottom: "9px", cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%",
          border: `2px solid ${on ? TEAL : "#c0d4d1"}`,
          background: on ? TEAL : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.15s",
        }}>
          {on && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fff" }} />}
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1f1e", margin: 0 }}>{title}</p>
          <span style={{ fontSize: "11px", color: "#9aaba8" }}>{desc}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <p style={sectionTitle}>AI virtual interview</p>
      <RadioOption value={true} title="Yes — use AI screening" desc="Candidates complete an AI-led interview before review" />
      <RadioOption value={false} title="No — skip AI screening" desc="Proceed directly to manual review of applications" />

      <div style={divider} />

      <p style={sectionTitle}>Posting details</p>
      <div style={grid2}>
        <FieldGroup label="Application deadline">
          <input
            type="date"
            value={data.deadline}
            onChange={(e) => onChange({ ...data, deadline: e.target.value })}
            style={fieldInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = TEAL;
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,122,110,0.10)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e4eceb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </FieldGroup>
        <FieldGroup label="Open positions">
          <input
            type="number"
            min={1}
            value={data.slots}
            onChange={(e) => onChange({ ...data, slots: parseInt(e.target.value) || 1 })}
            style={fieldInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = TEAL;
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,122,110,0.10)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e4eceb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </FieldGroup>
      </div>
      <FieldGroup label="Pipeline stages">
        <TextArea
          placeholder="e.g. Application Review, Technical Interview, Final Interview..."
          value={data.pipelineStages}
          onChange={(v) => onChange({ ...data, pipelineStages: v })}
          rows={3}
        />
      </FieldGroup>
      {data.interview && (
        <FieldGroup label="AI screening criteria">
          <TextArea
            placeholder="Describe what the AI interview should evaluate..."
            value={data.aiCriteria}
            onChange={(v) => onChange({ ...data, aiCriteria: v })}
            rows={3}
          />
        </FieldGroup>
      )}
      <FieldGroup label="Internal notes">
        <TextArea placeholder="Optional notes visible only to your hiring team..." value={data.notes} onChange={(v) => onChange({ ...data, notes: v })} rows={2} />
      </FieldGroup>

      <SubmitFooterButtons
        onBack={onBack}
        onNext={onSubmit}
        nextLabel={isSubmitting ? "Publishing..." : "Publish process"}
        disabled={isSubmitting}
      />
    </div>
  );
};

// ─── Success screen ───────────────────────────────────────────────────────────

const SuccessScreen = ({ positionName, onReset }: { positionName: string; onReset: () => void }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: "40px 30px", height: "100%",
  }}>
    <div style={{
      width: "54px", height: "54px", borderRadius: "50%",
      background: TEAL_LIGHT, display: "flex",
      alignItems: "center", justifyContent: "center", marginBottom: "18px",
    }}>
      <BigCheckIcon />
    </div>
    <p style={{ fontSize: "18px", fontWeight: 700, color: "#1a1f1e", marginBottom: "8px" }}>
      Process published!
    </p>
    <p style={{ fontSize: "13px", color: "#9aaba8", marginBottom: "24px", maxWidth: "280px", lineHeight: 1.6 }}>
      Your hiring process for{" "}
      <strong style={{ color: TEAL }}>{positionName || "this role"}</strong>{" "}
      is live and accepting applications.
    </p>
    <button
      onClick={onReset}
      style={{
        background: TEAL, color: "#fff", border: "none",
        borderRadius: "10px", padding: "11px 32px",
        fontSize: "13px", fontWeight: 700, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      Start another process
    </button>
  </div>
);

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Hire() {
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step1, setStep1] = useState<Step1Data>({
    country: "Rwanda", province: "Gasabo", district: "Gasabo",
    vision: "", mission: "",
  });
  const [step2, setStep2] = useState<Step2Data>({
    position: "",
    jobDesc: "",
    responsibilities: "",
    qualifications: "",
    skills: "",
    employmentType: "full-time",
    isRemote: false,
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
  });
  const [step3, setStep3] = useState<Step3Data>({
    extraInfo: "", docs: ["Resume", "Cover letter"],
    linkedin: true, github: true,
  });
  const [step4, setStep4] = useState<Step4Data>({
    interview: true,
    deadline: "",
    slots: 1,
    pipelineStages: "Application Review\nHiring Team Review",
    aiCriteria: "",
    notes: "",
  });

  const scrollStyle: CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "20px 22px 24px",
  };

  const handlePublish = async () => {
    const payload = buildJobPayload(step1, step2, step3, step4);
    const salaryMin = payload.salaryMin;
    const salaryMax = payload.salaryMax;

    if (!payload.title) {
      toast.error("Position title is required.");
      setStep(2);
      return;
    }

    if (!payload.description) {
      toast.error("Job description is required.");
      setStep(2);
      return;
    }

    if (!payload.responsibilities.length) {
      toast.error("Add at least one responsibility.");
      setStep(2);
      return;
    }

    if (!payload.requirements.length) {
      toast.error("Add at least one qualification or requirement.");
      setStep(3);
      return;
    }

    if (!payload.skills.length) {
      toast.error("Add at least one skill.");
      setStep(2);
      return;
    }

    if (!payload.pipelineStages.length) {
      toast.error("Add at least one pipeline stage.");
      setStep(4);
      return;
    }

    if (Number.isNaN(salaryMin) || Number.isNaN(salaryMax)) {
      toast.error("Salary fields must be valid numbers.");
      setStep(2);
      return;
    }

    if (
      typeof salaryMin === "number" &&
      typeof salaryMax === "number" &&
      salaryMin > salaryMax
    ) {
      toast.error("Salary minimum cannot be greater than salary maximum.");
      setStep(2);
      return;
    }

    if (payload.aiScreeningEnabled && !payload.aiScreeningCriteria) {
      toast.error("Add AI screening criteria or switch off AI screening.");
      setStep(4);
      return;
    }

    setIsSubmitting(true);

    try {
      await jobService.createJob(payload);
      toast.success("Hiring process published successfully.");
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to publish hiring process.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: TEAL, fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d0dbd9; border-radius: 4px; }
      `}</style>

      <Sidebar current={submitted ? 5 : step} />

      <main style={{
        flex: 1, background: PAGE_BG,
        borderRadius: "0 24px 24px 0",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <Topbar />

        {submitted ? (
          <SuccessScreen
            positionName={step2.position}
            onReset={() => { setSubmitted(false); setStep(1); }}
          />
        ) : (
          <div style={scrollStyle}>
            {step === 1 && (
              <Step1 data={step1} onChange={setStep1} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
              <Step2 data={step2} onChange={setStep2} onBack={() => setStep(1)} onNext={() => setStep(3)} />
            )}
            {step === 3 && (
              <Step3 data={step3} onChange={setStep3} onBack={() => setStep(2)} onNext={() => setStep(4)} />
            )}
            {step === 4 && (
              <Step4
                data={step4}
                onChange={setStep4}
                onBack={() => setStep(3)}
                onSubmit={handlePublish}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
