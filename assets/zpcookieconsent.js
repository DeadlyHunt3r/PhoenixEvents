/*! ***

	!!! DIE DATEI ZPCOOKIECONSENT.JS NIE DIREKT BEARBEITEN !!! 
	
	Diese Datei wird automatisch mit Babel "transpiled" um IE-Kompatibilität herzustellen.
	Die bearbeitbare Datei liegt in: 
	
	Development/Source/Packaging/Widgets/zpcookieconsent/zpcookieconsent-src.js
	
*** */
"use strict";
"use strict";

/*! $Id$ */

// @codekit-prepend quiet "hinweis.js";

// globals
var type_attr, zp_consent_whitelist, zp_consentlang, zp_consent_strings, zp_consent_categories, zp_consent_settings, zp_consent_ids_by_category, zp_consent_categories_de, zp_consent_pos, zp_consent_theme, blockiframes, zp_consent_usedids, zp_consent_privacypage, zp_consent_privacylinkt, zp_consent_imprintpage, zp_consent_imprintlinkt, zp_consent_buttontitle_accept, zp_consent_buttontitle_essential, zp_consent_bgcolor_accept, zp_consent_textcolor_accept, zp_consent_bgcolor_essential, zp_consent_textcolor_gen, zp_consent_linkcolor_gen, zp_consent_textcolor_essential, zp_consent_bgcolor_save, zp_consent_textcolor_save, zp_consent_buttontitle, zp_consent_description, zp_consent_title, fallbackOpener;
var consentStorage = {};
var zpconsent = {};
var zp_consent_local_blocklist = ["assets/js/webfont/1.6.28/webfont.js"];
var zp_gaconsent_ids = ["zp_consent_ga", "zp_consent_gmaps", "zp_consent_gtm", "zp_consent_yt", "zp_consent_gadsense", "zp_consent_googlefonts", "zp_consent_googlerecaptcha", "zp_consent_gtranslate"];

//var zp_consent_local_blocklist = []; 

// use localStorage or cookies?
var supports_html5_storage = does_support_html5_storage();

// begin google consent v2 default denied
var dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('consent', 'default', {
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 2500
});
// end google consent v2 default denied

