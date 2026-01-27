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
     choices:[{ text: "گیاه اول", image: "images/plant_a.png" },
            { text: "گیاه دوم", image: "images/plant_b.png" },
            { text: "گیاه سوم ", image: "images/plant_c.png" }], correctIndex: 2 },
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

/* --- وضعیت سیستم --- */
let activeVideo = video1;
let inactiveVideo = video2;
let currentIndex = 0;
let currentKey = linearOrder[0];
let countdownInterval = null;
let score = 0;
let answeredThisStep = false;
const videoBlobs = {}; // محل ذخیره ویدیوهای لود شده

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
    // پری‌لود کردن ویدیوی بک‌گراند استارت و دو ویدیوی اول بازی
    const initialAssets = [
    START_VIDEO,
    videos['1'].src,
    videos['1'].loop,
    videos['2'].src
];

    
    try {
        for (const url of initialAssets) {
            if (!url) continue;
            const response = await fetch(url);
            const blob = await response.blob();
            videoBlobs[url] = URL.createObjectURL(blob); // ذخیره در حافظه
        }
        
        document.getElementById('preload-msg').innerText = "همه چیز آماده‌ست!";
        
        setTimeout(() => {
            preloadScreen.style.opacity = '0';
            setTimeout(() => {
                preloadScreen.classList.add('hidden');
                showStartScreen();
            }, 500);
        }, 3000); // ۳ ثانیه زمان برای خواندن پیام "گوشی را بچرخان"
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
}

function swapToInactiveAndPlay(desiredSrc){
    inactiveVideo.src = getSrcOrBlob(desiredSrc);
    inactiveVideo.muted = false;
    inactiveVideo.style.opacity = 0;
    
    const doSwap = () => {
        inactiveVideo.oncanplaythrough = null;
        inactiveVideo.play().catch(()=>{});
        inactiveVideo.style.opacity = 1;
        activeVideo.style.opacity = 0;
        [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];
    };

    if (inactiveVideo.readyState >= 3) { doSwap(); } 
    else { inactiveVideo.oncanplaythrough = doSwap; }
}

/* ================= ۴. اتمام ویدیو و نمایش سوالات ================= */

function onVideoEndLinear(){
    if (currentIndex === linearOrder.length - 1) {
        handleGameEnd();
        return; 
    }

    const vid = videos[currentKey];

    // نمایش سوال اگر وجود داره
    if(vid.question){
        overlayText.innerText = vid.question;
        overlayText.classList.add('show');
    }

    if(vid.loop) startLoop(vid.loop);

    if(vid.choices && vid.choices.length > 0){
        showChoicesLinear(currentKey);
        startChoiceCountdown(20);
    } else {
        // عبور خودکار اگر سوالی نیست
        setTimeout(() => {
            endCurrentAndProceed();
        }, 1000);
    }
}

function handleGameEnd() {
    playerDiv.style.display = 'none';
    const endScreen = document.getElementById('end-screen');
    const finalScoreDiv = document.getElementById('finalScore');
    
    const totalQuestions = linearOrder.length - 1;
finalScoreDiv.innerText = `تعداد پاسخ صحیح شما: ${score} از ${totalQuestions}`;

    endScreen.classList.remove('hidden');
    
    submitToGoogleForms();
    
    setTimeout(() => {
        finalScoreDiv.innerText = "گزارش برای معلم ارسال شد. ممنون قهرمان!";
    }, 2000);
}

/* ================= ۵. توابع کمکی (تایمر، انتخاب‌ها و غیره) ================= */

function startChoiceCountdown(seconds){
    stopChoiceCountdown(); // تایمر قبلی قطع میشه
    const bar = document.getElementById('timerBar');
    let timeLeft = seconds;

    // ریست CSS تایمر
    bar.style.transform = 'scaleX(1)';
    timerDiv.classList.add('show');

    countdownInterval = setInterval(() => {
        timeLeft--;
        const progress = timeLeft / seconds;
        bar.style.transform = `scaleX(${progress})`;

        if (timeLeft <= 0) {
            stopChoiceCountdown();

            if(!answeredThisStep) {
                answeredThisStep = true; // علامت پایان مرحله
                // امتیاز صفر ثبت میشه یا فقط رد میشه
            }

            endCurrentAndProceed(); // همیشه مرحله بعدی اجرا میشه
        }
    }, 1000);
}

function stopChoiceCountdown(){
    if(countdownInterval) clearInterval(countdownInterval);
    timerDiv.classList.remove('show');
}


/* در main.js، این تابع را با نسخه جدید جایگزین کنید */

/* ======================== choices (نسخه نهایی و اصلاح شده) ======================== */

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
                btn.classList.add('correct');
            } else {
                btn.classList.add('incorrect');
                if (buttonElements[correctIndex]) {
                    buttonElements[correctIndex].classList.add('correct');
                }
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
            }, 2000);
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
    loopVideo.src = getSrcOrBlob(src);
    loopVideo.loop = true;
    loopVideo.style.opacity = 1;
    loopVideo.play().catch(()=>{});
}

function stopLoop(){
    loopVideo.pause();
    loopVideo.style.opacity = 0;
}

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
