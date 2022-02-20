var guessing = true;
var current_date = null;

var synth = window.speechSynthesis;

var inputForm = document.querySelector('form');
var inputTxt = document.querySelector('.txt');
var voiceSelect = document.querySelector('select');

var pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value');

var voices = [];

let default_voice = 'DEFAULT'

function populateVoiceList() {
  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;

    voiceSelect.innerHTML = '';
    var option = document.createElement('option');
    option.textContent = default_voice;
    option.setAttribute('data-name', default_voice);
    voiceSelect.appendChild(option);

  for(i = 0; i < voices.length ; i++) {
    if (!voices[i].lang.startsWith('en')) {
        continue;
    }
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
    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    if (selectedOption != default_voice) {
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

  if (inputTxt.value !== '') {
    speak(inputTxt.value);
  }

  inputTxt.blur();
}

pitch.onchange = function() {
  pitchValue.textContent = pitch.value;
}

rate.onchange = function() {
  rateValue.textContent = rate.value;
}

voiceSelect.onchange = function(){
  speak();
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

function get_day_string(date) {
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
    if (document.getElementById("tts").checked) {
        speak(text);
    }
}

function get_new_date() {
    current_date = random_date(new Date("1700-01-01"), new Date("2100-01-01"));
    document.getElementById("date-element").textContent = get_date_string(current_date);
}

function audio_action() {
    if (guessing) {
        let weekday = get_day_string(current_date);
        document.title = weekday;
        speak_if_tts(weekday);
        guessing = false;
    } else {
        get_new_date();
        let date_string = get_date_string_for_tts(current_date);
        document.title = date_string;
        speak_if_tts(date_string);
        guessing = true;
    }
}

function setup() {
    guessing = true;
    get_new_date();
    let date_string = get_date_string_for_tts(current_date);
    document.title = date_string;
    inputTxt.value = get_date_string_for_tts(new Date(Date.now()));

    let audio = document.getElementById("audio");
    audio.src = "silence.flac";

    audio.onpause = function() {
        audio_action();
    }

    audio.onplay = function() {
        audio_action();
    }
}

setup();