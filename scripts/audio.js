function loadAudio(filename, volume = 1) {
    const path = '../assets/sounds/' + filename;
    const audio = new Audio(path);
    audio.volume = volume;
    return audio;
}

export const audio = {
    alarm: loadAudio('alarm.mp3', 0.5),
    stopAlarm: loadAudio('stopAlarm.mp3'),
    background: loadAudio('background.mp3'),
    click: loadAudio('click.mp3'),
};