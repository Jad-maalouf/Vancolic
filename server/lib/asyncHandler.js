// Express doesn't forward rejected promises from async route handlers to the
// error middleware on its own — wrap every handler with this so a thrown/
// rejected error becomes a 500 instead of an unhandled rejection.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
