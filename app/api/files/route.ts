export function POST() {
  return Response.json(
    { error: "File upload is not implemented in Phase 1." },
    { status: 501 },
  );
}
