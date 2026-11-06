// Scope -> feature registry. Single source of truth (mirrors OA-4 ticket).
// In production this drives both the auth-start flow and the capability resolver.

export type ScopeClass = "none" | "sensitive" | "restricted";

export interface ScopeDef {
  scope: string;
  label: string;
}

export interface Bundle {
  id: string;
  feature: string;
  description: string;
  icon: string; // emoji stand-in for the service glyph
  scopes: ScopeDef[];
  class: ScopeClass;
  requiresCasa: boolean;
  demoAction: string; // what the unlocked feature lets you do (stub)
}

export const SIGN_IN: Bundle = {
  id: "signin",
  feature: "Google Sign-in",
  description: "Identify the user. Always requested first.",
  icon: "👤",
  scopes: [
    { scope: "openid", label: "Authenticate you" },
    { scope: "auth/userinfo.email", label: "See your email address" },
    { scope: "auth/userinfo.profile", label: "See your basic profile" },
  ],
  class: "none",
  requiresCasa: false,
  demoAction: "Read your name and email",
};

export const BUNDLES: Bundle[] = [
  {
    id: "calendar",
    feature: "Calendar & Meet",
    description: "Read and create events, join Meet links.",
    icon: "📅",
    scopes: [
      { scope: "auth/calendar.events", label: "Manage your calendar events" },
      { scope: "auth/calendar.readonly", label: "View your calendars" },
    ],
    class: "sensitive",
    requiresCasa: false,
    demoAction: "Show your next 3 meetings",
  },
  {
    id: "docs",
    feature: "Docs & Sheets",
    description: "Work with files the app creates or you pick. Uses drive.file — no CASA.",
    icon: "📄",
    scopes: [
      { scope: "auth/drive.file", label: "Access files you open or create with this app" },
      { scope: "auth/documents", label: "Edit Google Docs" },
      { scope: "auth/spreadsheets", label: "Edit Google Sheets" },
    ],
    class: "sensitive",
    requiresCasa: false,
    demoAction: "Summarize a doc you pick",
  },
  {
    id: "contacts",
    feature: "Contacts & Tasks",
    description: "Read contacts and manage task lists.",
    icon: "👥",
    scopes: [
      { scope: "auth/contacts.readonly", label: "See your contacts" },
      { scope: "auth/tasks", label: "Manage your tasks" },
    ],
    class: "sensitive",
    requiresCasa: false,
    demoAction: "Draft a task from a contact",
  },
  {
    id: "drive",
    feature: "Full Drive",
    description: "Read ALL Drive files. Restricted scope — triggers CASA Tier 2.",
    icon: "🗂️",
    scopes: [{ scope: "auth/drive.readonly", label: "See and download ALL your Drive files" }],
    class: "restricted",
    requiresCasa: true,
    demoAction: "Search across your entire Drive",
  },
  {
    id: "gmail",
    feature: "Gmail",
    description: "Read and send email. Restricted scope — triggers CASA Tier 2 annual audit.",
    icon: "✉️",
    scopes: [
      { scope: "auth/gmail.readonly", label: "Read all your email" },
      { scope: "auth/gmail.send", label: "Send email on your behalf" },
    ],
    class: "restricted",
    requiresCasa: true,
    demoAction: "Summarize your unread inbox",
  },
];

export const ALL_BUNDLES = [SIGN_IN, ...BUNDLES];

export function classColor(c: ScopeClass): string {
  switch (c) {
    case "none":
      return "#5f6570";
    case "sensitive":
      return "#b45309";
    case "restricted":
      return "#dc2626";
  }
}

export function classLabel(c: ScopeClass): string {
  switch (c) {
    case "none":
      return "Basic";
    case "sensitive":
      return "Sensitive";
    case "restricted":
      return "Restricted";
  }
}
