import {getProperty, incrementProperty, setProperty} from "./property.js";

const SPEED = 0.05
const forestElem = document.querySelectorAll("[data-forest]")

export function setupForest() {
    setProperty(forestElem[0], "--left", 0)
    setProperty(forestElem[1], "--left", 300)
}

export function updateForest(delta, speedScale) {
    forestElem.forEach(forest => {
        incrementProperty(forest, "--left", delta * speedScale * SPEED * -1)

        if (getProperty(forest, "--left") <= -300) {
            incrementProperty(forest, "--left", 600)
        }
    })
}