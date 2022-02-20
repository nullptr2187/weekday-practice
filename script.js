var guessing = true;
var current_date = null;

var synth = window.speechSynthesis;

var inputForm = document.querySelector('form');
var voiceSelect = document.querySelector('select');

var pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value');

var randomVoice = document.getElementById("random");
var tts_option = document.getElementById("tts");
var main_element = document.getElementById("main-element");

var voices = [];

let default_voice = 'DEFAULT'
var lockbutton = false;

function populateVoiceList() {
  voices = synth.getVoices().filter(voice => voice.lang.startsWith('en'));
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;

    voiceSelect.innerHTML = '';
    var option = document.createElement('option');
    option.textContent = default_voice;
    option.setAttribute('data-name', default_voice);
    voiceSelect.appendChild(option);

  for(i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }

  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(text) {
    synth.cancel()
    var utterThis = new SpeechSynthesisUtterance(text);
    var selectedOption;
    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    if (randomVoice.checked) {
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
    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;
    synth.speak(utterThis);
}

inputForm.onsubmit = function(event) {
    event.preventDefault();

    let date_string = get_date_string_for_tts(current_date);
    speak(date_string);
}

pitch.onchange = function() {
  pitchValue.textContent = pitch.value;
}

rate.onchange = function() {
  rateValue.textContent = rate.value;
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
    if (tts_option.checked) {
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

function setup() {
    guessing = true;
    let date_string = get_new_date();
    document.title = date_string;

    let audio = document.getElementById("audio");
    audio.src = "silence.flac";

    audio.onpause = change_main_element;

    audio.onplay = function() {
        audio.pause()
    }

    main_element.onclick = audio_action;

    var options_button = document.getElementById("options");
    var colls = document.getElementsByClassName("collapsible");

    options_button.addEventListener("click", function() {
        for (j = 0; j < colls.length; ++j) {
            var element = colls[j];
            if (element.style.display === "block") {
                element.style.display = "none";
            } else {
                element.style.display = "block";
            }
        }
    });
}

setup();