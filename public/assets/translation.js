function TranslateInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: "hi,ta,te,ml,kn,mr,gu,bn,pa",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
    },
    "google_translate_element"
  );
}
