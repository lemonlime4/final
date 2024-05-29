const container = document.querySelector('#dialog');
container.style.visibility = 'hidden';



let clearDialogTimeout = null;
export function dialogTime(text, duration, callback = () => { }) {
    container.textContent = text;
    container.style.visibility = 'visible';

    clearTimeout(clearDialogTimeout);
    clearDialogTimeout = setTimeout(() => {
        container.style.visibility = 'hidden';
        container.textContent = '';
        callback();
    }, duration * 1000);
}

export function dialogCallback(text) {
    clearTimeout(clearDialogTimeout);
    container.textContent = text;
    container.style.visibility = 'visible';
    return () => {
        container.style.visibility = 'hidden';
        container.textContent = '';
    };
}

export function dialogChoice(text, callback) {
    if (!callback) throw new Error('missing callback');

    clearTimeout(clearDialogTimeout);
    const textElem = document.createElement('p');
    textElem.innerHTML = text;

    const yesElem = document.createElement('button');
    yesElem.textContent = 'Yes';
    yesElem.classList.add('dialogChoice');
    yesElem.addEventListener('click', event => {
        event.stopPropagation();
        container.style.visibility = 'hidden';
        container.replaceChildren();
        callback(true);
    })

    const noElem = document.createElement('button');
    noElem.textContent = 'No';
    noElem.classList.add('dialogChoice');
    noElem.addEventListener('click', event => {
        event.stopPropagation();
        container.style.visibility = 'hidden';
        container.replaceChildren();
        callback(false);
    });

    container.replaceChildren(textElem, yesElem, noElem);
    container.style.visibility = 'visible';
}




const interactionContainer = document.querySelector('#interaction');
interactionContainer.style.visibility = 'hidden';


export function startInteraction(exitCallback, contents) {
    interactionContainer.replaceChildren(...contents);
    interactionContainer.style.visibility = 'visible';
    const eventListener = event => {
        if (event.code === 'Escape') {
            window.removeEventListener('keydown', eventListener);
            interactionContainer.style.visibility = 'hidden';
            interactionContainer.replaceChildren();
            exitCallback();
        }
    };
    window.addEventListener('keydown', eventListener);
}