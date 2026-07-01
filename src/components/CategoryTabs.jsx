export function CategoryTabs({ categories, activeId, onChange }) {
  return (
    <div className="buttons">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`the_buttons${cat.id === activeId ? ' selected' : ''}`}
          style={{ backgroundImage: `url(/images/${cat.icon})` }}
          onClick={() => onChange(cat.id)}
        >
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
