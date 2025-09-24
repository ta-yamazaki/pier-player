<template>
 <div>aaaaaaaaaa</div>
</template>

<script setup>
definePageMeta({layout: false})
const body = document.getElementsByTagName('body')[0]

window.onload = (event) => {
  window.sub.subWindowShow((event, param) => {
    body.innerHTML = ""
    if (param.type.match(/video\/.*/)) playVideo(event, param)
    if (param.type.match(/audio\/.*/)) playAudio(event, param)
  })

  function playVideo(event, param) {
    const source = document.createElement('source');
    source.src = param.path
    source.type = param.type

    const video = document.createElement('video');
    video.appendChild(source);
    body.appendChild(video);

    // event.sender.send('subContentsCreated')

    video.play().then(() => {
      body.classList.add("start")
    }).catch((e) => console.error(e))

    video.addEventListener("ended", () => {
      body.classList.add("end")
    })
  }

  function playAudio(event, param) {
    const audio = document.createElement('audio');
    audio.src = param.path
    audio.type = param.type
    body.appendChild(audio);
    audio.play()
  }

  // window.sub.subWindowHide((event) => {
  //     body.innerHTML = ""
  //     body.classList.remove("start")
  //     body.classList.remove("end")
  // })
};
</script>

<style scoped>
html {
  background-color: black;
}

body {
  margin: 0;
  overflow: hidden;
  opacity: 0;
}

body.start {
  opacity: 1;
  animation-name: fadeIn;
  animation-duration: 1s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

body.start.end {
  opacity: 0;
  animation-name: blackOut;
  animation-duration: 1s;
}

@keyframes blackOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

video {
  width: 100%;
}
</style>