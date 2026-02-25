/* ========== تنظیمات گوگل فرم ========== */
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd9VHVesRYtLCptOhWRcghUDIyzQ1L0q6A0lGnr2tugYg07aA/formResponse";
const NAME_ENTRY_ID = "entry.343465937";
const SCORE_ENTRY_ID = "entry.136173253";
let studentName = "";

/* ========== داده‌های ویدیوها ========= */
const START_VIDEO = "videos/Start-Loop.mp4";

const videos = {
    1: { src:"videos/1.mp4", loop:"videos/1-Loop.mp4", question: "تا تاریکی هوا چند ساعت وقت داره؟",
     choices:[{text:"۴"},{text:"۵"},{text:"۶"}], correctIndex: 1 },
    2: { src:"videos/2.mp4", loop:"videos/2-Loop.mp4", question: "از کدوم گیاه می‌تونه برای درمان زخمش استفاده کنه؟",
     choices:[{ text: "گیاه اول", image: "images/plant_a.webp" },
            { text: "گیاه دوم", image: "images/plant_b.webp" },
            { text: "گیاه سوم ", image: "images/plant_c.webp" }], correctIndex: 2 },
    3: { src:"videos/3.mp4", loop:"videos/3-Loop.mp4", question: "باید از کدوم دسته کمک بگیره؟",
     choices:[{text:"پنج تا دو متری"},{text:"سه تا چهار متری"}], correctIndex: 1 },
    4: { src:"videos/4.mp4", loop:"videos/4-Loop.mp4", question: "چه کسری دیگه ای باید آب اضافه کنه تا گیاه راه درست رو نشون بده؟",
     choices:[{text:"دو ششم"},{text:"یک چهارم"},{text:"دو هشتم"}], correctIndex: 0 },
    5: { src:"videos/5.mp4",loop:"videos/5-Loop.mp4",question: "چند تا ضربه دیگه باید بزنه تا بیست میوه داشته باشه؟",
     choices:[{text:"۴"},{text:"۵"},{text:"۶"}], correctIndex: 0 },
    6: { src:"videos/6.mp4", loop: "videos/6-Loop.mp4",
    question: "جواب چی میشه؟",
     choices:[{text:"۲۴"},{text:"۳۲"},{text:"۳۴"}], correctIndex: 2 }, 
   7: {
    src: "videos/7.mp4",
    loop: null,
    question: null,
    choices: null },
};

const linearOrder = ['1','2','3','4','5','6','7'];

/* --- المان‌های DOM --- */
const startBtn = document.getElementById('start-btn');
const startBg = document.getElementById('startBg');
const fadeOverlay = document.getElementById('fadeOverlay');
const playerDiv = document.getElementById('player');
const video1 = document.getElementById('videoPlayer1');
const video2 = document.getElementById('videoPlayer2');
const loopVideo = document.getElementById('loopVideo');
const choicesDiv = document.getElementById('choices');
const overlayText = document.getElementById('overlayText');
const timerDiv = document.getElementById('timerDiv');
const regScreen = document.getElementById('registration-screen');
const preloadScreen = document.getElementById('preload-screen');
const nameInput = document.getElementById('studentNameInput');
const confirmBtn = document.getElementById('confirmNameBtn');
const rotateIcon = document.querySelector('.rotate-icon');
const rotateText = document.getElementById('rotateText');
/* --- وضعیت سیستم --- */
let activeVideo = video1;
let inactiveVideo = video2;
let currentIndex = 0;
let currentKey = linearOrder[0];
let countdownInterval = null;
let score = 0;
let answeredThisStep = false;
const videoBlobs = {}; // این متغیر نگه داشته شد تا بقیه کد به هم نریزد

// دیگر نیازی به دانلود کامل با Blob نیست، مستقیم از لینک استفاده می‌کنیم
function getSrcOrBlob(url){ return videoBlobs[url] || url; }
/* ================= ۱. سیستم ثبت‌نام و پری‌لود ================= */

confirmBtn.addEventListener('click', () => {
    studentName = nameInput.value.trim();
    if (!studentName) {
        alert("لطفاً اسمت رو بنویس قهرمان!");
        return;
    }
    regScreen.classList.add('hidden');
    preloadScreen.classList.remove('hidden');
    startPreloadingProcess();
});

