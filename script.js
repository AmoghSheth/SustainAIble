const STORAGE_KEYS = {
    ECO_SCORE: 'sustainAIble_eco_score',
    USER_HABITS: 'sustainAIble_habits',
    COMPLETED_CHALLENGES: 'sustainAIble_completed_challenges',
    ACTIVE_CHALLENGES: 'sustainAIble_active_challenges'
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    const formData = {
        transportation: document.getElementById('transportation').value,
        diet: document.getElementById('diet').value,
        energy: document.getElementById('energy').value
    };
    console.log('Form data:', formData);

    // Save data to localStorage
    localStorage.setItem(STORAGE_KEYS.USER_HABITS, JSON.stringify(formData));

    // Show loading state
    toggleLoading(true);

    try {
        console.log('Getting recommendations...');
        const recommendations = getRecommendations(formData);
        console.log('Received recommendations:', recommendations);
        displayRecommendations(recommendations);
        calculateAndUpdateEcoScore(formData);
    } catch (error) {
        console.error('Error:', error);
        displayError(error.message);
    } finally {
        toggleLoading(false);
    }
}

function displayRecommendations(recommendations) {
    const resultsDiv = document.getElementById('recommendation-results');
    resultsDiv.innerHTML = `
        <div class="recommendation-card">
            <h4>Your Personalized Recommendations:</h4>
            <p>${recommendations}</p>
        </div>
    `;
    document.getElementById('recommendations').classList.remove('hidden');
}

function initializeApp() {
    const habitsForm = document.getElementById('habits-form');
    habitsForm.addEventListener('submit', handleFormSubmit);

    // Add navigation handlers
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Load challenges
    loadChallenges();
    
    // Load stored eco-score
    loadStoredEcoScore();
}

// Show/hide sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

// Recommendation templates
const recommendationTemplates = {
    transportation: {
        car: [
            "Switch to a hybrid or electric vehicle to reduce emissions",
            "Start carpooling with colleagues to share fuel costs",
            "Plan and combine multiple errands into single trips"
        ],
        public: [
            "Get a monthly transit pass to save money",
            "Use transit apps to optimize your routes",
            "Consider biking or walking for shorter distances"
        ],
        bicycle: [
            "Maintain your bike regularly for optimal efficiency",
            "Install proper lighting for safe night riding",
            "Map out safe cycling routes in your area"
        ],
        walk: [
            "Get comfortable walking shoes to encourage more walking",
            "Use a step counter to track your progress",
            "Find scenic walking routes in your neighborhood"
        ]
    },
    diet: {
        omnivore: [
            "Try meatless Mondays to reduce carbon footprint",
            "Choose locally sourced and seasonal produce",
            "Reduce food waste by meal planning"
        ],
        vegetarian: [
            "Explore plant-based protein alternatives",
            "Start a small herb garden at home",
            "Learn to preserve seasonal vegetables"
        ],
        vegan: [
            "Source local organic produce for maximum impact",
            "Make your own plant-based alternatives",
            "Share vegan recipes with friends and family"
        ],
        pescatarian: [
            "Choose sustainable seafood options",
            "Support local fish markets",
            "Learn about seasonal fish availability"
        ]
    },
    energy: {
        high: [
            "Install a smart thermostat to optimize heating/cooling",
            "Switch to LED bulbs throughout your home",
            "Unplug devices when not in use"
        ],
        medium: [
            "Use natural light when possible",
            "Install weather stripping around doors and windows",
            "Use energy-efficient appliances"
        ],
        low: [
            "Consider installing solar panels",
            "Share your energy-saving tips with neighbors",
            "Monitor and optimize your energy usage patterns"
        ]
    }
};

// Get recommendations from templates
function getRecommendations(habits) {
    // Get recommendations based on habits
    const recommendations = [];
    
    // Add transportation recommendation
    if (habits.transportation && recommendationTemplates.transportation[habits.transportation]) {
        recommendations.push(...recommendationTemplates.transportation[habits.transportation]);
    }
    
    // Add diet recommendation
    if (habits.diet && recommendationTemplates.diet[habits.diet]) {
        recommendations.push(...recommendationTemplates.diet[habits.diet]);
    }
    
    // Add energy recommendation
    if (habits.energy && recommendationTemplates.energy[habits.energy]) {
        recommendations.push(...recommendationTemplates.energy[habits.energy]);
    }
    
    // Format recommendations
    return recommendations
        .slice(0, 3)  // Get top 3 recommendations
        .map((rec, index) => `${index + 1}. ${rec}`)
        .join('\n');
}

// Calculate and update eco-score
function calculateAndUpdateEcoScore(habits) {
    let score = 0;
    
    // Transportation scoring
    switch(habits.transportation) {
        case 'walk': score += 30; break;
        case 'bicycle': score += 25; break;
        case 'public': score += 15; break;
        case 'car': score += 5; break;
    }

    // Diet scoring
    switch(habits.diet) {
        case 'vegan': score += 30; break;
        case 'vegetarian': score += 25; break;
        case 'pescatarian': score += 20; break;
        case 'omnivore': score += 10; break;
    }

    // Energy usage scoring
    switch(habits.energy) {
        case 'low': score += 40; break;
        case 'medium': score += 25; break;
        case 'high': score += 10; break;
    }

    updateEcoScore(score);
    localStorage.setItem(STORAGE_KEYS.ECO_SCORE, score.toString());
}

