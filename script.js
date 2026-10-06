const slides = document.querySelectorAll(".slide");
const enterButton = document.getElementById("enterButton");
const startHackathonButton = document.getElementById("startButton");
const countdownNumber = document.getElementById("count");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");
const onlyHours = document.getElementById("onlyHours");
const onlyMinutes = document.getElementById("onlyMinutes");
const onlySeconds = document.getElementById("onlySeconds");
const TOTAL_TIME = 24 * 60 * 60 * 1000;
let timerInterval;
let finalSlideTimeout;
let hasShownTimeUp = false;

function resumeSavedTimer() {
  const timerState = localStorage.getItem("hackatopiaTimerState");
  const startTime = Number(localStorage.getItem("hackatopiaStartTime"));

  if (timerState === "running" && startTime) {
    showTimerSequence();
    updateTimer();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
  } else if (timerState === "expired") {
    updateTimer();
  }
}

resumeSavedTimer();
/* =================================
   SHOW SLIDE
================================= */
function showSlide(slideId) {
  slides.forEach(function (slide) {
    slide.classList.remove("active");
  });
  document.getElementById(slideId).classList.add("active");
}
/* =================================
   INTRO BUTTON
================================= */
enterButton.addEventListener("click", function () {
  startCountdown();
});
/* =================================
   COUNTDOWN
================================= */
function startCountdown() {
  showSlide("countdown");
  let number = 5;
  countdownNumber.textContent = number;
  const countdown = setInterval(function () {
    number--;
    countdownNumber.textContent = number;
    /*
                Restart the animation
            */

    countdownNumber.style.animation = "none";
    void countdownNumber.offsetWidth;
    countdownNumber.style.animation = "numberPop 1s ease";
    /*
                When we reach 0
            */
    if (number === 0) {
      clearInterval(countdown);
      showWelcomeSlides();
    }
  }, 1000);
}
/* =================================
   WELCOME SLIDES
================================= */
function showWelcomeSlides() {
  /*
        Participants
    */
  showSlide("participants");
  setTimeout(function () {
    /*
            Judges
        */
    showSlide("judges");
  }, 3000);
  setTimeout(function () {
    /*
            Faculty
        */
    showSlide("faculty");
  }, 6000);
  setTimeout(function () {
    /*
            Core Team
        */
    showSlide("team");
  }, 9000);
  setTimeout(function () {
    /*
            Volunteers
        */
    showSlide("volunteers");
  }, 12000);
  setTimeout(function () {
    /*
            Domains
        */
    showSlide("domains");
  }, 15000);
  setTimeout(function () {
    /*
            Final question
        */
    showSlide("start");
  }, 18000);
}
/* =================================
   START 24 HOUR TIMER
================================= */
startHackathonButton.addEventListener("click", function () {
  const timerState = localStorage.getItem("hackatopiaTimerState");
  const hasStartTime = localStorage.getItem("hackatopiaStartTime");

  if (
    !localStorage.getItem("hackatopiaAutoStarted") ||
    (!timerState && !hasStartTime) ||
    timerState === "expired"
  ) {
    localStorage.setItem("hackatopiaAutoStarted", "true");
    if (timerState === "expired") {
      localStorage.removeItem("hackatopiaPausedTime");
      localStorage.removeItem("hackatopiaStartTime");
      localStorage.removeItem("hackatopiaLiveStartedAt");
      localStorage.removeItem("hackatopiaTimerPhase");
    }
    start24HourTimer();
    return;
  }

  showTimerSequence();
});
/* =================================
   START TIMER
================================= */
function start24HourTimer() {
  hasShownTimeUp = false;
  const pausedTime = Number(localStorage.getItem("hackatopiaPausedTime"));
  const storedStartTime = Number(localStorage.getItem("hackatopiaStartTime"));
  let startTime = storedStartTime;

  if (pausedTime) {
    startTime = Date.now() - (TOTAL_TIME - pausedTime);
  } else if (!startTime) {
    startTime = Date.now();
  }

  localStorage.setItem("hackatopiaStartTime", startTime);
  localStorage.setItem("hackatopiaTimerState", "running");
  if (!localStorage.getItem("hackatopiaLiveStartedAt")) {
    localStorage.setItem("hackatopiaLiveStartedAt", Date.now());
    localStorage.setItem("hackatopiaTimerPhase", "live");
  }
  localStorage.removeItem("hackatopiaPausedTime");

  showTimerSequence();
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

function showTimerSequence() {
  const liveStartedAt = Number(localStorage.getItem("hackatopiaLiveStartedAt"));
  const elapsed = Date.now() - liveStartedAt;
  const liveDuration = 5000;

  if (localStorage.getItem("hackatopiaTimerPhase") === "timerOnly") {
    showSlide("timerOnly");
    return;
  }

  if (elapsed >= liveDuration) {
    localStorage.setItem("hackatopiaTimerPhase", "timerOnly");
    showSlide("timerOnly");
    return;
  }

  showSlide("timer");
  updateTimer();
  clearTimeout(finalSlideTimeout);
  finalSlideTimeout = setTimeout(function () {
    localStorage.setItem("hackatopiaTimerPhase", "timerOnly");
    showSlide("timerOnly");
  }, liveDuration - elapsed);
}

function stop24HourTimer() {
  const startTime = Number(localStorage.getItem("hackatopiaStartTime"));
  if (!startTime) {
    return;
  }

  const remaining = Math.max(TOTAL_TIME - (Date.now() - startTime), 0);
  localStorage.setItem("hackatopiaPausedTime", remaining);
  localStorage.setItem("hackatopiaTimerState", "stopped");
  localStorage.removeItem("hackatopiaStartTime");
  clearInterval(timerInterval);
  updateTimer();
}

function reset24HourTimer() {
  localStorage.setItem("hackatopiaPausedTime", TOTAL_TIME);
  localStorage.setItem("hackatopiaTimerState", "stopped");
  localStorage.removeItem("hackatopiaStartTime");
  clearInterval(timerInterval);
  updateTimer();
}
/* =================================
   UPDATE TIMER
================================= */
function updateTimer() {
  const startTime = Number(localStorage.getItem("hackatopiaStartTime"));
  const pausedTime = Number(localStorage.getItem("hackatopiaPausedTime"));
  const isStopped = localStorage.getItem("hackatopiaTimerState") === "stopped";
  const isExpired = localStorage.getItem("hackatopiaTimerState") === "expired";
  /*
        Current time
    */
  const now = Date.now();
  /*
        How much time has passed?
    */
  const elapsed = isStopped ? 0 : now - startTime;
  /*
        How much time remains?
    */
  let remaining = isExpired
    ? 0
    : isStopped
      ? pausedTime
      : TOTAL_TIME - elapsed;
  /*
        Timer finished
    */
  if (remaining <= 0) {
    remaining = 0;
    localStorage.setItem("hackatopiaTimerState", "expired");
    localStorage.removeItem("hackatopiaStartTime");
    localStorage.removeItem("hackatopiaPausedTime");
    clearInterval(timerInterval);
  }
  /*
        Convert milliseconds
        into seconds
    */
  const totalSeconds = Math.floor(remaining / 1000);
  /*
        Calculate hours
    */
  const remainingHours = Math.floor(totalSeconds / 3600);
  /*
        Calculate minutes
    */
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  /*
        Calculate seconds
    */
  const remainingSeconds = totalSeconds % 60;
  /*
        Display values
    */
  hours.textContent = String(remainingHours).padStart(2, "0");
  minutes.textContent = String(remainingMinutes).padStart(2, "0");
  seconds.textContent = String(remainingSeconds).padStart(2, "0");
  onlyHours.textContent = hours.textContent;
  onlyMinutes.textContent = minutes.textContent;
  onlySeconds.textContent = seconds.textContent;

  if (remaining === 0 && !hasShownTimeUp) {
    hasShownTimeUp = true;
    clearTimeout(finalSlideTimeout);
    showSlide("timeUp");
  }
}