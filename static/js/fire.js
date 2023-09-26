import {getProperty, incrementProperty, setProperty} from "./property.js";

const SPEED = 0.05
const FIRE_INTERVAL_MIN = 1000
const FIRE_INTERVAL_MAX = 2000
const worldElem = document.querySelector("[data-world]")

let nextFireTime

export function setupFire() {
    nextFireTime = FIRE_INTERVAL_MIN
    document.querySelectorAll("[data-fire]").forEach(fire => {
        fire.remove()
    })
}

export function updateFire(delta, speedScale) {
    document.querySelectorAll("[data-fire]").forEach(fire => {
        incrementProperty(fire, "--left", delta * speedScale * SPEED * -1)

        if (getProperty(fire, "--left") <= -100) {
            fire.remove()
        }
    })

    if (nextFireTime <= 0) {
        createFire()
        nextFireTime = randomNumber(FIRE_INTERVAL_MIN, FIRE_INTERVAL_MAX) / speedScale
    }
    nextFireTime -= delta
}

export function getFireRects(){
    return [...document.querySelectorAll("[data-fire]")].map(fire => {
        return fire.getBoundingClientRect()
    })
}

function createFire() {
    const fire = document.createElement("img")
    fire.dataset.fire = true
    fire.src = "static/images/fire.png"
    fire.classList.add("fire")
    setProperty(fire, "--left", 100)
    worldElem.append(fire)
}


function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}