async function startPreloadingProcess() {
    document.getElementById('preload-msg').innerText = "آماده ای؟";

    try {
        // ۱. دانلود کاملِ فقط و فقط ویدیوی استارت (برای نمایش فوری و بدون قطعی)
        const response = await fetch(START_VIDEO);
        const blob = await response.blob();
        videoBlobs[START_VIDEO] = URL.createObjectURL(blob);
        
        startBg.src = getSrcOrBlob(START_VIDEO);
        
        // ۲. استریم ویدیوی اول بازی (بدون دانلود کامل)
        inactiveVideo.src = videos[linearOrder[0]].src;
        inactiveVideo.preload = "auto";

        let loadedCount = 0;

        const finishPreload = () => {
            if (preloadScreen.classList.contains('hidden')) return; // جلوگیری از اجرای دوگانه
            preloadScreen.style.opacity = '0';
            setTimeout(() => {
                preloadScreen.classList.add('hidden');
                showStartScreen();
            }, 500);
        };

        const checkReady = () => {
            loadedCount++;
            // منتظریم تا هم ویدیوی استارت (سریع) و هم نوک ویدیوی اول (استریم) آماده شوند
            if (loadedCount >= 2) {
                setTimeout(finishPreload, 2000); // زمان برای خواندن "گوشیت رو بچرخون"
            }
        };

        // گوش دادن به رویدادهای مرورگر (canplaythrough برای ویدیوی کامل، loadeddata برای ویدیوی استریم)
        startBg.addEventListener('canplaythrough', checkReady, { once: true });
        inactiveVideo.addEventListener('loadeddata', checkReady, { once: true });

        // فال‌بک طلایی: اگر اینترنت کاربر خیلی ضعیف بود، بعد از 8 ثانیه به زور وارد بازی بشه تا گیر نکنه
        setTimeout(finishPreload, 8000); 

    } catch (e) {
        console.error("خطا در بارگذاری:", e);
        showStartScreen(); // در صورت خطا هم وارد بازی شود
    }
}
function showStartScreen() {
    regScreen.style.display = 'none';
    preloadScreen.style.display = 'none';

    const startScreenEl = document.getElementById('start-screen');
    startScreenEl.classList.remove('hidden');
    startScreenEl.style.display = 'flex';

    startBg.src = getSrcOrBlob(START_VIDEO);

    // تنظیمات مهم برای موبایل
    startBg.muted = true;
    startBg.loop = true;
    startBg.playsInline = true;

    startBg.play().catch(() => {});

    startBtn.classList.add('visible');
}

/* ================= ۲. کنترل دکمه شروع نهایی ================= */
startBtn.onclick = () => {
    fadeOverlay.style.opacity = "1";
    setTimeout(() => {
        try { startBg.pause(); } catch(e){}
        document.getElementById('start-screen').style.display = 'none';
        playerDiv.style.display = 'flex';
        currentIndex = 0;
        score = 0;
        playCurrentVideo();
    }, 420);
};

/* ================= ۳. منطق اصلی پخش ویدیو و جابجایی ================= */

// تابع جدید برای دانلود مخفیانه ویدیوی بعدی در حین بازی کاربر
function preloadNextVideoInGame() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < linearOrder.length) {
        const nextKey = linearOrder[nextIndex];
        const nextSrc = videos[nextKey].src;
        
        // ویدیوی بعدی رو میذاریم توی پلیری که الان خاموشه تا دانلودش شروع بشه
        inactiveVideo.src = nextSrc;
        inactiveVideo.preload = "auto";
        inactiveVideo.load();
    }
}

function playCurrentVideo(){
    if(currentIndex >= linearOrder.length){
        showFinalResults();
        return;
    }
    currentKey = linearOrder[currentIndex];
    stopLoop();
    overlayText.classList.remove('show');
    hideChoicesImmediate();

    const desiredSrc = videos[currentKey]?.src;
    swapToInactiveAndPlay(desiredSrc);

    // --- تغییر جدید: پیش‌بارگذاری ویدیوی لوپ همین مرحله در پس‌زمینه ---
    const loopSrc = videos[currentKey]?.loop;
    if (loopSrc) {
        // اگر سورس از قبل تنظیم نشده بود، تنظیمش می‌کنیم تا دانلودش شروع بشه
        if (!loopVideo.src.includes(loopSrc)) {
            loopVideo.src = getSrcOrBlob(loopSrc);
            loopVideo.preload = "auto";
            loopVideo.load();
        }
    }
    // ------------------------------------------------------------------
}
function swapToInactiveAndPlay(desiredSrc){
    // بررسی می‌کنیم که آیا سورس ویدیو از قبل تنظیم شده یا نه
    if (!inactiveVideo.src.endsWith(desiredSrc)) {
        inactiveVideo.src = getSrcOrBlob(desiredSrc);
        inactiveVideo.load();
    }
    
    inactiveVideo.muted = false;
    inactiveVideo.style.opacity = 0;
    
    const doSwap = () => {
        inactiveVideo.oncanplaythrough = null;
        inactiveVideo.onloadeddata = null;
        inactiveVideo.play().catch(()=>{});
        inactiveVideo.style.opacity = 1;
        activeVideo.style.opacity = 0;
        [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];
    };

    if (inactiveVideo.readyState >= 3) { 
        doSwap(); 
    } else { 
        inactiveVideo.oncanplaythrough = doSwap; 
        inactiveVideo.onloadeddata = doSwap; // فال‌بک برای موبایل
    }
}

