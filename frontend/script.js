const SPECIES_ORDER = [
    "rose",
    "tulip",
    "lily",
    "sunflower",
    "carnation",
    "peony",
    "iris",
    "daffodil",
    "hibiscus",
    "cherry_blossom",
];

const SPECIES_STICKERS = {
    rose: "🌹",
    tulip: "🌷",
    lily: "🤍",
    sunflower: "🌻",
    carnation: "💐",
    peony: "🌸",
    iris: "🪻",
    daffodil: "🌼",
    hibiscus: "🌺",
    cherry_blossom: "💮",
};

let flowerFile = null;
let flowerPreviewUrl = null;
let lastHealth = null;
let lastResults = null;
let quoteTimer = null;
let quoteIndex = 0;
let quoteFadeTimer = null;

function $(id) {
    return document.getElementById(id);
}

function applyStaticI18n() {
    const lang = currentLang();
    document.documentElement.lang = lang === "my" ? "my" : "en";
    document.body.classList.toggle("lang-my", lang === "my");
    document.title = t("pageTitle");

    document.querySelectorAll("[data-i18n]").forEach((node) => {
        const key = node.getAttribute("data-i18n");
        if (key) {
            node.textContent = t(key);
        }
    });

    const toggle = $("lang-toggle");
    if (toggle) {
        toggle.textContent = t("langButton");
        toggle.setAttribute("aria-label", t("langAria"));
    }

    const previewImg = $("flower-preview").querySelector("img");
    if (previewImg) {
        previewImg.alt = t("previewAlt");
    }
}

function applyLanguage() {
    applyStaticI18n();
    if (lastHealth) {
        showHealthBanner(lastHealth);
    } else {
        setBanner(t("checkingStatus"));
        checkHealth();
    }
    if (lastResults) {
        renderResults(lastResults);
    } else {
        $("diagnosis-title").textContent = t("speciesHeading");
        $("diagnosis-text").textContent = t("waiting");
        $("stage-text").textContent = t("stageUnavailable");
    }
}

function toggleLanguage() {
    setLang(currentLang() === "my" ? "en" : "my");
    applyLanguage();
}

function stopQuoteRotation() {
    if (quoteTimer) {
        clearInterval(quoteTimer);
        quoteTimer = null;
    }
    if (quoteFadeTimer) {
        clearTimeout(quoteFadeTimer);
        quoteFadeTimer = null;
    }
}

function renderQuote(index, animate) {
    const quote = GARDEN_QUOTES[index % GARDEN_QUOTES.length];
    const banner = $("status-banner");
    const markup = `
            <p class="quote-text">“${quote.text}”</p>
            <p class="quote-author">— ${quote.author}</p>
        `;
    const show = () => {
        banner.className = "banner ok quote-banner";
        banner.innerHTML = markup;
    };

    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        show();
        return;
    }

    banner.classList.add("quote-fade");
    quoteFadeTimer = setTimeout(() => {
        banner.innerHTML = markup;
        banner.className = "banner ok quote-banner quote-fade";
        requestAnimationFrame(() => {
            banner.classList.remove("quote-fade");
        });
        quoteFadeTimer = null;
    }, 280);
}

function startQuoteRotation() {
    const banner = $("status-banner");
    if (quoteTimer && banner.classList.contains("quote-banner")) {
        return;
    }
    stopQuoteRotation();
    renderQuote(quoteIndex, false);
    quoteTimer = setInterval(() => {
        quoteIndex = (quoteIndex + 1) % GARDEN_QUOTES.length;
        renderQuote(quoteIndex, true);
    }, QUOTE_INTERVAL_MS);
}

function setBanner(text, kind) {
    stopQuoteRotation();
    const banner = $("status-banner");
    banner.textContent = text;
    banner.className = `banner ${kind || ""}`.trim();
}

function showHealthBanner(health) {
    if (health.species_model_ready) {
        startQuoteRotation();
    } else {
        setBanner(t("healthMissing"), "warn");
    }
}

async function checkHealth() {
    try {
        const response = await fetch("/api/health");
        if (!response.ok) {
            throw new Error("Health check failed");
        }
        lastHealth = await response.json();
        showHealthBanner(lastHealth);
    } catch (error) {
        lastHealth = null;
        setBanner(t("healthDown"), "err");
    }
}

function setupUpload() {
    const box = $("flower-upload");
    const input = $("flower-image");

    $("upload-btn").addEventListener("click", (event) => {
        event.stopPropagation();
        input.click();
    });
    box.addEventListener("click", () => input.click());
    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    box.addEventListener("dragover", (event) => {
        event.preventDefault();
        box.style.borderColor = "var(--primary)";
    });
    box.addEventListener("dragleave", () => {
        box.style.borderColor = "";
    });
    box.addEventListener("drop", (event) => {
        event.preventDefault();
        box.style.borderColor = "";
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleFile(file);
        }
    });
}

