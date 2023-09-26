import {setupForest, updateForest} from './forest.js';
import {setupCharacter, updateCharacter, getCharacterRects, setGameOver} from './naruto.js';
import {setupFire, updateFire, getFireRects} from './fire.js';

const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 30;
const SPEED_SCALE_INCREASE = 0.00001;

const gameElem = document.querySelector("[data-world]");
const worldElem = document.querySelector("[data-world]");
const scoreElem = document.querySelector("[data-score]");
const startScreenElem = document.querySelector("[data-start-text]");

const leaderboardElem = document.querySelector("[data-leaderboard]")

let lastTime
let speedScale
let score
let current_player
let isGameRunning = false

handleSubmit()

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
document.addEventListener("keydown", handleStart)
setupForest()

function setPixelToWorldScale() {
    let worldToPixelScale
    if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
        worldToPixelScale = window.innerWidth / WORLD_WIDTH
    } else {
        worldToPixelScale = window.innerHeight / WORLD_HEIGHT
    }

    worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
    worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}

function update(time) {
    if (lastTime == null) {
        lastTime = time
        window.requestAnimationFrame(update)
        return
    }
    const delta = time - lastTime

    updateForest(delta, speedScale)
    updateCharacter(delta, speedScale)
    updateFire(delta, speedScale)
    updateSpeedScale(delta)
    updateScore(delta)
    if (checkLose()) return handleLose()

    lastTime = time
    window.requestAnimationFrame(update)
}

function checkLose() {
    const characterRects = getCharacterRects()
    return getFireRects().some(rect => isCollision(rect, characterRects))
}

function isCollision(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.top < rect2.bottom &&
        rect1.right > rect2.left &&
        rect1.bottom > rect2.top
    )
}

function updateSpeedScale(delta) {
    speedScale += delta * SPEED_SCALE_INCREASE
}

function updateScore(delta) {
    score += delta * 0.01
    scoreElem.textContent = Math.floor(score)
}

function handleStart(event) {
    if (!isGameRunning && event.code === "Space") {
        isGameRunning = true;
        lastTime = null
        score = 0
        speedScale = 1

        setupForest()
        setupCharacter()
        setupFire()
        startScreenElem.classList.add("hide")
        window.requestAnimationFrame(update)
    }
}

function handleLose() {
    if (isGameRunning) {
        isGameRunning = false;
        setGameOver()
        submitScore(current_player, score)
        refreshTable()
        setTimeout(() => {
            document.addEventListener("keydown", handleStart)
            startScreenElem.classList.remove("hide")
        }, 50)
    }
}

function handleSubmit() {
    const playerName = prompt("Please give a name to begin the game: ")
    if (playerName && playerName.trim() !== "") {
        console.log(playerName)
        current_player = playerName;
        if (current_player.toLowerCase().trim() === "admin") {
            gameElem.style.display = "none";
            leaderboardElem.style.display = "block";
            deleteScore();
        }
    } else if(playerName === null){
        refreshTable()
        handleSubmit()
    }
    else{
        alert("Oh, Hello there SPACE-man! Have you got a name?");
        handleSubmit()
    }
}

function submitScore(player, point) {
    const url = '/submit_score';
    const formData = new FormData();
    formData.append('playerName', player);

    formData.append('score', Math.floor(point));

    fetch(url, {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            console.log('Score is successfully submitted.');
            refreshTable();
        } else {
            console.error('Score could not be submitted');
        }
    }).catch(error => {
        console.error("Error submitting the score.");
    });
}

function handleAdminActions() {
    const isAdmin = current_player.toLowerCase().trim() === "admin";
    if (isAdmin) {
        const adminChoice = prompt("Enter 'yes' to delete another score or 'no' to start the game:");

        if (adminChoice.toLowerCase().trim() === 'yes') {
            deleteScore();
        } else if (adminChoice.toLowerCase().trim() === 'no') {
            gameElem.style.display = "block";
            handleSubmit();
        } else {
            handleAdminActions();
        }
    }
}

function deleteScore() {
    if (current_player.toLowerCase().trim() === "admin") {
        const url = '/delete_score';
        const playerToDelete = prompt("Enter the player, whose score you want to delete:");

        if (playerToDelete && playerToDelete.trim() !== "") {
            const scoreToDelete = parseInt(prompt(`Enter the score you want to delete for ${playerToDelete}:`));

            if (!isNaN(scoreToDelete)) {
                const formData = new FormData();
                formData.append('playerName', playerToDelete);
                formData.append('score', scoreToDelete);

                fetch(url, {
                    method: 'DELETE',
                    body: formData
                })
                    .then(response => {
                        if (response.status === 200) {
                            response.json().then(data => {
                                console.log(`One occurrence of score ${scoreToDelete} for ${playerToDelete} deleted successfully.`);
                                alert(data.message);
                                refreshTable();
                                handleAdminActions();
                            });
                        } else {
                            response.json().then(data => {
                                alert(data.message);
                                refreshTable()
                                handleAdminActions()
                            });
                            console.error('Score deletion failed.');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting score:', error);
                    });
            } else {
                alert("No score for such player name was found!");
                console.log("Invalid score provided. Deletion cancelled.");
                handleAdminActions();
            }
        } else {
            alert("No player with such name was found!")
            console.log("Deletion cancelled. No player provided.");
            handleAdminActions();
        }
    } else {
        console.log("Only 'admin' player can initiate score deletion.");
        handleSubmit();
    }
}

function refreshTable() {
    fetch('/').then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newTable = doc.querySelector('#highScore');
            const oldTable = document.querySelector('#highScore');
            oldTable.parentNode.replaceChild(newTable, oldTable);
        })
        .catch(error => {
            console.error('Error refreshing table:', error);
        });
}


