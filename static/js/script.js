//let previous = document.querySelector('#pre');
let play = document.querySelector('#play');
//let next = document.querySelector('#next');
let title = document.querySelector('#title');
let recent_volume = document.querySelector('#volume');
let volume_show = document.querySelector('#volume_show');
let slider = document.querySelector('#duration_slider');
let show_duration = document.querySelector('#show_duration');
let track_image = document.querySelector('#track_image');
let auto_play = document.querySelector('#auto');
//let present = document.querySelector('#present');
//let total = document.querySelector('#total');
let artist = document.querySelector('#artist');

let timer;
let autoplay = 0;

let index_no = 0;
let Playing_song = false;

//create an audio element
let track = document.createElement('audio');

//Retrieving filename

const pdfContainer = document.getElementById("name-container");
const pdfFileName = pdfContainer.getAttribute("data-name")

//Retrieving audio_file
const audioContainer = document.getElementById("audio-container");
const audioFile = audioContainer.getAttribute("data-audio-file");

//All songs list
let All_song = [
  {
    name: pdfFileName,
    path: audioFile,
    img: 'https://orarum.com/agestas/img/img4.svg',
    singer: '',
  },
];

// All functions

// function load the track
function load_track(index_no) {
  clearInterval(timer);
  reset_slider();
  track.src = All_song[0].path;
  title.innerHTML = All_song[0].name;
  track_image.src = All_song[0].img;
  artist.innerHTML = All_song[0].singer;
  track.load();

  timer = setInterval(range_slider, 1000);
}

load_track(index_no);

//mute sound function
function mute_sound() {
  track.volume = 0;
  volume.value = 0;
  volume_show.innerHTML = 0;
}

// checking.. the song is playing or not
function justplay() {
  if (Playing_song == false) {
    playsong();
  } else {
    pausesong();
  }
}

// reset song slider
function reset_slider() {
  slider.value = 0;
}

// play song
function playsong() {
  track.play();
  Playing_song = true;
  play.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';
}

//pause song
function pausesong() {
  track.pause();
  Playing_song = false;
  play.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
}

// next song
//function next_song() {
//  if (index_no < All_song.length - 1) {
//    index_no += 1;
//    load_track(index_no);
//    playsong();
//  } else {
//    index_no = 0;
//    load_track(index_no);
//    playsong();
//  }
//}

// previous song
//function previous_song() {
//  if (index_no > 0) {
//    index_no -= 1;
//    load_track(index_no);
//    playsong();
//  } else {
//    index_no = All_song.length;
//    load_track(index_no);
//    playsong();
//  }
//}

// change volume
function volume_change() {
  volume_show.innerHTML = recent_volume.value;
  track.volume = recent_volume.value / 100;
}

// change slider position
function change_duration() {
  slider_position = track.duration * (slider.value / 100);
  track.currentTime = slider_position;
}

// format the time in mm:ss
function formatTime(seconds) {
  let min = Math.floor(seconds / 60);
  let sec = Math.floor(seconds % 60);
  if (sec < 10) {
    sec = '0' + sec;
  }
  return min + ':' + sec;
}

function range_slider() {
  let position = 0;

  // update slider position
  if (!isNaN(track.duration)) {
    position = track.currentTime * (100 / track.duration);
    slider.value = position;

    // update the displayed duration
    show_duration.innerHTML = formatTime(track.currentTime);
  }

  // function will run when the song is over
  if (track.ended) {
    play.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
    if (autoplay == 1) {
      index_no += 1;
      load_track(index_no);
      playsong();
    }
  }
}
