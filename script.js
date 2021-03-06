var guessing = true;
var current_date = null;

var synth = window.speechSynthesis;

var test_button = document.getElementById('play');
var voiceSelect = document.getElementById('voice-selector');
var bg_select = document.getElementById('bg-selector');

var opt_speech_pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var opt_speech_rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value');

var opt_random = document.getElementById("random");
var opt_speech_enabled = document.getElementById("tts");
var main_element = document.getElementById("main-element");

var options_button = document.getElementById("options-button");
var colls = document.getElementById("collapsible");

var opt_fg_color = document.getElementById("color-fg");
var opt_bg_color = document.getElementById("color-bg");

var voices = [];
var backgrounds = ["blue-galaxy.jpg"];

let default_voice = 'DEFAULT'
let selected_voice_name = null;
var lockbutton = false;
let root = document.documentElement;

function populateVoiceList() {
    voices = synth.getVoices().filter(voice => voice.lang.startsWith('en'));
    var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;

    voiceSelect.innerHTML = '';
    var option = document.createElement('option');
    option.textContent = default_voice;
    option.setAttribute('data-name', default_voice);
    voiceSelect.appendChild(option);

    var i;
    for(i = 0; i < voices.length ; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);

        if (selected_voice_name === voices[i].name) {
            selectedIndex = i + 1;
        }
    }

  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function populate_bg_list() {
    var option = document.createElement('option');
    option.textContent = 'NONE';
    option.setAttribute('data-file', '');
    bg_select.appendChild(option);

    var i;
    for(i= 0; i < backgrounds.length; ++i) {
        var option = document.createElement('option');
        option.textContent = backgrounds[i].replace(/\.[^/.]+$/, "");
        var file = "backgrounds/" + backgrounds[i];
        option.setAttribute('data-file', file);
        bg_select.appendChild(option);
    }

    bg_select.selectedIndex = 0;
}

function maybe_select_bg(bg_name) {
    if (bg_name.length == 0) {
        bg_select.selectedIndex = 0;
        return;
    }

    var i;
    for(i=0; i < bg_select.options.length; ++i) {
        let file_name = bg_select.options[i].getAttribute('data-file');
        if (bg_name === file_name) {
            bg_select.selectedIndex = i;
            break;
        }
    }
}
populate_bg_list();

