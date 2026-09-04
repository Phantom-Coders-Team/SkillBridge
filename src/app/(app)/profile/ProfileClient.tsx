"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, CheckCircle, FileText, Loader2, Trash2, Upload, User, X } from "lucide-react";
import { updateProfileAction, uploadDocumentAction, deleteDocumentAction, type ProfileState } from "./actions";
import { Avatar, Card, CardHeader } from "@/components/ui";

interface ProfileDoc {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
}

interface ProfileData {
  name: string;
  email: string;
  role: string;
  bio: string;
  phone: string;
  location: string;
  department: string;
  collegeName: string;
  year: number | null;
  rollNumber: string;
  skills: string;
  avatarUrl: string | null;
  documents: ProfileDoc[];
  institutionType: string;
  establishedYear: number | null;
  websiteUrl: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  naacGrade: string;
  nbaAccredited: boolean;
  aicteApproved: boolean;
  principalName: string;
  tpoName: string;
  tpoPhone: string;
  totalStudents: number | null;
  totalFaculty: number | null;
  departments: string;
  affiliatedUniversity: string;
  coursesOffered: string;
  ugcRecognized: boolean;
  admissionContact: string;
  admissionPhone: string;
  averagePlacementRate: number | null;
  highestPackage: string;
  averagePackage: string;
  facilities: string;
  motto: string;
  vision: string;
}

