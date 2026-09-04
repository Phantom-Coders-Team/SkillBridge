"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { submitProofOfWork } from "./actions";

export default function AddProofOfWorkForm({
  projects,
}: {
  projects: { id: string; title: string }[];
}) {
  const [state, formAction, isPending] = useActionState(submitProofOfWork, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // Find and close the parent details element if it exists
      const details = formRef.current?.closest("details");
      if (details) {
        details.open = false;
      }
    }
  }, [state?.success]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-slate-500">
        You don't have any projects yet. Create a project in your portfolio first to submit a Proof of Work.
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="border-b border-border-muted pb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Submit Proof of Work</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Link an artifact to an existing project for dual-sign off verification.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label htmlFor="projectId" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Project <span className="text-red-500">*</span>
          </label>
          <Select id="projectId" name="projectId" required>
            <option value="">Choose a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="artifactUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Artifact URL (GitHub, Figma, etc.)
          </label>
          <Input id="artifactUrl" name="artifactUrl" type="url" placeholder="https://..." />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea 
            id="description" 
            name="description" 
            placeholder="Briefly describe what you built or accomplished..." 
            rows={3} 
            required 
          />
        </div>

        {state?.error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      </div>
    </form>
  );
}
