"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { submitTriage } from "@/lib/api";
import { SymptomEntry, TriageRequest, VitalsInput } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const emptySymptom: SymptomEntry = {
  symptom: "",
  severity: "mild",
  duration: "",
  onset: "gradual",
};

const steps = [
  "Patient",
  "Symptoms",
  "Vitals",
  "History",
  "Review",
];

export function SymptomForm() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [patient, setPatient] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "",
  });

  const [chiefComplaint, setChiefComplaint] = useState("");

  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([
    { ...emptySymptom },
  ]);

  const [vitals, setVitals] = useState({
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    temperature_f: "",
    oxygen_saturation: "",
  });

  const [history, setHistory] = useState({
    medical_history: "",
    current_medications: "",
    allergies: "",
  });

  function updateSymptom(
    index: number,
    field: keyof SymptomEntry,
    value: string
  ) {
    setSymptoms((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addSymptom() {
    setSymptoms((previous) => [...previous, { ...emptySymptom }]);
  }

  function removeSymptom(index: number) {
    setSymptoms((previous) =>
      previous.length === 1
        ? previous
        : previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function validateCurrentStep() {
    setError("");

    if (step === 0) {
      if (!patient.patient_name.trim()) {
        setError("Patient name is required.");
        return false;
      }

      if (!patient.patient_age || Number(patient.patient_age) < 0) {
        setError("Valid patient age is required.");
        return false;
      }

      if (!patient.patient_gender.trim()) {
        setError("Patient gender is required.");
        return false;
      }
    }

    if (step === 1) {
      if (!chiefComplaint.trim()) {
        setError("Chief complaint is required.");
        return false;
      }

      for (const symptom of symptoms) {
        if (!symptom.symptom.trim() || !symptom.duration.trim()) {
          setError("Each symptom needs a name and duration.");
          return false;
        }
      }
    }

    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((previous) => Math.min(previous + 1, steps.length - 1));
  }

  function goBack() {
    setError("");
    setStep((previous) => Math.max(previous - 1, 0));
  }

  function optionalNumber(value: string): number | undefined {
    if (!value.trim()) {
      return undefined;
    }

    return Number(value);
  }

  function buildVitals(): VitalsInput | undefined {
    const parsedVitals: VitalsInput = {
      blood_pressure_systolic: optionalNumber(vitals.blood_pressure_systolic),
      blood_pressure_diastolic: optionalNumber(vitals.blood_pressure_diastolic),
      heart_rate: optionalNumber(vitals.heart_rate),
      temperature_f: optionalNumber(vitals.temperature_f),
      oxygen_saturation: optionalNumber(vitals.oxygen_saturation),
    };

    const hasAnyVital = Object.values(parsedVitals).some(
      (value) => value !== undefined
    );

    return hasAnyVital ? parsedVitals : undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload: TriageRequest = {
      patient_name: patient.patient_name.trim(),
      patient_age: Number(patient.patient_age),
      patient_gender: patient.patient_gender.trim(),
      chief_complaint: chiefComplaint.trim(),
      symptoms,
      vitals: buildVitals(),
      medical_history: history.medical_history.trim() || undefined,
      current_medications: history.current_medications.trim() || undefined,
      allergies: history.allergies.trim() || undefined,
    };

    try {
      const result = await submitTriage(payload);
      router.push(`/triage-result/${result.case_id}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit triage request.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
      <ProgressBar currentStep={step} />

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {step === 0 && (
        <section className="space-y-5">
          <SectionHeader
            title="Patient demographics"
            description="Enter basic patient information for this triage record."
          />

          <div className="grid gap-4 md:grid-cols-3 text-black">
            <TextInput
              label="Patient Name"
              value={patient.patient_name}
              onChange={(value) =>
                setPatient((previous) => ({
                  ...previous,
                  patient_name: value,
                }))
              }
              placeholder="Demo Patient"
            />

            <TextInput
              label="Age"
              type="number"
              value={patient.patient_age}
              onChange={(value) =>
                setPatient((previous) => ({
                  ...previous,
                  patient_age: value,
                }))
              }
              placeholder="45"
            />

            <TextInput
              label="Gender"
              value={patient.patient_gender}
              onChange={(value) =>
                setPatient((previous) => ({
                  ...previous,
                  patient_gender: value,
                }))
              }
              placeholder="Female"
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-5 text-black">
          <SectionHeader
            title="Chief complaint and symptoms"
            description="Add the main complaint and each symptom with severity, duration, and onset."
          />

          <TextArea
            label="Chief Complaint"
            value={chiefComplaint}
            onChange={setChiefComplaint}
            placeholder="Chest pain with sweating and shortness of breath"
          />

          <div className="space-y-4">
            {symptoms.map((symptom, index) => (
              <div key={index} className="rounded-xl border bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    Symptom {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeSymptom(index)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                    disabled={symptoms.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <TextInput
                    label="Symptom"
                    value={symptom.symptom}
                    onChange={(value) =>
                      updateSymptom(index, "symptom", value)
                    }
                    placeholder="Chest pain"
                  />

                  <SelectInput
                    label="Severity"
                    value={symptom.severity}
                    onChange={(value) =>
                      updateSymptom(index, "severity", value)
                    }
                    options={[
                      { label: "Mild", value: "mild" },
                      { label: "Moderate", value: "moderate" },
                      { label: "Severe", value: "severe" },
                    ]}
                  />

                  <TextInput
                    label="Duration"
                    value={symptom.duration}
                    onChange={(value) =>
                      updateSymptom(index, "duration", value)
                    }
                    placeholder="30 minutes"
                  />

                  <SelectInput
                    label="Onset"
                    value={symptom.onset}
                    onChange={(value) =>
                      updateSymptom(index, "onset", value)
                    }
                    options={[
                      { label: "Gradual", value: "gradual" },
                      { label: "Sudden", value: "sudden" },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSymptom}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add Symptom
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-5 text-black">
          <SectionHeader
            title="Vitals"
            description="Vitals are optional, but they improve triage quality when available."
          />

          <div className="grid gap-4 md:grid-cols-5">
            <TextInput
              label="Systolic BP"
              type="number"
              value={vitals.blood_pressure_systolic}
              onChange={(value) =>
                setVitals((previous) => ({
                  ...previous,
                  blood_pressure_systolic: value,
                }))
              }
              placeholder="120"
            />

            <TextInput
              label="Diastolic BP"
              type="number"
              value={vitals.blood_pressure_diastolic}
              onChange={(value) =>
                setVitals((previous) => ({
                  ...previous,
                  blood_pressure_diastolic: value,
                }))
              }
              placeholder="80"
            />

            <TextInput
              label="Heart Rate"
              type="number"
              value={vitals.heart_rate}
              onChange={(value) =>
                setVitals((previous) => ({
                  ...previous,
                  heart_rate: value,
                }))
              }
              placeholder="88"
            />

            <TextInput
              label="Temp °F"
              type="number"
              value={vitals.temperature_f}
              onChange={(value) =>
                setVitals((previous) => ({
                  ...previous,
                  temperature_f: value,
                }))
              }
              placeholder="98.6"
            />

            <TextInput
              label="SpO2 %"
              type="number"
              value={vitals.oxygen_saturation}
              onChange={(value) =>
                setVitals((previous) => ({
                  ...previous,
                  oxygen_saturation: value,
                }))
              }
              placeholder="98"
            />
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5 text-black">
          <SectionHeader
            title="Medical history"
            description="Add relevant history, medications, and allergies if known."
          />

          <TextArea
            label="Medical History"
            value={history.medical_history}
            onChange={(value) =>
              setHistory((previous) => ({
                ...previous,
                medical_history: value,
              }))
            }
            placeholder="Hypertension, diabetes, asthma, prior stroke..."
          />

          <TextArea
            label="Current Medications"
            value={history.current_medications}
            onChange={(value) =>
              setHistory((previous) => ({
                ...previous,
                current_medications: value,
              }))
            }
            placeholder="Lisinopril, metformin..."
          />

          <TextArea
            label="Allergies"
            value={history.allergies}
            onChange={(value) =>
              setHistory((previous) => ({
                ...previous,
                allergies: value,
              }))
            }
            placeholder="None, penicillin..."
          />
        </section>
      )}

      {step === 4 && (
        <section className="space-y-5">
          <SectionHeader
            title="Review and submit"
            description="Confirm the intake details before sending to the AI triage pipeline."
          />

          <ReviewPanel
            patient={patient}
            chiefComplaint={chiefComplaint}
            symptoms={symptoms}
            vitals={vitals}
            history={history}
          />
        </section>
      )}

      <div className="mt-8 flex items-center justify-between border-t pt-5">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || isSubmitting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoadingSpinner label="Running AI triage..." />
            ) : (
              "Submit for Triage"
            )}
          </button>
        )}
      </div>
    </form>
  );
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex justify-between text-xs font-medium text-slate-500">
        {steps.map((label, index) => (
          <span
            key={label}
            className={index <= currentStep ? "text-blue-700" : ""}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-blue-700 transition-all"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 focus:border-blue-600 focus:ring-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReviewPanel({
  patient,
  chiefComplaint,
  symptoms,
  vitals,
  history,
}: {
  patient: {
    patient_name: string;
    patient_age: string;
    patient_gender: string;
  };
  chiefComplaint: string;
  symptoms: SymptomEntry[];
  vitals: Record<string, string>;
  history: Record<string, string>;
}) {
  return (
    <div className="space-y-5 rounded-xl border bg-slate-50 p-5">
      <ReviewSection
        title="Patient"
        items={[
          ["Name", patient.patient_name],
          ["Age", patient.patient_age],
          ["Gender", patient.patient_gender],
        ]}
      />

      <ReviewSection
        title="Chief Complaint"
        items={[["Complaint", chiefComplaint]]}
      />

      <div>
        <h3 className="mb-2 font-semibold text-slate-900">Symptoms</h3>
        <div className="space-y-2">
          {symptoms.map((symptom, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white px-3 py-2 text-sm text-slate-700"
            >
              <strong>{symptom.symptom}</strong> — {symptom.severity},{" "}
              {symptom.duration}, {symptom.onset}
            </div>
          ))}
        </div>
      </div>

      <ReviewSection
        title="Vitals"
        items={[
          ["BP", `${vitals.blood_pressure_systolic || "-"} / ${vitals.blood_pressure_diastolic || "-"}`],
          ["Heart Rate", vitals.heart_rate || "-"],
          ["Temperature", vitals.temperature_f || "-"],
          ["SpO2", vitals.oxygen_saturation || "-"],
        ]}
      />

      <ReviewSection
        title="History"
        items={[
          ["Medical History", history.medical_history || "-"],
          ["Medications", history.current_medications || "-"],
          ["Allergies", history.allergies || "-"],
        ]}
      />
    </div>
  );
}

function ReviewSection({
  title,
  items,
}: {
  title: string;
  items: string[][];
}) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
      <dl className="grid gap-2 text-sm md:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-white px-3 py-2">
            <dt className="text-xs font-medium uppercase text-slate-500">
              {label}
            </dt>
            <dd className="mt-1 text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}