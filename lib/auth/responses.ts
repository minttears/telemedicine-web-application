export function unauthorized(message = "Требуется вход в аккаунт") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Доступ запрещён") {
  return Response.json({ error: message }, { status: 403 });
}
