// A compact, circular icon-only button. `label` is required — it becomes
// the hover tooltip (title) and the screen-reader name (aria-label), since
// there's no visible text otherwise.
export function IconButton({ icon: Icon, label, type = 'button', className = '', ...rest }) {
  return (
    <button
      type={type}
      className={`icon-button ${className}`.trim()}
      title={label}
      aria-label={label}
      {...rest}
    >
      <Icon />
    </button>
  );
}
