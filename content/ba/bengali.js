// ============================================================
//  SUGGESTION HUB — BA — Bengali
//
//  examDate -> "YYYY-MM-DD" (e.g. "2026-10-15"), or "" if not announced yet.
//              Shows the exam date + a countdown on the subject card.
//  status   -> "pending"  = suggestions not uploaded yet (shows "Coming Soon")
//              "ready"    = suggestions are uploaded and live (shows "Ready")
//
//  Two lists below:
//    "suggestions"  -> exam-focused suggestion sets
//    "materials"    -> study materials (PDF notes or YouTube videos)
//
//  For each item:
//    title -> what shows on the site
//    type  -> "pdf" or "youtube"
//    url   -> the link (Google Drive / YouTube / or a PDF you uploaded
//             into this repo, e.g. "files/ba/bengali/chapter1.pdf")
// ============================================================
 
const BA_BENGALI = {
  name: "Bengali",
  icon: "📗",
  examDate: "",
  status: "pending",
  suggestions: [
    // Example -- delete or replace this once you add real items:
    // { title: "Suggestion — Unit 1", type: "pdf", url: "https://drive.google.com/..." }
       { title: "Suggestion — Bengali", type: "pdf", url: "https://drive.google.com/drive/folders/1QD91YY_LJm36-afh0WGjrhF6ps3A7gcV"}
  ],
  materials: [
    // Example -- delete or replace this once you add real items:
    // { title: "Chapter 1 Notes", type: "pdf", url: "https://drive.google.com/..." },
    // { title: "Chapter 1 Explained", type: "youtube", url: "https://youtube.com/..." }
  ]
};
