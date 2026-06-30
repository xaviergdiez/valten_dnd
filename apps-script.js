/**
 * Valten D&D Sheet → Webapp Sync
 *
 * SETUP (one-time):
 * 1. In your Google Sheet: Extensions → Apps Script → paste this file.
 * 2. In Apps Script: Project Settings → Script Properties → add:
 *      SYNC_SECRET  →  d38f70fe11c0dd551b7563557247c1a1647fa6b2e3bd1f0a12d743cf
 *      WEBHOOK_URL  →  https://dndvalten-git-feature-s-67f6d8-xavier-garcias-projects-1ba59fc2.vercel.app/api/sync-sheet
 *      (use https://dndvalten.vercel.app/api/sync-sheet once merged to main)
 * 3. Run `createTrigger()` once (select it in the dropdown → Run) to set up
 *    the automatic onChange trigger.
 * 4. Run `syncToApp()` manually once to do an initial push.
 *
 * SHEET TAB STRUCTURE  (create these tabs with these exact names / columns):
 *
 * ┌─────────────┬──────────────────────────────────────────────────────────────┐
 * │ Tab name    │ Columns (row 1 = headers, data from row 2 on)                │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Stats       │ key  │ value                                                 │
 * │             │ (keys: str, dex, con, int, wis, cha, proficiency, hpMax,    │
 * │             │  ac, speed, initiative, hitDiceCount, hitDiceDie, classLevel)│
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Saves       │ ability  │ proficient (TRUE/FALSE)                           │
 * │             │ (rows: str, dex, con, int, wis, cha)                        │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Skills      │ skill  │ proficient (TRUE/FALSE)                             │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Attacks     │ name  │ atkBonus  │ damage                                   │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Equipment   │ name  │ quantity  │ equipped (TRUE/FALSE)                    │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Currency    │ coin  │ amount                                               │
 * │             │ (rows: cp, ep, pp, gp, sp)                                  │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Features    │ name  │ category  │ description                              │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Spellcasting│ class │ label │ class_name │ ability │ save_dc │             │
 * │             │ attack_bonus │ cantrips (comma-sep) │ always_prepared        │
 * │             │ (rows: one per spellcasting class, e.g. cleric / warlock)   │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Spell Slots │ class  │ level  │ total                                      │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │ Custom      │ spell_name │ level │ range │ components │ duration │         │
 * │ Spells      │ concentration │ casting_time │ ritual │ description │        │
 * │             │ material │ school │ classes (comma-sep class keys)           │
 * │             │ NOTE: level = "Cantrip", "1"–"9", or "Item" (skip magic     │
 * │             │ items). The `classes` column links spells to knownByLevel.  │
 * └─────────────┴──────────────────────────────────────────────────────────────┘
 */

var TABS = [
  "Stats",
  "Saves",
  "Skills",
  "Attacks",
  "Equipment",
  "Currency",
  "Features",
  "Spellcasting",
  "Spell Slots",
  "Custom Spells",
];

// Keys used in the payload match what /api/sync-sheet expects.
var TAB_KEYS = {
  "Stats": "stats",
  "Saves": "saves",
  "Skills": "skills",
  "Attacks": "attacks",
  "Equipment": "equipment",
  "Currency": "currency",
  "Features": "features",
  "Spellcasting": "spellcasting",
  "Spell Slots": "spellSlots",
  "Custom Spells": "spells",
};

function syncToApp() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("SYNC_SECRET");
  var webhookUrl = props.getProperty("WEBHOOK_URL");

  if (!secret || !webhookUrl) {
    throw new Error("Script Properties missing: set SYNC_SECRET and WEBHOOK_URL");
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {};

  TABS.forEach(function (tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) return; // tab doesn't exist yet — skip gracefully

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return; // header only — skip

    var headers = data[0].map(function (h) { return String(h).trim(); });
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // Skip rows where every cell is empty.
      if (row.every(function (cell) { return cell === "" || cell === null; })) continue;
      var obj = {};
      headers.forEach(function (h, j) {
        obj[h] = row[j];
      });
      rows.push(obj);
    }

    payload[TAB_KEYS[tabName]] = rows;
  });

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: { Authorization: "Bearer " + secret },
    muteHttpExceptions: true,
  };

  var response = UrlFetchApp.fetch(webhookUrl, options);
  var code = response.getResponseCode();

  if (code !== 200) {
    throw new Error("Sync failed: HTTP " + code + " — " + response.getContentText());
  }

  Logger.log("Sync OK: " + response.getContentText());
}

/** Run once to install a trigger that calls syncToApp() on any sheet change. */
function createTrigger() {
  // Remove existing triggers for this function to avoid duplicates.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "syncToApp") ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger("syncToApp")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onChange()
    .create();

  Logger.log("Trigger created.");
}
