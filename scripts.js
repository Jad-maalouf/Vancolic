function toggleCategory(categoryId) {
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        if (category.id === categoryId) {
            category.style.display = category.style.display === 'none' ? 'block' : 'block';
        } else {
            category.style.display = 'none';
        }
    });
}

// Initialize: Hide all categories on page load
document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        if(category.id === "spirits"){
            category.style.display = 'block';
        }
        else {
            category.style.display = 'none';
        }
    });
});