/* ================= ۴. اتمام ویدیو و نمایش سوالات ================= */

function onVideoEndLinear(){
    // پایان بازی
    if (currentIndex === linearOrder.length - 1) {
        handleGameEnd();
        return; 
    }

    // پیش‌بارگذاری ویدیوی مرحله بعدی در پس‌زمینه
    preloadNextVideoInGame();

    // نمایش سوال
    const vid = videos[currentKey];
    if(vid.question){
        overlayText.innerText = vid.question;
        overlayText.classList.add('show');
    }

    if(vid.loop) startLoop(vid.loop);
    showChoicesLinear(currentKey);
    startChoiceCountdown(20);
}

function handleGameEnd() {
    playerDiv.style.display = 'none';
    const endScreen = document.getElementById('end-screen');
    const finalScoreDiv = document.getElementById('finalScore');
    
    const totalQuestions = linearOrder.length - 1;
    finalScoreDiv.innerText =
  `تعداد پاسخ‌های درست: ${score.toLocaleString('fa-IR')} از ${totalQuestions.toLocaleString('fa-IR')}`;

    endScreen.classList.remove('hidden');
    
    submitToGoogleForms();
    
}

/* ================= ۵. توابع کمکی (تایمر، انتخاب‌ها و غیره) ================= */

function startChoiceCountdown(seconds){
    const bar = document.getElementById('timerBar');
    let timeLeft = seconds;

    timerDiv.classList.add('show');
    bar.style.transform = 'scaleX(1)';

    countdownInterval = setInterval(() => {
        timeLeft--;
        const progress = timeLeft / seconds;
        bar.style.transform = `scaleX(${progress})`;

        if (timeLeft <= 0) {
            stopChoiceCountdown();
            endCurrentAndProceed();
        }
    }, 1000);
}

function stopChoiceCountdown(){
    if(countdownInterval) clearInterval(countdownInterval);
    timerDiv.classList.remove('show');
}


/* ======================== choices (نسخه نهایی و ۱۰۰٪ کارآمد) ======================== */

function showChoicesLinear(key) {
    if (!choicesDiv) return;

    choicesDiv.innerHTML = ''; 
    const vid = videos[key];

    if (!vid || !vid.choices || !vid.choices.length === 0) {
        choicesDiv.classList.add('hidden');
        return;
    }

    answeredThisStep = false;
    choicesDiv.classList.remove('hidden');

    // ۱. ابتدا تمام دکمه ها را در یک آرایه می سازیم
    const buttonElements = vid.choices.map((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';

        // --- <<< تغییر کلیدی در اینجا اعمال شده است >>> ---
        if (choice.image) {
            // اگر گزینه، ویژگی 'image' را داشت
            btn.classList.add('image-choice'); // کلاس جدید برای استایل دهی
            const img = document.createElement('img');
            img.src = choice.image;
            img.alt = choice.text || `گزینه ${idx + 1}`; // متن جایگزین
            btn.appendChild(img);
        } else {
            // اگر فقط متن داشت (رفتار قبلی)
            btn.innerText = choice.text || (idx === 0 ? 'درست' : 'غلط');
        }
        // --- <<< پایان تغییر >>> ---

        return btn;
    });

    // ۲. برای هر دکمه، شنونده رویداد را اضافه می کنیم
    buttonElements.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            if (answeredThisStep) return;
            answeredThisStep = true;
            
            stopChoiceCountdown();

            const correctIndex = typeof vid.correctIndex === 'number' ? vid.correctIndex : 0;
            const isCorrect = (idx === correctIndex);
            
            // ۳. استایل ها برای بازخورد (منطق شما، بدون تغییر)
             if (isCorrect) {
                score++;
                btn.classList.add('correct'); // <<< استایل سبز و انیمیشن impactScale اعمال می شود >>>
                playSuccessSound(); // <<< پخش صدای تشویق >>>
            } else {
                btn.classList.add('incorrect');
                if (buttonElements[correctIndex]) {
                    buttonElements[correctIndex].classList.add('correct');
                }
            playFailSound(); // <<< پخش صدای پاسخ غلط >>>
            }

            // ۴. غیرفعال کردن دکمه های دیگر (منطق شما، بدون تغییر)
            buttonElements.forEach(otherBtn => {
                if (!otherBtn.classList.contains('correct') && !otherBtn.classList.contains('incorrect')) {
                    otherBtn.classList.add('disabled');
                }
            });
            
            // ۵. وقفه تعلیق آمیز (منطق شما، بدون تغییر)
            setTimeout(() => {
                endCurrentAndProceed();
            }, 3000);
        });
    });

    // ۶. اضافه کردن دکمه ها به DOM (منطق شما، بدون تغییر)
    buttonElements.forEach(btn => {
        choicesDiv.appendChild(btn);
    });

    if (choicesDiv.children.length === 1) {
        choicesDiv.children[0].style.minWidth = '220px';
    }
}