function initcontent() {
  zpconsent.read_cookie = function (name) {
    // read from localStorage
    if (supports_html5_storage) {
      //console.log("LocalStorage supported and used to read cookies!");
      let result = JSON.parse(localStorage.getItem(name));
      return result;
    }

    //let result = document.cookie.match(new RegExp(name + '=([^;]+)'));
    let result = decodeURIComponent(document.cookie).match(new RegExp('zp_consent=([^;]+)'));
    result && (result = JSON.parse(result[1]));
    if (result) {
      //console.log("Cookie result: ", result[name]);
      return result[name];
    } else {
      return null;
    }
  };

  // if user accepted all cookies, we proactively set google consent v2
  if (zpconsent.read_cookie('zp_consent_all')) {
    //console.log("✅ granting google consent as all accepted");
    googleConsentv2('granted');
  }
  type_attr = 'text/zpconsent';
  zp_consent_whitelist = ["//js.stripe.com", "//code.jquery.com", "//localhost", "//127.0.0.", "chrome-extension://", "//cdn.sitesearch360.com", "//js.sitesearch360.com"];
  zp_consentlang = document.getElementsByTagName("html")[0].getAttribute("lang") || "de";
  zp_consentlang = zp_consentlang.toLowerCase();
  if (zp_consentlang.substring(0, 2) !== "de") {
    zp_consentlang = "en";
  } else {
    // in case someone set the lang attribute to e.g. "zp_consentlang = "de-DE" or such
    zp_consentlang = "de";
  }
  zp_consent_strings = {
    "consent_title_de": "Datenschutzeinstellungen",
    "consent_title_en": "Privacy-Settings",
    "consent_descr_de": "<p>Auf dieser Website werden Cookies genutzt. Sie können alle Cookies akzeptieren oder nur bestimmte auswählen. Sie können diese Einstellungen jederzeit ändern.</p>",
    "consent_descr_en": "<p>This website uses cookies. You can accept all cookies or select individual cookies. These settings can be changed at any time.</p>",
    "title_settings_de": "Cookie-Einstellungen",
    "title_settings_en": "Cookie-Settings",
    "button_accept_de": "Alle akzeptieren",
    "button_accept_en": "Accept all",
    "button_loadiframe_de": "IFrame laden",
    "button_loadiframe_en": "Load iframe",
    "button_loadfont_de": "Schriften laden",
    "button_loadfont_en": "Load fonts",
    "button_accept_essential_de": "Alle ablehnen",
    "button_accept_essential_en": "Deny all",
    "button_save_de": "Speichern",
    "button_save_en": "Save",
    "button_activate_de": "Cookie aktivieren",
    "button_activate_en": "Activate cookie",
    "show_info_de": "Informationen anzeigen",
    "hide_info_de": "Informationen ausblenden",
    "show_info_en": "Show information",
    "hide_info_en": "Hide information",
    "imprint_de": "Impressum",
    "imprint_en": "Imprint",
    "policy_de": "Datenschutzerklärung",
    "policy_en": "Privacy-Terms",
    "name_label_de": "Name: ",
    "name_label_en": "Name: ",
    "anbieter_label_de": "Anbieter: ",
    "anbieter_label_en": "Supplier: ",
    "descr_label_de": "Beschreibung: ",
    "descr_label_en": "Description: ",
    "blocked_info_de": "<div class=\"zpconsentinfo\"><h3>Deaktivierter Inhalt!</h3><p>Aktivieren Sie das Cookie <b>%s</b> um diesen Inhalt anzuzeigen!</p>%d<p class=\"butt\"><a href=\"#\" data-consentid=\"%id\" class=\"button default activate\"><span>%b</span></a></p></div>",
    "blocked_info_en": "<div class=\"zpconsentinfo\"><h3>Deactivated content!</h3><p>Activate cookie <b>%s</b> to view the content!</p>%d<p class=\"butt\"><a href=\"#\" data-consentid=\"%id\" class=\"default activate\"><span>%b</span></a></p></div>",
    "blocked_info_notactive_de": "Aktivieren Sie alle Cookies per Klick auf &quot;<strong>Alle akzeptieren</strong>&quot; um diesen Inhalt anzuzeigen.",
    "blocked_info_notactive_en": "Activate all cookies by clicking on &quot;<strong>Accept all</strong>&quot; to view the content.",
    "blocked_unknown_de": "<div class=\"zpconsentinfo\"><h3>Deaktiviertes Script!</h3><p>Aktivieren Sie alle Cookies per Klick auf &quot;<strong>Alle akzeptieren</strong>&quot; um diesen Inhalt anzuzeigen.</p>%a Unbekannt<br /> URL: <span style=\"-ms-word-break: break-all; word-break: break-all;\">%u</span>%b</div>",
    "blocked_unknown_en": "<div class=\"zpconsentinfo\"><h3>Deactivated script!</h3><p>Activate all cookies by clicking on &quot;<strong>Accept all</strong>&quot; to view the content.</p>%a unknown<br /> URL: <span style=\"-ms-word-break: break-all; word-break: break-all;\">%u</span>%b</div>",
    "blocked_iframe_de": "<div class=\"zpconsentinfo iframe\"><h3>Deaktiviertes IFrame!</h3><p>Laden Sie externe Inhalte per Klick auf &quot;<strong>%t</strong>&quot;.</p>%a Unbekannt<br />URL: <span style=\"-ms-word-break: break-all; word-break: break-all;\">%u</span>%b<p><span class=\"smallprint\">Durch Klick auf den Button erklären Sie sich damit einverstanden, dass Ihnen externe Inhalte angezeigt werden. Damit könnten personenbezogene Daten an Drittplattformen übermittelt werden. Mehr dazu hier: <a %dsu>%dst</a>.</span></p></div>",
    "blocked_iframe_en": "<div class=\"zpconsentinfo iframe\"><h3>Deactivated iframe!</h3><p>Load external content with a click on &quot;<strong>%t</strong>&quot;.</p>%a Unknown<br />URL: <span style=\"-ms-word-break: break-all; word-break: break-all;\">%u</span>%b<p><span class=\"smallprint\">By klicking the button, you agree that external data is loaded. This could transmit personal data to third-party platforms. More about this here: <a %dsu>%dst</a>.</span></p></div>",
    "blocked_font_de": "<div class=\"zpconsentinfo gfont\"><h3>Ungeladene Schriftarten!</h3><p>Laden Sie externe Schriftarten per Klick auf &quot;<strong>%t</strong>&quot;.</p>%d %b<p><span class=\"smallprint\">Durch Klick auf den Button erklären Sie sich damit einverstanden, dass externe Schriftarten geladen werden. Dadurch könnten personenbezogene Daten an Google übermittelt werden.</span></p></div>",
    "blocked_font_en": "<div class=\"zpconsentinfo gfont\"><h3>Inactive fonts!</h3><p>Load external fonts with a click on &quot;<strong>%t</strong>&quot;.</p>%d %b<p><span class=\"smallprint\">By klicking the button, you agree that external fonts are loaded. This could transmit personal data to Google.</span></p></div>",
    "blocked_recptcha_de": "<div class=\"zpconsentinfo recaptcha\"><h3>Ungeladenes, benötigtes Script!</h3><p>Um dieses Formular absenden zu können, laden Sie das Script per Klick auf &quot;<strong>%t</strong>&quot;.</p>%d %b<p><span class=\"smallprint\">Durch Klick auf den Button erklären Sie sich damit einverstanden, dass reCAPTCHA geladen wird. Dadurch könnten personenbezogene Daten an Google übermittelt werden.</span></p></div>",
    "blocked_recptcha_en": "<div class=\"zpconsentinfo gfont\"><h3>Deactivated, required script!</h3><p>In order to submit this form, load the script with a click on &quot;<strong>%t</strong>&quot;.</p>%d %b<p><span class=\"smallprint\">By klicking the button, you agree that external reCAPTCHA is loaded. This could transmit personal data to Google.</span></p></div>"
  };
  zp_consent_categories = {
    " Essenziell": {
      "show_switch": false,
      "name_de": " Essenziell",
      "description_de": "<p class=\"description\">Sind für die einwandfreie Funktion der Website erforderlich.</p>"
    },
    "Externe Medien": {
      "name_de": "Externe Medien",
      "description_de": "<p class=\"description\">Inhalte von externen Plattformen wie YouTube, Vimeo etc.</p>"
    },
    "Statistiken": {
      "name_de": "Statistiken",
      "description_de": "<p class=\"description\">Helfen uns zu verstehen, wie Sie unsere Website nutzen.</p>"
    },
    "Marketing": {
      "name_de": "Marketing",
      "description_de": "<p class=\"description\">Werden von Anbietern verwendet, um personalisierte Werbung anzuzeigen.</p>"
    },
    " Essential": {
      "show_switch": false,
      "name_en": " Essential",
      "description_en": "<p class=\"description\">Are necessary for the proper function of the website.</p>"
    },
    "External Media": {
      "name_en": "External Media",
      "description_en": "<p class=\"description\">Content from third party platforms like YouTube, Vimeo etc.</p>"
    },
    "Statistics": {
      "name_en": "Statistics",
      "description_en": "<p class=\"description\">Help us understand how you use out site.</p>"
    },
    "Marketing_EN": {
      "name_en": "Marketing",
      "description_en": "<p class=\"description\">Are used by third-parties to display personalized ads.</p>"
    }
  };
  zp_consent_settings = {
    "zp_consent_zp": {
      "name": "–",
      "anbieter_de": "Eigentümer dieser Website",
      "anbieter_en": "Owner of this website",
      "policy_de": "",
      "policy_en": "",
      "category_de": " Essenziell",
      "category_en": " Essential",
      "description_de": "<p class=\"description\">Diverse Session-Cookies oder z.B. Ihre Cookie-Einstellungen.</p>",
      "description_en": "<p class=\"description\">Various session cookies or i.e. your cookie-consent-settings.</p>",
      "type": "iframe"
    },
    "zp_consent_yt": {
      "name": "YouTube Video",
      "anbieter_de": "YouTube",
      "anbieter_en": "YouTube",
      "poster_image": "https://img.youtube.com/vi/{@videoid}/maxresdefault.jpg",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Videos von YouTube.</p>",
      "description_en": "<p class=\"description\">Videos from YouTube.</p>",
      "type": "iframe",
      "url_pattern": ["//www\.youtube-nocookie\.com/", "//www\.youtube\.com/"]
    },
    "zp_consent_vimeo": {
      "name": "Vimeo Video",
      "anbieter_de": "Vimeo",
      "anbieter_en": "Vimeo",
      "poster_image": "assets/stock-images/video-placeholder.svg",
      "policy_de": "https://vimeo.com/de/features/video-privacy",
      "policy_en": "https://vimeo.com/features/video-privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Videos von Vimeo.</p>",
      "description_en": "<p class=\"description\">Videos from Vimeo.</p>",
      "type": "iframe",
      "url_pattern": ["//player\.vimeo\.com/"]
    },
    "zp_consent_gmaps": {
      "name": "Google Maps",
      "anbieter_de": "Google",
      "anbieter_en": "Google",
      "poster_image": "assets/stock-images/GoogleMapsPreview.png",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Karten von Google Maps.</p>",
      "description_en": "<p class=\"description\">Maps from Google Maps.</p>",
      "type": "iframe",
      "url_pattern": ["//maps\.google\.com/", "//www\.google\.com/maps/"]
    },
    "zp_consent_soundcloud": {
      "name": "Soundcloud",
      "anbieter_de": "Soundcloud",
      "anbieter_en": "Soundcloud",
      "policy_de": "https://soundcloud.com/pages/privacy",
      "policy_en": "https://soundcloud.com/pages/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Audio von Soundcloud.</p>",
      "description_en": "<p class=\"description\">Audio from Soundcloud</p>",
      "type": "iframe",
      "url_pattern": ["soundcloud\.com/player/"]
    },
    "zp_consent_spotify_if": {
      "name": "Spotify",
      "anbieter_de": "Spotify",
      "anbieter_en": "Spotify",
      "policy_de": "https://support.spotify.com/de/article/data-rights-and-privacy-settings/",
      "policy_en": "https://www.spotify.com/us/legal/privacy-policy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Eingebettete Inhalte von Spotify.</p>",
      "description_en": "<p class=\"description\">Embedded content from Spotify.</p>",
      "type": "iframe",
      "url_pattern": ["//open\.spotify\.com/embed/", "//podcasters\.spotify\.com/.*/embed/"]
    },
    "zp_consent_ga": {
      "name": "Google Analytics",
      "anbieter_de": "Google LLC",
      "anbieter_en": "Google LLC",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Statistiken",
      "category_en": "Statistics",
      "description_de": "<p class=\"description\">Website-Analyse und Tracking mit Google Analytics.</p>",
      "description_en": "<p class=\"description\">Website analytics and tracking with Google Analytics.</p>",
      "type": "script",
      "url_pattern": ["//www\.google-analytics\.com/analytics\.js", "//www\.googletagmanager\.com/gtag/js\\?id="]
    },
    "zp_consent_clarity": {
      "name": "Microsoft Clarity",
      "anbieter_de": "Microsoft Corporation",
      "anbieter_en": "Microsoft Corporation",
      "policy_de": "https://privacy.microsoft.com/de-de/privacystatement",
      "policy_en": "https://privacy.microsoft.com/en-us/privacystatement",
      "category_de": "Statistiken",
      "category_en": "Statistics",
      "description_de": "<p class=\"description\">Website-Analyse und Tracking mit Microsoft Clarity.</p>",
      "description_en": "<p class=\"description\">Website analytics and tracking with Microsoft Clarity.</p>",
      "type": "script",
      "url_pattern": ["//www\.clarity\.ms/tag/"]
    },
    "zp_consent_matomo": {
      "name": "Matomo",
      "anbieter_de": "Matomo",
      "anbieter_en": "Matomo",
      "policy_de": "https://matomo.org/privacy-policy/",
      "policy_en": "https://matomo.org/privacy-policy/",
      "category_de": "Statistiken",
      "category_en": "Statistics",
      "description_de": "<p class=\"description\">Website-Analyse und Tracking mit Matomo.</p>",
      "description_en": "<p class=\"description\">Website analytics and tracking with Matomo.</p>",
      "type": "script",
      "url_pattern": ["/piwik\.js", "/matomo\.js"]
    },
    "zp_consent_gtm": {
      "name": "Google Tag Manager",
      "anbieter_de": "Google LLC",
      "anbieter_en": "Google LLC",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Marketing",
      "category_en": "Marketing_EN",
      "description_de": "<p class=\"description\">Website-Analyse und Tracking mit Google Tag Manager.</p>",
      "description_en": "<p class=\"description\">Website analytics and tracking with Google Tag Manager.</p>",
      "type": "script",
      "url_pattern": ["//www\.googletagmanager\.com/ns\.html", "//www\.googletagmanager\.com/gtm\.js"]
    },
    "zp_consent_gadsense": {
      "name": "Google AdSense",
      "anbieter_de": "Google LLC",
      "anbieter_en": "Google LLC",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Marketing",
      "category_en": "Marketing_EN",
      "description_de": "<p class=\"description\">Werbung von Google AdSense.</p>",
      "description_en": "<p class=\"description\">Ads by Google AdSense.</p>",
      "type": "script",
      "url_pattern": ["//pagead2\.googlesyndication\.com/pagead/", "//tpc\.googlesyndication\.com/sodar/", "//googleads\.g\.doubleclick.net"]
    },
    "zp_consent_twitter": {
      "name": "Twitter",
      "anbieter_de": "Twitter",
      "anbieter_en": "Twitter",
      "policy_de": "https://twitter.com/de/privacy",
      "policy_en": "https://twitter.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Twitter-Button.</p>",
      "description_en": "<p class=\"description\">Twitter-Button.</p>",
      "type": "script",
      "url_pattern": ["//platform\.twitter\.com/widgets\.js"],
      "warning_target": ".twitter-share-button"
    },
    "zp_consent_fbpixel": {
      "name": "Facebook Pixel",
      "anbieter_de": "Facebook Ireland Limited",
      "anbieter_en": "Facebook Ireland Limited",
      "policy_de": "https://www.facebook.com/policies/cookies",
      "policy_en": "https://www.facebook.com/policies/cookies",
      "category_de": "Marketing",
      "category_en": "Marketing_EN",
      "description_de": "<p class=\"description\">Website-Analyse und Tracking mit Facebook-Pixel.</p>",
      "description_en": "<p class=\"description\">Website analytics, ad targeting, and ad measurement with facebook-pixel.</p>",
      "type": "script",
      "url_pattern": ["connect\.facebook\.net.*/fbevents\.js", "//www\.facebook\.com/tr\\?id="]
    },
    "zp_consent_fbcomments": {
      "name": "Facebook Kommentare",
      "anbieter_de": "Facebook Ireland Limited",
      "anbieter_en": "Facebook Ireland Limited",
      "policy_de": "https://www.facebook.com/policies/cookies",
      "policy_en": "https://www.facebook.com/policies/cookies",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Seite kommentieren über Facebook.</p>",
      "description_en": "<p class=\"description\">Comment page via Facebook.</p>",
      "type": "script",
      "url_pattern": ["connect\.facebook\.net.*/all\.js"],
      "warning_target": ".fb-comments"
    },
    "zp_consent_fbplugin": {
      "name": "Facebook Plugins",
      "anbieter_de": "Facebook Ireland Limited",
      "anbieter_en": "Facebook Ireland Limited",
      "poster_image": "",
      "policy_de": "https://www.facebook.com/policies/cookies",
      "policy_en": "https://www.facebook.com/policies/cookies",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Facebook-Plugins, wie z.B. Facebook Seiten-Plugin.</p>",
      "description_en": "<p class=\"description\">Facebook-Plugins, like e.g. facebook-page-plugin.</p>",
      "type": "iframe",
      "url_pattern": ["facebook\.com/plugins/[^comments]"]
    },
    "zp_consent_disq": {
      "name": "Disqus",
      "anbieter_de": "Disqus, Inc.",
      "anbieter_en": "Disqus, Inc.",
      "policy_de": "https://help.disqus.com/en/articles/1717103-disqus-privacy-policy",
      "policy_en": "https://help.disqus.com/en/articles/1717103-disqus-privacy-policy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Live Kommentare und Diskussionen mit Disqus.</p>",
      "description_en": "<p class=\"description\">Live comments and discussion using Disqus.</p>",
      "type": "script",
      "url_pattern": ["disqus\.com/embed\.js", "disquscdn\.com/", "disqus\.com/\\?ref_noscript"],
      "warning_target": "#disqus_thread"
    },
    "zp_consent_smartsupp": {
      "name": "SmartSupp live chat",
      "anbieter_de": "Smartsupp.com",
      "anbieter_en": "Smartsupp.com",
      "policy_de": "https://www.smartsupp.com/help/privacy/",
      "policy_en": "https://www.smartsupp.com/help/privacy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Chat mit dem Websitebetreiber.</p>",
      "description_en": "<p class=\"description\">Chat with us.</p>",
      "type": "script",
      "url_pattern": ["//www\.smartsuppchat\.com/"]
    },
    "zp_consent_userlike": {
      "name": "Userlike live chat",
      "anbieter_de": "www.userlike.com",
      "anbieter_en": "www.userlike.com",
      "policy_de": "https://www.userlike.com/de/terms#privacy-policy",
      "policy_en": "https://www.userlike.com/en/terms#privacy-policy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Chat mit dem Websitebetreiber.</p>",
      "description_en": "<p class=\"description\">Chat with us.</p>",
      "type": "script",
      "url_pattern": ["//userlike-cdn-widgets\."]
    },
    "zp_consent_instagram": {
      "name": "Instagram",
      "anbieter_de": "instagram.com",
      "anbieter_en": "instagram.com",
      "policy_de": "https://help.instagram.com/519522125107875",
      "policy_en": "https://www.smartsupp.com/help/privacy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Eingebetteter Instagram-Feed.</p>",
      "description_en": "<p class=\"description\">Embedded Instagram-Feed.</p>",
      "type": "script",
      "url_pattern": ["//www\.instagram\.com/embed\.js"],
      "warning_target": ".instagram-media[data-instgrm-permalink]"
    },
    "zp_consent_elfsight": {
      "name": "Elfsight Widgets",
      "anbieter_de": "elfsight.com",
      "anbieter_en": "elfsight.com",
      "policy_de": "https://elfsight.com/privacy-policy/",
      "policy_en": "https://elfsight.com/privacy-policy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Diverse Widgets um externe Medien darzustellen.</p>",
      "description_en": "<p class=\"description\">Various widgets to display external media.</p>",
      "type": "script",
      "url_pattern": ["//apps\.elfsight\.com/"]
    },
    "zp_consent_opentable": {
      "name": "Open Table",
      "anbieter_de": "opentable.de",
      "anbieter_en": "opentable.com",
      "policy_de": "https://www.opentable.de/legal/privacy-policy",
      "policy_en": "https://www.opentable.com/legal/privacy-policy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Restaurant-Reservierungen.</p>",
      "description_en": "<p class=\"description\">Restaurant reservations.</p>",
      "type": "script",
      "url_pattern": ["//www\.opentable\.de/widget/", "//www\.opentable\.com/widget/"]
    },
    "zp_consent_mailchimp": {
      "name": "Mailchimp",
      "anbieter_de": "mailchimp.com",
      "anbieter_en": "mailchimp.com",
      "policy_de": "https://mailchimp.com/legal/privacy/",
      "policy_en": "https://mailchimp.com/legal/privacy/",
      "category_de": "Marketing",
      "category_en": "Marketing_EN",
      "description_de": "<p class=\"description\">E-Mail Newsletter.</p>",
      "description_en": "<p class=\"description\">Email newsletters.</p>",
      "type": "script",
      "url_pattern": ["//cdn-images\.mailchimp\.com/embedcode/", "//s3\.amazonaws\.com/downloads\.mailchimp\.com/js/"]
    },
    "zp_consent_werkenntdenbesten": {
      "name": "Wer kennt den Besten",
      "anbieter_de": "werkenntdenbesten.de",
      "anbieter_en": "werkenntdenbesten.de",
      "policy_de": "https://www.werkenntdenbesten.de/datenschutz",
      "policy_en": "https://www.werkenntdenbesten.de/datenschutz",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Bewertungsportal.</p>",
      "description_en": "<p class=\"description\">Ratings.</p>",
      "type": "script",
      "url_pattern": ["//download\.werkenntdenbesten\.de/"]
    },
    "zp_consent_dirs21": {
      "name": "DIRS21",
      "anbieter_de": "dirs21.de",
      "anbieter_en": "dirs21.de",
      "policy_de": "https://www.dirs21.de/disclaimer",
      "policy_en": "https://www.dirs21.de/disclaimer",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Onlinebuchung, Channelmanagement und Marketing für Hotels und Gastronomie.</p>",
      "description_en": "<p class=\"description\">Web-based reservations and channel mangement system.</p>",
      "type": "script",
      "url_pattern": ["//js-sdk\.dirs21\.de/"],
      "warning_target": "#d21-quickbook"
    },
    "zp_consent_fewochannel": {
      "name": "Fewo-Channelmanager",
      "anbieter_de": "SECRA Bookings GmbH",
      "anbieter_en": "SECRA Bookings GmbH",
      "policy_de": "https://www.fewo-channelmanager.de/datenschutz",
      "policy_en": "https://www.fewo-channelmanager.de/data-privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Multi-Channel-Distribution von Ferienwohnungen &amp; Ferienhäusern.</p>",
      "description_en": "<p class=\"description\">Multi-channel distribution of vacation condos and vacation houses.</p>",
      "type": "script",
      "url_pattern": ["\.fewo-channelmanager\.de/integration/v2/js/object/"]
    },
    "zp_consent_formstack": {
      "name": "Formstack",
      "anbieter_de": "formstack.com",
      "anbieter_en": "formstack.com",
      "policy_de": "https://www.formstack.com/privacy",
      "policy_en": "https://www.formstack.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Website-Formulare.</p>",
      "description_en": "<p class=\"description\">Website-Forms.</p>",
      "type": "script",
      "url_pattern": ["\.formstack\.com/forms/"]
    },
    "zp_consent_tawkto": {
      "name": "Tawk.to live chat",
      "anbieter_de": "Tawk.to",
      "anbieter_en": "Tawk.to",
      "policy_de": "https://www.tawk.to/privacy-policy/",
      "policy_en": "https://www.tawk.to/privacy-policy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Chat mit dem Websitebetreiber.</p>",
      "description_en": "<p class=\"description\">Chat with us.</p>",
      "type": "script",
      "url_pattern": ["//embed\.tawk\.to/"]
    },
    "zp_consent_lautfm": {
      "name": "Laut.fm User Generated Radio",
      "anbieter_de": "Laut AG",
      "anbieter_en": "Laut AG",
      "policy_de": "https://laut.fm/pages/privacy",
      "policy_en": "https://laut.fm/pages/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">User Generated Radio.</p>",
      "description_en": "<p class=\"description\">User Generated Radio.</p>",
      "type": "script",
      "url_pattern": ["//api\.laut\.fm/"]
    },
    "zp_consent_provenexpert": {
      "name": "Proven Expert",
      "anbieter_de": "Expert Systems AG",
      "anbieter_en": "Expert Systems AG",
      "policy_de": "https://www.provenexpert.com/de-de/datenschutzbestimmungen/",
      "policy_en": "https://www.provenexpert.com/en-gb/privacy-policy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Bewertungsportal.</p>",
      "description_en": "<p class=\"description\">Ratings.</p>",
      "type": "script",
      "url_pattern": ["//www\.provenexpert\.com/slider_", "//s\.provenexpert\.net/seals/"]
    },
    "zp_consent_osmaps": {
      "name": "OpenStreetMap",
      "anbieter_de": "OpenStreetMap",
      "anbieter_en": "OpenStreetMap",
      "policy_de": "https://wiki.osmfoundation.org/wiki/Privacy_Policy",
      "policy_en": "https://wiki.osmfoundation.org/wiki/Privacy_Policy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Eingebettete Karten von OpenStreetMap.</p>",
      "description_en": "<p class=\"description\">Embedded maps from OpenStreetMap.</p>",
      "type": "iframe",
      "url_pattern": ["//openstreetmap\.org/export/embed\.", "//www\.openstreetmap\.org/export/embed\."]
    },
    "zp_consent_googlefonts": {
      "name": "Google Fonts",
      "anbieter_de": "Google",
      "anbieter_en": "Google",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Schriftarten, die zur Gestaltung dieser Website genutzt werden.</p>",
      "description_en": "<p class=\"description\">Fonts used for the design of this website.</p>",
      "type": "script",
      "url_pattern": ["assets/js/webfont/1\.6\.28/webfont\.js", "//fonts\.googleapis\.com/", "//fonts\.gstatic\.com/", "//fonts\.googleapis\.com/css"]
    },
    "zp_consent_bookingtime": {
      "name": "Bookingtime",
      "anbieter_de": "bookingtime GmbH",
      "anbieter_en": "bookingtime GmbH",
      "policy_de": "https://www.onlinetermine.com/datenschutz",
      "policy_en": "https://www.booking-time.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Online Terminverwaltung.</p>",
      "description_en": "<p class=\"description\">Online appointments.</p>",
      "type": "script",
      "url_pattern": ["//satellite\.booking-time\.com"]
    },
    "zp_consent_googlerecaptcha": {
      "name": "Google reCAPTCHA",
      "anbieter_de": "Google",
      "anbieter_en": "Google",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">reCAPTCHA wird genutzt um ein automatisiertes Versenden von Formularen zu verhindern.</p>",
      "description_en": "<p class=\"description\">reCAPTCHA is used to prevent automated form-submission.</p>",
      "type": "script",
      "url_pattern": ["//www\.google\.com/recaptcha/", "//www\.gstatic\.com/recaptcha/"]
    },
    "zp_consent_tockify": {
      "name": "Tockify Calendars",
      "anbieter_de": "Tockify",
      "anbieter_en": "Tockify",
      "policy_de": "https://tockify.com/i/docs/company/privacy",
      "policy_en": "https://tockify.com/i/docs/company/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Tockify Website Kalender.</p>",
      "description_en": "<p class=\"description\">Tockify Website Calendars.</p>",
      "type": "script",
      "url_pattern": ["//public\.tockify\.com/browser/embed\.js"]
    },
    "zp_consent_igroove": {
      "name": "iGroove",
      "anbieter_de": "iGroove AG",
      "anbieter_en": "iGroove AG",
      "policy_de": "https://www.igroovemusic.com/terms",
      "policy_en": "https://www.igroovemusic.com/terms?lang=en",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">iGroove Musikvertrieb und Promotion.</p>",
      "description_en": "<p class=\"description\">iGroove music distribution and promotion.</p>",
      "type": "script",
      "url_pattern": ["//app\.igroovenext\.com/user-widget/generate\.js", "//app\.igroovemusic\.com/show-release-widget"],
      "warning_target": ".igroove-artist-widget"
    },
    "zp_consent_aidaform": {
      "name": "Aidaform Formulare",
      "anbieter_de": "Aidaform",
      "anbieter_en": "Aidaform",
      "policy_de": "https://de.aidaform.com/privacy-policy.html",
      "policy_en": "https://aidaform.com/privacy-policy.html",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Online Formulare.</p>",
      "description_en": "<p class=\"description\">Online Forms.</p>",
      "type": "script",
      "url_pattern": ["//embed\.aidaform\.com/embed\.js"]
    },
    "zp_consent_ratedo": {
      "name": "Ratedo Kundenbewertungen",
      "anbieter_de": "Ratedo",
      "anbieter_en": "Ratedo",
      "policy_de": "https://www.ratedo.de/datenschutz",
      "policy_en": "https://de.aidaform.com/privacy-policy.html",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Kundenbewertungen.</p>",
      "description_en": "<p class=\"description\">Customer-Ratings.</p>",
      "type": "script",
      "url_pattern": ["//www\.ratedo\.de/js/widgets/"]
    },
    "zp_consent_calendarappde": {
      "name": "Calendarapp.de Belegungskalender",
      "anbieter_de": "Calendarapp.de | Tool Loft UG",
      "anbieter_en": "Calendarapp.de | Tool Loft UG",
      "policy_de": "https://calendarapp.de/seite/datenschutz/",
      "policy_en": "https://calendarapp.de/en/seite/privacy-policy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Belegungskalender.</p>",
      "description_en": "<p class=\"description\">Booking Calendar.</p>",
      "type": "script",
      "url_pattern": ["//app\.calendarapp\.de/loadcal\.php"]
    },
    "zp_consent_gtranslate": {
      "name": "Google Translate",
      "anbieter_de": "Google",
      "anbieter_en": "Google",
      "policy_de": "https://policies.google.com/privacy?hl=de",
      "policy_en": "https://policies.google.com/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Google Übersetzer.</p>",
      "description_en": "<p class=\"description\">Google Translator.</p>",
      "type": "script",
      "url_pattern": ["//translate.google.com/translate_a/element\.js"]
    },
    "zp_consent_klicktipp": {
      "name": "KlickTipp Marketing Automation",
      "anbieter_de": "Klick-Tipp Limited",
      "anbieter_en": "Klick-Tipp Limited",
      "policy_de": "https://www.klicktipp.com/datenschutzerklarung/",
      "policy_en": "https://www.klicktipp.com/datenschutzerklarung/",
      "category_de": "Marketing",
      "category_en": "Marketing_EN",
      "description_de": "<p class=\"description\">KlickTipp Marketing Automation.</p>",
      "description_en": "<p class=\"description\">KlickTipp Marketing Automation.</p>",
      "type": "script",
      "url_pattern": ["//assets\.klicktipp\.com/userimages/"]
    },
    "zp_kundennote": {
      "name": "Kundennote Bewertungen",
      "anbieter_de": "muto websolutions e.U.",
      "anbieter_en": "muto websolutions e.U.",
      "policy_de": "https://kundennote.com/datenschutzerklaerung/",
      "policy_en": "https://kundennote.com/datenschutzerklaerung/",
      "category_de": "Marketing",
      "category_en": "Marketing_EN",
      "description_de": "<p class=\"description\">Bewertungen für Ihr Unternehmen sammeln.</p>",
      "description_en": "<p class=\"description\">Collect ratings for your enterprise.</p>",
      "type": "script",
      "url_pattern": ["//kundennote\.com/app/widget/"]
    },
    "zp_consent_trackboxx": {
      "name": "Trackboxx",
      "anbieter_de": "Trackboxx",
      "anbieter_en": "Trackboxx",
      "policy_de": "https://trackboxx.com/datenschutzerklaerung/",
      "policy_en": "https://trackboxx.com/en/privacy-policy/",
      "category_de": "Statistiken",
      "category_en": "Statistics",
      "description_de": "<p class=\"description\">Website-Analyse und Tracking mit Trackboxx.</p>",
      "description_en": "<p class=\"description\">Website analytics and tracking with Trackboxx.</p>",
      "type": "script",
      "url_pattern": ["//cdn\.trackboxx\.info/p/"],
      "OFF_warning_target": '[data-areaname="Standard"] .zpContainer:last'
    },
    "zp_consent_pretix": {
      "name": "Pretix Ticket-Shop",
      "anbieter_de": "rami.io GmbH",
      "anbieter_en": "rami.io GmbH",
      "policy_de": "https://pretix.eu/about/de/privacy",
      "policy_en": "https://pretix.eu/about/en/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Ticket-Shop für Konferenzen, Festivals, Messen, ...</p>",
      "description_en": "<p class=\"description\">Reinventing ticket sales for conferences, festivals, exhibitions, ...</p>",
      "type": "script",
      "url_pattern": ["//pretix\.eu/"],
      "warning_target": "pretix-widget"
    },
    "zp_consent_golocal": {
      "name": "Golocal Bewertungen",
      "anbieter_de": "GoLocal GmbH & Co. KG",
      "anbieter_en": "GoLocal GmbH & Co. KG",
      "policy_de": "https://www.golocal.de/privacy/",
      "policy_en": "https://www.golocal.de/privacy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Bewertungen und Empfehlungen…</p>",
      "description_en": "<p class=\"description\">Ratings and recommendations…</p>",
      "type": "script",
      "url_pattern": ["//www\.golocal\.de/widget"]
    },
    "zp_consent_chatbase": {
      "name": "Chatbase | Custom ChatGPT for your data",
      "anbieter_de": "Chatbase.co",
      "anbieter_en": "Chatbase.co",
      "policy_de": "https://www.chatbase.co/privacy",
      "policy_en": "https://www.chatbase.co/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Kundenspezifische Chatbots…</p>",
      "description_en": "<p class=\"description\">Custom Chatbots…</p>",
      "type": "script",
      "url_pattern": ["//www\.chatbase\.co/embed\.min\.js", "//www\.chatbase\.co/chatbot-iframe/"]
    },
    "zp_consent_onlineradiobox": {
      "name": "Online Radio Box",
      "anbieter_de": "Online Radio Box sp.z.o.o.",
      "anbieter_en": "Online Radio Box sp.z.o.o.",
      "policy_de": "https://onlineradiobox.com/privacy?cs=de.metropol",
      "policy_en": "https://onlineradiobox.com/privacy?cs=en.metropol",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Online Radio.</p>",
      "description_en": "<p class=\"description\">Online Radio.</p>",
      "type": "script",
      "url_pattern": ["//ecdn\.onlineradiobox\.com/js/"],
      "warning_target": ".orbL"
    },
    "zp_consent_tucalendi": {
      "name": "Tucalendi Online Terminkalender",
      "anbieter_de": "TuCalendi, Inc.",
      "anbieter_en": "TuCalendi, Inc.",
      "policy_de": "https://www.tucalendi.com/de/privatsphaere",
      "policy_en": "https://www.tucalendi.com/en/privacy",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Online Terminkalender.</p>",
      "description_en": "<p class=\"description\">Online Calendar.</p>",
      "type": "script",
      "url_pattern": ["//widgets\.tucalendi\.com/"]
    },
    "zp_consent_leadinfo": {
      "name": "Leadinfo Lead-Generierung",
      "anbieter_de": "Leadinfo B.V.",
      "anbieter_en": "Leadinfo B.V.",
      "policy_de": "https://www.leadinfo.com/de/rechtliches/datenschutz/",
      "policy_en": "https://www.leadinfo.com/en/legal/privacy/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Lead-Generierung.</p>",
      "description_en": "<p class=\"description\">Lead Generation</p>",
      "type": "script",
      "url_pattern": ["//cdn\.leadinfo\.eu/"]
    },
    "zp_consent_trustlocal": {
      "name": "Trustlocal",
      "anbieter_de": "Trustlocal DACH GmbH",
      "anbieter_en": "Trustlocal DACH GmbH",
      "policy_de": "https://trustlocal.de/datenschutz/",
      "policy_en": "https://trustlocal.de/datenschutz/",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Finden Sie die besten Dienstleister</p>",
      "description_en": "<p class=\"description\">Finden Sie die besten Dienstleister</p>",
      "type": "script",
      "url_pattern": ["//static\.trustlocal\.de/widget/"],
      "warning_target": ".trustoo-widget"
    },
    "zp_consent_drflex": {
      "name": "Dr. Flex",
      "anbieter_de": "Dr. Flex GmbH",
      "anbieter_en": "Dr. Flex GmbH",
      "policy_de": "https://dr-flex.de/datenschutz",
      "policy_en": "https://dr-flex.de/datenschutz",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Online-Terminvergabe für Ärzte.</p>",
      "description_en": "<p class=\"description\">Online appointment scheduling for doctors.</p>",
      "type": "script",
      "url_pattern": ["//dr-flex\.de/embed\.js"]
    },
    "zp_consent_videolyser": {
      "name": "Videolyser",
      "anbieter_de": "Videolyser",
      "anbieter_en": "Videolyser",
      "policy_de": "https://www.videolyser.de/datenschutz.php",
      "policy_en": "https://www.videolyser.de/datenschutz.php",
      "category_de": "Externe Medien",
      "category_en": "External Media",
      "description_de": "<p class=\"description\">Video Hosting aus Deutschland für alle Unternehmer - DSGVO konform.</p>",
      "description_en": "<p class=\"description\">Video Hosting from Deutschland.</p>",
      "type": "iframe",
      "url_pattern": ["//www\.videolyser\.de/"]
    }
  };
  zp_consent_ids_by_category = Object.keys(zp_consent_settings).sort(function (a, b) {
    var textA = zp_consent_settings[a].category_de.toLowerCase() + zp_consent_settings[a].name.toLowerCase();
    var textB = zp_consent_settings[b].category_de.toLowerCase() + zp_consent_settings[b].name.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
  zp_consent_categories_de = [];
  for (var key in zp_consent_settings) {
    var cat = zp_consent_settings[key].category_de;
    if (zp_consent_categories_de.indexOf(cat) == -1) {
      zp_consent_categories_de.push(cat);
    }
  }
  function setScriptContent(node, consent_type) {
    if (zpconsent.read_cookie('zp_consent_all') || node.getAttribute("type") == type_attr) {
      return;
    }
    // if page is loaded by screenshot helper in templates build-script, exit early to not show consent-popup
    if (navigator.webdriver && document.location.hostname == "localhost" && (document.location.pathname == "/index.html" || document.location.pathname == "/index.php")) {
      return;
    }

    // loop through zp_consent_yt.url_pattern to find out consent-id
    var currentSrc = "";
    if (consent_type === 'noscript') {
      currentSrc = 'noscript';
    } else if (consent_type === 'link') {
      currentSrc = node.getAttribute("href") || null;
    } else {
      currentSrc = node.getAttribute("src");
    } //debug.log("    " + new Date().getTime() + ' addedNode: ', node);

    if (currentSrc) {
      var found = false;
      currentSrc = currentSrc.toLowerCase();

      // check if currentURL matches a local URL which needs to be checked
      var checkInternal = false;
      for (let i in zp_consent_local_blocklist) {
        if (currentSrc.indexOf(zp_consent_local_blocklist[i].toLowerCase()) !== -1) {
          // blacklisted local url
          checkInternal = true;
          break;
        }
      }
      if (!urlIsExternal(currentSrc) && !checkInternal) {
        // only block external code, where urls start with https:// or http:// - do not block relative URLs
        debug.log("🚀 CurrentSrc is local: " + currentSrc + ' (' + consent_type + ')');
        return;
      }
      debug.log("🚀 CurrentSrc: " + currentSrc + ' (' + consent_type + ')');
      loop1:
      // für alle dienste warnungen mit "akzeptieren"-Buttons anzeigen
      for (let key in zp_consent_settings) {
        // debug.log("✅ Checking type: " + zp_consent_settings[key].type + " / Src: " + currentSrc);
        if (zp_consent_settings[key].type !== "script" && zp_consent_settings[key].type !== "iframe") {
          continue;
        }
        if (zp_consent_settings[key].url_pattern) {
          for (let i in zp_consent_whitelist) {
            if (currentSrc.indexOf(zp_consent_whitelist[i].toLowerCase()) !== -1) {
              // whitelisted url
              found = true;
              debug.log("🚀 URL <" + currentSrc + "> is whitelisted");
              break loop1;
            }
          }
          //debug.log("🚀 URL <" + currentSrc + "> is NOT whitelisted");

          var urlpattern = zp_consent_settings[key].url_pattern;
          var warning_target = zp_consent_settings[key].warning_target;
          for (let i in urlpattern) {
            // if ( consent_type !== 'noscript' && currentSrc.indexOf(urlpattern[i].toLowerCase()) !== -1 ){
            if (consent_type !== 'noscript' && new RegExp(urlpattern[i], "i").test(currentSrc)) {
              // if no consent was given, disable script
              if (!zpconsent.read_cookie(key) && !(consent_type === "link" && node.rel !== "stylesheet")) {
                debug.log("🛑 BLOCKING consent_type: " + consent_type + " | ID: " + key + " | URL: " + urlpattern[i]);
                var tmpSrc;
                if (consent_type === "script") {
                  node.setAttribute('type', type_attr);
                }
                if (consent_type === "link") {
                  //node.setAttribute('rel', type_attr);
                  //tmpSrc = node.getAttribute("href");
                  //node.removeAttribute('href');
                  node.remove();
                } else {
                  tmpSrc = node.getAttribute("src");
                  node.removeAttribute('src');
                }
                node.setAttribute('data-consentid', key);
                node.setAttribute('data-src', tmpSrc);

                // indicate blocked content
                var category = zp_consent_settings[key]['category_' + zp_consentlang];
                var displaycategory = zp_consent_categories[category]['name_' + zp_consentlang];
                var consentInfo = displaycategory + ' &gt; ' + zp_consent_settings[key].name;
                var anbieter = zp_consent_strings['anbieter_label_' + zp_consentlang] + zp_consent_settings[key]['anbieter_' + zp_consentlang] + '<br />';
                var descr = '<i>' + zp_consent_settings[key]['description_' + zp_consentlang] + '</i>';
                var policy = '<a target="policy" href="' + zp_consent_settings[key]['policy_' + zp_consentlang] + '">' + zp_consent_strings['policy_' + zp_consentlang] + '</a>';
                var description = anbieter + descr + policy;
                var output = zp_consent_strings['blocked_info_' + zp_consentlang].replace('%s', consentInfo);
                output = output.replace('%id', key);
                output = output.replace('%b', zp_consent_strings['button_activate_' + zp_consentlang]);
                output = output.replace('%d', description);
                debug.log("✅ Unblock-Output: " + output);
                if (key == "zp_consent_googlerecaptcha") {
                  // insert custom warning
                  let lfButton = '<p class="butt"><a href="#" data-consentid="zp_consent_googlerecaptcha" role="button" class="default activate button"><span>' + zp_consent_strings['button_activate_' + zp_consentlang] + '</span></a></p>';
                  output = zp_consent_strings['blocked_recptcha_' + zp_consentlang].replace('%s', consentInfo);
                  output = output.replace('%id', key);
                  output = output.replace('%a', anbieter);
                  output = output.replace('%d', description);
                  output = output.replace('%t', zp_consent_strings['button_activate_' + zp_consentlang]);
                  output = output.replace('%b', lfButton);

                  // disable the form, so the user doesn't start to fill, which would be lost after a reload withe reCAPTCHA activated
                  $z(document).ready(function () {
                    $z("form.zpusesrecaptcha input, form.zpusesrecaptcha textarea, form.zpusesrecaptcha select").prop("disabled", true);
                  });
                }
                if (consent_type === "iframe") {
                  warning_target = $z(node);
                  if (key == 'zp_consent_vimeo') {
                    warning_target = $z(node).parents(".zpvideo");
                    if ($z(node).parents(".zpvideo").length) {
                      // ZP vimeo widget
                      warning_target = $z(node).parents(".zpvideo");
                    } else if ($z(node).parent().attr("class") !== "zpvideo" && $z(node).parent().prop("tagName") == "DIV" && $z(node).parent().attr("style")) {
                      // vimeo might include an additional div if "responsive"-Option is selected when getting 
                      // the sharing-code and that div causes a gap due to padding
                      // the div is hard to recognize. Example: <div style="padding:56.25% 0 0 0;position:relative;">
                      warning_target = $z(node).parent();
                    }
                  }
                  warning_target.replaceWith(output);
                } else if (node && node.parentNode && node.parentNode.nodeName !== "HEAD") {
                  if (warning_target && $z(warning_target).length) {
                    $z(warning_target).replaceWith(output);
                    acceptButtons();
                  } else {
                    warning_target = $z(node);
                    $z(warning_target).replaceWith(output);
                    acceptButtons();
                  }
                } else {
                  if (key == "zp_consent_googlefonts") {
                    debug.log("✅ Unblock-Notice: " + consent_type + " | ID: " + key + " | URL: " + urlpattern[i]);
                    // insert custom warning
                    let lfButton = '<p class="butt"><a href="#" data-consentid="zp_consent_googlefonts" role="button" class="default activate button"><span>' + zp_consent_strings['button_loadfont_' + zp_consentlang] + '</span></a></p>';
                    output = zp_consent_strings['blocked_font_' + zp_consentlang].replace('%s', consentInfo);
                    output = output.replace('%id', key);
                    output = output.replace('%a', anbieter);
                    output = output.replace('%d', description);
                    output = output.replace('%t', zp_consent_strings['button_loadfont_' + zp_consentlang]);
                    output = output.replace('%b', lfButton);
                    //output = output.replace('%b', ifButtons );

                    $z(document).ready(function () {
                      $z('[data-areaname="Standard"] .zpContainer:last').append(output);
                      acceptButtons();
                    });
                  } else {
                    $z(document).ready(function () {
                      if (warning_target && $z(warning_target).length) {
                        debug.log("✅ Unblock-Notice: " + consent_type + " | ID: " + key + " | URL: " + urlpattern[i]);
                        $z(warning_target).replaceWith(output);
                        acceptButtons();
                      }
                    });
                  }
                }
              } else {
                debug.log("✅ NOT BLOCKING consent_type: " + consent_type + " | ID: " + key + " | URL: " + urlpattern[i]);
                if (zp_gaconsent_ids.indexOf(key) !== -1) {
                  // fire google consent v2 for google services
                  debug.log("   and granting google consent");
                  googleConsentv2('granted');
                }
              }
              found = true;
              break loop1;
            } else if (consent_type === 'noscript' && new RegExp(urlpattern[i], "i").test(node.outerHTML)) {
              debug.log("🛑 NOSCRIPT MATCH: ", node.innerHTML); // iframe source needs to be searched for occurance of url
              if (!zpconsent.read_cookie(key)) {
                node.innerHTML = "";
                node.setAttribute('data-consentid', key);
              }
              found = true;
              break loop1;
            }
          }
        }
      }
      if (!found && (consent_type == "script" || consent_type == "link" && node.rel == "stylesheet") && !zpconsent.read_cookie('zp_consent_all')) {
        // disable external script not found in consent-list
        debug.log("🛑 BLOCKING unknnown consent_type: " + consent_type + " | ID: unknown | URL: " + currentSrc);
        if (consent_type === "script") {
          node.setAttribute('type', type_attr);
        }
        if (consent_type === "link") {
          //node.setAttribute('rel', type_attr);
          //tmpSrc = node.getAttribute("href");
          //node.removeAttribute('href');
          node.remove();
        } else {
          tmpSrc = node.getAttribute("src");
          node.removeAttribute('src');
        }
        node.setAttribute('data-consentid', 'zp_consent_unknown');
        node.setAttribute('data-src', tmpSrc);
        if ($z(node).parents('body').length) {
          // insert warning, if node is child of body (not head)
          anbieter = zp_consent_strings['anbieter_label_' + zp_consentlang];
          var buttons = '<p class="butt"><button data-consent-id="zp_consent_unknown" class="default activate">' + zp_consent_strings['button_accept_' + zp_consentlang] + '</button></p>';
          output = zp_consent_strings['blocked_unknown_' + zp_consentlang].replace('%s', consentInfo);
          output = output.replace('%a', anbieter);
          output = output.replace('%u', tmpSrc);
          output = output.replace('%b', buttons);
          $z(output).insertBefore(node);
          //  TODO FIXME: wire up the accept all button
          setTimeout(function () {
            $z('button[data-consent-id="zp_consent_unknown"].activate').on('click', function (e) {
              debug.log("Accept All Button clicked!!!");
              e.preventDefault();
              acceptAll();
            });
          }, 50);
        }
      } else if (!found && consent_type == "iframe" && !blockiframes && !zpconsent.read_cookie('zp_consent_all')) {
        // disable external iframe not found in consent-list
        debug.log("🛑 BLOCKING consent_type: " + consent_type + " | ID: unknown | URL: " + currentSrc);
        tmpSrc = node.getAttribute("src");
        node.removeAttribute('src');
        node.setAttribute('data-consentid', 'zp_consent_iframe');
        node.setAttribute('data-src', tmpSrc);
        node.setAttribute('data-height', node.getAttribute("height"));
        node.setAttribute('height', '0');
        var rewrittennode = $z(node).parent().html();
        var $node = $z(node).parent().html(rewrittennode);
        if ($node.parents('body').length) {
          // insert warning, if node is child of body (not head)
          anbieter = zp_consent_strings['anbieter_label_' + zp_consentlang];
          var ifButtons = '<p class="butt"><button data-consent-id="zp_consent_iframe" class="default activate">' + zp_consent_strings['button_loadiframe_' + zp_consentlang] + '</button></p>';
          output = zp_consent_strings['blocked_iframe_' + zp_consentlang].replace('%s', consentInfo);
          output = output.replace('%a', anbieter);
          output = output.replace('%u', tmpSrc);
          output = output.replace('%t', zp_consent_strings['button_loadiframe_' + zp_consentlang]);
          output = output.replace('%b', ifButtons);
          $z(output).insertBefore($node.find("iframe"));
          // wire up the accept all button
          setTimeout(function () {
            $node.find('button[data-consent-id="zp_consent_iframe"].activate').on('click', function (e) {
              e.preventDefault();
              $node.find('iframe').attr('src', $node.find('iframe').attr('data-src'));
              $node.find('iframe').attr('height', $node.find('iframe').attr('data-height'));
              $node.find('.zpconsentinfo').remove();
            });
          }, 50);
        }
      }
    }

    // workaround for firefox which is loading external scripts also after they've been rewritten by the mutationObserver
    // see: https://medium.com/snips-ai/how-to-block-third-party-scripts-with-a-few-lines-of-javascript-f0b08b9c4c0
    const beforeScriptExecuteListener = function (event) {
      // Prevent only marked scripts from executing
      if (node.getAttribute('type') === type_attr) {
        debug.log("🛑 BLOCKING Script in Firefox: ", node);
        event.preventDefault();
      }
      node.removeEventListener('beforescriptexecute', beforeScriptExecuteListener);
    };
    node.addEventListener('beforescriptexecute', beforeScriptExecuteListener);
  }
  const targetNode = document.getElementsByTagName("html")[0];
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  };
  const callback = function (mutationsList) {
    //debug.log('mutationsList: ', mutationsList)
    // check scripts in direct nodes
    //for(let mutation of mutationsList) {
    for (var i = 0; i < mutationsList.length; i++) {
      var mutation = mutationsList[i];
      //debug.log('mutation.target.nodeName: ' + mutation.target.nodeName + ' | Mutation: ' , mutation.addedNodes)
      //debug.log('mutation: ', mutation.addedNodes)
      if (mutation.target.nodeName == "SCRIPT") {
        //setScriptContent(mutation.target);
      }

      // check scripts in child nodes 
      //for(let addedNode of mutation.addedNodes) {
      for (var j = 0; j < mutation.addedNodes.length; j++) {
        var addedNode = mutation.addedNodes[j];
        if (addedNode.tagName) {
          //debug.log("    addedNode type: " + addedNode.nodeType + " | tagName: " + addedNode.tagName );
        }
        if (addedNode.nodeType === 1 && (addedNode.tagName === 'SCRIPT' || addedNode.tagName === 'NOSCRIPT' || addedNode.tagName === 'IFRAME' || addedNode.tagName === 'LINK')) {
          //debug.log("    addedNode: " + addedNode.outerHTML );
          //debug.log("✅ addedNode type: " + addedNode.nodeType + " | tagName: " + addedNode.tagName + " | addedNode: " +  addedNode.outerHTML);
          setScriptContent(addedNode, addedNode.tagName.toLowerCase());
        }
      }

      // check scripts in child nodes 
      /*
      for(let addedNode of mutation.addedNodes) {
      	debug.log("    addedNode: " + addedNode.outerHTML )
      	var n = addedNode.outerHTML;
      	if ( n && n.indexOf("<script") !== -1 ){
      		setScriptContent(addedNode);
      	}
      }
      */
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  // rewrite dynamically created scripts
  const createElementBackup = document.createElement;
  document.createElement = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    //debug.log("Create Element: ", args);
    // If this is not a script tag, bypass
    if (args[0].toLowerCase() !== 'script') return createElementBackup.bind(document)(...args);
    const scriptElt = createElementBackup.bind(document)(...args);
    const originalSetAttribute = scriptElt.setAttribute.bind(scriptElt);

    // Define getters / setters to ensure that the script type is properly set
    Object.defineProperties(scriptElt, {
      'src': {
        get() {
          return scriptElt.getAttribute('src');
        },
        set(value) {
          //debug.log('☠️ Script-Element Tag:' + scriptElt.tagName.toLowerCase() + ' | src: ' + value);
          var consentid = isOnBlacklist(value, scriptElt.type);
          if (consentid) {
            originalSetAttribute('type', type_attr);
            originalSetAttribute('data-src', value);
            originalSetAttribute('data-consentid', consentid);
            scriptElt.removeAttribute('src');

            // indicate blocked content
            var warning_target = zp_consent_settings[consentid].warning_target;
            var category = zp_consent_settings[consentid]['category_' + zp_consentlang];
            var displaycategory = zp_consent_categories[category]['name_' + zp_consentlang];
            var consentInfo = displaycategory + ' &gt; ' + zp_consent_settings[consentid].name;
            var anbieter = zp_consent_strings['anbieter_label_' + zp_consentlang] + zp_consent_settings[consentid]['anbieter_' + zp_consentlang] + '<br />';
            var descr = zp_consent_strings['descr_label_' + zp_consentlang] + zp_consent_settings[consentid]['description_' + zp_consentlang] + '<br />';
            var policy = '<a target="policy" href="' + zp_consent_settings[consentid]['policy_' + zp_consentlang] + '">' + zp_consent_strings['policy_' + zp_consentlang] + '</a>';
            var description = anbieter + descr + policy;
            var output = zp_consent_strings['blocked_info_' + zp_consentlang].replace('%s', consentInfo);
            output = output.replace('%id', consentid);
            output = output.replace('%b', zp_consent_strings['button_activate_' + zp_consentlang]);
            output = output.replace('%d', description);

            //debug.log('☠️  Warning Target: ' + warning_target + ' | Warning Output: ' + output);

            if (warning_target) {
              $z(document).ready(function () {
                debug.log('☠️  Injecting Warning for ' + consentid);
                $z(warning_target).replaceWith(output);
                acceptButtons();
              });
            }
          } else {
            originalSetAttribute('src', value);
          }
          return;
        }
      },
      'type': {
        set(value) {
          const typeValue = isOnBlacklist(scriptElt.src, scriptElt.type) ? type_attr : value;
          originalSetAttribute('type', typeValue);
          return;
        }
      }
    });

    // Monkey patch the setAttribute function so that the setter is called instead.
    // Otherwise, setAttribute('type', 'whatever') will bypass our custom descriptors!
    scriptElt.setAttribute = function (name, value) {
      if (name === 'type' || name === 'src') scriptElt[name] = value;else HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value);
    };
    return scriptElt;
  };
  function isOnBlacklist(src) {
    if (!src || zpconsent.read_cookie('zp_consent_all')) {
      return false;
    }
    src = src.toString().toLowerCase();
    loop1: for (let key in zp_consent_settings) {
      if (zp_consent_settings[key].type !== "script" && zp_consent_settings[key].type !== "iframe") {
        continue;
      }
      if (zp_consent_settings[key].url_pattern) {
        for (let i in zp_consent_whitelist) {
          if (src.indexOf(zp_consent_whitelist[i].toLowerCase()) !== -1) {
            // whitelisted url
            return false;
          }
        }
        var urlpattern = zp_consent_settings[key].url_pattern;
        for (let i in urlpattern) {
          if (new RegExp(urlpattern[i], "i").test(src)) {
            // if ( src.indexOf(urlpattern[i].toLowerCase()) !== -1 ){
            // if no consent was given, disable script
            if (!zpconsent.read_cookie(key)) {
              debug.log('🛑 BLOCKING dynamic-content | ID: ' + key + ' | URL: ' + src);
              return key;
            }
            break loop1;
          }
        }
      }
    }
    return false;
  }
  function setConsent(consent_id, value) {
    if (zp_consent_usedids && zp_consent_usedids.indexOf(consent_id) == -1) {
      // only store settings for services the user has enabled
      return;
    }
    //console.log("setConsent() consent_id: " + consent_id + " / value: " + value);
    if (consent_id !== "zp_consent_all" && value == false) {
      // since an individual value changed to false, we need to unset "Accept All"-Status
      consentStorage.zp_consent_all = false;
    }
    consentStorage[consent_id] = value;

    // check if category switch indicates correctly
    var category_de = $z('#consent input.consent:not(.consentcategory)[name="' + consent_id + '"]').attr('data-category-de');
    var settingsInCategory = $z('#consent input.consent:not(.consentcategory)[data-category-de="' + category_de + '"]').length;
    var allSettingsInCategoryOn = $z('#consent input.consent:not(.consentcategory)[data-category-de="' + category_de + '"]:checked').length;
    if (allSettingsInCategoryOn == 0) {
      //debug.log("All Settings in " + category_de + " off!");
      $z('#consent input.consent.consentcategory[data-category-de="' + category_de + '"]').prop("checked", false).removeClass("partial");
    } else if (allSettingsInCategoryOn == settingsInCategory) {
      // all are on
      //debug.log("All Settings in " + category_de + " on!");
      $z('#consent input.consent.consentcategory[data-category-de="' + category_de + '"]').prop("checked", true).removeClass("partial");
    } else {
      $z('#consent input.consent.consentcategory[data-category-de="' + category_de + '"]').prop("checked", true).addClass("partial");
    }

    //debug.log("Consent set: " + consent_id + "(" + category_de + "): " + value + " | allSettingsInCategoryOn: " + allSettingsInCategoryOn + " | settingsInCategory: " + settingsInCategory);
  }

  function acceptButtons() {
    $z('.zpconsentinfo a.activate').off('click.accept');
    $z('.zpconsentinfo a.activate').on('click.accept', function (e) {
      e.preventDefault();
      var consentid = $(this).attr('data-consentid');
      if (consentid) {
        setConsent(consentid, true);
        saveConsent();
      }
    });
  }
  function set_cookie(name, value) {
    if (!name || name == "") {
      return;
    }

    // update settings object
    consentStorage[name] = value;

    // store in localStorage
    if (supports_html5_storage) {
      localStorage.setItem(name, JSON.stringify(value));
      return;
    }
    var date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // expire 30 days from today
    var cookiestring = 'zp_consent=' + (encodeURIComponent(JSON.stringify(consentStorage)) || '') + '; path=/' + '; expires=' + date.toGMTString();
    var secureCookies = document.location.protocol == 'https:' ? true : false;
    if (secureCookies) {
      cookiestring += '; samesite=none; secure';
    }
    debug.log("Consent secureCookies: " + secureCookies + " / cookiestring: " + decodeURIComponent(cookiestring).replace(/,/g, ", "));

    // set HTTP-Cookie to circumvent safari 7 day limit
    var pathToRoot = $z("html").attr("data-ptr") || "";
    //console.log("Set HTTP-Cookies to: ", JSON.stringify(consentStorage) );

    // if loaded from real server and not in browser preview, set http cookie
    if (document.location.href.indexOf("/external-preview/") == -1) {
      $z.ajax({
        type: 'POST',
        cache: false,
        //url: pathToRoot + 'assets/php/cc/cookiemonster.php?cookiename=zp_consent&cookievalue=' + encodeURI(JSON.stringify(consentStorage)),
        url: pathToRoot + 'assets/php/cc/cookiemonster.php',
        data: {
          samesite: secureCookies,
          cookiename: "zp_consent",
          cookievalue: encodeURIComponent(JSON.stringify(consentStorage))
        },
        timeout: 5000,
        dataType: "json",
        success: function success(data) {
          debug.log("Consent HTTP-Cookie-Result: ", data);
          // check if http-cookie was set properly via PHP and set normal cookie as fallback, if not
          if (!data.hasOwnProperty("success") || !data.success || (document.cookie + "").indexOf("zp_consent") == -1) {
            debug.log("HTTP-Cookie failed, setting browser-cookie to: " + cookiestring);
            document.cookie = cookiestring;
          }
          setTimeout(function () {
            // give the http cookies a little time and reload the page after 100ms
            debug.log("Reloading page with new cookies");
            location.reload(true);
          }, 100);
        },
        error: function error(xhr, status, _error) {
          if (status == "timeout") {
            console.error("Timeout setting HTTP-Cookies");
          } else {
            console.error("☠️ Fehler beim setzen des Consent HTTP-Cookies " + name + "=" + value + " / Status: " + status + " (" + _error + ")", xhr);
          }
          document.cookie = cookiestring;
          setTimeout(function () {
            // give the http cookies a little time and reload the page after 100ms
            debug.log("Reloading page with new cookies");
            location.reload(true);
          }, 100);
        }
      });
    } else {
      document.cookie = cookiestring;
      setTimeout(function () {
        // give the http cookies a little time and reload the page after 100ms
        debug.log("Reloading page with new cookies");
        location.reload(true);
      }, 100);
    }
  }
  function urlIsExternal(url) {
    if ((url.indexOf("https://") == 0 || url.indexOf("http://") == 0 || url.indexOf("//") == 0) && url.indexOf(document.location.protocol + "//" + document.location.hostname) !== 0) {
      return true;
    } else {
      return false;
    }
  }
  function saveConsent() {
    debug.log("saveConsent()");

    /*
    for (let key in consentStorage) {
    	debug.log("Save cookie key: " + key + " / value: " + consentStorage[key]);
    	set_cookie(key, consentStorage[key]);
    }
    */
    // set cookie which indicates, the user has saved once and this is not a first time visit
    set_cookie("zp_consent_zp", true);
  }
  function acceptAll() {
    // set cookie to remember we accept all, so we can also load unknown scripts, not listed in consent settings
    consentStorage.zp_consent_all = true;

    //setConsent('zp_consent_all', true, false);	
    $z("#consent input.consent").prop("checked", true).trigger("change");
    saveConsent();
  }
  function denyAll() {
    // set cookie to remember we accept all, so we can also load unknown scripts, not listed in consent settings
    consentStorage.zp_consent_all = false;
    for (let key in consentStorage) {
      consentStorage[key] = false;
    }
    $z("#consent input.consent").prop("checked", false).trigger("change");
    saveConsent();
  }
  zpconsent.openConsent = function () {
    let firstTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    // key-shortcuts
    $z('body').off('keydown.consent');
    $z('body').on('keydown.consent', function (e) {
      // add key-shortcuts to overlay
      if (e && e.originalEvent && e.originalEvent.repeat) {
        // avoid retriggering this due to keyboard autorepeat
        return;
      }
      debug.log("Keydown on keycode: " + e.which);
      var inputIsFocused = $("input:focus").length > 0 ? true : false;
      if (!firstTime && e.which == 27 && !inputIsFocused) {
        e.preventDefault();
        // close overlay on ESC
        closeConsent(false);
      } else if (e.which == 13 && !inputIsFocused) {
        e.preventDefault();
        // accept all cookies and close overlay on RETURN
        $z('#consent button.default').animate({
          opacity: .5
        }, 150);
        $z('#consent button.default').animate({
          opacity: 1
        }, 150);
        $z('#consent button.default').animate({
          opacity: .5
        }, 150);
        $z('#consent button.default').animate({
          opacity: 1
        }, 150, function () {
          acceptAll();
          closeConsent(false);
        });
      }
    });

    // get window height and set max-height for consent, so content doesn't get 
    // covered by the safari URL-Bar on mobile
    $z('#consent').css('max-height', window.innerHeight - 20 + "px");

    // hide close boxes, so user has to explicitly save on his first visit
    if (firstTime) {
      $z('#consent a.close, #consent form').hide();
      $z('#consent div.buttons a.settings').show().css('display', 'block');
      // hide save button on firstTime visite
      $z('div.buttons button.save').hide();
    } else {
      $z('#consent a.close, #consent form, div.buttons button.save').show();
      $z('#consent div.buttons a.settings').hide();
    }

    // open overlay only if not already visible (.backdrop is added when opened)
    if (!$z('#consent').hasClass("backdrop")) {
      $z('#consenttoggle').addClass('hidden');
      $z('#consent').slideToggle(400, function () {
        $z('#consent').removeClass("hidden").addClass("backdrop");
      });
    }
  };
  function closeConsent() {
    let reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    $z('body').off('keydown.consent'); // remove key-shortcuts from overlay
    $z('#consenttoggle').removeClass('hidden');
    $z('#consent').slideToggle(400, function () {
      $z('#consent').addClass("hidden").removeClass("backdrop");
      if (reload) {
        setTimeout(function () {
          // give the http cookies a little time and reload the page after 100ms
          location.reload(true);
        }, 100);
      }
    });
  }

  // handle consent settings and overlay
  $z(document).ready(function () {
    var ptrfallback = "/";
    if (document.location && document.location.pathname.indexOf("/external-preview/") == 0) {
      // we're in the zp browser-preview
      ptrfallback = "";
    }
    // get widget settings
    var pathToRoot = $z("html").attr("data-ptr");
    if (typeof pathToRoot === typeof undefined || pathToRoot === false) {
      pathToRoot = ptrfallback;
    }
    $z.ajax({
      type: 'GET',
      cache: false,
      url: pathToRoot + 'assets/consentsettings.json',
      timeout: 3000,
      dataType: "json",
      success: function (data) {
        debug.log("Widget-Prefs Result: ", data);
        zp_consent_theme = data.theme;
        blockiframes = data.blockiframes === '1' ? true : false;
        zp_consent_bgcolor_accept = data["zp_consent_bgcolor_accept"];
        zp_consent_textcolor_accept = data["zp_consent_textcolor_accept"];
        zp_consent_bgcolor_essential = data["zp_consent_bgcolor_essential"];
        zp_consent_textcolor_essential = data["zp_consent_textcolor_essential"];
        zp_consent_textcolor_gen = data["zp_consent_textcolor_gen"];
        zp_consent_linkcolor_gen = data["zp_consent_linkcolor_gen"];
        zp_consent_bgcolor_save = data["zp_consent_bgcolor_save"];
        zp_consent_textcolor_save = data["zp_consent_textcolor_save"];
        zp_consent_pos = data.zp_consent_pos;
        zp_consent_usedids = data.zp_consent_ids;
        zp_consent_privacypage = data["privacypage_" + zp_consentlang] || "";
        zp_consent_privacylinkt = data["ds_linktext_" + zp_consentlang] || zp_consent_strings['policy_' + zp_consentlang];
        zp_consent_imprintpage = data["imprintpage_" + zp_consentlang] || "";
        zp_consent_imprintlinkt = data["im_linktext_" + zp_consentlang] || zp_consent_strings['imprint_' + zp_consentlang];
        zp_consent_buttontitle_accept = data["zp_consent_buttontitle_accept_" + zp_consentlang] || "";
        zp_consent_buttontitle_essential = data["zp_consent_buttontitle_essential_" + zp_consentlang] || "";
        zp_consent_buttontitle = data["zp_consent_buttontitle_" + zp_consentlang] || "";
        zp_consent_description = data["zp_consent_description_" + zp_consentlang] || zp_consent_strings['consent_descr_' + zp_consentlang];
        zp_consent_title = data["zp_consent_title_" + zp_consentlang] || zp_consent_strings['consent_title_' + zp_consentlang];

        // generate consent form elements
        generateConsent();
        if (!blockiframes) {
          reenableIframes();
        } else {
          initIframeWarnings();
        }

        // "COOKIE AKTIVIEREN"-Buttons für bekannte Dienste, die aber in den Widget-Settings deaktiviert sind ersetzen durch "ALLE AKZEPTIEREN"
        fixActivateButtons();
      },
      error: function (xhr, status, error) {
        if (status == "timeout") {
          return;
        }
        console.error("Fehler beim lesen der Consent-Widget-Einstellungen: " + status + " " + error, xhr);

        // set sane defaults, if user settings are missing
        zp_consent_theme = "light";
        blockiframes = true;
        zp_consent_pos = "bottom_middle";
        zp_consent_usedids = ["zp_consent_disq", "zp_consent_fbcomments", "zp_consent_fbpixel", "zp_consent_fbplugin", "zp_consent_ga", "zp_consent_gmaps", "zp_consent_gtm", "zp_consent_twitter", "zp_consent_vimeo", "zp_consent_yt"];
        zp_consent_privacypage = 'href="#"';
        zp_consent_privacylinkt = zp_consent_strings['policy_' + zp_consentlang];
        zp_consent_imprintpage = 'href="#"';
        zp_consent_imprintlinkt = zp_consent_strings['imprint_' + zp_consentlang];
        zp_consent_buttontitle_accept = "";
        zp_consent_buttontitle_essential = "";
        zp_consent_bgcolor_accept = "";
        zp_consent_textcolor_accept = "";
        zp_consent_bgcolor_essential = "";
        zp_consent_textcolor_essential = "";
        zp_consent_textcolor_gen = "";
        zp_consent_linkcolor_gen = "";
        zp_consent_buttontitle = "";
        zp_consent_description = "";
        zp_consent_title = "";
        generateConsent();
      }
    });
    function generateConsent() {
      // if page is loaded by screenshot helper in templates build-script, exit early to not show consent-popup
      if (navigator.webdriver && document.location.hostname == "localhost" && (document.location.pathname == "/index.html" || document.location.pathname == "/index.php")) {
        return;
      }
      var policylink = "";
      var imprintlink = "";
      if (zp_consent_privacypage !== "") {
        policylink = '<a ' + zp_consent_privacypage + '>' + zp_consent_privacylinkt + '</a>';
      }
      if (zp_consent_imprintpage !== "") {
        imprintlink = '<a ' + zp_consent_imprintpage + '>' + zp_consent_imprintlinkt + '</a>';
      }
      if (zp_consent_privacypage !== "" && zp_consent_imprintpage !== "") {
        policylink = policylink + ' | ';
      }

      // inject text color styles from widget into head if set
      if (zp_consent_textcolor_gen && zp_consent_textcolor_gen !== "" && zp_consent_textcolor_gen !== "transparent" || zp_consent_linkcolor_gen && zp_consent_linkcolor_gen !== "" && zp_consent_linkcolor_gen !== "transparent") {
        var head = document.getElementsByTagName('head')[0],
          style = document.createElement('style'),
          headstyle = '';
        if (zp_consent_textcolor_gen && zp_consent_textcolor_gen !== "" && zp_consent_textcolor_gen !== "transparent") {
          headstyle += '#consent, #consent.dark, #consent.light{color: ' + zp_consent_textcolor_gen + ';}';
        }
        if (zp_consent_linkcolor_gen && zp_consent_linkcolor_gen !== "" && zp_consent_linkcolor_gen !== "transparent") {
          headstyle += '#consent a:not(.close), #consent.dark a:not(.close), #consent.light a:not(.close)';
          headstyle += '{color: ' + zp_consent_linkcolor_gen + ' !important;}';
        }
        var rules = document.createTextNode(headstyle.replace(/\s+/g, ' '));
        if (style.styleSheet) {
          style.styleSheet.cssText = rules.nodeValue;
        } else {
          style.appendChild(rules);
        }
        head.appendChild(style);
      }

      // add content overlay
      $z("body").append('<div id="consent" class="hidden' + ' ' + zp_consent_theme + '"><a class="close" title="Schließen / Close" href="#off">✕</a><h3>' + zp_consent_title + '</h3>' + zp_consent_description + '<div class="buttons">\
				 <button style="color: ' + zp_consent_textcolor_essential + '; background-color: ' + zp_consent_bgcolor_essential + ';" class="deny">' + zp_consent_buttontitle_essential + '</button> \
				 <button style="color: ' + zp_consent_textcolor_accept + '; background-color: ' + zp_consent_bgcolor_accept + ';" class="default accept">' + zp_consent_buttontitle_accept + '</button> \
				 <button style="color: ' + zp_consent_textcolor_save + '; background-color: ' + zp_consent_bgcolor_save + ';" class="save">' + zp_consent_strings['button_save_' + zp_consentlang] + '</button>\
				 <br /><a href="#" role="button" class="settings"><i class="fa fa-gear fr-deletable"></i> ' + zp_consent_strings['title_settings_' + zp_consentlang] + '</a></div>' + '<form></form><div id="zpconsentlinks">' + policylink + imprintlink + '</div></div>');
      if (!zp_consent_buttontitle) {
        $z("body").append('<div id="consenttoggle" class="screenonly ' + zp_consent_theme + ' ' + zp_consent_pos + '"><a href="#" title="' + zp_consent_strings['consent_title_' + zp_consentlang] + '" class="toggleconsent"><svg viewBox="0 0 48 48" width="48" height="48"><g stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" fill="#333333" stroke="#333333"><path data-color="color-2" fill="#F2F2F2" stroke-miterlimit="10" d="M26.062,5 C28.177,3.133,30.955,2,34,2c6.627,0,12,5.373,12,12c0,3.077-1.147,5.879-3.041,8"></path> <circle fill="#E7E7E7" stroke="#333333" stroke-miterlimit="10" cx="20" cy="28" r="18"></circle> <circle fill="none" stroke="#333333" stroke-miterlimit="10" cx="22" cy="18" r="1"></circle> <circle data-color="color-2" fill="none" stroke-miterlimit="10" cx="35" cy="10" r="1"></circle> <circle fill="none" stroke="#333333" stroke-miterlimit="10" cx="11" cy="24" r="1"></circle> <circle fill="none" stroke="#333333" stroke-miterlimit="10" cx="30" cy="31" r="1"></circle> <circle fill="none" stroke="#333333" stroke-miterlimit="10" cx="20" cy="29" r="1"></circle> <circle fill="none" stroke="#333333" stroke-miterlimit="10" cx="15" cy="38" r="1"></circle> <circle fill="#333333" cx="22" cy="18" r="1"></circle> <circle data-color="color-2" data-stroke="none" cx="35" cy="10" r="1" stroke="none"></circle> <circle fill="#333333" cx="11" cy="24" r="1"></circle> <circle fill="#333333" cx="30" cy="31" r="1"></circle> <circle fill="#333333" cx="20" cy="29" r="1"></circle> <circle fill="#333333" cx="15" cy="38" r="1"></circle></g></svg></a></div>');
      } else {
        $z("body").append('<div id="consenttoggle" class="screenonly textonly ' + zp_consent_theme + ' ' + zp_consent_pos + '"><a href="#" title="' + zp_consent_strings['consent_title_' + zp_consentlang] + '" role="button" class="toggleconsent">' + zp_consent_buttontitle + '</a></div>');
      }

      // fill the form with checkboxes for all consent_ids
      debug.log("Generating Consent-Form");
      var currentCategory = "";
      for (var theid in zp_consent_ids_by_category) {
        var id = zp_consent_ids_by_category[theid];
        var category = zp_consent_settings[id]['category_' + zp_consentlang];
        var category_de = zp_consent_settings[id]['category_de'];
        var displaycategory = zp_consent_categories[category]['name_' + zp_consentlang];
        var alwaysdisplay = zp_consent_categories[category].hasOwnProperty('show_switch') ? !zp_consent_categories[category].show_switch : false;
        if (!alwaysdisplay && zp_consent_usedids && zp_consent_usedids.indexOf(id) == -1) {
          continue;
        }
        var anbieter = zp_consent_settings[id]['anbieter_' + zp_consentlang];
        var name = zp_consent_settings[id].name;
        var descr = zp_consent_settings[id]['description_' + zp_consentlang];
        //debug.log("Category: >" + category + "< | Consentlang: " + zp_consentlang, zp_consent_categories[category]);
        var catdescription = zp_consent_categories[category]['description_' + zp_consentlang];
        var showswitch = zp_consent_categories[category].hasOwnProperty("show_switch") ? zp_consent_categories[category].show_switch : true;
        var policy = zp_consent_settings[id]['policy_' + zp_consentlang];
        if (currentCategory !== category) {
          currentCategory = category;
          if (showswitch) {
            $z('#consent form').append('<div class="cat" data-category-de="' + category_de + '"><label class="switch consentcategory"><input data-category-de="' + category_de + '" class="consent consentcategory ' + category + '" type="checkbox" name="' + category + '"><span class="slider round"></span></label><h4>' + displaycategory + '</h4>' + catdescription + '<p class="center"><a class="showconsentinfo" href="#">' + zp_consent_strings['show_info_' + zp_consentlang] + '</a></p></div>');
          } else {
            $z('#consent form').append('<div class="cat" data-category-de="' + category_de + '"><h4>' + category + '</h4>' + catdescription + '<p class="center"><a class="showconsentinfo" href="#">' + zp_consent_strings['show_info_' + zp_consentlang] + '</a></p></div>');
          }
        }
        if (showswitch) {
          $z('#consent form div[data-category-de="' + category_de + '"]').append('<div>' + zp_consent_strings['name_label_' + zp_consentlang] + name + ' <label class="switch"><input data-category-de="' + category_de + '" class="consent ' + id + '" type="checkbox" name="' + id + '"><span class="slider round"></span></label><p>' + zp_consent_strings['anbieter_label_' + zp_consentlang] + anbieter + '</p>' + descr + '<p class="policylink"><a target="policy" href="' + policy + '">' + zp_consent_strings['policy_' + zp_consentlang] + '</a></p></div>');
        } else {
          $z('#consent form div[data-category-de="' + category_de + '"]').append('<div>' + zp_consent_strings['name_label_' + zp_consentlang] + name + '<p>' + zp_consent_strings['anbieter_label_' + zp_consentlang] + anbieter + '</p>' + descr + '<p class="policylink"><a ' + zp_consent_privacypage + '>' + zp_consent_strings['policy_' + zp_consentlang] + '</a></p></div>');
        }
      }

      // wire up button to toggle consent form display
      $z('a.toggleconsent').on("click", function (e) {
        e.preventDefault();
        zpconsent.openConsent();
      });

      // wire up close-button to close content-overlay
      $z('#consent a.close').on("click", function (e) {
        e.preventDefault();
        closeConsent();
      });

      // wire up cookie-settings-link
      $z('#consent div.buttons a.settings').off("click.zpconsentsettings");
      $z('#consent div.buttons a.settings').on("click.zpconsentsettings", function (e) {
        e.preventDefault();
        // show save button
        $z('div.buttons button.save').show();
        $z('#consent form, #consent div.buttons a.settings').toggle(400);
      });

      // wire up accept all / save buttons
      $z('#consent div.buttons button').off("click.zpconsent");
      $z('#consent div.buttons button').on("click.zpconsent", function (e) {
        e.preventDefault();
        // accept all button
        if ($z(this).hasClass('accept')) {
          acceptAll();
          closeConsent(false);
        }
        // deny all button (accept essential
        if ($z(this).hasClass('deny')) {
          denyAll();
          closeConsent(false);
        }
        // save settings button
        if ($z(this).hasClass('save')) {
          saveConsent();
          closeConsent(false);
        }
      });
      // sync checkbox state with cookies
      for (let key in zp_consent_settings) {
        //debug.log(key, zp_consent_settings[key]);
        if (zpconsent.read_cookie(key)) {
          $z("#consent input:not(.consentcategory).consent." + key).prop("checked", true);
          setConsent(key, true);
        } else {
          $z("#consent input:not(.consentcategory).consent." + key).prop("checked", false);
          setConsent(key, false);
        }
      }
      if (zpconsent.read_cookie('zp_consent_all')) {
        consentStorage['zp_consent_all'] = true;
      } else {
        consentStorage['zp_consent_all'] = false;
      }

      // set checked status for category checkboxes
      $z("#consent input.consentcategory").each(function () {
        var currentCategory = $z(this).attr('data-category-de');
        var checked = false;
        $z(this).parents('form').first().find('input:not(.consentcategory)[data-category-de="' + currentCategory + '"]').each(function () {
          if ($z(this).prop("checked")) {
            checked = true;
            return false;
          }
        });
        $z(this).prop("checked", checked);
      });

      // set consent via checkboxes
      $z("#consent input.consent").on("change", function () {
        debug.log("Input changed: ", $z(this));
        if ($z(this).hasClass('consentcategory')) {
          // enable whole category
          var currentCategory = $z(this).attr('data-category-de');
          var checked = $z(this).prop("checked");
          $z(this).parents('form').first().find('input:not(.consentcategory)[data-category-de="' + currentCategory + '"]').each(function () {
            debug.log("Category clicked: " + $z(this).attr("name"));
            // when turning on, we only turn on the items, the user has enabled
            $z(this).prop("checked", checked);
            if (checked) {
              setConsent($z(this).attr("name"), checked);
            }
          });
          // when turning off, we turn all items of the category no matter if user has enabled them or not
          if (!checked) {
            // unset setting/cookie to remember we accept all, so we can also load unknown scripts, not listed in consent settings
            consentStorage.zp_consent_all = false;
            for (let key in zp_consent_settings) {
              var cat = zp_consent_settings[key].category_de;
              if (cat == currentCategory) {
                setConsent(key, checked);
              }
            }
          }
        } else {
          // enable single ID
          setConsent($z(this).attr("name"), $z(this).prop("checked"));
        }
      });

      // show more consent info
      $z('#consent a.showconsentinfo').on("click", function (e) {
        e.preventDefault();
        var thishtml = $z(this).html() || "";

        // reset linktext of all categories
        $z('#consent a.showconsentinfo').html(zp_consent_strings['show_info_' + zp_consentlang]);

        // replace displayed linktext of clicked category		
        if (thishtml.indexOf(zp_consent_strings['show_info_' + zp_consentlang]) !== -1) {
          $z(this).html(zp_consent_strings['hide_info_' + zp_consentlang]);
        }
        if (thishtml.indexOf(zp_consent_strings['hide_info_' + zp_consentlang]) !== -1) {
          $z(this).html(zp_consent_strings['show_info_' + zp_consentlang]);
        }
        var clickedCategory = $z(this).parents("div.cat").attr("data-category-de") || "";
        // hide previously opened info
        $z('#consent div.cat:not([data-category-de="' + clickedCategory + '"]) > div:visible').slideUp();

        // show info for current category
        $z(this).parents('div').first().find("div").slideToggle();
      });
    }
    function reenableIframes() {
      // if set to not block iFrames, restore already blocked ones (blocked before user prefs could be read)
      $z('iframe[data-consentid="zp_consent_iframe"]').each(function () {
        debug.log("✅ unblock iframe: ", this);
        $z(this).attr('src', $z(this).attr('data-src'));
        $z(this).attr('height', $z(this).attr('data-height'));
        $z(this).parent().find('.zpconsentinfo').remove();
      });
    }
    function initIframeWarnings() {
      // replace text placeholders in warnings with user-prefs
      $z('.zpconsentinfo.iframe span.smallprint').each(function () {
        debug.log("✅ unblock iframe: ", this);
        var currHtml = $z(this).html();
        currHtml = currHtml.replace("%dsu", zp_consent_privacypage);
        currHtml = currHtml.replace("%dst", zp_consent_privacylinkt);
        $z(this).html(currHtml);
      });
    }
    function fixActivateButtons() {
      // "COOKIE AKTIVIEREN"-Buttons für bekannte Dienste, die aber in den Widget-Settings deaktiviert sind ersetzen durch "ALLE AKZEPTIEREN"
      $z('.zpconsentinfo p.butt a.button.activate').each(function () {
        var cid = $z(this).attr("data-consentid");
        if (zp_consent_usedids && zp_consent_usedids.indexOf(cid) == -1) {
          var $buttonParent = $z(this).parent();
          debug.warn("Consent ID " + cid + " used in button not found in active services!");
          // replace the buttonwith an "accept all" button
          var replacedButton = '<button data-consent-id="zp_consent_unknown" class="default activate">' + zp_consent_strings['button_accept_' + zp_consentlang] + '</button>';
          $buttonParent.html(replacedButton);
          // replace first paragraph "Aktivieren Sie das Cookie Externe Medien > Google Maps um diesen Inhalt anzuzeigen!"
          $buttonParent.parents(".zpconsentinfo").find('p').first().html(zp_consent_strings['blocked_info_notactive_' + zp_consentlang]);

          // wire up the accept all button
          $buttonParent.find('button[data-consent-id="zp_consent_unknown"].activate').on('click', function (e) {
            e.preventDefault();
            acceptAll();
            setTimeout(function () {
              // give the http cookies a little time and reload the page after 100ms
              location.reload(true);
            }, 100);
          });
        }
      });
    }

    // wire up accept buttons in content deactivated notices
    acceptButtons();
  });
}
function zpHasClass(el, className) {
  return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
}
function does_support_html5_storage() {
  // do not use for now:
  return false;
  /*
  try {
  	return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
  	return false;
  }
  */
}

function googleConsentv2(action) {
  // console.log("✅ Google Consent V2 action = " + action);
  if (action !== "denied" && action !== "granted") {
    return;
  }
  gtag('consent', 'update', {
    ad_user_data: action,
    ad_personalization: action,
    ad_storage: action,
    analytics_storage: action
  });
}
if (!zpHasClass(document.getElementsByTagName("html")[0], "zppreview")) {
  initcontent();
  if (!zpconsent.read_cookie("zp_consent_zp")) {
    // .load might not fire if page is cached, so we fallback with this
    fallbackOpener = window.setTimeout(function () {
      debug.log("Delayed Opener as load didn't fire within 10 seconds");
      zpconsent.openConsent(true);
    }, 10000);
    $z(window).off("load.zpconsent");
    $z(window).on("load.zpconsent", function () {
      //alert("Window load!");
      window.clearTimeout(fallbackOpener);
      window.setTimeout(function () {
        zpconsent.openConsent(true);
      }, 500);
    });
  }
}
