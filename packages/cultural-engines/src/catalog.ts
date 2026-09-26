import type { CulturalAtlasCatalog } from "./types.js";

export const FOUNDATION_CULTURAL_ATLAS = {
  schemaVersion: 1,
  sources: [
    {
      id: "raa-about-runor",
      title: "About Runor (Runes)",
      institution: "Swedish National Heritage Board (Riksantikvarieämbetet)",
      url: "https://www.raa.se/in-english/digital-services/about-runor/",
      sourceType: "heritage-authority",
      languages: ["en"],
      note: "Describes the Runor research platform and its corpus of runic inscriptions.",
    },
    {
      id: "raa-reading-runes",
      title: "Att läsa runor och runinskrifter",
      institution: "Swedish National Heritage Board (Riksantikvarieämbetet)",
      url: "https://www.raa.se/kulturarv/runor-och-runstenar/att-lasa-runor-och-runinskrifter/",
      sourceType: "heritage-authority",
      languages: ["sv"],
      note: "Historical overview of runic inscriptions, periods, and the Viking Age 16-character rune row.",
    },
    {
      id: "raa-rune-school",
      title: "Allmänt om runor",
      institution: "Swedish National Heritage Board (Riksantikvarieämbetet)",
      url: "https://www.raa.se/kulturarv/runor-och-runstenar/runskolan/allmant-om-runor/",
      sourceType: "heritage-authority",
      languages: ["sv"],
      note: "Explains runes as writing signs used to represent speech sounds and distinguishes multiple rune rows.",
    },
    {
      id: "nmai-maya-calendar",
      title: "Calendar | Living Maya Time",
      institution: "Smithsonian National Museum of the American Indian",
      url: "https://maya.nmai.si.edu/calendar",
      sourceType: "community-institution",
      languages: ["en"],
      note: "Introduces Maya calendrical systems and includes contemporary Maya voices.",
    },
    {
      id: "nmai-maya-calendar-system",
      title: "The Calendar System | Living Maya Time",
      institution: "Smithsonian National Museum of the American Indian",
      url: "https://maya.nmai.si.edu/calendar/calendar-system",
      sourceType: "community-institution",
      languages: ["en"],
      note: "Explains Haab, Tzolk'in, Calendar Round, and Long Count cycles.",
    },
    {
      id: "nmai-maya-converter",
      title: "Maya Calendar Converter | Living Maya Time",
      institution: "Smithsonian National Museum of the American Indian",
      url: "https://maya.nmai.si.edu/calendar/maya-calendar-converter",
      sourceType: "community-institution",
      languages: ["en"],
      note: "Documents Long Count units and Gregorian-to-Maya calendar conversion.",
    },
    {
      id: "nmai-maya-people",
      title: "The Maya | Living Maya Time",
      institution: "Smithsonian National Museum of the American Indian",
      url: "https://maya.nmai.si.edu/maya",
      sourceType: "community-institution",
      languages: ["en"],
      note: "Emphasizes the continuity and contemporary vitality of Maya communities.",
    },
  ],
  modules: [
    {
      id: "scandinavian-runic-writing",
      title: "Scandinavian Runic Writing",
      kinds: ["runic-writing", "symbolic-writing"],
      geography: ["Scandinavia", "Sweden"],
      periods: ["approximately 2nd century CE through medieval and later survivals"],
      originalLanguages: ["Proto-Norse", "Old Norse", "medieval Scandinavian languages"],
      sourceIds: ["raa-about-runor", "raa-reading-runes", "raa-rune-school"],
      claims: [
        {
          id: "runes-are-writing-signs",
          status: "attested",
          statement:
            "Runes are writing signs used to represent speech sounds, rather than a numerology system.",
          sourceIds: ["raa-rune-school"],
        },
        {
          id: "multiple-rune-rows",
          status: "attested",
          statement:
            "Historical Scandinavian use includes multiple rune rows; the Viking Age younger rune row has 16 characters.",
          sourceIds: ["raa-reading-runes", "raa-rune-school"],
        },
        {
          id: "runic-corpus-scale",
          status: "attested",
          statement:
            "The Swedish National Heritage Board's Runor research platform aggregates roughly 7,000 runic inscriptions from multiple collections and databases.",
          sourceIds: ["raa-about-runor"],
        },
      ],
      cautions: [
        "Do not describe runes as an interchangeable ancient numerology system.",
        "Historical rune names, phonetic values, inscriptions, and periods must be separated from modern divinatory meanings.",
        "Entertainment-oriented rune draws must be labeled modern/entertainment and cannot be presented as proof of ancient practice.",
      ],
    },
    {
      id: "maya-calendrical-systems",
      title: "Maya Calendrical Systems",
      kinds: ["calendar", "calendar-mathematics", "symbolic-writing"],
      geography: ["Mesoamerica"],
      periods: ["ancient Maya periods", "living Maya traditions"],
      communities: ["Maya peoples"],
      originalLanguages: ["Mayan languages"],
      sourceIds: [
        "nmai-maya-calendar",
        "nmai-maya-calendar-system",
        "nmai-maya-converter",
        "nmai-maya-people",
      ],
      claims: [
        {
          id: "maya-multiple-calendars",
          status: "attested",
          statement:
            "The best-studied Maya calendrical components include the Haab, Tzolk'in, Calendar Round, and Long Count.",
          sourceIds: ["nmai-maya-calendar", "nmai-maya-calendar-system"],
        },
        {
          id: "long-count-units",
          status: "attested",
          statement:
            "Long Count arithmetic uses k'in, uinal, tun, katun, and baktun units, with 20 k'in per uinal, 18 uinal per tun, 20 tun per katun, and 20 katun per baktun.",
          sourceIds: ["nmai-maya-converter"],
        },
        {
          id: "maya-living-tradition",
          status: "living-tradition",
          statement:
            "Maya calendar keeping and cultural traditions are living practices among contemporary Maya communities, not merely extinct archaeological material.",
          sourceIds: ["nmai-maya-calendar", "nmai-maya-people"],
        },
      ],
      cautions: [
        "Do not relabel Maya calendrical mathematics as generic 'Maya numerology'.",
        "Keep historical calendrical arithmetic distinct from modern personality-number systems.",
        "Contemporary Maya voices and living traditions must not be flattened into an undifferentiated ancient-mysticism module.",
        "Sacred, ceremonial, or community-restricted practices require additional source and community review before entertainment use.",
      ],
    },
  ],
} as const satisfies CulturalAtlasCatalog;
