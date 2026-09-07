"""Locked Floriscan class lists, display names, and care tips."""

SPECIES = [
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
]

SPECIES_LABELS = {
    "rose": "Rose",
    "tulip": "Tulip",
    "lily": "Lily",
    "sunflower": "Sunflower",
    "carnation": "Carnation",
    "peony": "Peony",
    "iris": "Iris",
    "daffodil": "Daffodil",
    "hibiscus": "Hibiscus",
    "cherry_blossom": "Cherry blossom",
}

SPECIES_LATIN = {
    "rose": "Rosa",
    "tulip": "Tulipa",
    "lily": "Lilium (true lily only)",
    "sunflower": "Helianthus annuus",
    "carnation": "Dianthus caryophyllus",
    "peony": "Paeonia lactiflora",
    "iris": "Iris germanica (bearded)",
    "daffodil": "Narcissus",
    "hibiscus": "Hibiscus rosa-sinensis",
    "cherry_blossom": "Prunus serrulata (not plum)",
}

BLOOM_STAGES = ["bud", "partially_open", "fully_open"]

STAGE_LABELS = {
    "bud": "Bud",
    "partially_open": "Partially open",
    "fully_open": "Fully open",
}

# Hibiscus and cherry blossom are held out of Phase B until labels are clean.
STAGE_SUPPORTED = [
    "rose",
    "tulip",
    "lily",
    "sunflower",
    "carnation",
    "peony",
    "iris",
    "daffodil",
]

CARE_TIPS = {
    "rose": [
        "Give at least 6 hours of direct sun and well-drained soil.",
        "Water at the base in the morning; keep leaves as dry as you can.",
        "Deadhead spent blooms to encourage more flowers.",
        "Cut stems at an angle and recut under water for a longer vase life.",
    ],
    "tulip": [
        "Plant bulbs in autumn in cool, well-drained soil.",
        "Keep soil moist while blooming, then let foliage die back naturally.",
        "Avoid hot rooms; tulips last longer in cool, bright spots.",
        "Do not mix with daffodils in the same vase at first — daffodil sap can shorten tulip life.",
    ],
    "lily": [
        "This class is true Lilium only, not daylily, calla, or water lily.",
        "Keep soil evenly moist and give bright light without harsh midday burn.",
        "Remove pollen anthers if you want longer vase life and less stain.",
        "Keep cats away — Lilium is highly toxic to cats.",
    ],
    "sunflower": [
        "Needs full sun and regular deep watering while the head is filling.",
        "Stake tall stems before the flower becomes heavy.",
        "Harvest for the vase when the outer ray florets just start to lift.",
        "Leave some heads on the plant if you want seeds for birds or next year.",
    ],
    "carnation": [
        "Prefers cool nights and well-drained, slightly alkaline soil.",
        "Pinch early shoots if you want bushier plants and more blooms.",
        "Change vase water every two days; carnations are long-lasting cut flowers.",
        "Keep away from fruit bowls — ethylene shortens bloom life.",
    ],
    "peony": [
        "Plant in a spot with morning sun and soil that never stays soggy.",
        "Do not bury the eyes of the crown more than about 5 cm deep.",
        "Cut stems when buds feel like a soft marshmallow for the vase.",
        "Support heavy blooms with rings or stakes before they open.",
    ],
    "iris": [
        "Bearded iris wants a dryish rhizome baked by sun — do not mulch over it.",
        "Divide crowded clumps every 3–4 years after flowering.",
        "Water well while buds swell, then ease off after bloom.",
        "Cut spent stems down but leave healthy fans of leaves.",
    ],
    "daffodil": [
        "Plant bulbs in autumn; they naturalise well in sun or light shade.",
        "Let the leaves yellow for at least 6 weeks after bloom before cutting.",
        "Condition cut stems in their own water for a few hours before mixing.",
        "Never eat any part — Narcissus is toxic if ingested.",
    ],
    "hibiscus": [
        "Tropical hibiscus wants heat, sun, and consistent moisture.",
        "Each flower often lasts only one day; buds keep opening in sequence.",
        "Feed lightly during warm months; watch for aphids and whitefly.",
        "Bring potted plants indoors before nights drop much below 10°C.",
    ],
    "cherry_blossom": [
        "This class is ornamental cherry (Prunus serrulata), not plum blossom.",
        "Needs winter chill and a sunny, airy site with well-drained soil.",
        "Prune only lightly, just after flowering, to avoid disease in the wood.",
        "Peak bloom is brief — enjoy the tree as a whole, not a single vase stem.",
    ],
}

STAGE_TIPS = {
    "bud": "The flower is still closed. Keep it cool and watered; avoid bruising the tight petals.",
    "partially_open": "Petals have started to separate. This is a good time to cut for the vase.",
    "fully_open": "The bloom is expanded. Enjoy it now and deadhead when petals drop.",
}


def display_name(species_id: str) -> str:
    return SPECIES_LABELS.get(species_id, species_id.replace("_", " ").title())


def care_tips_for(species_id: str, stage_id=None):
    tips = list(CARE_TIPS.get(species_id, ["Identify the species first, then match care to that plant."]))
    if stage_id and stage_id in STAGE_TIPS:
        tips.insert(0, STAGE_TIPS[stage_id])
    return tips
