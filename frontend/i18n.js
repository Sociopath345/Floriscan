const LANG_KEY = "floriscan-lang";

const SPECIES_NAMES = {
    en: {
        rose: "Rose",
        tulip: "Tulip",
        lily: "Lily",
        sunflower: "Sunflower",
        carnation: "Carnation",
        peony: "Peony",
        iris: "Iris",
        daffodil: "Daffodil",
        hibiscus: "Hibiscus",
        cherry_blossom: "Cherry blossom",
    },
    my: {
        rose: "နှင်းဆီ",
        tulip: "ကျူးလစ်",
        lily: "လစ်လီ",
        sunflower: "နေကြာပန်း",
        carnation: "ဇော်မွှားပန်း",
        peony: "ပျိုနီပန်း",
        iris: "အိုင်းရစ်ပန်း",
        daffodil: "ဒက်ဖဒိလ်ပန်း",
        hibiscus: "ခေါင်ရမ်းပန်း",
        cherry_blossom: "ချယ်ရီပန်း",
    },
};

const STAGE_NAMES = {
    en: {
        bud: "Bud",
        partially_open: "Partially open",
        fully_open: "Fully open",
    },
    my: {
        bud: "အဖူး",
        partially_open: "တစ်ဝက်ပွင့်",
        fully_open: "အပြည့်ပွင့်",
    },
};

const STAGE_TIPS_I18N = {
    en: {
        bud: "The flower is still closed. Keep it cool and watered; avoid bruising the tight petals.",
        partially_open: "Petals have started to separate. This is a good time to cut for the vase.",
        fully_open: "The bloom is expanded. Enjoy it now and deadhead when petals drop.",
    },
    my: {
        bud: "ပန်းသည် အဖူးအဖြစ် ရှိနေသေးသည်။ အေးအေးဆေးဆေးထားပြီး ရေလောင်းပါ။ တင်းကျပ်သော အပွင့်များကို မထိခိုက်စေပါနှင့်။",
        partially_open: "ပွင့်ချပ်များ စတင်ကွဲထွက်နေပြီ။ ပန်းအိုးအတွက် ဖြတ်ယူရန် သင့်တော်သော အချိန်ဖြစ်သည်။",
        fully_open: "ပန်းသည် အပြည့်ပွင့်နေပြီ။ ယခုပျော်ရွှင်စွာ ကြည့်ရှုပါ။ ပွင့်ချပ်များ ကြွေသောအခါ ညှိုးပွင့်များကို ဖြတ်ပေးပါ။",
    },
};

