function loadAudio(filename, volume = 1, loop = false) {
    const path = '../assets/sounds/' + filename;
    const audio = new Audio(path);
    audio.volume = volume;
    audio.loop = loop;
    return audio;
}

export const audio = {
    alarm: loadAudio('alarm.mp3', 0.1),
    stopAlarm: loadAudio('stopAlarm.mp3', 0.5),
    background: loadAudio('background.mp3', 0.05, true),
    music: loadAudio('music.mp3', 0.5, true),
    click: loadAudio('click.mp3', 0.2),
    topDoor: loadAudio('topDoor.mp3', 0.5),
    drawerOpen: loadAudio('drawerOpen.mp3', 0.3),
    drawerClose: loadAudio('drawerClose.mp3', 0.3),
    electricalOpen: loadAudio('electricalOpen.mp3', 0.5),
    electricalClose: loadAudio('electricalClose.mp3', 0.5),
    leverOn: loadAudio('leverOn.mp3', 0.5),
    leverOff: loadAudio('leverOff.mp3', 0.5),
    computer: loadAudio('computer.mp3', 0.5),
    paper: loadAudio('paper.mp3', 0.8),
    getKey: loadAudio('getKey.mp3', 1),
    useKey: loadAudio('useKey.mp3', 0.5),
};
window.a = audio;