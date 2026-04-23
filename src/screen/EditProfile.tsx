import { useState, useEffect } from "react";
import {
  profileService,
  TalentProfile,
  UpdateTalentProfilePayload,
  TalentSkill,
  TalentExperience,
  TalentEducation,
  SkillLevel,
  AvailabilityStatus,
} from "../service/profile";

// ── Icons ──────────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const SaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const SpinnerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
    </path>
  </svg>
);

// ── Shared form styles ─────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #e8eaed", fontSize: 13, color: "#202124",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  background: "white", transition: "border-color 0.15s",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#9aa0a6",
  textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5, display: "block",
};
const sectionHeadStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: "#202124",
  borderBottom: "1.5px solid #f1f3f4", paddingBottom: 10, marginBottom: 16,
  display: "flex", alignItems: "center", justifyContent: "space-between",
};

// ── Reusable field ─────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ── Focused input with teal border on focus ────────────────────────────
function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle, borderColor: focused ? "#20b2a0" : "#e8eaed" }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle, resize: "vertical", borderColor: focused ? "#20b2a0" : "#e8eaed" }}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle, cursor: "pointer", borderColor: focused ? "#20b2a0" : "#e8eaed" }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 38, height: 22, borderRadius: 11, position: "relative",
          background: checked ? "#20b2a0" : "#e8eaed", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: "50%", background: "white",
          position: "absolute", top: 3, left: checked ? 19 : 3, transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
      <span style={{ fontSize: 13, color: "#5f6368", fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 8,
        border: "1.5px dashed #20b2a0", background: "transparent",
        color: "#20b2a0", fontSize: 12, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <PlusIcon />{label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 10px", borderRadius: 6, border: "none",
        background: "#fff0f0", color: "#dc2626", fontSize: 11,
        fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
      }}
    >
      <TrashIcon /> Remove
    </button>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────
function FormCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={sectionHeadStyle}>
        <span>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Skill row ──────────────────────────────────────────────────────────
function SkillRow({ skill, onChange, onRemove }: {
  skill: TalentSkill;
  onChange: (s: TalentSkill) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f1f3f4" }}>
      <Input value={skill.name} onChange={v => onChange({ ...skill, name: v })} placeholder="e.g. TypeScript" />
      <Select
        value={skill.level}
        onChange={v => onChange({ ...skill, level: v as SkillLevel })}
        options={[
          { value: "beginner", label: "Beginner" },
          { value: "intermediate", label: "Intermediate" },
          { value: "advanced", label: "Advanced" },
          { value: "expert", label: "Expert" },
        ]}
      />
      <input
        type="number" min={0} max={50}
        value={skill.yearsOfExperience}
        onChange={e => onChange({ ...skill, yearsOfExperience: Number(e.target.value) })}
        placeholder="Yrs"
        style={{ ...inputStyle, width: 70 }}
      />
      <RemoveButton onClick={onRemove} />
    </div>
  );
}

// ── Experience card ────────────────────────────────────────────────────
function ExperienceRow({ exp, onChange, onRemove }: {
  exp: TalentExperience; onChange: (e: TalentExperience) => void; onRemove: () => void;
}) {
  return (
    <div style={{ border: "1.5px solid #f1f3f4", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><RemoveButton onClick={onRemove} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Role">
          <Input value={exp.role} onChange={v => onChange({ ...exp, role: v })} placeholder="e.g. Senior Engineer" />
        </Field>
        <Field label="Company">
          <Input value={exp.company} onChange={v => onChange({ ...exp, company: v })} placeholder="e.g. Andela" />
        </Field>
        <Field label="Start Date">
          <Input type="date" value={exp.startDate.slice(0, 10)} onChange={v => onChange({ ...exp, startDate: v })} />
        </Field>
        <Field label="End Date">
          <Input type="date" value={exp.endDate?.slice(0, 10) ?? ""} onChange={v => onChange({ ...exp, endDate: v || null })} />
        </Field>
        <Field label="Location">
          <Input value={exp.location} onChange={v => onChange({ ...exp, location: v })} placeholder="e.g. Kigali, Rwanda" />
        </Field>
        <Field label="Technologies (comma-separated)">
          <Input
            value={exp.technologies.join(", ")}
            onChange={v => onChange({ ...exp, technologies: v.split(",").map(t => t.trim()).filter(Boolean) })}
            placeholder="Node.js, React, AWS"
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={exp.description} onChange={v => onChange({ ...exp, description: v })} placeholder="Describe your responsibilities and achievements..." rows={3} />
      </Field>
      <Toggle checked={exp.isCurrent} onChange={v => onChange({ ...exp, isCurrent: v, endDate: v ? null : exp.endDate })} label="I currently work here" />
    </div>
  );
}

// ── Education card ─────────────────────────────────────────────────────
function EducationRow({ edu, onChange, onRemove }: {
  edu: TalentEducation; onChange: (e: TalentEducation) => void; onRemove: () => void;
}) {
  return (
    <div style={{ border: "1.5px solid #f1f3f4", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><RemoveButton onClick={onRemove} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Institution">
          <Input value={edu.institution} onChange={v => onChange({ ...edu, institution: v })} placeholder="e.g. University of Rwanda" />
        </Field>
        <Field label="Degree">
          <Input value={edu.degree} onChange={v => onChange({ ...edu, degree: v })} placeholder="e.g. BSc Computer Science" />
        </Field>
        <Field label="Field of Study">
          <Input value={edu.fieldOfStudy} onChange={v => onChange({ ...edu, fieldOfStudy: v })} placeholder="e.g. Computer Science" />
        </Field>
        <Field label="Grade">
          <Input value={edu.grade} onChange={v => onChange({ ...edu, grade: v })} placeholder="e.g. First Class Honours" />
        </Field>
        <Field label="Start Date">
          <Input type="date" value={edu.startDate.slice(0, 10)} onChange={v => onChange({ ...edu, startDate: v })} />
        </Field>
        <Field label="End Date">
          <Input type="date" value={edu.endDate?.slice(0, 10) ?? ""} onChange={v => onChange({ ...edu, endDate: v || null })} />
        </Field>
      </div>
      <Toggle checked={edu.isCurrent} onChange={v => onChange({ ...edu, isCurrent: v, endDate: v ? null : edu.endDate })} label="I am currently studying here" />
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────
interface EditProfileProps {
  /** Called when user clicks Back / after successful save */
  onBack?: () => void;
  /** Called after a successful save with the updated profile */
  onSaved?: (profile: TalentProfile) => void;
}

// ── Main Component ─────────────────────────────────────────────────────
export default function EditProfile({ onBack, onSaved }: EditProfileProps) {
  // ── Form state ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Basic fields
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("open");
  const [expectedSalaryMin, setExpectedSalaryMin] = useState(0);
  const [expectedSalaryMax, setExpectedSalaryMax] = useState(0);
  const [expectedSalaryCurrency, setExpectedSalaryCurrency] = useState("USD");
  const [languagesRaw, setLanguagesRaw] = useState(""); // comma-separated

  // Arrays
  const [skills, setSkills] = useState<TalentSkill[]>([]);
  const [experience, setExperience] = useState<TalentExperience[]>([]);
  const [education, setEducation] = useState<TalentEducation[]>([]);

  // ── Load existing profile ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await profileService.getMyProfile();
        if (cancelled) return;
        setHeadline(p.headline);
        setBio(p.bio);
        setLocation(p.location);
        setLinkedinUrl(p.linkedinUrl);
        setGithubUrl(p.githubUrl);
        setResumeUrl(p.resumeUrl);
        setIsPublic(p.isPublic);
        setAvailabilityStatus(p.availabilityStatus);
        setExpectedSalaryMin(p.expectedSalaryMin);
        setExpectedSalaryMax(p.expectedSalaryMax);
        setExpectedSalaryCurrency(p.expectedSalaryCurrency);
        setLanguagesRaw(p.languages.join(", "));
        setSkills(p.skills);
        setExperience(p.experience);
        setEducation(p.education);
      } catch (err: any) {
        if (!cancelled) setFetchError(err?.message ?? "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload: UpdateTalentProfilePayload = {
        headline, bio, location, linkedinUrl, githubUrl, resumeUrl, isPublic,
        availabilityStatus,
        expectedSalaryMin: Number(expectedSalaryMin),
        expectedSalaryMax: Number(expectedSalaryMax),
        expectedSalaryCurrency,
        languages: languagesRaw.split(",").map(l => l.trim()).filter(Boolean),
        skills,
        experience,
        education,
      };
      const updated = await profileService.updateMyProfile(payload);
      setSaveSuccess(true);
      onSaved?.(updated);
      // auto-dismiss success banner after 3s
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Array helpers ────────────────────────────────────────────────
  const addSkill = () => setSkills(s => [...s, { name: "", level: "intermediate", yearsOfExperience: 1 }]);
  const updateSkill = (i: number, v: TalentSkill) => setSkills(s => s.map((x, j) => j === i ? v : x));
  const removeSkill = (i: number) => setSkills(s => s.filter((_, j) => j !== i));

  const addExperience = () => setExperience(e => [...e, {
    role: "", company: "", description: "", startDate: "", endDate: null,
    isCurrent: false, location: "", technologies: [],
  }]);
  const updateExperience = (i: number, v: TalentExperience) => setExperience(e => e.map((x, j) => j === i ? v : x));
  const removeExperience = (i: number) => setExperience(e => e.filter((_, j) => j !== i));

  const addEducation = () => setEducation(e => [...e, {
    institution: "", degree: "", fieldOfStudy: "", startDate: "",
    endDate: null, isCurrent: false, grade: "",
  }]);
  const updateEducation = (i: number, v: TalentEducation) => setEducation(e => e.map((x, j) => j === i ? v : x));
  const removeEducation = (i: number) => setEducation(e => e.filter((_, j) => j !== i));

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f7f9f9", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>

      {/* ── TOP BAR ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "white", borderBottom: "1px solid #f1f3f4",
        padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e8eaed", background: "white", color: "#5f6368", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <ChevronLeft /> Back
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#202124" }}>Edit Profile</div>
            <div style={{ fontSize: 12, color: "#9aa0a6" }}>Changes are saved to your account</div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 22px",
            borderRadius: 8, border: "none",
            background: saving || loading ? "#9aa0a6" : "#1a7a6e",
            color: "white", fontSize: 13, fontWeight: 700,
            cursor: saving || loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            transition: "background 0.2s",
          }}>
          {saving ? <SpinnerIcon /> : <SaveIcon />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ── BANNERS ── */}
      {saveSuccess && (
        <div style={{ background: "#dcfce7", borderBottom: "1px solid #bbf7d0", padding: "12px 28px", fontSize: 13, fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: 8 }}>
          ✓ Profile saved successfully!
        </div>
      )}
      {saveError && (
        <div style={{ background: "#fee2e2", borderBottom: "1px solid #fecaca", padding: "12px 28px", fontSize: 13, fontWeight: 600, color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>⚠ {saveError}</span>
          <button onClick={() => setSaveError(null)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {loading && (
          <div style={{ background: "white", borderRadius: 14, padding: 40, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ color: "#20b2a0", marginBottom: 12, display: "flex", justifyContent: "center" }}><SpinnerIcon /></div>
            <div style={{ fontSize: 13, color: "#9aa0a6" }}>Loading your profile…</div>
          </div>
        )}

        {fetchError && (
          <div style={{ background: "white", borderRadius: 14, padding: 32, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#202124", marginBottom: 8 }}>Failed to load</div>
            <div style={{ fontSize: 13, color: "#9aa0a6", marginBottom: 20 }}>{fetchError}</div>
            <button onClick={() => window.location.reload()} style={{ padding: "8px 20px", borderRadius: 8, background: "#1a7a6e", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {!loading && !fetchError && (
          <>
            {/* ── BASIC INFO ── */}
            <FormCard title="Basic Information">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Headline">
                  <Input value={headline} onChange={setHeadline} placeholder="e.g. Senior Full-Stack Engineer | 6 Years Experience" />
                </Field>
                <Field label="Bio">
                  <Textarea value={bio} onChange={setBio} placeholder="Tell recruiters about yourself…" rows={4} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Location">
                    <Input value={location} onChange={setLocation} placeholder="e.g. Kigali, Rwanda" />
                  </Field>
                  <Field label="Languages (comma-separated)">
                    <Input value={languagesRaw} onChange={setLanguagesRaw} placeholder="English, Kinyarwanda, French" />
                  </Field>
                </div>
              </div>
            </FormCard>

            {/* ── LINKS ── */}
            <FormCard title="Links & Resume">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="LinkedIn URL">
                  <Input value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/you" />
                </Field>
                <Field label="GitHub URL">
                  <Input value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/you" />
                </Field>
                <Field label="Resume URL">
                  <Input value={resumeUrl} onChange={setResumeUrl} placeholder="https://cdn.yourhost.com/resume.pdf" />
                </Field>
              </div>
            </FormCard>

            {/* ── AVAILABILITY & SALARY ── */}
            <FormCard title="Availability & Salary">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
                <Field label="Availability Status">
                  <Select
                    value={availabilityStatus}
                    onChange={v => setAvailabilityStatus(v as AvailabilityStatus)}
                    options={[
                      { value: "available", label: "Available" },
                      { value: "open", label: "Open to offers" },
                      { value: "not_available", label: "Not available" },
                    ]}
                  />
                </Field>
                <Field label="Currency">
                  <Select
                    value={expectedSalaryCurrency}
                    onChange={setExpectedSalaryCurrency}
                    options={[
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                      { value: "RWF", label: "RWF" },
                      { value: "GBP", label: "GBP" },
                      { value: "KES", label: "KES" },
                    ]}
                  />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Min Salary / month">
                  <input
                    type="number" min={0}
                    value={expectedSalaryMin}
                    onChange={e => setExpectedSalaryMin(Number(e.target.value))}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Max Salary / month">
                  <input
                    type="number" min={0}
                    value={expectedSalaryMax}
                    onChange={e => setExpectedSalaryMax(Number(e.target.value))}
                    style={inputStyle}
                  />
                </Field>
              </div>
              <div style={{ marginTop: 16 }}>
                <Toggle checked={isPublic} onChange={setIsPublic} label="Make my profile public (visible to recruiters)" />
              </div>
            </FormCard>

            {/* ── SKILLS ── */}
            <FormCard
              title="Skills"
              action={<AddButton onClick={addSkill} label="Add skill" />}
            >
              {skills.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#9aa0a6", fontSize: 13 }}>No skills yet — add your first one above.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, marginBottom: 4 }}>
                    {["Skill name", "Level", "Yrs", ""].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</span>
                    ))}
                  </div>
                  {skills.map((s, i) => (
                    <SkillRow key={i} skill={s} onChange={v => updateSkill(i, v)} onRemove={() => removeSkill(i)} />
                  ))}
                </div>
              )}
            </FormCard>

            {/* ── EXPERIENCE ── */}
            <FormCard
              title="Experience"
              action={<AddButton onClick={addExperience} label="Add experience" />}
            >
              {experience.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#9aa0a6", fontSize: 13 }}>No experience added yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {experience.map((e, i) => (
                    <ExperienceRow key={i} exp={e} onChange={v => updateExperience(i, v)} onRemove={() => removeExperience(i)} />
                  ))}
                </div>
              )}
            </FormCard>

            {/* ── EDUCATION ── */}
            <FormCard
              title="Education"
              action={<AddButton onClick={addEducation} label="Add education" />}
            >
              {education.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#9aa0a6", fontSize: 13 }}>No education added yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {education.map((e, i) => (
                    <EducationRow key={i} edu={e} onChange={v => updateEducation(i, v)} onRemove={() => removeEducation(i)} />
                  ))}
                </div>
              )}
            </FormCard>

            {/* ── BOTTOM SAVE ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 40 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "11px 28px",
                  borderRadius: 10, border: "none",
                  background: saving ? "#9aa0a6" : "#1a7a6e",
                  color: "white", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}>
                {saving ? <SpinnerIcon /> : <SaveIcon />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}