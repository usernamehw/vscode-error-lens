## 3.28.0 `29 Jan 2026`

- ✨ Pick a problem by (message/source/code) and change its visual style `"errorLens.transmute"` setting. [demo](https://github.com/usernamehw/vscode-error-lens/blob/master/docs/docs.md#errorlenstransmute)

## 3.27.0 `27 Jan 2026`

- ✨ Pick a problem by (message/source/code) and change its severity `"errorLens.transmute"` setting. [demo](https://github.com/usernamehw/vscode-error-lens/blob/master/docs/docs.md#errorlenstransmute)
- 🔨 Delete deprecated setting `"errorLens.exclude"`

## 3.26.0 `29 Apr 2025`

- 🔨 Deprecate `"errorLens.exclude"` setting in favor of `"errorLens.excludeByMessage"`.

`"errorLens.exclude"` was transforming every string into a Regular Expression which is bad for performance and can lead to an Extension Host crash (`Extension causes high cpu load`). New setting `"errorLens.excludeByMessage"` matches strings by default(case-insensitive), but can use Regular Expressions too (use object instead of a string).

## 3.25.0 `01 Apr 2025`

- ✨ Configure inline message border `"errorLens.border"` [demo](https://github.com/usernamehw/vscode-error-lens/blob/master/docs/docs.md#errorlensborder)
- ✨ Allow relative fontSize (negative/smaller) to `"editor.fontSize"` e.g.: `"errorLens.fontSize": "-4",`
- ✨ Apply gutter colors to text specified in `"errorLens.gutterEmoji"` (symbols like ⏻/⛆/▣/◈/⟁/... or any letter/text)
- 🐛 Fix possible NPE when problems were removed
- 🔨 Remove duplicate onSave timeout. Change default timeout from 1000 to 500 `"errorLens.onSaveTimeout": 500,`

## 3.24.0 `06 Mar 2025`

- ✨ Add hint gutter icons
- 🐛 Fix Code Lens not respecting delay settings (`"errorLens.onSave"`, `"errorLens.delay"` (only for `"errorLens.delayMode": "new"`))
- 🐛 Fix Code Lens not respecting file exclusions (`"errorLens.ignoreDirty"`, `"errorLens.ignoreUntitled"`, ...)
- 🔨 Remove experimental mutiline decorations

## 3.23.0 `30 Jan 2025`

- ✨ `Exclude Problem` command should be available to call from "Command Palette" / hotkey
- 🐛 Fix [#223 Error decorations persist in jupyter notebooks (ipynb) after resolution](https://github.com/usernamehw/vscode-error-lens/issues/223)

## 3.22.1 `28 Jan 2025`

- 🐛 Fix "Copy Problem Message" command not working
- 🐛 Maybe fixed [#223 Error decorations persist in jupyter notebooks (ipynb) after resolution](https://github.com/usernamehw/vscode-error-lens/issues/223)

## 3.22.0 `20 Dec 2024`

- 📚 Created docs/examples page: https://github.com/usernamehw/vscode-error-lens/blob/master/docs/docs.md
- ✨ Added command to foce update/clear decorations `"command": "errorLens.updateEverything", "args": { "kind": "update"// "clear" }`
- 🔨 `"errorLens.align"` to use its own numerical property value for padding
- 🔨 Setting values `"followCursor": "activeLine" & "closestProblem"` should not use end range of diagnostics
- 🐛 Maybe fixed [#223 Error decorations persist in jupyter notebooks (ipynb) after resolution](https://github.com/usernamehw/vscode-error-lens/issues/223)
- 🐛 Maybe fixed [#214 Decorations not updated when using split editor](https://github.com/usernamehw/vscode-error-lens/issues/214)

## 3.21.0 `16 Dec 2024`

- ✨ New setting `"errorLens.ignoreDirty"` - don't show decorations in modified unsaved files (when `"files.autoSave"` is disabled)
- 🐛 Honour padding for `"errorLens.alignMessage"`, set `"useFixedPosition": true` by default
- 🐛 Fix emoji & letter gutter icons not working in VSCode **1.96.0**

## 3.20.0 `22 Jun 2024`

- ✨ Changed how `"errorLens.onSave"` works. Less erratic decoration updating
- ✨ New setting `"errorLens.onSaveUpdateOnActiveEditorChange"` to control whether or not to draw decorations on editor focus change (when `"errorLens.onSave"` enabled)
- ✨ New value for `"errorLens.statusBarMessageType"` setting: "activeCursor" => updates status bar for closest problem inside the active line
- 🐛 Fix `"errorLens.statusBarMessageType": "activeLine"`  doesn't sort problems by severity

## 3.19.0 `21 Jun 2024`

- ✨ Add new delay mode. It is the default now: `"errorLens.delayMode": "new"`
- 🐛 Fix bug when enabling status bar message extension re-rendered editor decorations (interfered with `"errorLens.delay"` AND `"errorLens.onSave"`)

## 3.18.0 `28 May 2024`

- 🐛 Code Lens fixes: doesn't respect : `errorLens.enabled` & `errorLens.enabledDiagnosticLevels` & `errorLens.excludePatterns`
- ✨ Code Lens change default settings: "max": 100 -> 200

## 3.17.0 `14 Apr 2024`

- ✨ Show problems using "Code Lens" api. New settings: `"errorLens.codeLensEnabled"`, `"errorLens.codeLensTemplate"`, `"errorLens.codeLensOnClick"`, `"errorLens.codeLensLength"` [PR 202](https://github.com/usernamehw/vscode-error-lens/pull/202) by [duncanawoods](https://github.com/duncanawoods)

## 3.16.0 `16 Dec 2023`

- ✨ Honor vscode `problems.visibility` setting when showing decorations (new setting `"errorLens.respectUpstreamEnabled"`)
- ✨ Ignore running on untitled files (new setting `"errorLens.ignoreUntitled"`) [PR 190](https://github.com/usernamehw/vscode-error-lens/pull/190) by [smcenlly](https://github.com/smcenlly)

## 3.15.0 `22 Oct 2023`

- ✨ New gutter icons `"errorLens.gutterIconSet": "emoji"` & setting to control: `"errorLens.gutterEmoji": { "error": "💀", "warning": "😞", "info": "🆗", "hint": "🍏" }`
- ✨ New property `"useFixedPosition"` to `"errorLens.alignMessage"` setting (to reduce stuttering)
- ✨ New setting `"errorLens.statusBarIconsTargetProblems": "all" | "activeEditor" | "visibleEditors"` to choose which problems to use for counting problems (icons status bar item)

## 3.14.0 `25 Sep 2023`

- ✨ Align message `"errorLens.alignMessage"` [Issue 136](https://github.com/usernamehw/vscode-error-lens/issues/136)
- ✨ Highlight problem range `"errorLens.problemRangeDecorationEnabled"`
- 🐛 "letter" gutter icon set should use editor font family

## 3.13.0 `08 Aug 2023`

- ✨ New command `errorLens.selectProblem` - select range of the closest problem [PR 178](https://github.com/usernamehw/vscode-error-lens/pull/178) by [zardoy](https://github.com/zardoy)
- ✨ New setting `"errorLens.delayMode"`
- ✨ New options for gutter icons: `"squareRounded"` and `"letter"`

## 3.12.0 `14 Jul 2023`

- ✨ New setting `"errorLens.replace"` - transform error message [PR 175](https://github.com/usernamehw/vscode-error-lens/pull/175) by [ssalbdivad](https://github.com/ssalbdivad)
- ✨ New command `errorLens.toggleInlineMessage` => toggle `"errorLens.messageEnabled"` setting
- ✨ Allow linter disabling comments on the same line (in `"errorLens.disableLineComments"` setting => append ` SAME_LINE` to the text)
- ✨ Add "square" gutter icon set
- ✨ "square" and "circle" gutter icons now show for `hint` diagnostic severity
- 🐛 Make "defaultOutline" gutter icons the same size as other icons

## 3.11.1 `08 Jun 2023`

- 🐛 Fix: Notebooks show duplciated messages [PR 171](https://github.com/usernamehw/vscode-error-lens/pull/171) by [r3m0t](https://github.com/r3m0t)

## 3.11.0 `06 May 2023`

- 💥 Disable all hovers by default `"errorLens.editorHoverPartsEnabled"`
- ✨ Add option to show source/code in hover `"sourceCodeEnabled"` property for `"errorLens.editorHoverPartsEnabled"` setting
- ✨ New command and button in hover: `errorLens.searchForProblem` - search in default browser for problem (query controlled by `"errorLens.searchForProblemQuery"` setting)
- ✨ New command and button in hover: `errorLens.disableLine` - add comment to disable linter for this line

## 3.10.1 `26 Apr 2023`

- 🐛 Fix: Changing enabled/disabled status doesn't update visible editors #163

## 3.10.0 `18 Apr 2023`

- 💥 Replace `"errorLens.editorHoverEnabled"` with `"errorLens.editorHoverPartsEnabled"`. Disable hover message by default (not buttons).
- ✨ Hover message is monospace and doesn't replace linebreaks
- ✨ Hover message is status bar has the same buttons as editor hover (when `"errorLens.statusBarMessageEnabled"` is enabled)

## 3.9.0 `07 Apr 2023`

- ✨ New command `errorlens.toggleWorkspace` and setting `"excludeWorkspaces"` to exclude entire folder. [PR 154](https://github.com/usernamehw/vscode-error-lens/pull/154) by [onuryukselce](https://github.com/onuryukselce)
- ✨ Add hover for editor decorations (`errorLens.editorHoverEnabled` to disable)
- ✨ Editor hover has buttons to: "Exclude problem" or "Open linter rule definition". `"errorLens.lintFilePaths"` setting controls which files to search for linter rule.

## 3.8.0 `14 Mar 2023`

- 🐛 Error range should use starting point #147
- 🐛 Ignore notebook cells for `enableOnDiffView` setting #116

## 3.7.0 `07 Feb 2023`

- ✨ Make extension available on the web
- ✨ Configure symbol replacing newlines `"errorLens.replaceLinebreaksSymbol"` #137

## 3.6.0 `24 Jul 2022`

- ✨ Allow ignoring errors by code #126
- ✨ Don't show decorations on files with merge conflict markers #129
- ✨ Disable inline message: Make `"errorLens.messageMaxChars: 0"` possible #130

## 3.5.2 `13 Jul 2022`

- 🐛 When zero errors/warnings should remove status bar icon foreground color
- 🐛 When delay is set - status bar icons is not updated
- 💥 Change default setting `statusBarIconsAtZero` to `"removeBackground"`

## 3.5.1 `26 May 2022`

- 🐛 Fix broken **`errorLens.delay`** setting #121

## 3.5.0 `18 May 2022`

- ✨ Control status bar items alignment and priority. Settings: **`errorLens.statusBarIconsAlignment`**, **`errorLens.statusBarIconsPriority`**, **`errorLens.statusBarMessageAlignment`**, **`errorLens.statusBarMessagePriority`**
- ✨ Add "allLinesExceptActive" option to the **`errorLens.followCursor`** setting #115
- 🔨 Refactor a bit to improve performance

## 3.4.2 `09 Mar 2022`

- ✨ Add option to disable decorations on diff view **`"errorLens.enableOnDiffView"`** #72
- ✨ Add option to quickly switch between line background highlighting modes **`"errorLens.messageBackgroundMode"`** #113

## 3.4.1 `13 Nov 2021`

- ✨ Create foreground colors for status bar icons #98
- ✨ Maximum Message Length #100
- 🐛 Fix separated status bar icons #96
- 🐛 Remove newlines from the deprecation message #99

## 3.4.0 `06 Aug 2021`

- 💥 Create setting `errorLens.enabled` . Toggle commands now use global `settigns.json` to save their state.

> **Error Lens: Toggle (Enable/Disable) Everything** - toggles `errorLens.enabled` <br>
> **Error Lens: Toggle Errors** - toggles items inside `errorLens.enabledDiagnosticLevels`
- ✨ Create status bar icons with highlighted background #96

## 3.3.2 `29 Jul 2021`

- 🐛 Try to fix `errorLens.delay` setting

## 3.3.1 `16 Jul 2021`

- ✨ Make extension work on remote VSCode (github codespaces) #91

## 3.3.0 `27 Jun 2021`

- 💥 Remove hint diagnostics from default. To revert - change `errorLens.enabledDiagnosticLevels` to **["error", "warning", "info", "hint"]**
- 💥 `errorLens.addAnnotationTextPrefixes` & `errorLens.addNumberOfDiagnostics` settings are deprecated in favor of `errorLens.messageTemplate` [vscode-error-lens/issues/92](https://github.com/usernamehw/vscode-error-lens/issues/92)
- 💥 Change default value of setting `errorLens.removeLinebreaks` to **true**
- 🐛 Status bar should honor enabled diagnostic levels
- ✨ Add `closestSeverity` option for status bar setting `errorLens.statusBarMessageType`. Show most severe closest problem in status bar.

## 3.2.7 `31 May 2021`

- ✨ Replace linebreaks in inline diagnostics with whitespace
- ✨ Click on Status Bar Item to go to the problem

## 3.2.6 `18 Apr 2021`

- ✨ Exclude diagnostics by source `"errorLens.excludeBySource"`

## 3.2.5 `12 Mar 2021`

- 🐛 Fix custom gutter icons stopped working
- 🐛 Fix when delay is set `excludePatterns` is ignored

## 3.2.4 `13 Nov 2020`

- ✨ Use "ui" extension kind to support remote [PR #63](https://github.com/usernamehw/vscode-error-lens/pull/63) by [@Daniel15](https://github.com/Daniel15)

## 3.2.3 `03 Oct 2020`

- ✨ Add setting to hide inline message `errorLens.messageEnabled`

## 3.2.2 `28 Sep 2020`

- ✨ Add separate colors for status bar items

## 3.2.1 `23 Aug 2020`

- ✨ Add option to prevent horizontal scrollbar appearing for decorations with `errorLens.scrollbarHackEnabled`
- ✨ `onSave` should work with vscode autosave

## 3.2.0 `08 Aug 2020`

- ✨ Exclude files by glob with `excludePatterns` setting
- ✨ Use `onStartupFinished` activation event
- 🔨 Refactor

## 3.1.1 `20 Apr 2020`

- 🐛 Fix wrong type for a setting that generated warning [PR #49](https://github.com/usernamehw/vscode-error-lens/pull/49) by [@Luxcium](https://github.com/Luxcium)

## 3.1.0 `01 Apr 2020`

- ✨ Add an option to render gutter icons separately from main decoration [#45 Show only gutter icons unless cursor is on line with error](https://github.com/usernamehw/vscode-error-lens/issues/45)
- ✨ Change status bar item to show message for the active line
- ✨ Add an option to use decoration colors for status bar message (`statusBarColorsEnabled`)

## 3.0.0 `19 Feb 2020`

- 💥 Deprecate and delete `errorLens.useColorContributions`
- 💥 Deprecate and delete `errorLens.editorActiveTabDecorationEnabled` (Move to a separate extension)
- ✨ `delay` setting should only work for a new diagnostics (Fixed diagnostics decoration should be removed immediately) [#39](https://github.com/usernamehw/vscode-error-lens/issues/39)
- ✨ Show closest to cursor diagnostic in status bar `errorLens.statusBarMessageEnabled`
- ✨ Expose `addNumberOfDiagnostics` as a setting
- ✨ Expose `padding` as a setting
- ✨ Expose `borderRadius` as a setting
- ✨ Update `margin` setting to use `ch` units instead of `px`

## 2.9.0 `09 Jan 2020`

- 💥 Set `errorLens.useColorContributions` to **`true`**
- ✨ Create command to transfer colors from `Settings` to `Colors`: **Convert colors from Settings to Colors.**. Note: colors only for light themes are not supported yet.
- 💄 Remove number of diagnostics from annotation prefix.

## 2.8.1 `29 Nov 2019`

- 🐛 Fix missing message prefix when there are multiple diagnostics on the line [Issue #33](https://github.com/usernamehw/vscode-error-lens/issues/33)

## 2.8.0 `26 Nov 2019`

- 💥 Delete `clearDecorations` option
- ✨ Possible future breaking change: Using color contributions instead of settings values for colors. Now hidden behind a config `errorLens.useColorContributions`
- ✨ Specify custom message prefix
- 🐛 Fix broken `circle` gutter icon set
- 🔨 Update version to **1.40.0**

## 2.7.2 `12 Oct 2019`

- 🐛 Prevent `:after` decoration clashing with other extensions [PR #28](https://github.com/usernamehw/vscode-error-lens/pull/28) by [@bmalehorn](https://github.com/bmalehorn)

## 2.7.1 `14 Sep 2019`

- 💥 Deprecate `exclude` setting using **source** and **code** and leave only `exclude` using problem message.
- ✨ Set some padding, only when one of message colors is set (`errorLens.errorMessageBackground` / ...)
- 🔨 Allow omitting CSS units for `margin` & `fontSize` (`px` will be used)

## 2.7.0 `20 Aug 2019`

- 🐛 Fix not updated decorations while dragging tabs
- 🐛 Fix not working on remote
- ✨ New gutter icon set `defaultOutline`
- ✨ Ability to change message background on top of the entire line background: `errorLens.errorMessageBackground` / ...

## 2.6.0 `15 Aug 2019`

- ✨ Ability to show only closest to the cursor problems (`errorLens.followCursor`).
- ✨ Ability to change active editor tab title background when file has Errors/Warnings (`errorLens.editorActiveTabDecorationEnabled`)

## 2.5.0 `11 Jul 2019`

- 💥 Deprecate enum setting `errorLens.fontStyle` in favor of boolean `errorLens.fontStyleItalic`
- 💥 Change default settings `errorLens.addAnnotationTextPrefixes` and `errorLens.margin`
- 🐛 Error decoration must always trump Warning etc: `ERROR` => `WARNING` => `INFO` => `HINT`
- ✨ New command to copy problem at active line number `errorLens.copyProblemMessage`

## 2.4.1 `11 Jul 2019`

- 🐛 Decorations stopped working in `settings.json` in **1.37**

## 2.4.0 `06 Jul 2019`

- ✨ New gutter icon set **`circle`**
- 💥 Change default colors for `INFO` & `HINT` diagnostics
- ✨ Any unset `light` color/path should default to ordinary one.
- ✨ Add commands to temporarily disable one level of diagnostic [Fixes #10](https://github.com/usernamehw/vscode-error-lens/issues/10)
- 💥 Deprecate: `errorLens.errorGutterIconPathLight`, `errorLens.warningGutterIconPathLight` and `errorLens.infoGutterIconPathLight`. They were moved into `errorLens.light`.

## 2.3.4 `22 Jun 2019`

- ✨ Add an option to choose if the decorations should be cleared when you start typing (only when `delay` is set) – `errorLens.clearDecorations`.

## 2.3.3 `09 Jun 2019`

- 🔨 Update dependencies

## 2.3.2 `07 Jun 2019`

- ✨ Set custom gutter icons (Using absolute file path).

## 2.3.1 `02 Jun 2019`

- ✨ Configure gutter icon size with: `errorLens.gutterIconSize`
- ✨ Configure gutter icons to be borderless with `errorLens.gutterIconSet`: [PR #6](https://github.com/usernamehw/vscode-error-lens/pull/6) by [@karlsander](https://github.com/karlsander)

## 2.3.0 `01 Jun 2019`

- ✨ Add an option to render gutter icons `errorLens.gutterIconsEnabled`
- 🔨 Increase limit for long messages truncation from 300 to 500 symbols

## 2.2.3 `25 May 2019`

- ✨ Draw decorations in `Untitled` files
- 📚 Add an example of `exclude` setting to README
- 🔨 Move `exclude` RegExp creation out of the loop

## 2.2.2 `24 May 2019`

- 🐛 Different fix for decorations not rendered the first time with `errorLens.onSave`

## 2.2.1 `24 May 2019`

- 🐛 Fix failed to update decorations (on save) when language diagnostics haven't changed

## 2.2.0 `23 May 2019`

- ✨ Update decorations only on document save with `errorLens.onSave`

## 2.1.1 `22 May 2019`

- ✨ Change font family with `errorLens.fontFamily`

## 2.1.0 `21 May 2019`

- ✨ Customize delay before showing problems with `errorLens.delay`

## 2.0.4 `19 May 2019`

- ✨ Allow to set colors for light themes separately with the setting `errorLens.light`

## 2.0.3 `19 May 2019`

- 🐛 Fix disposing decorations when settings change from Settings GUI

## 2.0.2 `18 May 2019`

- ✨ Customize font size of messages with `errorLens.fontSize`
- 🐛 Toggle ErrorLens command should update decorations for all visible editors

## 2.0.1 `18 May 2019`

- ✨ Update decorations for all visible editors (split/grid)
- 🐛 Additionally dispose decorations when settings change

## 2.0.0 `18 May 2019`

- ✨ Support excluding some of the problems with the setting `errorLens.exclude`
- ✨ Hot reload of all Settings
- 💥 Toggle extension with one command `errorLens.toggle` instead of two
- 💥 Rename colors to have `background` & `foreground` suffix
- 💥 Remove statusbar entry completely
- 💥 Change default values (colors, fontStyle)
- 💥 Experimental: remove `onDidOpenTextDocument` event listener
- 🔨 Minor fixes like more specific types for Setting values
- 🔨 Use webpack

# Fork happened

