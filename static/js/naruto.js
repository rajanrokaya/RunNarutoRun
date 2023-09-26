import {getProperty, incrementProperty, setProperty} from "./property.js";

const narutoCharacter = document.querySelector("[data-naruto]")
const JUMP_SPEED = 0.51
const GRAVITY = 0.002
const CHARACTER_FRAME_COUNT = 2
const FRAME_TIME = 100

let isJumping
let characterFrame
let currentFrameTime
let yVelocity

export function setupCharacter() {
    isJumping = false
    characterFrame = 0
    currentFrameTime = 0
    yVelocity = 0
    setProperty(narutoCharacter, "--bottom", 0)
    document.removeEventListener("keydown", onJump)
    document.addEventListener("keydown", onJump)
}

export function updateCharacter(delta, speedScale) {
    handleRun(delta, speedScale)
    handleJump(delta)
}

export function getCharacterRects(){
    return narutoCharacter.getBoundingClientRect()
}

export function setGameOver(){
    narutoCharacter.src = "static/images/game-over.png"
}

function handleRun(delta, speedScale) {
    if (isJumping) {
        narutoCharacter.src = `static/images/jump.png`
        return
    }

    if (currentFrameTime >= FRAME_TIME) {
        characterFrame = (characterFrame + 1) % CHARACTER_FRAME_COUNT
        narutoCharacter.src = `static/images/run-${characterFrame}.png`
        currentFrameTime -= FRAME_TIME
    }
    currentFrameTime += delta * speedScale
}

function handleJump(delta) {
    if (!isJumping) return

    incrementProperty(narutoCharacter, "--bottom", yVelocity * delta)
    if (getProperty(narutoCharacter, "--bottom") <= 0){
        setProperty(narutoCharacter, "--bottom", 0)
        isJumping = false
    }

    yVelocity -= GRAVITY * delta
}

function onJump(e){
    if(e.code !=="Space" || isJumping) return

    yVelocity = JUMP_SPEED
    isJumping = true
}