const CARE_TIPS_I18N = {
    en: {
        rose: [
            "Give at least 6 hours of direct sun and well-drained soil.",
            "Water at the base in the morning; keep leaves as dry as you can.",
            "Deadhead spent blooms to encourage more flowers.",
            "Cut stems at an angle and recut under water for a longer vase life.",
        ],
        tulip: [
            "Plant bulbs in autumn in cool, well-drained soil.",
            "Keep soil moist while blooming, then let foliage die back naturally.",
            "Avoid hot rooms; tulips last longer in cool, bright spots.",
            "Do not mix with daffodils in the same vase at first — daffodil sap can shorten tulip life.",
        ],
        lily: [
            "This class is true Lilium only, not daylily, calla, or water lily.",
            "Keep soil evenly moist and give bright light without harsh midday burn.",
            "Remove pollen anthers if you want longer vase life and less stain.",
            "Keep cats away — Lilium is highly toxic to cats.",
        ],
        sunflower: [
            "Needs full sun and regular deep watering while the head is filling.",
            "Stake tall stems before the flower becomes heavy.",
            "Harvest for the vase when the outer ray florets just start to lift.",
            "Leave some heads on the plant if you want seeds for birds or next year.",
        ],
        carnation: [
            "Prefers cool nights and well-drained, slightly alkaline soil.",
            "Pinch early shoots if you want bushier plants and more blooms.",
            "Change vase water every two days; carnations are long-lasting cut flowers.",
            "Keep away from fruit bowls — ethylene shortens bloom life.",
        ],
        peony: [
            "Plant in a spot with morning sun and soil that never stays soggy.",
            "Do not bury the eyes of the crown more than about 5 cm deep.",
            "Cut stems when buds feel like a soft marshmallow for the vase.",
            "Support heavy blooms with rings or stakes before they open.",
        ],
        iris: [
            "Bearded iris wants a dryish rhizome baked by sun — do not mulch over it.",
            "Divide crowded clumps every 3–4 years after flowering.",
            "Water well while buds swell, then ease off after bloom.",
            "Cut spent stems down but leave healthy fans of leaves.",
        ],
        daffodil: [
            "Plant bulbs in autumn; they naturalise well in sun or light shade.",
            "Let the leaves yellow for at least 6 weeks after bloom before cutting.",
            "Condition cut stems in their own water for a few hours before mixing.",
            "Never eat any part — Narcissus is toxic if ingested.",
        ],
        hibiscus: [
            "Tropical hibiscus wants heat, sun, and consistent moisture.",
            "Each flower often lasts only one day; buds keep opening in sequence.",
            "Feed lightly during warm months; watch for aphids and whitefly.",
            "Bring potted plants indoors before nights drop much below 10°C.",
        ],
        cherry_blossom: [
            "This class is ornamental cherry (Prunus serrulata), not plum blossom.",
            "Needs winter chill and a sunny, airy site with well-drained soil.",
            "Prune only lightly, just after flowering, to avoid disease in the wood.",
            "Peak bloom is brief — enjoy the tree as a whole, not a single vase stem.",
        ],
    },
    my: {
        rose: [
            "တိုက်ရိုက်နေရောင် အနည်းဆုံး ၆ နာရီနှင့် ရေစိမ့်ဝင်ကောင်းသော မြေတွင် စိုက်ပါ။",
            "နံနက်ပိုင်းတွင် ပင်စည်အခြေကို ရေလောင်းပါ။ အရွက်များကို တတ်နိုင်သမျှ ခြောက်အောင်ထားပါ။",
            "ညှိုးပွင့်များကို ဖြတ်ပေးခြင်းဖြင့် ပန်းအသစ်များ ပိုပွင့်စေပါ။",
            "ပင်စည်ကို စောင်းဖြတ်ပြီး ရေအောက်တွင် ထပ်ဖြတ်ပါက ပန်းအိုးထဲ ပိုကြာခံသည်။",
        ],
        tulip: [
            "ဆောင်းဦးတွင် အေးပြီး ရေစိမ့်ဝင်ကောင်းသော မြေ၌ မီးသီးများ စိုက်ပါ။",
            "ပွင့်နေစဉ် မြေကို စိုစွတ်အောင်ထားပြီး အရွက်များကို သဘာဝအတိုင်း ညှိုးကျခွင့်ပြုပါ။",
            "ပူသော အခန်းများကို ရှောင်ပါ။ ကျူးလစ်သည် အေး၍ လင်းသော နေရာတွင် ပိုကြာခံသည်။",
            "အစပိုင်းတွင် ဒက်ဖဒိလ်နှင့် ပန်းအိုးတစ်ခုတည်း မရောပါနှင့် — ဒက်ဖဒိလ်ရည်က ကျူးလစ်သက်တမ်းကို တိုစေနိုင်သည်။",
        ],
        lily: [
            "ဤအမျိုးအစားသည် စစ်မှန်သော လစ်လီ (Lilium) သာဖြစ်ပြီး နေ့လည်လီ၊ ကာလာ သို့မဟုတ် ရေလီ မဟုတ်ပါ။",
            "မြေကို ညီညာစွာ စိုအောင်ထားပြီး နေ့လည်ပိုင်း ပြင်းထန်သော နေလောင်မည့် အလင်းကို ရှောင်ပါ။",
            "ပန်းအိုးသက်တမ်း ပိုကြာစေရန်နှင့် အစွန်းအထင်း လျော့စေရန် ဝတ်မှုန်အိတ်များကို ဖြတ်နိုင်သည်။",
            "ကြောင်များကို ဝေးဝေးထားပါ — Lilium သည် ကြောင်များအတွက် အလွန်အဆိပ်ပြင်းသည်။",
        ],
        sunflower: [
            "နေအပြည့်နှင့် နေကြာခေါင်း ကြီးထွားနေစဉ် ပုံမှန် နက်ရှိုင်းစွာ ရေလောင်းရန် လိုသည်။",
            "ပန်းခေါင်း မလေးမီ အရပ်မြင့်သော ပင်စည်များကို ထောက်တိုင်ထူပါ။",
            "အပြင်ပွင့်ချပ်များ စတင်မထလာသေးခင် ပန်းအိုးအတွက် ဖြတ်ယူပါ။",
            "ငှက်များ သို့မဟုတ် နောက်နှစ်အတွက် မျိုးစေ့လိုပါက အချို့ခေါင်းများကို အပင်ပေါ် ချန်ထားပါ။",
        ],
        carnation: [
            "ညအေးပြီး ရေစိမ့်ဝင်ကောင်းကာ အနည်းငယ် အယ်လ်ကာလိုင်း မြေကို နှစ်သက်သည်။",
            "ပိုပွားပြီး ပန်းပိုပွင့်စေလိုပါက အစောပိုင်း အညွန့်များကို ချိုးပေးပါ။",
            "ပန်းအိုးရေကို နှစ်ရက်တစ်ကြိမ် ပြောင်းပါ။ ဇော်မွှားပန်းသည် ကြာရှည်ခံသော ဖြတ်ပန်းဖြစ်သည်။",
            "သစ်သီးပန်းကန်နှင့် ဝေးဝေးထားပါ — အီသလင်းဓာတ်က ပွင့်ချိန်ကို တိုစေသည်။",
        ],
        peony: [
            "နံနက်နေရောင်ရပြီး မြေမစိုလွန်းသော နေရာတွင် စိုက်ပါ။",
            "သရဖူ၏ မျက်လုံးများကို ၅ စင်တီမီတာထက် ပိုနက်အောင် မမြှုပ်ပါနှင့်။",
            "အဖူးသည် ပျော့ပျောင်းသော မာရှမဲလိုးကဲ့သို့ ခံစားရသောအခါ ပန်းအိုးအတွက် ဖြတ်ပါ။",
            "ပွင့်မီ လေးသော ပန်းများကို ကွင်း သို့မဟုတ် ထောက်တိုင်ဖြင့် ထောက်ပံ့ပါ။",
        ],
        iris: [
            "မုတ်ဆိတ်အိုင်းရစ်သည် နေပူခံ ခြောက်သွေ့သော အမြစ်ဖုကို လိုသည် — အပေါ်မှ မြေဆွေးမဖုံးပါနှင့်။",
            "ပွင့်ပြီးနောက် ၃–၄ နှစ်တစ်ကြိမ် စုဝေးနေသော အုပ်များကို ခွဲစိုက်ပါ။",
            "အဖူးရင့်နေစဉ် ကောင်းစွာ ရေလောင်းပြီး ပွင့်ပြီးလျှင် ရေလျှော့ပါ။",
            "ညှိုးပွင့်ပင်စည်များကို ဖြတ်ပါ၊ ကျန်းမာသော အရွက်ပန်ကန်များကို ချန်ထားပါ။",
        ],
        daffodil: [
            "ဆောင်းဦးတွင် မီးသီးများ စိုက်ပါ။ နေရောင် သို့မဟုတ် အရိပ်ပေါ့ပေါ့တွင် ကောင်းစွာ ပျံ့နှံ့ပေါက်သည်။",
            "ပွင့်ပြီးနောက် အရွက်များကို အနည်းဆုံး ၆ ပတ် ဝါခွင့်ပြုပြီးမှ ဖြတ်ပါ။",
            "အခြားပန်းများနှင့် မရောမီ မိမိရေတွင် နာရီအနည်းငယ် ထားပြီး ပြင်ဆင်ပါ။",
            "မည်သည့် အစိတ်အပိုင်းကိုမျှ မစားပါနှင့် — Narcissus သည် စားမိပါက အဆိပ်ရှိသည်။",
        ],
        hibiscus: [
            "အပူပိုင်း ခေါင်ရမ်းသည် အပူ၊ နေရောင်နှင့် ပုံမှန် စိုစွတ်မှုကို လိုသည်။",
            "ပန်းတစ်ပွင့်သည် မကြာခဏ တစ်ရက်သာ ခံသည်။ အဖူးများ ဆက်တိုက် ပွင့်နေမည်။",
            "နွေးသော လများတွင် အနည်းငယ်သာ မြေသြဇာကျွေးပါ။ ပျ၊ ယင်ဖြူကို သတိထားပါ။",
            "ညအပူချိန် ၁၀°C အောက် ကျခါနီးတွင် အိုးစိုက်ပင်များကို အတွင်းသို့ သွင်းပါ။",
        ],
        cherry_blossom: [
            "ဤအမျိုးအစားသည် အလှဆင်ချယ်ရီ (Prunus serrulata) ဖြစ်ပြီး ဇီးပွင့် မဟုတ်ပါ။",
            "ဆောင်းရာသီ အေးမြမှုနှင့် နေရောင်ရ၊ လေဝင်လေထွက်ကောင်း၊ ရေစိမ့်ဝင်ကောင်းသော နေရာ လိုသည်။",
            "ပွင့်ပြီးချက်ချင်းသာ ပေါ့ပေါ့ပါးပါး ကိုင်းဖြတ်ပါ။ သစ်သားရောဂါ မဝင်စေရန်။",
            "အထွတ်အထိပ် ပွင့်ချိန်သည် တိုတောင်းသည် — ပန်းအိုးတစ်ခက်မဟုတ်ဘဲ တစ်ပင်လုံးကို ခံစားပါ။",
        ],
    },
};

