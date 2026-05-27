export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}