function speak(text) {
    var utterThis = new SpeechSynthesisUtterance(text);
    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    if (opt_random.checked) {
        let index = Math.floor(Math.random() * voices.length) + 1;
        utterThis.voice = voices[index];
    }
    else if (selectedOption != default_voice) {
        for(i = 0; i < voices.length ; i++) {
            if(voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }
    }
    utterThis.pitch = opt_speech_pitch.value;
    utterThis.rate = opt_speech_rate.value;
    synth.cancel()
    synth.speak(utterThis);
}

test_button.onclick = function() {
    let date_string = get_date_string_for_tts(current_date);
    speak(date_string);
}

function random_date(start, end) {
    let date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    if (date.getFullYear() == 2001 && date.getDate() == 11 && date.getMonth() == 8) {
        return random_date(start, end);
    } 
    return date;
}

function get_date_string(date) {
    let months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let string = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
    return string;
}

function get_weekday_string(date) {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

function get_date_string_for_tts(date) {
    let months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month = months[date.getMonth()];
    let dayofmonth = date.getDate().toString();

    switch (dayofmonth.charAt(dayofmonth.length - 1)) {
        case '1':
            dayofmonth += "st"
            break;
        case '2':
            dayofmonth += "nd"
            break;
        case '3':
            dayofmonth += "rd"
            break;
        default:
            dayofmonth += "th"
            break;
    }

    return month + " " + dayofmonth + " " + date.getFullYear();
}

function speak_if_tts(text) {
    if (opt_speech_enabled.checked) {
        speak(text);
    }
}

function get_new_date() {
    current_date = random_date(new Date("1700-01-01"), new Date("2100-01-01"));
    let date_string = get_date_string(current_date);
    main_element.textContent = date_string;
    return date_string;
}

function show_weekday() {
    let weekday = get_weekday_string(current_date);
    main_element.textContent = weekday;
    return weekday;
}

function audio_action() {
    if (guessing) {
        let weekday = show_weekday();
        document.title = weekday;
        speak_if_tts(weekday);
        guessing = false;
    } else {
        let date_string = get_new_date();
        document.title = date_string;
        speak_if_tts(date_string);
        guessing = true;
    }
}

function change_main_element() {
    if (!lockbutton) {
        lockbutton = true;
        audio_action();
        setTimeout(() => {lockbutton = false}, 1000);
    }
}

function toggle_options() {
    if (colls.style.display === "block") {
        colls.style.display = "none";
        options_button.textContent = "Options"
    } else {
        colls.style.display = "block";
        options_button.textContent = "Close"
    }
}

opt_speech_pitch.oninput = function() {
    pitchValue.textContent = opt_speech_pitch.value;
}

opt_speech_rate.oninput = function () {
    rateValue.textContent = opt_speech_rate.value;
}

opt_bg_color.oninput = function () {
    root.style.setProperty('--bg-color', opt_bg_color.value);
}

opt_fg_color.oninput = function () {
    root.style.setProperty('--fg-color', opt_fg_color.value);
}

function setup() {
    guessing = true;
    let date_string = get_new_date();
    document.title = date_string;

    let audio = document.getElementById("audio");
    audio.src = "silence.flac";

    audio.onplay = change_main_element;

    audio.onpause = function() {
        audio.play()
    }

    main_element.onclick = audio_action;
    options_button.onclick = toggle_options;

    audio.muted = false;
}

function isTrue(s) {
    return (s === 'true');
}
function loadSettings() {
    opt_random.onchange = function () {
        localStorage.setItem('opt_random', opt_random.checked);
    }
    var value = localStorage.getItem('opt_random');
    if (value != null) {
        opt_random.checked = isTrue(value);
    }

    opt_speech_enabled.onchange = function () {
        localStorage.setItem('opt_speech_enabled', opt_speech_enabled.checked);
    }
    value = localStorage.getItem('opt_speech_enabled');
    if (value != null) {
        opt_speech_enabled.checked = isTrue(value);
    }

    opt_speech_pitch.onchange = function () {
        localStorage.setItem('opt_speech_pitch', opt_speech_pitch.value);
        pitchValue.textContent = opt_speech_pitch.value;
    }
    value = localStorage.getItem('opt_speech_pitch');
    if (value != null) {
        opt_speech_pitch.value = value;
        opt_speech_pitch.onchange();
    }

    opt_speech_rate.onchange = function () {
        localStorage.setItem('opt_speech_rate', opt_speech_rate.value);
        rateValue.textContent = opt_speech_rate.value;
    }
    value = localStorage.getItem('opt_speech_rate');
    if (value != null) {
        opt_speech_rate.value = value;
        opt_speech_rate.onchange();
    }

    voiceSelect.onchange = function () {
        let selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
        localStorage.setItem('selected_voice', selectedOption);
    }
    value = localStorage.getItem('selected_voice');
    if (value != null) {
        selected_voice_name = value;
    }

    opt_fg_color.onchange = function() {
        localStorage.setItem('opt_fg_color', opt_fg_color.value);
    }
    value = localStorage.getItem('opt_fg_color');
    if (value != null) {
        root.style.setProperty('--fg-color', value);
    }
    opt_fg_color.value = root.style.getPropertyValue('--fg-color');

    opt_bg_color.onchange = function() {
        localStorage.setItem('opt_bg_color', opt_bg_color.value);
    }
    value = localStorage.getItem('opt_bg_color');
    if (value != null) {
        root.style.setProperty('--bg-color', value);
    }
    opt_bg_color.value = root.style.getPropertyValue('--bg-color');


    bg_select.onchange = function () {
        let selected_bg = bg_select.selectedOptions[0].getAttribute('data-file');
        localStorage.setItem('selected_bg', selected_bg);
        root.style.setProperty('--bg-image', selected_bg);
        document.getElementById('body').style.background = 'url('+selected_bg+')';
        console.log(selected_bg);
    }
    value = localStorage.getItem('selected_bg');
    if (value != null) {
        maybe_select_bg(value);
    }
}

setup();
loadSettings();