function endCurrentAndProceed(){
    currentIndex++;
    hideChoicesImmediate();
    playCurrentVideo();
}

function hideChoicesImmediate(){
    choicesDiv.innerHTML = '';
    choicesDiv.classList.add('hidden');
}

function startLoop(src){
    if(!src) return;
    
    // چون در تابع بالا ویدیو را بارگذاری کردیم، اینجا فقط چک می‌کنیم که سورس درست باشد
    if (!loopVideo.src.includes(src)) {
        loopVideo.src = getSrcOrBlob(src);
    }
    
    loopVideo.loop = true;
    
    // --- تغییر جدید: می‌آوریمش روی ویدیوی اصلی تا پرش تصویر نداشته باشیم ---
    loopVideo.style.zIndex = "6"; 
    loopVideo.style.opacity = 1;
    loopVideo.play().catch(()=>{});
}

function stopLoop(){
    loopVideo.pause();
    loopVideo.style.opacity = 0;
    // --- تغییر جدید: برمی‌گردانیمش به لایه زیرین ---
    loopVideo.style.zIndex = "4"; 
}
/* ========== توابع کمکی برای افکت های تشویقی (صدا) ========== */

// برای پخش صدای تشویق
function playSuccessSound() {
    const successAudio = new Audio('audio/success.mp3'); // <<< مسیر فایل صوتی شما
    successAudio.play().catch(e => console.error("خطا در پخش صدا:", e));
}

function playFailSound() {
    const failAudio = new Audio('audio/fail.mp3'); // <<< مسیر فایل صوتی شما
    failAudio.play().catch(e => console.error("خطا در پخش صدا:", e));
}

function handleOrientation() {
  // اگر عرض > ارتفاع یعنی حالت landscape
  if (window.innerWidth > window.innerHeight) {
    rotateIcon.style.display = 'none'; // مخفی کردن
 rotateText.textContent = '...برو که رفتیم'; // متن جدید  
} else {
    rotateIcon.style.display = 'block'; // دوباره نشان دادن در portrait
rotateText.textContent = 'گوشیت رو بچرخون'; // متن اصلی
  }
}

// بررسی اولیه
handleOrientation();

// اضافه کردن event listener
window.addEventListener('resize', handleOrientation);
window.addEventListener('orientationchange', handleOrientation);

// ارسال گزارش
async function submitToGoogleForms() {
    const formData = new FormData();
    formData.append(NAME_ENTRY_ID, studentName);
    formData.append(SCORE_ENTRY_ID, score);
    try {
        await fetch(GOOGLE_FORM_URL, { method: "POST", mode: "no-cors", body: formData });
    } catch (e) { console.error("خطا در ارسال:", e); }
}

/* ================= ۶. راه‌اندازی اولیه و رویدادها ================= */

// اتصال رویداد پایان ویدیو به پلیرها
video1.addEventListener('ended', onVideoEndLinear);
video2.addEventListener('ended', onVideoEndLinear);

// آماده‌سازی تایمر
let timerFGcircle, timerNumberEl, timerCircumference;
function ensureTimerUI() {
    if (timerDiv.querySelector('.timer-wrap')) return;
    timerDiv.innerHTML = `
        <div class="timer-wrap">
            <svg class="timer-svg" viewBox="0 0 100 100">
                <circle class="timer-bg" cx="50" cy="50" r="44"></circle>
                <circle class="timer-fg" cx="50" cy="50" r="44"></circle>
            </svg>
            <div class="timer-number"></div>
        </div>`;
    timerFGcircle = timerDiv.querySelector('.timer-fg');
    timerNumberEl = timerDiv.querySelector('.timer-number');
    timerCircumference = 2 * Math.PI * 44;
    timerFGcircle.style.strokeDasharray = timerCircumference;
}

// دکمه شروع دوباره
document.getElementById('restart-btn').onclick = () => location.reload();