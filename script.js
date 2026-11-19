/* ==========================================
   НАСТРОЙКИ
   ========================================== */
const CONFIG = {
    catalogUrl: "https://www.atomy.ru/category?ysclid=mwlo1vq294273795948&sortType=POPULAR",
    registrationUrl: "https://forms.yandex.ru/u/65afb571c769f110773f1b77/",
    myChatUrl: "https://max.ru/u/f9LHodD0cOIx3B2hAWPt-lCGUBdjU4_3OZDrf3BNgPOds3ubPydwo_aFTWs"
};

/* ==========================================
   КЛЮЧ ХРАНИЛИЩА
   ========================================== */
const STORAGE_KEY = "atomy_reviews_json";

/* ==========================================
   БАЗА ОТЗЫВОВ (JSON)
   Инициализация при первом запуске
   ========================================== */
const DEFAULT_REVIEWS = [
    { author: "Елена", stars: 5, text: "Эти Патчи от Атоми-наша Любовь 💎", date: "2026-11-12" },
    { author: "Анна", stars: 5, text: "Отличная косметика, пользуюсь уже полгода. Регистрация прошла быстро, менеджер всё объяснил", date: "2026-10-20" },
    { author: "Марина", stars: 4, text: "Качество на высоте, доставка немного задержалась, но результат того стоит", date: "2026-10-28" },
    { author: "Ольга", stars: 5, text: "Хорошая компания Атоми.И цена нормальная.Рассчитана на среднего потребителя", date: "2026-11-02" },
    { author: "Ирина", stars: 5, text: "Я только начинаю знакомиться с продукцией Атоми и мне очень нравится", date: "2026-11-10" }
];

/* ==========================================
   РАБОТА С "JSON-БАЗОЙ" (localStorage)
   ========================================== */
function loadReviews() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        // Первый запуск — заполняем дефолтными отзывами
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
        return [...DEFAULT_REVIEWS];
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Ошибка чтения JSON:", e);
        return [];
    }
}

function saveReviewsToStorage(reviews) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

/* ==========================================
   КНОПКИ ГЛАВНОГО ЭКРАНА
   ========================================== */
function openCatalog() {
    window.open(CONFIG.catalogUrl, '_blank');
}

function openRegistration() {
    window.open(CONFIG.registrationUrl, '_blank');
}

function openChat() {
    window.open(CONFIG.myChatUrl, '_blank');
}

/* ==========================================
   МОДАЛЬНОЕ ОКНО: ФОРМА ОТЗЫВА
   ========================================== */
let selectedRating = 0;

function openReviewForm() {
    selectedRating = 0;
    document.getElementById("reviewName").value = "";
    document.getElementById("reviewText").value = "";
    updateStars(0);
    document.getElementById("reviewFormModal").classList.add("active");
}

function closeReviewForm() {
    document.getElementById("reviewFormModal").classList.remove("active");
}

/* --- Звёзды --- */
function updateStars(value) {
    const stars = document.querySelectorAll("#starsInput .star");
    stars.forEach(star => {
        const v = parseInt(star.dataset.value, 10);
        star.classList.toggle("active", v <= value);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Инициализация звёзд
    const stars = document.querySelectorAll("#starsInput .star");
    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.value, 10);
            updateStars(selectedRating);
        });
        star.addEventListener("mouseenter", () => {
            updateStars(parseInt(star.dataset.value, 10));
        });
    });

    const starsContainer = document.getElementById("starsInput");
    if (starsContainer) {
        starsContainer.addEventListener("mouseleave", () => {
            updateStars(selectedRating);
        });
    }

    // Закрытие модалок по клику вне окна
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function (e) {
            if (e.target === this) {
                this.classList.remove("active");
            }
        });
    });
});

/* ==========================================
   СОХРАНЕНИЕ ОТЗЫВА
   ========================================== */
function saveReview() {
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();

    if (!name) {
        alert("Пожалуйста, укажите ваше имя.");
        return;
    }
    if (selectedRating < 1) {
        alert("Пожалуйста, поставьте оценку (1–5 звёзд).");
        return;
    }
    if (!text) {
        alert("Пожалуйста, напишите комментарий.");
        return;
    }

    const newReview = {
        author: name,
        stars: selectedRating,
        text: text,
        date: new Date().toISOString().slice(0, 10)
    };

    // Читаем текущую JSON-базу, добавляем новый отзыв, сохраняем обратно
    const reviews = loadReviews();
    reviews.push(newReview);
    saveReviewsToStorage(reviews);

    alert("Спасибо! Ваш отзыв сохранён.");
    closeReviewForm();
}

/* ==========================================
   МОДАЛЬНОЕ ОКНО: СПИСОК ОТЗЫВОВ (5 последних)
   ========================================== */
function openReviewsList() {
    const modal = document.getElementById("reviewsListModal");
    const list = document.getElementById("reviewsList");

    const reviews = loadReviews();

    // Сортируем по дате (новые сверху) и берём 5 последних
    const lastFive = reviews
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    list.innerHTML = "";

    if (lastFive.length === 0) {
        list.innerHTML = '<div class="empty-message">Пока нет отзывов. Будьте первым!</div>';
    } else {
        lastFive.forEach(review => {
            const stars = "★".repeat(review.stars) + "☆".repeat(5 - review.stars);
            const card = document.createElement("div");
            card.className = "review-card";
            card.innerHTML = `
                <div class="review-author">${escapeHtml(review.author)}</div>
                <div class="review-stars">${stars}</div>
                <p class="review-text">${escapeHtml(review.text)}</p>
                <div class="review-date">${review.date}</div>
            `;
            list.appendChild(card);
        });
    }

    modal.classList.add("active");
}

function closeReviewsList() {
    document.getElementById("reviewsListModal").classList.remove("active");
}

/* ==========================================
   БЕЗОПАСНОСТЬ: экранирование HTML
   ========================================== */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
