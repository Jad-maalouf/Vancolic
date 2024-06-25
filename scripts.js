function toggleCategory(categoryId, buttonId) {
    const categories = document.querySelectorAll('.category');
    const buttons = document.querySelectorAll('.the_buttons');

    // Toggle category display
    categories.forEach(category => {
        category.style.display = category.id === categoryId ? 'block' : 'none';
    });

    // Update button styles
    buttons.forEach(button => {
        if (button.id === buttonId) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

// Initialize: Hide all categories on page load and set default button
document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.category');
    const defaultCategoryId = 'spirits';
    const defaultButtonId = 'spi';

    categories.forEach(category => {
        category.style.display = category.id === defaultCategoryId ? 'block' : 'none';
    });

    const defaultButton = document.querySelector(`#${defaultButtonId}`);
    if (defaultButton) {
        defaultButton.classList.add('selected');
    }
});
