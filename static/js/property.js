export function getProperty(elem, prop){
    return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0
}

export function setProperty(elem, prop, value){
    elem.style.setProperty(prop, value)
}

export function incrementProperty(elem, prop, inc){
    setProperty(elem, prop, getProperty(elem, prop) + inc)
}