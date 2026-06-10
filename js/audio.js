// 音乐数据
var musicData = [
  {
    name: "洛春赋",
    author: "赵方婧",
    src: "./mp3/music0.mp3",
    cover: "./img/record0.jpg",
    bg: "./img/bg0.png",
    mv: "./mp4/video0.mp4",
  },
  {
    name: "Yesterday",
    author: "The Beatles",
    src: "./mp3/music1.mp3",
    cover: "./img/record1.jpg",
    bg: "./img/bg1.png",
    mv: "./mp4/video1.mp4",
  },
  {
    name: "江南烟雨色",
    author: "等什么君",
    src: "./mp3/music2.mp3",
    cover: "./img/record2.jpg",
    bg: "./img/bg2.png",
    mv: "./mp4/video2.mp4",
  },
  {
    name: "Vision pt.II",
    author: "Alexis",
    src: "./mp3/music3.mp3",
    cover: "./img/record3.jpg",
    bg: "./img/bg3.png",
    mv: "./mp4/video3.mp4",
  },
];

// 播放模式: 0-顺序播放 1-单曲循环 2-随机播放
var mode = 0;
var modeName = ["顺序播放", "单曲循环", "随机播放"];
// 当前播放歌曲索引
var currentMusic = 0;
// 倍速选项
var speedOptions = [1.0, 1.5, 2.0];
var currentSpeedIndex = 0;

// 获取DOM元素
var audioTag = document.getElementById("audioTag");
var body = document.getElementById("body");
var recordImg = document.getElementById("record-img");
var musicTitle = document.getElementById("music-title");
var authorName = document.getElementById("author-name");
var playPause = document.getElementById("playPause");
var progressTotal = document.getElementById("progress-total");
var progress = document.getElementById("progress");
var playedTime = document.getElementById("playedTime");
var audioTime = document.getElementById("audioTime");
var skipForward = document.getElementById("skipForward");
var skipBackward = document.getElementById("skipBackward");
var playMode = document.getElementById("playMode");
var volumeBtn = document.getElementById("volume");
var volumeSlider = document.getElementById("volumn-togger");
var listBtn = document.getElementById("list");
var musicList = document.getElementById("music-list");
var closeList = document.getElementById("close-list");
var speedBtn = document.getElementById("speed");
var mvBtn = document.getElementById("MV");
var allList = document.getElementById("all-list");
var toast = document.getElementById("toast");

// 生成播放列表
function buildPlaylist() {
  allList.innerHTML = "";
  for (var i = 0; i < musicData.length; i++) {
    var item = document.createElement("div");
    item.setAttribute("data-index", i);
    item.innerHTML =
      '<span class="list-name">' +
      musicData[i].name +
      "</span>" +
      '<span class="list-author">' +
      musicData[i].author +
      "</span>";
    item.addEventListener("click", function () {
      var idx = parseInt(this.getAttribute("data-index"));
      currentMusic = idx;
      loadMusic(currentMusic);
      playSong();
      closeMusicList();
    });
    allList.appendChild(item);
  }
}

buildPlaylist();

// 显示提示信息
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 1500);
}

// 加载音乐
function loadMusic(index) {
  var music = musicData[index];
  audioTag.src = music.src;
  musicTitle.textContent = music.name;
  authorName.textContent = music.author;
  recordImg.style.backgroundImage = "url(" + music.cover + ")";
  body.style.backgroundImage = "url(" + music.bg + ")";
  updateListHighlight(index);
}

// 更新列表高亮
function updateListHighlight(index) {
  var allItems = allList.querySelectorAll("div");
  for (var i = 0; i < allItems.length; i++) {
    allItems[i].classList.remove("active");
    if (i === index) {
      allItems[i].classList.add("active");
    }
  }
}

// 播放歌曲
function playSong() {
  audioTag.play();
  playPause.classList.add("playing");
  playPause.title = "暂停";
  recordImg.className = "rotate-play";
}

// 暂停歌曲
function pauseSong() {
  audioTag.pause();
  playPause.classList.remove("playing");
  playPause.title = "播放";
  recordImg.className = "rotate-pause";
}

// 播放/暂停
playPause.addEventListener("click", function () {
  if (audioTag.paused) {
    playSong();
  } else {
    pauseSong();
  }
});

// 更新进度条和时间
audioTag.addEventListener("timeupdate", function () {
  if (!isDragging && audioTag.duration) {
    var percent = (audioTag.currentTime / audioTag.duration) * 100;
    progress.style.width = percent + "%";
    playedTime.textContent = transTime(audioTag.currentTime);
  }
});

// 加载完成显示总时长
audioTag.addEventListener("loadedmetadata", function () {
  audioTime.textContent = transTime(audioTag.duration);
});

// 进度条拖动跳转
var isDragging = false;

function seekTo(e) {
  var rect = progressTotal.getBoundingClientRect();
  var clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  var ratio = clickX / rect.width;
  progress.style.width = ratio * 100 + "%";
  playedTime.textContent = transTime(ratio * audioTag.duration);
  return ratio;
}

