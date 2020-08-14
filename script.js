// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = "";

// Set token
let _token = hash.access_token;

const authEndpoint = "https://accounts.spotify.com/authorize";

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "86a19f59308f4529908699eecb6c61b7";
const redirectUri = "https://spotify-random-song.glitch.me";
const scopes = [
  "streaming",
  "user-modify-playback-state",
  "user-library-modify"
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
  )}&response_type=token`;
}

// Set up the Web Playback SDK

let deviceId;
let ids = [];

window.onSpotifyPlayerAPIReady = () => {
  const player = new Spotify.Player({
    name: "Big Spotify Button",
    getOAuthToken: cb => {
      cb(_token);
    }
  });

  // Error handling
  player.on("initialization_error", e => console.error(e));
  player.on("authentication_error", e => console.error(e));
  player.on("account_error", e => console.error(e));
  player.on("playback_error", e => console.error(e));

  // Playback status updates
  player.on("player_state_changed", state => {
    console.log(state);
  });

  // Ready
  player.on("ready", data => {
    console.log("Ready with Device ID", data.device_id);
    deviceId = data.device_id;
  });

  // Connect to the player!
  player.connect();
};

// Play a specified track on the Web Playback SDK's device ID
function play(device_id, track) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
    type: "PUT",
    data: `{"uris": ["${track}"]}`,
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      console.log(data);
    }
  });
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getASong() {
  let random_seed = makeid(2);
  let random_offset = Math.floor(Math.random() * 2000); // returns a random integer from 0 to 9
  $.ajax({
    url:
      "https://api.spotify.com/v1/search?type=track&offset=" +
      random_offset +
      "&limit=1&q=" +
      random_seed,
    type: "GET",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      console.log(data);
      let trackUri = data.tracks.items[0].uri;

      play(deviceId, trackUri);
      $("#current-track-name-save").attr("data-song", data.tracks.items[0].uri);
      $("#current-track-name-save").attr(
        "src",
        "https://cdn.glitch.com/eed3cfeb-d097-4769-9d03-2d3a6cc7c004%2Ficons8-heart-24.png?v=1597232027543"
      );
      $("#embed-uri").attr(
        "src",
        "https://open.spotify.com/embed/track/" + data.tracks.items[0].id
      );
      $("#current-track-name-save").css("display", "block");
    }
  });
}

function saveTrack(tid) {
  var track = $("#" + tid)
    .attr("data-song")
    .split(":")
    .pop();

  $.ajax({
    url: "https://api.spotify.com/v1/me/tracks?ids=" + track,
    type: "PUT",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      console.log(data);
      $("#" + tid).attr(
        "src",
        "https://cdn.glitch.com/eed3cfeb-d097-4769-9d03-2d3a6cc7c004%2Ficons8-heart-24(1).png?v=1597232463038"
      );
    }
  });
}
