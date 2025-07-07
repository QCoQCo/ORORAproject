document.addEventListener('DOMContentLoaded', async () => {
    const listWrap = document.querySelector('.list-wrap');
    const template = document.getElementById('list-item');

    // Function to create and append list items
    const createListItem = (itemData) => {
        const itemFragment = document.importNode(template.content, true);

        // Populate data
        const imgElement = itemFragment.querySelector('.item-photo img');
        imgElement.src = itemData.img;
        imgElement.alt = itemData.title;
        imgElement.onerror = () => {
            imgElement.src = 'logo.png';
            imgElement.onerror = null; // Prevent infinite loop if logo.png also fails
        };

        itemFragment.querySelector('.item-title').textContent = itemData.title;
        itemFragment.querySelector('.item-description').textContent = itemData.description;
        itemFragment.querySelector('.hash-tag').textContent = itemData.hashtags.join(' ');

        // Like button event
        const likeBtn = itemFragment.querySelector('.likeBtn');
        likeBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent link navigation
            e.stopPropagation(); // Prevent event bubbling
            likeBtn.classList.toggle('liked');
        });

        listWrap.appendChild(itemFragment);
    };

    // Fetch data and create list
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        data.forEach(createListItem);
    } catch (error) {
        console.error("Could not fetch or process data:", error);
    }
});
