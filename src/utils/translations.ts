export type Language = 'en' | 'hi';
export type Theme = 'light' | 'dark';

export const translations = {
  en: {
    // Navigation
    'app.title': 'Van Nyay',
    'app.tagline': 'Forest Judicial Case Monitor',
    'nav.dashboard': 'Dashboard',
    'nav.cases': 'Offence Cases',
    'nav.calendar': 'Court Calendar',
    'nav.settings': 'Settings',
    'nav.newReport': 'New Offence Report (POR)',
    'nav.statutoryDeadlines': 'Statutory Deadlines',
    'nav.searchPlaceholder': 'Search case #, offence, accused, section...',
    'nav.alerts': 'Alerts',
    'nav.profile': 'Officer Profile',
    'nav.switchOfficer': 'Switch Active Officer',

    // Language & Theme
    'lang.english': 'English',
    'lang.hindi': 'हिंदी (Hindi)',
    'lang.toggle': 'Language: English / हिंदी',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'theme.toggle': 'Toggle Light/Dark Theme',

    // Settings
    'settings.title': 'Settings & Division Administration',
    'settings.subtitle': 'Configure forest division jurisdiction, DSC crypto tokens, language, theme and system backup.',
    'settings.saveBtn': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.savedToast': 'Settings and preferences saved successfully!',
    
    // Settings Sections
    'settings.prefSection': 'Language & Display Preferences',
    'settings.prefDesc': 'Select your preferred official operating language and interface theme.',
    'settings.langLabel': 'Interface Language (इंटरफ़ेस भाषा)',
    'settings.langSub': 'Switch between English and Hindi for navigation, alerts, and legal dashboards.',
    'settings.themeLabel': 'Color Theme (रंग थीम)',
    'settings.themeSub': 'Switch between high-contrast Forest Clean (Light) and eye-safe Midnight Emerald (Dark).',

    'settings.divisionSection': 'Forest Division & Circle Jurisdiction',
    'settings.divisionName': 'Division Name',
    'settings.divisionCode': 'Division Code',
    'settings.circleName': 'Forest Circle',
    'settings.dfo': 'Divisional Forest Officer (DFO)',
    'settings.nodalEmail': 'Nodal Contact Email',
    'settings.highCourt': 'High Court Legal Liaison Cell',

    'settings.dscSection': 'Class 3 DSC & E-Sign Provider',
    'settings.dscActive': 'Active & Registered',
    'settings.dscToken': 'ePass2003 Hardware Crypto Token',
    'settings.dscLicensedTo': 'Licensed to: Rajesh Kumar (Investigating Officer) • Valid Thru: Oct 2026',
    'settings.dscCryptoInfo': 'SHA-256 with RSA 2048-bit encryption • Compliant with CCA India & IT Act 2000',
    'settings.dscTestBtn': 'Test Connection',

    'settings.rosterSection': 'Authorized Officers & IO Roster',
    'settings.addOfficer': 'Add Officer',
    
    'settings.dataSection': 'Data Management & Local Persistence',
    'settings.dataDesc': 'All case records, daily investigation diaries, seized contraband schedules, and court hearing dates are safely preserved in browser local storage and can be backed up or restored anytime.',
    'settings.exportBackup': 'Export Full System Backup (JSON)',
    'settings.restoreBackup': 'Restore from Backup JSON',
    'settings.resetDemo': 'Reset to Default Demo Cases',
    'settings.storageStatus': 'Active Local Storage Persistence: Synchronized with browser cache.',

    // Statuses
    'status.investigation': 'Investigation',
    'status.pendingTrial': 'Pending Trial',
    'status.closed': 'Closed / Disposed',
    'status.appeals': 'Appeals & Revision',
    'status.firRegistered': 'FIR / POR Registered',
    'status.underInvestigation': 'Under Investigation',
    'status.chargesheetFiled': 'Charge Sheet Filed',
    'status.trial': 'Trial in Court',
    'status.judgmentDelivered': 'Judgment Delivered',
    'status.appealFiled': 'Appeal Filed',

    // Dashboard
    'dashboard.statusBreakdown': 'Case Status & Lifecycle Breakdown',
    'dashboard.statusBreakdownSub': 'Proportional case distribution across investigation, trial prosecution, and closure',
    'dashboard.viewCases': 'All Cases',
    'dashboard.total': 'Total',
    'dashboard.pipelineView': 'Overview',
    'dashboard.allStagesView': 'All 6 Stages',

    // Case List & Import
    'cases.bulkImport': 'Bulk CSV / Excel Import',
    'cases.scanOcr': 'Scan PDF / OCR Auto-Upload',
    'cases.newPOR': 'New POR',
    'cases.exportCsv': 'Export CSV'
  },
  hi: {
    // Navigation
    'app.title': 'वन न्याय',
    'app.tagline': 'वन अपराध न्यायिक प्रकरण मॉनिटर',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.cases': 'वन अपराध प्रकरण',
    'nav.calendar': 'न्यायालय कैलेंडर',
    'nav.settings': 'सेटिंग्स एवं प्रशासन',
    'nav.newReport': 'नया प्राथमिक वन अपराध (POR)',
    'nav.statutoryDeadlines': 'वैधानिक समय-सीमाएं',
    'nav.searchPlaceholder': 'केस क्रमांक, अपराध, अभियुक्त, धारा खोजें...',
    'nav.alerts': 'विधिक सूचनाएं',
    'nav.profile': 'अधिकारी प्रोफ़ाइल',
    'nav.switchOfficer': 'सक्रिय अधिकारी बदलें',

    // Language & Theme
    'lang.english': 'English',
    'lang.hindi': 'हिंदी (Hindi)',
    'lang.toggle': 'भाषा बदलें: हिंदी / English',
    'theme.light': 'लाइट मोड (दिन)',
    'theme.dark': 'डार्क मोड (रात)',
    'theme.toggle': 'थीम बदलें: लाइट / डार्क',

    // Settings
    'settings.title': 'सेटिंग्स एवं मण्डल प्रशासन',
    'settings.subtitle': 'वन मण्डल क्षेत्राधिकार, डीएससी क्रिप्टो टोकन, भाषा, थीम एवं डेटाबेस बैकअप कॉन्फ़िगर करें।',
    'settings.saveBtn': 'सेटिंग्स सहेजें',
    'settings.saving': 'सहेजा जा रहा है...',
    'settings.savedToast': 'सेटिंग्स एवं प्राथमिकताएं सफलतापूर्वक सहेजी गईं!',

    // Settings Sections
    'settings.prefSection': 'भाषा एवं डिस्प्ले प्राथमिकताएं',
    'settings.prefDesc': 'वन न्याय पोर्टल के लिए अपनी पसंदीदा आधिकारिक कार्यशील भाषा और इंटरफ़ेस थीम चुनें।',
    'settings.langLabel': 'इंटरफ़ेस भाषा (Interface Language)',
    'settings.langSub': 'नेविगेशन, अलर्ट और विधिक डैशबोर्ड के लिए हिंदी अथवा अंग्रेजी का चयन करें।',
    'settings.themeLabel': 'रंग थीम (Color Theme)',
    'settings.themeSub': 'फॉरेस्ट क्लीन (लाइट मोड) अथवा आंखों के अनुकूल मिडनाइट एमराल्ड (डार्क मोड) में से चुनें।',

    'settings.divisionSection': 'वन मण्डल एवं वृत्त क्षेत्राधिकार',
    'settings.divisionName': 'वन मण्डल का नाम',
    'settings.divisionCode': 'मण्डल कोड',
    'settings.circleName': 'वन वृत्त का नाम',
    'settings.dfo': 'वन मण्डलाधिकारी (DFO)',
    'settings.nodalEmail': 'नोडल संपर्क ईमेल',
    'settings.highCourt': 'उच्च न्यायालय विधिक संपर्क प्रकोष्ठ',

    'settings.dscSection': 'क्लास 3 डीएससी एवं ई-हस्ताक्षर प्रदाता',
    'settings.dscActive': 'सक्रिय एवं पंजीकृत',
    'settings.dscToken': 'ePass2003 हार्डवेयर क्रिप्टो टोकन',
    'settings.dscLicensedTo': 'लाइसेंस धारक: राजेश कुमार (जांच अधिकारी) • वैधता: अक्टूबर 2026',
    'settings.dscCryptoInfo': 'SHA-256 व RSA 2048-बिट एन्क्रिप्शन • सीसीए इंडिया व आईटी अधिनियम 2000 के अनुरूप',
    'settings.dscTestBtn': 'कनेक्शन परीक्षण करें',

    'settings.rosterSection': 'अधिकृत वन अधिकारी एवं जांच अधिकारी रोस्टर',
    'settings.addOfficer': 'अधिकारी जोड़ें',

    'settings.dataSection': 'डेटा प्रबंधन एवं स्थानीय भंडारण',
    'settings.dataDesc': 'समस्त केस रिकॉर्ड, दैनिक जांच डायरी, जब्त वनोपज सूची एवं अदालती पेशी दिनांक सुरक्षित रूप से ब्राउज़र के लोकल स्टोरेज में संग्रहित हैं।',
    'settings.exportBackup': 'पूर्ण सिस्टम बैकअप डाउनलोड करें (JSON)',
    'settings.restoreBackup': 'बैकअप JSON से पुनर्स्थापित करें',
    'settings.resetDemo': 'डेमो केस डेटा रीसेट करें',
    'settings.storageStatus': 'स्थानीय भंडारण (localStorage): ब्राउज़र में सुरक्षित व सक्रिय।',

    // Statuses
    'status.investigation': 'जांच चरण',
    'status.pendingTrial': 'न्यायालय में विचाराधीन',
    'status.closed': 'निराकृत / बंद',
    'status.appeals': 'अपील एवं पुनरीक्षण',
    'status.firRegistered': 'प्रथम सूचना / POR दर्ज',
    'status.underInvestigation': 'विवेचना / जांच जारी',
    'status.chargesheetFiled': 'अभियोग पत्र (चार्जशीट) दाखिल',
    'status.trial': 'न्यायालय में साक्ष्य / विचारण',
    'status.judgmentDelivered': 'निर्णय पारित / दोषसिद्ध',
    'status.appealFiled': 'अपील / पुनरीक्षण दायर',

    // Dashboard
    'dashboard.statusBreakdown': 'केस स्थिति एवं जीवन चक्र विवरण',
    'dashboard.statusBreakdownSub': 'जांच, न्यायालय विचारण, एवं निराकरण में मामलों का समानुपातिक वितरण',
    'dashboard.viewCases': 'सभी मामले',
    'dashboard.total': 'कुल',
    'dashboard.pipelineView': 'संक्षिप्त अवलोकन',
    'dashboard.allStagesView': 'सभी 6 चरण',

    // Case List & Import
    'cases.bulkImport': 'थोक CSV / Excel आयात',
    'cases.scanOcr': 'दस्तावेज़ स्कैन PDF / OCR स्वतः अपलोड',
    'cases.newPOR': 'नया POR दर्ज करें',
    'cases.exportCsv': 'CSV निर्यात करें'
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