// Update eco-score display
function updateEcoScore(score) {
    document.getElementById('current-score').textContent = score;
    // Calculate percentage of 1000
    const percentage = (score / 1000) * 100;
    document.getElementById('score-progress').style.width = `${percentage}%`;
    
    // Calculate animation speed based on score (faster as score increases)
    // Speed ranges from 2s (at score 0) to 0.5s (at score 1000)
    const animationSpeed = Math.max(2 - (score / 1000) * 1.5, 0.5);
    
    // Add score display with max score
    document.querySelector('.score-display').innerHTML = `
        <div class="score-circle">
            <span id="current-score">${score}</span>
        </div>
        <div class="score-text">out of 1000</div>
        <div class="progress-bar">
            <div class="progress" id="score-progress" style="width: ${percentage}%"></div>
        </div>
    `;
    
    // Apply animation speed to score circle
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.animation = `pulse ${animationSpeed}s infinite ease-in-out`;
    
    document.getElementById('eco-score').classList.remove('hidden');
}

// Load stored eco-score
function loadStoredEcoScore() {
    const storedScore = localStorage.getItem(STORAGE_KEYS.ECO_SCORE);
    if (storedScore) {
        updateEcoScore(parseInt(storedScore));
    }
}

// Toggle loading state
function toggleLoading(show) {
    const loadingDiv = document.querySelector('.loading');
    const resultsDiv = document.getElementById('recommendation-results');
    
    loadingDiv.classList.toggle('hidden', !show);
    if (show) {
        resultsDiv.innerHTML = '';
    }
}

// Display error message
function displayError(message) {
    const resultsDiv = document.getElementById('recommendation-results');
    resultsDiv.innerHTML = `
        <div class="error-message">
            <p>Error: ${message}</p>
        </div>
    `;
    document.getElementById('recommendations').classList.remove('hidden');
}

// Load and display challenges
async function loadChallenges() {
    try {
        const response = await fetch('data/challenges.json');
        const data = await response.json();
        const allChallenges = data.challenges;
        
        // Get completed challenges from localStorage
        const completedChallenges = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHALLENGES)) || [];
        
        // Get active challenges from localStorage or initialize with first 3
        let activeChallenges = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_CHALLENGES));
        if (!activeChallenges) {
            activeChallenges = allChallenges.slice(0, 3);
            localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGES, JSON.stringify(activeChallenges));
        }
        
        displayChallenges(activeChallenges);
    } catch (error) {
        console.error('Error loading challenges:', error);
    }
}

function displayChallenges(challenges) {
    const container = document.getElementById('challenges-container');
    const challengesHTML = challenges.map(challenge => `
        <div class="challenge-card">
            <h3>${challenge.title}</h3>
            <span class="challenge-difficulty difficulty-${challenge.difficulty.toLowerCase()}">
                ${challenge.difficulty}
            </span>
            <div class="challenge-points">${challenge.points} Points</div>
            <p>${challenge.description}</p>
            <div class="challenge-tips">
                <strong>Tips:</strong>
                <ul>
                    ${challenge.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            <button class="complete-challenge" onclick="completeChallenge(${challenge.points}, ${challenge.id})">
                Complete Challenge
            </button>
        </div>
    `).join('');
    
    container.innerHTML = challengesHTML;
}

// Toggle expanded content
function toggleContent(contentId) {
    const content = document.getElementById(contentId);
    const allContent = document.querySelectorAll('.expanded-content');
    
    // Close other expanded content
    allContent.forEach(item => {
        if (item.id !== contentId && item.classList.contains('show')) {
            item.classList.remove('show');
        }
    });
    
    // Toggle current content
    content.classList.toggle('show');
    
    // Update button text
    const button = content.previousElementSibling;
    button.textContent = content.classList.contains('show') ? 'Read Less' : 'Read More';
}

// Get a new random challenge that hasn't been completed
async function getNewChallenge(completedIds) {
    const response = await fetch('data/challenges.json');
    const data = await response.json();
    const allChallenges = data.challenges;
    
    // Filter out completed challenges
    const availableChallenges = allChallenges.filter(challenge => 
        !completedIds.includes(challenge.id)
    );
    
    if (availableChallenges.length === 0) {
        // If all challenges are completed, reset the completed list
        localStorage.setItem(STORAGE_KEYS.COMPLETED_CHALLENGES, '[]');
        return allChallenges[Math.floor(Math.random() * allChallenges.length)];
    }
    
    // Return a random challenge from available ones
    return availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
}

// Handle challenge completion
async function completeChallenge(points, challengeId) {
    // Get current score
    const currentScore = parseInt(localStorage.getItem(STORAGE_KEYS.ECO_SCORE)) || 0;
    
    // Add challenge points
    const newScore = currentScore + points;
    
    // Update score display and storage
    updateEcoScore(newScore);
    localStorage.setItem(STORAGE_KEYS.ECO_SCORE, newScore.toString());
    
    // Update completed challenges
    const completedChallenges = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHALLENGES)) || [];
    completedChallenges.push(challengeId);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_CHALLENGES, JSON.stringify(completedChallenges));
    
    // Get active challenges
    let activeChallenges = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_CHALLENGES));
    
    // Get a new challenge
    const newChallenge = await getNewChallenge(completedChallenges);
    
    // Replace the completed challenge with the new one
    const challengeIndex = activeChallenges.findIndex(c => c.id === challengeId);
    if (challengeIndex !== -1) {
        activeChallenges[challengeIndex] = newChallenge;
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGES, JSON.stringify(activeChallenges));
    }
    
    // Refresh the challenges display
    displayChallenges(activeChallenges);
    
    // Show success message
    showSuccessMessage(points);
}

// Show success message when challenge is completed
function showSuccessMessage(points) {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h4>Challenge Completed!</h4>
            <p>You earned ${points} points!</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Trigger animation
    setTimeout(() => message.classList.add('show'), 100);
    
    // Remove message after animation
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 500);
    }, 3000);
} 