export default function ProfileClient({ profile }: { profile: ProfileData }) {
  const [state, setState] = useState<ProfileState | null>(null);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(profile.avatarUrl);
  const [hasRemoved, setHasRemoved] = useState(false);
  const [docState, setDocState] = useState<ProfileState | null>(null);
  const [docPending, setDocPending] = useState(false);
  const [deletePending, setDeletePending] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const docFormRef = useRef<HTMLFormElement>(null);

  const isInstitution =
    profile.role === "Institution" ||
    profile.role === "Institutions" ||
    profile.role === "INSTITUTION";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setHasRemoved(false);
  }

  function handleRemovePhoto() {
    setPreview(null);
    setHasRemoved(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (hasRemoved) {
      formData.set("avatar", "");
    }
    startTransition(async () => {
      try {
        const result = await updateProfileAction(null, formData);
        setState(result);
      } catch {
        setState({ error: "Profile update failed. Please try again." });
      }
    });
  }

  function handleDocUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setDocPending(true);
    uploadDocumentAction(null, formData)
      .then((result) => {
        setDocState(result);
        if (docFormRef.current) docFormRef.current.reset();
      })
      .catch(() => {
        setDocState({ error: "Upload failed. Please try a smaller file." });
      })
      .finally(() => {
        setDocPending(false);
      });
  }

  function handleDeleteDoc(id: string) {
    setDeletePending(id);
    deleteDocumentAction(id).finally(() => setDeletePending(null));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <User aria-hidden className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Profile</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">View and edit your personal information and documents.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Avatar card */}
        <Card className="flex flex-col items-center px-6 py-8">
          {preview ? (
            <img
              src={preview}
              alt={profile.name}
              className="size-28 rounded-full object-cover ring-4 ring-white shadow-lg dark:ring-slate-900"
            />
          ) : (
            <Avatar name={profile.name} size="lg" />
          )}
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{profile.name}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            {profile.role}
          </span>
          {profile.department && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {profile.department}
              {profile.year ? ` - Year ${profile.year}` : ""}
            </p>
          )}
          {profile.collegeName && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {profile.collegeName}
            </p>
          )}
          {isInstitution && profile.institutionType && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {profile.institutionType}
            </p>
          )}
          {profile.rollNumber && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Roll: {profile.rollNumber}</p>
          )}
        </Card>

        <div className="space-y-6">
          {/* Edit form */}
          <Card>
            <CardHeader title="Edit Profile" subtitle="Update your details below." icon={User} />
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {/* Profile photo */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {preview ? (
                      <img src={preview} alt="Preview" className="size-16 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600" />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <Camera aria-hidden className="size-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="avatar"
                      className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-surface dark:text-slate-300 dark:hover:border-slate-500"
                    >
                      <Camera aria-hidden className="size-3.5" />
                      Choose photo
                    </label>
                    {preview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-500 transition-all hover:border-red-300 hover:text-red-600 dark:border-slate-600 dark:bg-surface dark:text-slate-400 dark:hover:border-red-500/50 dark:hover:text-red-400"
                      >
                        <X aria-hidden className="size-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">JPG or PNG, max 2 MB.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={profile.name}
                    required
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile.phone}
                    placeholder="Optional"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={profile.location}
                  placeholder="e.g. Bengaluru, India"
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    defaultValue={profile.department}
                    placeholder="e.g. Computer Science"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label htmlFor="collegeName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    College Name
                  </label>
                  <input
                    id="collegeName"
                    name="collegeName"
                    type="text"
                    defaultValue={profile.collegeName}
                    placeholder="e.g. IIT Bombay"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Year
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={profile.year ?? ""}
                    placeholder="e.g. 4"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label htmlFor="rollNumber" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Roll Number
                  </label>
                  <input
                    id="rollNumber"
                    name="rollNumber"
                    type="text"
                    defaultValue={profile.rollNumber}
                    placeholder="e.g. CS21B001"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Skills
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  defaultValue={profile.skills}
                  placeholder="e.g. React, Python, Machine Learning"
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  defaultValue={profile.bio}
                  placeholder="Tell us about yourself…"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              {isInstitution && (
                <>
                  <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Institution Details</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="institutionType" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Institution Type
                      </label>
                      <select
                        id="institutionType"
                        name="institutionType"
                        defaultValue={profile.institutionType}
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100"
                      >
                        <option value="">Select type</option>
                        <option value="University">University</option>
                        <option value="Autonomous College">Autonomous College</option>
                        <option value="AICTE Approved">AICTE Approved</option>
                        <option value="Deemed University">Deemed University</option>
                        <option value="Government College">Government College</option>
                        <option value="Private College">Private College</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="establishedYear" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Established Year
                      </label>
                      <input
                        id="establishedYear"
                        name="establishedYear"
                        type="number"
                        min={1900}
                        max={2025}
                        defaultValue={profile.establishedYear ?? ""}
                        placeholder="e.g. 1995"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="websiteUrl" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Website URL
                    </label>
                    <input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      defaultValue={profile.websiteUrl}
                      placeholder="https://www.example.edu"
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      defaultValue={profile.address}
                      placeholder="Full address"
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        defaultValue={profile.city}
                        placeholder="e.g. Mumbai"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        defaultValue={profile.state}
                        placeholder="e.g. Maharashtra"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="pincode" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Pincode
                      </label>
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        defaultValue={profile.pincode}
                        placeholder="e.g. 400001"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="naacGrade" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        NAAC Grade
                      </label>
                      <select
                        id="naacGrade"
                        name="naacGrade"
                        defaultValue={profile.naacGrade}
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100"
                      >
                        <option value="">Select grade</option>
                        <option value="A++">A++</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B++">B++</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="principalName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Principal / Director Name
                      </label>
                      <input
                        id="principalName"
                        name="principalName"
                        type="text"
                        defaultValue={profile.principalName}
                        placeholder="e.g. Dr. Ramesh Kumar"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Placement Cell</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="tpoName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        TPO Name
                      </label>
                      <input
                        id="tpoName"
                        name="tpoName"
                        type="text"
                        defaultValue={profile.tpoName}
                        placeholder="Training & Placement Officer"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="tpoPhone" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        TPO Phone
                      </label>
                      <input
                        id="tpoPhone"
                        name="tpoPhone"
                        type="tel"
                        defaultValue={profile.tpoPhone}
                        placeholder="e.g. 9876543210"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="totalStudents" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Total Students
                      </label>
                      <input
                        id="totalStudents"
                        name="totalStudents"
                        type="number"
                        min={0}
                        defaultValue={profile.totalStudents ?? ""}
                        placeholder="e.g. 2000"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="totalFaculty" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Total Faculty
                      </label>
                      <input
                        id="totalFaculty"
                        name="totalFaculty"
                        type="number"
                        min={0}
                        defaultValue={profile.totalFaculty ?? ""}
                        placeholder="e.g. 150"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="departments" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Departments
                    </label>
                    <textarea
                      id="departments"
                      name="departments"
                      rows={3}
                      defaultValue={profile.departments}
                      placeholder="e.g. Computer Science, Electronics, Mechanical, Civil"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Accreditation & Affiliation</h3>
                  </div>

                  <div>
                    <label htmlFor="affiliatedUniversity" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Affiliated University
                    </label>
                    <input
                      id="affiliatedUniversity"
                      name="affiliatedUniversity"
                      type="text"
                      defaultValue={profile.affiliatedUniversity}
                      placeholder="e.g. Anna University, Mumbai University"
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="ugcRecognized"
                        defaultChecked={profile.ugcRecognized}
                        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">UGC Recognized</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="aicteApproved"
                        defaultChecked={profile.aicteApproved}
                        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">AICTE Approved</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="nbaAccredited"
                        defaultChecked={profile.nbaAccredited}
                        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">NBA Accredited</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="coursesOffered" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Courses Offered
                    </label>
                    <textarea
                      id="coursesOffered"
                      name="coursesOffered"
                      rows={3}
                      defaultValue={profile.coursesOffered}
                      placeholder="e.g. B.Tech CSE, B.Tech ECE, M.Tech, MBA, BCA"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Placement Statistics</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="averagePlacementRate" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Placement Rate (%)
                      </label>
                      <input
                        id="averagePlacementRate"
                        name="averagePlacementRate"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        defaultValue={profile.averagePlacementRate ?? ""}
                        placeholder="e.g. 85"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="highestPackage" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Highest Package
                      </label>
                      <input
                        id="highestPackage"
                        name="highestPackage"
                        type="text"
                        defaultValue={profile.highestPackage}
                        placeholder="e.g. ₹45 LPA"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="averagePackage" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Average Package
                      </label>
                      <input
                        id="averagePackage"
                        name="averagePackage"
                        type="text"
                        defaultValue={profile.averagePackage}
                        placeholder="e.g. ₹8 LPA"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Admissions & Facilities</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="admissionContact" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Admission Contact Person
                      </label>
                      <input
                        id="admissionContact"
                        name="admissionContact"
                        type="text"
                        defaultValue={profile.admissionContact}
                        placeholder="e.g. Prof. S. Sharma"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="admissionPhone" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Admission Phone
                      </label>
                      <input
                        id="admissionPhone"
                        name="admissionPhone"
                        type="tel"
                        defaultValue={profile.admissionPhone}
                        placeholder="e.g. 022-12345678"
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="facilities" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Facilities
                    </label>
                    <textarea
                      id="facilities"
                      name="facilities"
                      rows={3}
                      defaultValue={profile.facilities}
                      placeholder="e.g. Library, Labs, Hostel, Sports, Wi-Fi, Placement Cell"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="motto" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      College Motto
                    </label>
                    <input
                      id="motto"
                      name="motto"
                      type="text"
                      defaultValue={profile.motto}
                      placeholder="e.g. Knowledge is Power"
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="vision" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Vision
                    </label>
                    <textarea
                      id="vision"
                      name="vision"
                      rows={3}
                      defaultValue={profile.vision}
                      placeholder="Describe your institution's vision…"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </>
              )}

              {state?.error && (
                <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-300" role="alert">
                  {state.error}
                </p>
              )}

              {state?.success && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle aria-hidden className="size-4" />
                  Profile updated successfully.
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
              >
                {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
                {pending ? "Saving…" : "Save changes"}
              </button>
            </form>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader title="My Documents" subtitle="Upload your resume, certificates, and academic records." icon={FileText} />
            <div className="p-5">
              <form ref={docFormRef} onSubmit={handleDocUpload} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[140px] flex-1">
                  <label htmlFor="docType" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Type</label>
                  <select id="docType" name="type"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100">
                    <option value="Resume">Resume</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Internship Report">Internship Report</option>
                    <option value="Academic Record">Academic Record</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="min-w-[140px] flex-1">
                  <label htmlFor="docFile" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">File</label>
                  <input id="docFile" name="file" type="file" required
                    className="h-10 w-full text-sm text-slate-500 file:mr-2 file:h-9 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:text-xs file:font-semibold file:text-indigo-700 file:hover:bg-indigo-100 dark:text-slate-400 dark:file:bg-indigo-500/15 dark:file:text-indigo-300" />
                </div>
                <button type="submit" disabled={docPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                  {docPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
                </button>
              </form>
              {docState?.success && <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Document uploaded.</p>}
              {docState?.error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{docState.error}</p>}

              {profile.documents.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {profile.documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between rounded-xl border border-border-muted px-3 py-2">
                      <a href={d.dataUrl} download={d.name} className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                        <FileText className="size-4 shrink-0 text-slate-400" />
                        <span className="truncate">{d.name}</span>
                      </a>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-slate-400">{d.type}</span>
                        <button
                          onClick={() => handleDeleteDoc(d.id)}
                          disabled={deletePending === d.id}
                          aria-label="Delete document"
                          className="flex size-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {profile.documents.length === 0 && (
                <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">No documents uploaded yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