function handleFile(file) {
    flowerFile = file;
    const reader = new FileReader();
    reader.onload = (event) => {
        flowerPreviewUrl = event.target.result;
        $("flower-preview").innerHTML = `<img src="${flowerPreviewUrl}" alt="${t("previewAlt")}">`;
        $("flower-upload").classList.add("has-image");
        $("analyze-btn").disabled = false;
    };
    reader.readAsDataURL(file);
}

async function analyzeFlower() {
    if (!flowerFile) {
        return;
    }

    $("loading").hidden = false;
    $("results-section").hidden = true;

    try {
        const formData = new FormData();
        formData.append("image", flowerFile, flowerFile.name || "flower.jpg");

        const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || "Analysis failed");
        }
        displayResults(payload);
    } catch (error) {
        console.error(error);
        alert(error.message || t("analyzeFailed"));
    } finally {
        $("loading").hidden = true;
    }
}

function displayResults(results) {
    lastResults = results;
    renderResults(results);
}

function renderResults(results) {
    $("results-section").hidden = false;
    const speciesId = results.species.id;
    const confidencePct = (results.species.confidence * 100).toFixed(1);
    $("diagnosis-title").textContent = speciesName(speciesId);
    const diagnosis = `${speciesName(speciesId)} — ${confidencePct}% ${t("confidence")}`;
    $("diagnosis-text").textContent = results.placeholder
        ? `${diagnosis} (${t("placeholderNote")})`
        : diagnosis;
    $("diagnosis-icon").innerHTML = `<span class="diag-emoji">${SPECIES_STICKERS[speciesId] || "🌿"}</span>`;

    const grid = $("species-grid");
    grid.innerHTML = "";
    const probs = results.species.probabilities || {};
    SPECIES_ORDER.forEach((id) => {
        const value = probs[id] ?? 0;
        const percent = (value * 100).toFixed(1);
        const card = document.createElement("div");
        card.className = `species-card${id === speciesId ? " winner" : ""}`;
        card.innerHTML = `
            <div class="species-header">
                <span>${SPECIES_STICKERS[id] || "🌿"} ${speciesName(id)}</span>
                <span class="probability-text">${percent}%</span>
            </div>
            <div class="probability-bar">
                <div class="probability-fill" style="width: ${percent}%"></div>
            </div>
        `;
        grid.appendChild(card);
    });

    const stageCard = $("stage-card");
    if (results.stage) {
        stageCard.hidden = false;
        $("stage-text").textContent = `${stageName(results.stage.id)} (${(results.stage.confidence * 100).toFixed(1)}%)`;
        $("stage-progress").style.width = `${(results.stage.confidence * 100).toFixed(1)}%`;
        const bars = $("stage-bars");
        bars.innerHTML = "";
        Object.entries(results.stage.probabilities || {}).forEach(([key, value]) => {
            const row = document.createElement("p");
            row.textContent = `${stageName(key)}: ${(value * 100).toFixed(1)}%`;
            bars.appendChild(row);
        });
    } else {
        stageCard.hidden = false;
        const reason = !results.stage_model_ready ? t("stageNotTrained") : t("stageHeldOut");
        $("stage-text").textContent = reason;
        $("stage-progress").style.width = "0%";
        $("stage-bars").innerHTML = "";
    }

    const tips = $("tips-list");
    tips.innerHTML = "";
    const stageId = results.stage ? results.stage.id : null;
    tipsFor(speciesId, stageId).forEach((tip) => {
        const item = document.createElement("li");
        item.textContent = tip;
        tips.appendChild(item);
    });
}

function resetAnalysis() {
    flowerFile = null;
    flowerPreviewUrl = null;
    $("flower-image").value = "";
    $("flower-preview").innerHTML = "";
    $("flower-upload").classList.remove("has-image");
    $("analyze-btn").disabled = true;
    $("results-section").hidden = true;
    lastResults = null;
    $("diagnosis-title").textContent = t("speciesHeading");
    $("diagnosis-text").textContent = t("waiting");
    $("stage-text").textContent = t("stageUnavailable");
}

document.addEventListener("DOMContentLoaded", () => {
    setupUpload();
    $("analyze-btn").addEventListener("click", analyzeFlower);
    $("reset-btn").addEventListener("click", resetAnalysis);
    $("lang-toggle").addEventListener("click", toggleLanguage);
    applyLanguage();
});
