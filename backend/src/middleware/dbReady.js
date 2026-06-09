/**
 * Pass-through middleware since Supabase database connections are stateless HTTP requests.
 */
export function requireDB(req, res, next) {
  next();
}
