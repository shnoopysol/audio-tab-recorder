function injectedFunction() {
  let mediaRecorder;

  const recorderDiv = document.createElement("div");
  recorderDiv.style.padding = "1em";
  recorderDiv.style.backgroundColor = "red";
  recorderDiv.style.textAlign = "center";
  const startButton = document.createElement("button");
  startButton.textContent = "start recording";
  startButton.addEventListener("click", (evt) => {
    console.log("recording should start");
    startRecordingWindowAudio();
  });
  startButton.style.marginRight = "1em";
  startButton.style.padding = "1em";
  startButton.style.backgroundColor = "lightgray";
  const stopButton = document.createElement("button");
  stopButton.textContent = "stop recording";
  stopButton.addEventListener("click", (evt) => {
    console.log("recording should stop");
    mediaRecorder.stop();
  });
  stopButton.style.padding = "1em";
  stopButton.style.backgroundColor = "lightgray";
  recorderDiv.appendChild(startButton);
  recorderDiv.appendChild(stopButton);
  document.body.prepend(recorderDiv);

  function startRecordingWindowAudio() {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
      const track = stream.getAudioTracks()[0];
      if (!track) throw "System audio not available!";

      stream.getVideoTracks().forEach((track) => track.stop());

      const mediaStream = new MediaStream();
      mediaStream.addTrack(track);

      const chunks = [];

      mediaRecorder = new MediaRecorder(mediaStream);

      mediaRecorder.ondataavailable = (evt) => chunks.push(evt.data);

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaStream.removeTrack(track);
        const blob = new Blob(chunks, { type: "audio/wav; codecs=0" });
        const aud = new Audio(URL.createObjectURL(blob));
        aud.controls = true;
        aud.id = "recordedAudioEl";
        const prevRecordedAudioEl = document.getElementById("recordedAudioEl");
        if (prevRecordedAudioEl) {
          console.log("deleting old audio element...");
          prevRecordedAudioEl.remove();
        }
        document.body.prepend(aud);
      };

      mediaRecorder.start();
    });
  }
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectedFunction,
  });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("This is coming from the background script!");
});
