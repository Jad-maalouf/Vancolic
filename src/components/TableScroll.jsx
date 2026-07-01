// Lets wide tables scroll horizontally on narrow screens instead of
// squishing their columns unreadably.
export function TableScroll({ children }) {
  return <div className="table-scroll">{children}</div>;
}
