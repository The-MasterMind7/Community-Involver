
const selectedElements = new Set();

const elementsSelectionDiv = document.getElementById('elements-selection');
const recommendedElementsDiv = document.getElementById('recommended-elements');
const friendSuggestionsDiv = document.getElementById('friend-suggestions');

function renderElements() {
    elementsSelectionDiv.innerHTML = '<h2>Elements to Select</h2>';
    elementsData.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.classList.add('element-item');
        elementDiv.textContent = element.name;
        elementDiv.dataset.id = element.id;
        elementDiv.dataset.name = element.name;
        if (selectedElements.has(element.id)) {
            elementDiv.classList.add('selected');
        }
        elementDiv.addEventListener('click', () => {
            if (selectedElements.has(element.id)) {
                selectedElements.delete(element.id);
                elementDiv.classList.remove('selected');
            } else {
                selectedElements.add(element.id);
                elementDiv.classList.add('selected');
            }
            updateRecommendations();
            updateFriendSuggestions();
        });
        elementsSelectionDiv.appendChild(elementDiv);
    });
}

function updateRecommendations() {
    recommendedElementsDiv.innerHTML = '<h2>Recommended Elements</h2>';
    if (selectedElements.size === 0) {
        recommendedElementsDiv.innerHTML += '<p>Select some elements to get recommendations.</p>';
        return;
    }

    const selectedElementsArray = Array.from(selectedElements);
    const selectedElementObjects = elementsData.filter(e => selectedElementsArray.includes(e.id));

    const allSelectedTags = new Set(selectedElementObjects.flatMap(e => e.tags));
    const allSelectedCategories = new Set(selectedElementObjects.map(e => e.category));

    const recommendations = new Map(); // Stores {element.id: score}

    elementsData.forEach(element => {
        if (!selectedElements.has(element.id)) {
            let score = 0;
            // Score based on shared tags
            element.tags.forEach(tag => {
                if (allSelectedTags.has(tag)) {
                    score += 1;
                }
            });
            // Score based on shared category
            if (allSelectedCategories.has(element.category)) {
                score += 2; // Category match is stronger
            }
            if (score > 0) {
                recommendations.set(element.id, score);
            }
        }
    });

    const sortedRecommendations = Array.from(recommendations.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by score descending
        .map(([id, score]) => elementsData.find(e => e.id === id));

    if (sortedRecommendations.length === 0) {
        recommendedElementsDiv.innerHTML += '<p>No further recommendations based on your selections.</p>';
        return;
    }

    sortedRecommendations.forEach(element => {
        const recDiv = document.createElement('div');
        recDiv.classList.add('recommendation-item');
        recDiv.textContent = element.name;
        recommendedElementsDiv.appendChild(recDiv);
    });
}

function updateFriendSuggestions() {
    friendSuggestionsDiv.innerHTML = '<h2>Friend Suggestions</h2>';
    if (selectedElements.size === 0) {
        friendSuggestionsDiv.innerHTML += '<p>Select some elements to get friend suggestions.</p>';
        return;
    }

    const selectedElementNames = new Set(Array.from(selectedElements).map(id => elementsData.find(e => e.id === id).name));

    const friendScores = new Map(); // Stores {friend.id: score}

    friendsData.forEach(friend => {
        let score = 0;
        let commonInterests = [];

        friend.interests.forEach(interest => {
            if (selectedElementNames.has(interest)) {
                score += 3; // Stronger score for direct interest match
                commonInterests.push(interest);
            }
        });

        // Simulate local proximity (if user selected elements are from a specific location)
        // For simplicity, let's assume a 'user location' for now, or just compare friend locations.
        // Here, we'll just check if friends share the same location.
        // In a real app, you'd get the user's actual location.
        // Let's assume a mock user location or pick one from selected friends if available.
        const mockUserLocation = 'New York'; // Example user location
        if (friend.location === mockUserLocation) {
            score += 1; // Boost for local proximity
        }

        if (score > 0) {
            friendScores.set(friend.id, { score: score, commonInterests: commonInterests });
        }
    });

    const sortedFriends = Array.from(friendScores.entries())
        .sort((a, b) => b[1].score - a[1].score) // Sort by score descending
        .map(([id, data]) => {
            const friend = friendsData.find(f => f.id === id);
            return { ...friend, score: data.score, commonInterests: data.commonInterests };
        });

    if (sortedFriends.length === 0) {
        friendSuggestionsDiv.innerHTML += '<p>No friend suggestions based on your selections.</p>';
        return;
    }

    sortedFriends.forEach(friend => {
        const friendDiv = document.createElement('div');
        friendDiv.classList.add('friend-suggestion-item');
        friendDiv.innerHTML = `<strong>${friend.name}</strong> (Location: ${friend.location})<br>Shared Interests: ${friend.commonInterests.join(', ')}`;
        friendSuggestionsDiv.appendChild(friendDiv);
    });
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderElements();
    updateRecommendations();
    updateFriendSuggestions();
});