const GARDEN_QUOTES = [
    {
        text: "Where flowers bloom so does hope.",
        author: "Lady Bird Johnson",
    },
    {
        text: "To plant a garden is to believe in tomorrow.",
        author: "Audrey Hepburn",
    },
    {
        text: "A flower does not think of competing with the flower next to it. It just blooms.",
        author: "Zen Shin",
    },
    {
        text: "The earth laughs in flowers.",
        author: "Ralph Waldo Emerson",
    },
    {
        text: "Every flower is a soul blossoming in nature.",
        author: "Gerard de Nerval",
    },
    {
        text: "Just living is not enough... one must have sunshine, freedom, and a little flower.",
        author: "Hans Christian Andersen",
    },
    {
        text: "A flower cannot blossom without sunshine, and man cannot live without love.",
        author: "Max Müller",
    },
    {
        text: "Love is the flower you've got to let grow.",
        author: "John Lennon",
    },
    {
        text: "Flowers always make people better, happier, and more helpful; they are sunshine, food and medicine for the soul.",
        author: "Luther Burbank",
    },
];

const QUOTE_INTERVAL_MS = 15000;

const UI_STRINGS = {
    en: {
        pageTitle: "Floriscan — Flower Species Recognition",
        subtitle: "recognize flowers, then their bloom",
        uploadTitle: "Bring a bloom into the garden",
        instruction: "Drop one clear photo of a single flower.",
        flowerPhoto: "Flower photo",
        dropHint: "Drag and drop, or click to choose",
        choosePhoto: "Choose photo",
        analyze: "Analyze flower",
        resultsTitle: "What the garden sees",
        speciesHeading: "Species",
        waiting: "Waiting…",
        stageHeading: "Blooming stage",
        stageUnavailable: "Not available yet",
        probsTitle: "Species probabilities",
        tipsTitle: "Care tips",
        newAnalysis: "New analysis",
        recognizing: "Recognizing the flower…",
        lookingClosely: "The garden is looking closely",
        footer: "Floriscan — You bloom most beautifully when you choose yourself every day.",
        disclaimer: "Educational computer-vision project. Confirm plant identity before using care advice.",
        langButton: "မြန်မာ",
        langAria: "Switch to Burmese",
        confidence: "confidence",
        placeholderNote: "placeholder — train the species model",
        stageNotTrained: "Blooming-stage model not trained yet (Phase B).",
        stageHeldOut: "This species is held out of the shared stage model for now.",
        healthMissing:
            "Species weights are missing. The API is running in placeholder mode — train in Colab and copy floriscan_species.pth to backend/models.",
        healthDown: "Cannot reach the Floriscan API. Start Flask with python backend/app.py.",
        checkingStatus: "Checking model status…",
        analyzeFailed: "Analysis failed. Is Flask running?",
        previewAlt: "Flower preview",
        fallbackTip: "Identify the species first, then match care to that plant.",
    },
    my: {
        pageTitle: "Floriscan — ပန်းအမျိုးအစား မှတ်သားခြင်း",
        subtitle: "ပန်းအမျိုးအစားကို မှတ်ပြီး ပွင့်ချိန်အဆင့်ကို ဖော်ပြသည်",
        uploadTitle: "ပန်းပုံကို ဥယျာဉ်ထဲသို့ ထည့်ပါ",
        instruction: "ပန်းတစ်ပွင့်၏ ရှင်းလင်းသော ပုံတစ်ပုံကို တင်ပါ။",
        flowerPhoto: "ပန်းပုံ",
        dropHint: "ဖိုင်ကို ဆွဲချပါ၊ သို့မဟုတ် နှိပ်၍ ရွေးပါ",
        choosePhoto: "ပုံရွေးရန်",
        analyze: "ပန်းကို စစ်ဆေးရန်",
        resultsTitle: "ဥယျာဉ် မြင်သည့်အရာ",
        speciesHeading: "ပန်းအမျိုးအစား",
        waiting: "စောင့်နေသည်…",
        stageHeading: "ပွင့်ချိန်အဆင့်",
        stageUnavailable: "မရရှိသေးပါ",
        probsTitle: "အမျိုးအစား ဖြစ်နိုင်ခြေများ",
        tipsTitle: "ပြုစုနည်းများ",
        newAnalysis: "ထပ်မံ စစ်ဆေးရန်",
        recognizing: "ပန်းကို မှတ်နေသည်…",
        lookingClosely: "ဥယျာဉ်က သေချာကြည့်နေသည်",
        footer: "Floriscan — နေ့စဉ် မိမိကိုယ်ကို ရွေးချယ်သောအခါ သင်အလှဆုံး ပွင့်လန်းသည်။",
        disclaimer: "ပညာရေးသုံး ကွန်ပျူတာဗီရှင် စီမံကိန်း။ ပြုစုနည်းကို မလိုက်နာမီ ပန်းအမျိုးအစားကို ထပ်မံ အတည်ပြုပါ။",
        langButton: "EN",
        langAria: "အင်္ဂလိပ်သို့ ပြောင်းရန်",
        confidence: "ယုံကြည်မှု",
        placeholderNote: "ယာယီရလဒ် — မျိုးစိတ်မော်ဒယ်ကို လေ့ကျင့်ရန် လိုသည်",
        stageNotTrained: "ပွင့်ချိန်အဆင့် မော်ဒယ်ကို မလေ့ကျင့်ရသေးပါ။",
        stageHeldOut: "ဤပန်းအမျိုးအစားကို မျှဝေထားသော ပွင့်ချိန်မော်ဒယ်မှ ယာယီ ချန်လှပ်ထားသည်။",
        healthMissing:
            "မျိုးစိတ်အလေးချိန် ဖိုင် မရှိသေးပါ။ API သည် ယာယီမုဒ်ဖြင့် လည်ပတ်နေသည် — Colab တွင် လေ့ကျင့်ပြီး floriscan_species.pth ကို backend/models သို့ ကူးထည့်ပါ။",
        healthDown: "Floriscan API ကို ဆက်သွယ်မရပါ။ Flask ကို python backend/app.py ဖြင့် စတင်ပါ။",
        checkingStatus: "မော်ဒယ် အခြေအနေကို စစ်နေသည်…",
        analyzeFailed: "စစ်ဆေးမှု မအောင်မြင်ပါ။ Flask လည်ပတ်နေပါသလား။",
        previewAlt: "ပန်းပုံ အကြိုကြည့်ရှုမှု",
        fallbackTip: "အမျိုးအစားကို အရင်မှတ်ပါ၊ ထို့နောက် ထိုအပင်နှင့် ကိုက်သော ပြုစုနည်းကို လိုက်နာပါ။",
    },
};