progressTotal.addEventListener("mousedown", function (e) {
  isDragging = true;
  var ratio = seekTo(e);
  if (audioTag.duration) {
    audioTag.currentTime = ratio * audioTag.duration;
  }
});

document.addEventListener("mousemove", function (e) {
  if (isDragging) {
    seekTo(e);
  }
});

document.addEventListener("mouseup", function (e) {
  if (isDragging) {
    isDragging = false;
    var rect = progressTotal.getBoundingClientRect();
    var clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    var ratio = clickX / rect.width;
    if (audioTag.duration) {
      audioTag.currentTime = ratio * audioTag.duration;
    }
  }
});

// 播放结束自动下一首
audioTag.addEventListener("ended", function () {
  if (mode === 0) {
    currentMusic = (currentMusic + 1) % musicData.length;
  } else if (mode === 1) {
    audioTag.currentTime = 0;
    audioTag.play();
    return;
  } else {
    var randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * musicData.length);
    } while (randomIndex === currentMusic && musicData.length > 1);
    currentMusic = randomIndex;
  }
  loadMusic(currentMusic);
  playSong();
});

// 下一首
skipForward.addEventListener("click", function () {
  currentMusic = (currentMusic + 1) % musicData.length;
  loadMusic(currentMusic);
  playSong();
});

// 上一首
skipBackward.addEventListener("click", function () {
  currentMusic = (currentMusic - 1 + musicData.length) % musicData.length;
  loadMusic(currentMusic);
  playSong();
});

// 切换播放模式
playMode.addEventListener("click", function () {
  mode = (mode + 1) % 3;
  playMode.title = modeName[mode];
  var modeImages = ["./img/mode2.png", "./img/mode1.png", "./img/mode3.png"];
  playMode.style.backgroundImage = "url(" + modeImages[mode] + ")";
  showToast(modeName[mode]);
});

// 音量调节
volumeSlider.addEventListener("input", function () {
  audioTag.volume = volumeSlider.value / 100;
  if (audioTag.volume === 0) {
    volumeBtn.classList.add("muted");
  } else {
    volumeBtn.classList.remove("muted");
  }
});

// 点击音量图标静音/取消静音
volumeBtn.addEventListener("click", function () {
  if (audioTag.muted) {
    audioTag.muted = false;
    volumeBtn.classList.remove("muted");
    volumeSlider.value = audioTag.volume * 100;
  } else {
    audioTag.muted = true;
    volumeBtn.classList.add("muted");
  }
});

// 初始化音量
audioTag.volume = volumeSlider.value / 100;

// 打开音乐列表
function openMusicList() {
  musicList.classList.add("show");
  closeList.classList.add("show");
}

// 关闭音乐列表
function closeMusicList() {
  musicList.classList.remove("show");
  closeList.classList.remove("show");
}

// 显示/隐藏音乐列表
listBtn.addEventListener("click", function () {
  if (musicList.classList.contains("show")) {
    closeMusicList();
  } else {
    openMusicList();
  }
});

// 点击遮罩关闭音乐列表
closeList.addEventListener("click", function () {
  closeMusicList();
});

// 倍速切换
speedBtn.addEventListener("click", function () {
  currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
  var speed = speedOptions[currentSpeedIndex];
  audioTag.playbackRate = speed;
  speedBtn.textContent = speed.toFixed(1) + "X";
  if (currentSpeedIndex === 0) {
    speedBtn.classList.remove("active");
  } else {
    speedBtn.classList.add("active");
  }
  showToast("倍速 " + speed.toFixed(1) + "X");
});

// MV 播放
mvBtn.addEventListener("click", function () {
  pauseSong();

  var overlay = document.createElement("div");
  overlay.className = "mv-overlay show";

  var video = document.createElement("video");
  video.src = musicData[currentMusic].mv;
  video.controls = true;
  video.autoplay = true;

  var closeBtn = document.createElement("button");
  closeBtn.className = "mv-close";
  closeBtn.textContent = "关闭MV";

  overlay.appendChild(video);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  function closeMV() {
    video.pause();
    document.body.removeChild(overlay);
  }

  closeBtn.addEventListener("click", closeMV);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeMV();
    }
  });

  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape") {
      closeMV();
      document.removeEventListener("keydown", escHandler);
    }
  });
});

// 初始化第一首歌
loadMusic(currentMusic);

// 音频播放时间换算
function transTime(value) {
  var time = "";
  var h = parseInt(value / 3600);
  value %= 3600;
  var m = parseInt(value / 60);
  var s = parseInt(value % 60);
  if (h > 0) {
    time = formatTime(h + ":" + m + ":" + s);
  } else {
    time = formatTime(m + ":" + s);
  }
  return time;
}

// 格式化时间显示，补零对齐
function formatTime(value) {
  var time = "";
  var s = value.split(":");
  var i = 0;
  for (; i < s.length - 1; i++) {
    time += s[i].length == 1 ? "0" + s[i] : s[i];
    time += ":";
  }
  time += s[i].length == 1 ? "0" + s[i] : s[i];
  return time;
}
