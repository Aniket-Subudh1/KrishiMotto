#!/usr/bin/env node
/**
 * Merges booking-related locale keys from en.json into hi, ta, te, or
 * with language-specific translations.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const localesDir = path.join(root, 'locales');

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

const KEYS_TO_MERGE = [
  'common',
  'enums',
  'cropCalendar',
  'droneSpray',
  'cropHealth',
  'soilHealth',
  'expertVisit',
  'ppacsCredit',
  'paymentResult',
  'paymentCheckout',
];

const overrides = {
  hi: {
    common: {
      cancel: 'रद्द करें',
      done: 'हो गया',
      selectDate: 'तारीख चुनें',
      parcelPicker: {
        mapFieldFirst: 'पहले मैप पर अपना खेत बनाएँ',
        selected: 'चयनित',
        addField: 'खेत जोड़ें',
      },
    },
    enums: {
      cropTypes: {
        Cereal: 'अनाज',
        Vegetable: 'सब्ज़ी',
        Fruit: 'फल',
        Pulses: 'दाल',
        Oilseeds: 'तिलहन',
      },
      soilTypes: {
        Clay: 'चिकनी',
        Sandy: 'बलुई',
        Loamy: 'दोमट',
        Silty: 'गादिली',
        Peaty: 'पीट',
        Chalky: 'चूना',
      },
      seasons: { Kharif: 'खरीफ', Rabi: 'रबी', Zaid: 'ज़ैद' },
      visitPurposes: {
        pest: 'कीट और रोग निदान',
        advisory: 'सलाह',
        inspection: 'निरीक्षण',
        other: 'अन्य',
      },
      scheduleActivities: {
        sowing: 'बुवाई',
        firstIrrigation: 'पहली सिंचाई',
        fertilizerDap: 'उर्वरक (डीएपी)',
        fertilizerUrea: 'उर्वरक (यूरिया)',
        pestWatch: 'कीट निगरानी',
        harvest: 'कटाई · {{crop}}',
      },
      services: {
        CROP_CALENDAR: 'फसल कैलेंडर',
        DRONE_SPRAY: 'ड्रोन स्प्रे',
        CROP_HEALTH: 'फसल स्वास्थ्य',
        SOIL_HEALTH: 'मिट्टी स्वास्थ्य',
        EXPERT_VISIT: 'विशेषज्ञ विज़िट',
        PPACS_CREDIT: 'पीपैक्स क्रेडिट',
        STORAGE: 'भंडारण',
        CROP_TRACKER: 'फसल ट्रैकर',
        IRRIGATION: 'सिंचाई',
        FERTILIZER: 'उर्वरक',
        PEST_CONTROL: 'कीट नियंत्रण',
        WEATHER: 'मौसम',
        SEEDS: 'बीज',
        HARVEST: 'हार्वेस्ट ID',
        INSURANCE: 'बीमा',
        MARKET: 'बाज़ार भाव',
      },
      servicePrices: en.enums.servicePrices,
    },
    home: {
      dashboard: {
        services: {
          calendar: { title: 'फसल कैलेंडर', badge: '₹199/फसल' },
          drone: { title: 'ड्रोन स्प्रे', badge: '₹399/एकड़' },
          cropHealth: { title: 'फसल स्वास्थ्य', badge: '₹2,499/एकड़' },
          soil: { title: 'मिट्टी स्वास्थ्य', badge: '₹4,999/एकड़' },
          expert: { title: 'विशेषज्ञ विज़िट', badge: '₹499+' },
        },
      },
    },
  },
  ta: {
    common: {
      cancel: 'ரத்து',
      done: 'முடிந்தது',
      selectDate: 'தேதியைத் தேர்ந்தெடுக்கவும்',
      parcelPicker: {
        mapFieldFirst: 'முதலில் வரைபடத்தில் உங்கள் வயலை வரையவும்',
        selected: 'தேர்ந்தெடுக்கப்பட்டது',
        addField: 'வயல் சேர்க்க',
      },
    },
    enums: {
      cropTypes: {
        Cereal: 'தானியம்',
        Vegetable: 'காய்கறி',
        Fruit: 'பழம்',
        Pulses: 'பருப்பு',
        Oilseeds: 'எண்ணெய் விதை',
      },
      soilTypes: {
        Clay: 'களிமண்',
        Sandy: 'மணல்',
        Loamy: 'களிமண் மணல்',
        Silty: 'சேறு',
        Peaty: 'பீட்',
        Chalky: 'சுண்ணாம்பு',
      },
      seasons: { Kharif: 'காரிப்', Rabi: 'ராபி', Zaid: 'சைத்' },
      visitPurposes: {
        pest: 'பூச்சி & நோய் கண்டறிதல்',
        advisory: 'ஆலோசனை',
        inspection: 'ஆய்வு',
        other: 'மற்றவை',
      },
      scheduleActivities: {
        sowing: 'விதைப்பு',
        firstIrrigation: 'முதல் பாசனம்',
        fertilizerDap: 'உரம் (DAP)',
        fertilizerUrea: 'உரம் (யூரியா)',
        pestWatch: 'பூச்சி கண்காணிப்பு',
        harvest: 'அறுவடை · {{crop}}',
      },
      services: {
        CROP_CALENDAR: 'பயிர் காலண்டர்',
        DRONE_SPRAY: 'ட்ரோன் தெளிப்பு',
        CROP_HEALTH: 'பயிர் ஆரோக்கியம்',
        SOIL_HEALTH: 'மண் ஆரோக்கியம்',
        EXPERT_VISIT: 'நிபுணர் வருகை',
        PPACS_CREDIT: 'PPACS கடன்',
        STORAGE: 'சேமிப்பு',
        CROP_TRACKER: 'பயிர் டிராக்கர்',
        IRRIGATION: 'பாசனம்',
        FERTILIZER: 'உரம்',
        PEST_CONTROL: 'பூச்சி கட்டுப்பாடு',
        WEATHER: 'வானிலை',
        SEEDS: 'விதைகள்',
        HARVEST: 'அறுவடை ID',
        INSURANCE: 'காப்பீடு',
        MARKET: 'சந்தை விலை',
      },
      servicePrices: en.enums.servicePrices,
    },
    home: {
      dashboard: {
        services: {
          calendar: { title: 'பயிர் காலண்டர்', badge: '₹199/பயிர்' },
          drone: { title: 'ட்ரோன் தெளிப்பு', badge: '₹399/ஏக்கர்' },
          cropHealth: { title: 'பயிர் ஆரோக்கியம்', badge: '₹2,499/ஏக்கர்' },
          soil: { title: 'மண் ஆரோக்கியம்', badge: '₹4,999/ஏக்கர்' },
          expert: { title: 'நிபுணர் வருகை', badge: '₹499+' },
        },
      },
    },
  },
  te: {
    common: {
      cancel: 'రద్దు',
      done: 'పూర్తి',
      selectDate: 'తేదీ ఎంచుకోండి',
      parcelPicker: {
        mapFieldFirst: 'ముందుగా మ్యాప్‌లో మీ పొలం గీయండి',
        selected: 'ఎంపిక చేయబడింది',
        addField: 'పొలం జోడించండి',
      },
    },
    enums: {
      cropTypes: {
        Cereal: 'ధాన్యం',
        Vegetable: 'కూరగాయ',
        Fruit: 'పండు',
        Pulses: 'పప్పు',
        Oilseeds: 'నూనె విత్తనం',
      },
      soilTypes: {
        Clay: 'బంకమట్టి',
        Sandy: 'ఇసుక',
        Loamy: 'లోమి',
        Silty: 'అలుపు',
        Peaty: 'పీట్',
        Chalky: 'సుణ్ణం',
      },
      seasons: { Kharif: 'ఖరీఫ్', Rabi: 'రబీ', Zaid: 'జైద్' },
      visitPurposes: {
        pest: 'పురుగు & వ్యాధి నిర్ధారణ',
        advisory: 'సలహా',
        inspection: 'తనిఖీ',
        other: 'ఇతర',
      },
      scheduleActivities: {
        sowing: 'విత్తనం',
        firstIrrigation: 'మొదటి నీటిపారుదల',
        fertilizerDap: 'ఎరువు (DAP)',
        fertilizerUrea: 'ఎరువు (యూరియా)',
        pestWatch: 'పురుగు పర్యవేక్షణ',
        harvest: 'పంట కోత · {{crop}}',
      },
      services: {
        CROP_CALENDAR: 'పంట క్యాలెండర్',
        DRONE_SPRAY: 'డ్రోన్ స్ప్రే',
        CROP_HEALTH: 'పంట ఆరోగ్యం',
        SOIL_HEALTH: 'నేల ఆరోగ్యం',
        EXPERT_VISIT: 'నిపుణుల సందర్శన',
        PPACS_CREDIT: 'PPACS క్రెడిట్',
        STORAGE: 'నిల్వ',
        CROP_TRACKER: 'పంట ట్రాకర్',
        IRRIGATION: 'నీటిపారుదల',
        FERTILIZER: 'ఎరువు',
        PEST_CONTROL: 'పురుగు నియంత్రణ',
        WEATHER: 'వాతావరణం',
        SEEDS: 'విత్తనాలు',
        HARVEST: 'పంట ID',
        INSURANCE: 'భీమా',
        MARKET: 'మార్కెట్ ధర',
      },
      servicePrices: en.enums.servicePrices,
    },
    home: {
      dashboard: {
        services: {
          calendar: { title: 'పంట క్యాలెండర్', badge: '₹199/పంట' },
          drone: { title: 'డ్రోన్ స్ప్రే', badge: '₹399/ఎకరా' },
          cropHealth: { title: 'పంట ఆరోగ్యం', badge: '₹2,499/ఎకరా' },
          soil: { title: 'నేల ఆరోగ్యం', badge: '₹4,999/ఎకరా' },
          expert: { title: 'నిపుణుల సందర్శన', badge: '₹499+' },
        },
      },
    },
  },
  or: {
    common: {
      cancel: 'ବାତିଲ୍',
      done: 'ହୋଇଗଲା',
      selectDate: 'ତାରିଖ ବାଛନ୍ତୁ',
      parcelPicker: {
        mapFieldFirst: 'ପ୍ରଥମେ ମାନଚିତ୍ରରେ ଆପଣଙ୍କ ଜମି ଅଙ୍କନ କରନ୍ତୁ',
        selected: 'ବାଛିଲେ',
        addField: 'ଜମି ଯୋଡ଼ନ୍ତୁ',
      },
    },
    enums: {
      cropTypes: {
        Cereal: 'ଶସ୍ୟ',
        Vegetable: 'ପନିପରିବା',
        Fruit: 'ଫଳ',
        Pulses: 'ଡାଲି',
        Oilseeds: 'ତେଲ ବିହନ',
      },
      soilTypes: {
        Clay: 'କ୍ଲେ',
        Sandy: 'ବାଲିଆ',
        Loamy: 'ଦୋମଟ',
        Silty: 'ପଙ୍କିଲ',
        Peaty: 'ପିଟ୍',
        Chalky: 'ଚୁନ',
      },
      seasons: { Kharif: 'ଖରିଫ', Rabi: 'ରବି', Zaid: 'ଜାଇଦ' },
      visitPurposes: {
        pest: 'କୀଟ ଓ ରୋଗ ନିର୍ଣ୍ଣୟ',
        advisory: 'ପରାମର୍ଶ',
        inspection: 'ନିରୀକ୍ଷଣ',
        other: 'ଅନ୍ୟ',
      },
      scheduleActivities: {
        sowing: 'ବିହନ',
        firstIrrigation: 'ପ୍ରଥମ ସେଚନ',
        fertilizerDap: 'ସାର (DAP)',
        fertilizerUrea: 'ସାର (ୟୁରିଆ)',
        pestWatch: 'କୀଟ ନିରୀକ୍ଷଣ',
        harvest: 'ଅମଳ · {{crop}}',
      },
      services: {
        CROP_CALENDAR: 'ଫସଲ କ୍ୟାଲେଣ୍ଡର',
        DRONE_SPRAY: 'ଡ୍ରୋନ ସ୍ପ୍ରେ',
        CROP_HEALTH: 'ଫସଲ ସ୍ୱାସ୍ଥ୍ୟ',
        SOIL_HEALTH: 'ମାଟି ସ୍ୱାସ୍ଥ୍ୟ',
        EXPERT_VISIT: 'ବିଶେଷଜ୍ଞ ପରିଦର୍ଶନ',
        PPACS_CREDIT: 'PPACS ଋଣ',
        STORAGE: 'ଭଣ୍ଡାର',
        CROP_TRACKER: 'ଫସଲ ଟ୍ରାକର',
        IRRIGATION: 'ସେଚନ',
        FERTILIZER: 'ସାର',
        PEST_CONTROL: 'କୀଟ ନିୟନ୍ତ୍ରଣ',
        WEATHER: 'ପାଣିପାଗ',
        SEEDS: 'ବିହନ',
        HARVEST: 'ଅମଳ ID',
        INSURANCE: 'ବୀମା',
        MARKET: 'ବଜାର ମୂଲ୍ୟ',
      },
      servicePrices: en.enums.servicePrices,
    },
    home: {
      dashboard: {
        services: {
          calendar: { title: 'ଫସଲ କ୍ୟାଲେଣ୍ଡର', badge: '₹199/ଫସଲ' },
          drone: { title: 'ଡ୍ରୋନ ସ୍ପ୍ରେ', badge: '₹399/ଏକର' },
          cropHealth: { title: 'ଫସଲ ସ୍ୱାସ୍ଥ୍ୟ', badge: '₹2,499/ଏକର' },
          soil: { title: 'ମାଟି ସ୍ୱାସ୍ଥ୍ୟ', badge: '₹4,999/ଏକର' },
          expert: { title: 'ବିଶେଷଜ୍ଞ ପରିଦର୍ଶନ', badge: '₹499+' },
        },
      },
    },
  },
};

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] ?? {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

// Page-level translations: copy structure from en, apply language-specific strings via override files
const pageTranslations = {
  hi: JSON.parse(fs.readFileSync(path.join(localesDir, 'booking-pages-hi.json'), 'utf8')),
  ta: JSON.parse(fs.readFileSync(path.join(localesDir, 'booking-pages-ta.json'), 'utf8')),
  te: JSON.parse(fs.readFileSync(path.join(localesDir, 'booking-pages-te.json'), 'utf8')),
  or: JSON.parse(fs.readFileSync(path.join(localesDir, 'booking-pages-or.json'), 'utf8')),
};

for (const lang of ['hi', 'ta', 'te', 'or']) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const locale = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const key of KEYS_TO_MERGE) {
    if (key === 'common' || key === 'enums') {
      locale[key] = structuredClone(en[key]);
    } else if (pageTranslations[lang][key]) {
      locale[key] = pageTranslations[lang][key];
    }
  }

  deepMerge(locale, overrides[lang]);

  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`);
  console.log(`Updated ${lang}.json`);
}