function currentLang() {
    const stored = localStorage.getItem(LANG_KEY);
    return stored === "my" ? "my" : "en";
}

function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang === "my" ? "my" : "en");
}

function t(key, vars) {
    const pack = UI_STRINGS[currentLang()] || UI_STRINGS.en;
    let text = pack[key] ?? UI_STRINGS.en[key] ?? key;
    if (vars) {
        Object.keys(vars).forEach((name) => {
            text = text.replaceAll(`{${name}}`, vars[name]);
        });
    }
    return text;
}

function speciesName(id) {
    const pack = SPECIES_NAMES[currentLang()] || SPECIES_NAMES.en;
    return pack[id] || SPECIES_NAMES.en[id] || id;
}

function stageName(id) {
    const pack = STAGE_NAMES[currentLang()] || STAGE_NAMES.en;
    return pack[id] || STAGE_NAMES.en[id] || id;
}

function tipsFor(speciesId, stageId) {
    const lang = currentLang();
    const pack = CARE_TIPS_I18N[lang] || CARE_TIPS_I18N.en;
    const tips = [...(pack[speciesId] || CARE_TIPS_I18N.en[speciesId] || [t("fallbackTip")])];
    if (stageId && STAGE_TIPS_I18N[lang] && STAGE_TIPS_I18N[lang][stageId]) {
        tips.unshift(STAGE_TIPS_I18N[lang][stageId]);
    }
    return tips;
}
