import { useMemo, useState } from 'react';
import { RECIPE_SECTIONS } from '../../data/recipes.js';

function matches(recipe, needle) {
  if (recipe.name.toLowerCase().includes(needle)) return true;
  return recipe.ingredients.some((ing) => ing.toLowerCase().includes(needle));
}

export function RecipesTab() {
  const [search, setSearch] = useState('');

  const sections = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return RECIPE_SECTIONS;
    return RECIPE_SECTIONS.map((section) => ({
      ...section,
      recipes: section.recipes.filter((recipe) => matches(recipe, needle)),
    })).filter((section) => section.recipes.length > 0);
  }, [search]);

  return (
    <div className="recipes-tab">
      <div className="recipes-search">
        <input
          type="search"
          placeholder="Search drinks or ingredients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search recipes"
        />
      </div>

      {sections.length === 0 ? <p className="recipes-empty">No recipes match “{search}”.</p> : null}

      {sections.map((section) => (
        <section key={section.id} className="recipes-section">
          <h2>{section.label}</h2>
          <div className="recipe-cards">
            {section.recipes.map((recipe) => (
              <div key={recipe.name} className="recipe-card">
                <div className="recipe-card-header">
                  <span className="recipe-card-name">{recipe.name}</span>
                  {recipe.method ? <span className="recipe-card-method">{recipe.method}</span> : null}
                </div>
                <ul className="recipe-card-ingredients">
                  {recipe.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
                {recipe.notes ? <div className="recipe-card-notes">{recipe.notes}</div> : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
