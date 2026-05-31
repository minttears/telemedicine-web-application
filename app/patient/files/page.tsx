export default function PatientFilesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Files</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Consultation files
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Uploaded files are available inside each consultation chat today. A
          dedicated patient file archive will be connected in a later phase.
        </p>
      </section>

      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          No separate file archive yet
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Open a consultation to review shared attachments and messages. This
          page intentionally does not list storage paths or private file details.
        </p>
      </section>
    </div>
  );
}
