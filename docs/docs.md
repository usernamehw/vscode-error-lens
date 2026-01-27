<!--
"window.zoomLevel": 0.9,// & 1.9
"workbench.colorTheme": "Prism",
"editor.rulers": [40, 80, 120, 130],
-->

### Real talk: this is one of the most annoying extensions out there. Unless you are learning to code, I recommend keeping the inline message disabled by default and binding a hotkey to toggle it:

```js
// keybindings.json
{
    "key": "ctrl+u",
    "command": "errorLens.toggleInlineMessage",
    //          ^ Toggles global setting `errorLens.messageEnabled`
},
```

### If you don't want to go with the hotkey route - it's possible to:

1) Exclude problems (in workspace, by source, by code, by message) [**excludeByMessage**](#errorlensexcludebymessage), [**excludeBySource**](#errorlensexcludebysource), [**excludePatterns(Glob)**](#errorlensexcludepatterns), [**excludeWorkspaces**](#errorlensexcludeworkspaces)
1) Show fewer decorations (render decoration only on the active line) [**followCursor**](#errorlensfollowcursor)
1) Delay showing decorations (delay ms / on document save) [**delay**](#errorlensdelay), [**onSave**](#errorlensonsave), [**ignoreDirty**](#errorlensignoredirty)
1) Transform problem message (make it shorter maybe) [**replace**](#errorlensreplace)
1) Configure other settings or colors to make it less distracting

### 1. Exclude problems:

```js
"errorLens.excludeByMessage": [
    "Missing semicolon",
    "Newline required at end of file but not found",
    "More than 1 blank line not allowed",
],
// OR
"errorLens.excludeBySource": [
    "eslint(padded-blocks)",
],
```

### 2. Show only active line decoration or closest problem:

```js
"errorLens.followCursor": "activeLine",
// OR
"errorLens.followCursor": "closestProblem",
```

### 3. Delay showing problems:

```js
"errorLens.delay": 1500,
// OR
"errorLens.onSave": true,
```

### 4. Transform problem message:

<table>
<tbody>
<tr>
<td>

```js
"errorLens.replace": [
    {
        "matcher": "is declared but its value is never read",
        "message": "ಠ╭╮ಠ",
    },
],
```

</td>
<td>

![replace_demo](./img/replace_kamoji_aligned.png)

</td>
</tr>
</tbody>
</table>

---

## Settings (70+)

### `errorLens.enabled`

Toggle all decorations and features (background highlighting, inline message, gutter icons, status bar message, code lens).
Extension adds a command to toggle this setting: `errorLens.toggle` **Error Lens: Toggle (Enable/Disable) Everything**

### `errorLens.respectUpstreamEnabled`

Disable decorations or features when VSCode setting `problems.visibility` ("Controls whether the problems are visible throughout the editor and workbench") is disabled.

### `errorLens.enabledInMergeConflict`

Disable decorations when file has merge conflict symbols `<<<<<<<` or `=======` or `>>>>>>>`.

### `errorLens.fontFamily`

Change font family of inline message. Not supported natively by VSCode. Non-monospace fonts can usually fit more characters in the same space. May break [errorLens.alignMessage](#errorlensalignmessage).

<table>
<tbody>

<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>""</th>
<td>

![](./img/font_family_default.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Arial"</th>
<td>

![](./img/font_family_arial.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Times"</th>
<td>

![](./img/font_family_times.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Helvetica"</th>
<td>

![](./img/font_family_helvetica.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Gabriola"</th>
<td>

![](./img/font_family_gabriola.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Calibri"</th>
<td>

![](./img/font_family_calibri.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Comic Sans MS"</th>
<td>

![](./img/font_family_comic_sans_ms.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Cascadia Code"</th>
<td>

![](./img/font_family_cascadia_code.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<th>"Segoe Print"</th>
<td>

![](./img/font_family_segoe_print.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->

</tbody>
</table>

### `errorLens.fontWeight`

Whether to use bold or not font weight for messages.

<table>
<tbody>
<tr>
<th align="center">"normal"</th>
<th align="center">"bold"</th>
</tr>
<tr>
<td>

![font weight normal](./img/font_weight_normal.png)

</td>

<td>

![font weight bold](./img/font_weight_bold.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.fontStyleItalic`

Whether to use italic font style or not for messages.

<table>
<thead>
<tr>
<th align="center">false</th>
<th align="center">true</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![font style normal](./img/font_style_normal.png)

</td>

<td>

![font style italic](./img/font_style_italic.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.fontSize`

Change font size of inline message. Not supported natively by VSCode. Mostly useful to make message smaller, not bigger. Use negative value to have it relative to the editor's fontSize (e.g. `-3px`). May break [errorLens.alignMessage](#errorlensalignmessage).

<table>
<tbody>

<tr>
<th>""</th>
<td>

![font size default](./img/font_size_default.png)

</td>
</tr>

<tr>
<th>"12px"</th>
<td>

![font size 12px](./img/font_size_12px.png)

</td>
</tr>

</tbody>
</table>


### `errorLens.margin`

Extra space between the end of the line (end of text) and the inline message.

<table>
<thead>
<tr>
<th align="center">"4ch"</th>
<th align="center">"0"</th>
<th align="center">"100px"</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![](./img/margin_4ch.png)

</td>

<td>

![](./img/margin_0.png)

</td>

<td>

![](./img/margin_100px.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.alignMessage`

Align message to be in the same column (if possible). Only works with monospace fonts.

<table>
<tbody>

<tr>
<td>

```js
"errorLens.alignMessage": {
    "start": 40,
    "end": 0,
    "padding": [0, 0.5],
},
```

</td>
<td>

![](./img/align_start_40.png)

</td>
</tr>

<tr>
<td>

```js
"errorLens.alignMessage": {
    "start": 0,
    "end": 80,
    "padding": [0, 0.5],
},
```

</td>
<td>

![](./img/align_end_80.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.border`

<table>
<tbody>

<tr>
<td>

```js
"errorLens.border": [
	"1px solid",
	"1px dotted",
	"1px dashed",
	"1px solid #00000040",
],
```

</td>
<td>

![](./img/border.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.padding`

Add space around the inline message. Only visible when [errorLens.messageBackgroundMode](#errorlensmessagebackgroundmode) is set to `message`.

<table>
<tbody>
<tr>
<th align="center">"0"</th>
<th align="center">"2px 0.5ch"</th>
</tr>
<tr>
<td>

<img width="300" src="./img/padding_0.png">

</td>

<td>

<img width="300" src="./img/padding_2px_05ch.png">

</td>

</tr>
</tbody>
</table>

### `errorLens.borderRadius`

Round corners for inline message. Only visible when [errorLens.messageBackgroundMode](#errorlensmessagebackgroundmode) is set to `message`.

<table>
<thead>
<tr>
<th align="center">"0.3em"</th>
<th align="center">"0"</th>
<th align="center">"50%"</th>
<th align="center">"10px 30px 10px 30px"</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![](./img/border_radius_03em.png)

</td>

<td>

![](./img/border_radius_0.png)

</td>

<td>

![](./img/border_radius_50_percent.png)

</td>

<td>

![](./img/border_radius_long.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.enabledDiagnosticLevels`

Controls which diagnostics to include (error/warning/info/hint) for all features of this extension (decorations, gutter, status bar, code lens,...).

<table>
<thead>
<tr>
<th align="center">["error", "warning", "info", "hint"]</th>
<th align="center">["error", "warning"]</th>
<th align="center">["error", "info"]</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![](./img/diagnostic_levels_all.png)

</td>

<td>

![](./img/diagnostic_levels_error_warn.png)

</td>

<td>

![](./img/diagnostic_levels_error_info.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.messageTemplate`

Template used for all inline messages. Possible variables:

- `$message` - diagnostic message text
- `$count` - Number of diagnostics on the line
- `$severity` - Severity prefix taken from [errorLens.severityText](#errorlensseveritytext)
- `$source` - Source of diagnostic e.g. \"eslint\"
- `$code` - Code of the diagnostic

<table>
<tbody>

<tr>
<td>

```js
"errorLens.messageTemplate": "[$count] $severity $message $source($code)",
```

</td>
</tr>

<tr>
<td>

![](./img/template.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.messageMaxChars`

<table>
<tbody>

<tr>
<th align="center">500</th>
<td>

![](./img/truncate_500.png)

</td>
</tr>

<tr>
<th align="center">50</th>
<td>

![](./img/truncate_50.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.severityText`

Replaces `$severity` variable in [errorLens.messageTemplate](#errorlensmessagetemplate).

<table>
<tbody>

<tr>
<td>

```js
"errorLens.messageTemplate": "$severity $message",
"errorLens.severityText": [
    "❌",
    "⚠",
    "ℹ",
    "📗",
],
```

</td>
<td>

```js
"errorLens.messageTemplate": "$severity $message",
"errorLens.severityText": [
    "■",
    "■",
    "■",
    "■",
],
```

</td>
</tr>

<tr>
<td>

![](./img/severity_emoji.png)

</td>

<td>

![](./img/severity_same_shape.png)

</td>
</tr>

<tr>
<td>

```js
"errorLens.messageTemplate": "$severity $message",
"errorLens.severityText": [
    "▣",
    "◈",
    "◉",
    "⛆",
],
```

</td>
<td>

```js
"errorLens.messageTemplate": "$severity$message",
"errorLens.severityText": [
    "ERROR: ",
    "WARNING: ",
    "",
    "",
],
```

</td>
</tr>

<tr>
<td>

![](./img/severity_multiple_shapes.png)

</td>

<td>

![](./img/severity_text.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.messageEnabled`

Controls visibility of inline message (including background highlighting). Doesn't include gutter icons.

<table>
<tbody>

<tr>
<th>true</th>
<th>false</th>
</tr>

<tr>
<td>

<img src="./img/message_enabled.png">

</td>
<td>

<img src="./img/message_disabled.png">

</td>
</tr>

<tr>


</tr>
</tbody>
</table>

### `errorLens.messageBackgroundMode`

<table>
<thead>
<tr>
<th align="center">"line"</th>
<th align="center">"message"</th>
<th align="center">"none"</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![](./img/bgmode_line.png)

</td>

<td>

![](./img/bgmode_message.png)

</td>

<td>

![](./img/bgmode_none.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.problemRangeDecorationEnabled`

VSCode now supports natively highlighting problem ranges even without this extension (except `hint` severity):

<table>
<tbody>
<tr>
<td>

```js
"workbench.colorCustomizations": {
    "editorError.background": "#ff000030",
    "editorWarning.background": "#ee990030",
    "editorInfo.background": "#0095d530",
},
```

</td>
<td>

<img width="300" src="./img/vscode_problem_range.png">

</td>
</tr>

</tbody>
</table>


Still, it might be useful if you decide to disable native error highlighting and use the one from this extension (after delay or use different highlighting methods like borders):

<table>
<tbody>
<tr>
<td>

```js
"workbench.colorCustomizations": {
    "editorError.foreground": "#fff0",
    "editorWarning.foreground": "#fff0",
    "editorInfo.foreground": "#fff0",
    "editorHint.foreground": "#fff0",
},

"errorLens.problemRangeDecorationEnabled": true,

"errorLens.decorations": {
    "errorRange": {
        "border": "1px dashed red",
        "backgroundColor": "#ff000090",
        "color": "#ffffff",
    },
    "warningRange": {
        "border": "2px dotted #fa9121",
    },
    "infoRange": {
        "textDecoration": ";background:linear-gradient(45deg,#ff8400,#00d9ff);background-clip:text;color:transparent;border-bottom:2px solid #00d9ff",
        "backgroundColor": "#fff0",
    },
    "hintRange": {
        "textDecoration": ";box-shadow:0 0 5px 3px #2faf6470;border-radius:0.25em",
    },
},
```

</td>
</tr>

<tr>
<td>

<img width="300" src="./img/problem_range.png">

</td>
</tr>

</tbody>
</table>

### `errorLens.editorHoverPartsEnabled`

Controls which parts of hover are enabled (for the text editor; Doesn't affect status bar message hover).

- `messageEnabled` - Shows problem message.
- `sourceCodeEnabled` Shows prblem `source` & `code` and buttons to copy them to the clipboard
- `buttonsEnabled` - Show buttons like `Exclude`, `Open Definition`, `Search`...

### `errorLens.statusBarIconsEnabled`

Show icons for Errors & Warnings in status bar similar to native ones, but with the ability to change color / background color.

<table>
<tbody>

<tr>
<td>

<img width="400" src="./img/status_bar_icons_enabled.png">

</td>
<td>

<img width="400" src="./img/status_bar_icons_hover.png">

</td>
</tr>

<tr>


</tr>
</tbody>
</table>

### `errorLens.statusBarIconsPriority`

Move status bar icons right/left.

### `errorLens.statusBarIconsAlignment`

Choose alignment of the status bar icons left/right side of the viewport.

### `errorLens.statusBarIconsTargetProblems`

Choose what to include in counters for problems (status bar icons).

### `errorLens.statusBarIconsUseBackground`

When enabled - highlight status bar with background colors. Only 2 VSCode colors allowed (`statusBarItem.errorBackground` & `statusBarItem.warningBackground`).

### `errorLens.statusBarIconsAtZero`

Choose what happens to status bar icons when there are no errors - hide or remove background color.

### `errorLens.statusBarMessageEnabled`

Show problem message in Status Bar.

<table>
<tbody>

<tr>
<td>

![](./img/status_bar_message_enabled.png)

</td>
</tr>

<tr>
<td>

![](./img/status_bar_message_hover.png)

</td>
</tr>

</tbody>
</table>

Show problem message in Status Bar.

### `errorLens.statusBarMessageType`

Choose which diagnostic to use for status bar message:

- `closestProblem` - Closest to the cursor diagnostic
- `closestSeverity` - Closest to the cursor diagnostic sorted by severity (e.g. error will be shown before warning even if it's farther from the cursor)
- `activeLine` - Show only diagnostic that is on the same line as the cursor
- `activeCursor` - Similar to `activeLine` but follows the cursor movement inside the line

### `errorLens.statusBarMessagePriority`

Move status bar icons right/left.

### `errorLens.statusBarMessageAlignment`

Choose alignment of the status bar message left/right side of the viewport.

### `errorLens.statusBarColorsEnabled`

Uses colors `errorLens.statusBarErrorForeground`, `errorLens.statusBarWarningForeground`, `errorLens.statusBarInfoForeground`, `errorLens.statusBarHintForeground`.

<table>
<tbody>

<tr>
<th>false</th>
<td>

![](./img/status_bar_colors_disabled.png)

</td>
</tr>

<tr>
<th>true</th>
<td>

![](./img/status_bar_colors_enabled.png)

</td>

</tr>
</tbody>
</table>


────────────────────────────────────────────────────────────

### `errorLens.statusBarCommand`

Command that executes on click for Status Bar.

### `errorLens.statusBarMessageTemplate`

Almost the same as [errorLens.messageTemplate](#errorlensmessagetemplate) but instead affects status bar message.

### `errorLens.replace`

Replace message with custom one. Uses strings to create RegExp with `iu` flags.

<table>
<tbody>

<tr>
<td>

```js
"errorLens.replace": [],
```

</td>
<td>

![](./img/replace_semi.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<td>

```js
"errorLens.replace": [
    {
        "matcher": "Missing semicolon",
        "message": ";",
    },
],
```

</td>
<td>

![](./img/replace_semi_compressed.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<td>

```js
"errorLens.replace": [],
```

</td>
<td>

![](./img/replace_return_type_original.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<td>

```js
"errorLens.replace": [
    {
        "matcher": "Missing return type on (.+)",
        "message": "Type $1"
    }
],
```

</td>
<td>

![](./img/replace_return_type_replaced.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<td>

```js
"errorLens.replace": [
    {
        "matcher": "Missing return type on",
        "message": "<==",
    },
],
```

</td>
<td>

![](./img/replace_arrow.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->
<tr>
<td>

```js
"errorLens.replace": [
    {
        "matcher": "Missing return type on",
        "message": "(。_。)",
    },
],
```

</td>
<td>

![](./img/replace_kamoji.png)

</td>
</tr>
<!-- ──────────────────────────────────────────────────────────── -->

</tbody>
</table>

### `errorLens.transmute`

<table>
<tbody>

<tr>
<td>

```js
"errorLens.transmute": {},
```

</td>
<td>

```js
"errorLens.transmute": {
	"ESLint": {
		"target": {
			"source": "eslint",
		},
		"severity": "info",
	},
},
```

</td>
</tr>

<tr>
<td>

![](./img/transmute_default.png)

</td>

<td>

![](./img/transmute_eslint_info.png)

</td>

</tr>
</tbody>
</table>


### `errorLens.exclude`

> ❗Deprecated. Use [errorLens.excludeByMessage](#errorlensexcludebymessage).

Exclude diagnostics by message. Uses strings to create RegExp with `iu` flags.

### `errorLens.excludeByMessage`

Exclude diagnostics by message. Excludes when the diagnostic message contains the matching string(case-insensitive). Can use Regular Expressions (use object instead of a string).

```js
"errorLens.excludeByMessage": [
	"missing semicolon",// string match(includes), case-insensitive
	{
		"regex": "missing semicolon",// RegExp match
		"flags": "iu"
	},
],
```

### `errorLens.excludeBySource`

Exclude diagnostics by source or source+code pair.

### `errorLens.excludePatterns`

Exclude files by using [glob](https://code.visualstudio.com/docs/editor/glob-patterns) pattern (VSCode flavor. May have differences like [Glob matching should be case insensitive Issue#10633](https://github.com/Microsoft/vscode/issues/10633)). Example `[\"**/*.{ts,js}\"]`.

### `errorLens.excludeWorkspaces`

Exclude the entire workspace from highlighting problems. Related Command: `errorlens.toggleWorkspace` .

### `errorLens.disableLineComments`

Used for `errorLens.disableLine` command that adds a comment disabling linter rule for a line.

To force comment on the same line - add `SAME_LINE` to the message: `"eslint": "// eslint-disable-line $code SAME_LINE"`

### `errorLens.lintFilePaths`

Specify where to search for linter rule definitions by diagnostic source ([glob](https://code.visualstudio.com/docs/editor/glob-patterns) for local linter files). `node_modules` folder is excluded. Used when running `errorLens.findLinterRuleDefinition` command.

### `errorLens.searchForProblemQuery`

Pick query to open in default browser when searching for problem with `errorLens.searchForProblem` command.

### `errorLens.selectProblemType`

Which problem to select (closest / active line) when executing `errorLens.selectProblem` command.

- `closestProblem`, - Show closest to the cursor diagnostic
- `closestSeverity` - Show closest to the cursor diagnostic (sorted by severity e.g. error will be shown before warning even if it's farther from the cursor)
- `activeLine` - Show only diagnostic that is on the same line as the cursor.

### `errorLens.light`

Override colors when on of the "light" themes is used. Only for colors that are specified in "settings", not in "colors".

### `errorLens.delay`

Wait this amount (in milliseconds) before showing decorations.

### `errorLens.delayMode`

- `new` - Old/stale problems should disappear immediately while new problems should respect [errorLens.delay](#errorlensdelay)
- `old` - Buggy/Overcomplicated old implementation
- `debounce` - Simply use `debounce()` from `Lodash` library. Old/fixed problems also wait [errorLens.delay](#errorlensdelay) ms before being hidden.

### `errorLens.onSave`

When enabled - updates decorations only on document save (manual, not auto save).

### `errorLens.onSaveTimeout`

Wait this much (ms) before showing decorations after the document save.

### `errorLens.onSaveUpdateOnActiveEditorChange`

Update decorations immediately or not when switching focus from one Text Editor to another.

### `errorLens.enableOnDiffView`

Whether or not to show decorations on `diff` editor.

<table>
<tbody>

<tr>
<th>false</th>
<td>

![disabled on diff view](./img/diff_disabled.png)

</td>
</tr>

<tr>
<th>true</th>
<td>

![enabled on diff view](./img/diff_enabled.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.followCursor`

Highlight only closest to the cursor problem:

<table>
<tbody>

<tr>
<th align="center">"allLines"</th>
<td>

![](./img/follow_all.png)

</td>
</tr>

<tr>
<th align="center">"activeLine"</th>
<td>

![](./img/follow_active_line.png)

</td>
</tr>

<tr>
<th align="center">"closestProblem"</th>
<td>

![](./img/follow_closest_problem.png)

</td>
</tr>

<tr>
<th align="center">"allLinesExceptActive"</th>
<td>

![](./img/follow_all_lines_except_active.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.followCursorMore`

Augments [errorLens.followCursor](#errorlensfollowcursor) Adds number of lines to top and bottom when `errorLens.followCursor` is set to `activeLine`. Adds number of closest problems when `errorLens.followCursor` is set to `closestProblem`.

<table>
<tbody>

<tr>
<th align="center">0</th>
<td>

![](./img/follow_more_0.png)

</td>
</tr>

<tr>
<th align="center">1</th>
<td>

![](./img/follow_more_1.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.gutterIconsEnabled`

Whether to show gutter icons or not.

<table>
<tbody>
<tr>
<th align="center">false</th>
<th align="center">true</th>
</tr>
<tr>
<td>

![gutter icons disabled](./img/gutter_icons_disabled.png)

</td>

<td>

![gutter icons enabled](./img/gutter_icons_enabled.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.gutterIconsFollowCursorOverride`

When enabled and [errorLens.followCursor](#errorlensfollowcursor) setting is not set to `allLines`, then gutter icons would be rendered for all problems. This setting can overcome that:

<table>
<tbody>

<tr>
<td>

```js
"errorLens.gutterIconsEnabled": true,
"errorLens.followCursor": "activeLine",
"errorLens.gutterIconsFollowCursorOverride": true,
```

</td>
<td>

```js
"errorLens.gutterIconsEnabled": true,
"errorLens.followCursor": "activeLine",
"errorLens.gutterIconsFollowCursorOverride": false,
```

</td>
</tr>

<tr>
<td>

![](./img/gutter_override_true.png)

</td>

<td>

![](./img/gutter_override_false.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.gutterIconSize`

Change size of gutter icons:

<table>
<thead>
<tr>
<th align="center">"100%"</th>
<th align="center">"70%"</th>
<th align="center">"150%"</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![](./img/gutter_size_100.png)

</td>

<td>

![](./img/gutter_size_70.png)

</td>

<td>

![](./img/gutter_size_150.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.gutterIconSet`

<table>
<tbody>

<tr>
<th align="center">"default"</th>
<th align="center">"defaultOutline"</th>
</tr>

<tr>
<td>

![](./img/gutter_icons_default.png)

</td>

<td>


![](./img/gutter_icons_default_outline.png)

</td>
</tr>

<tr>
<th align="center">"squareRounded"</th>
<th align="center">"circle"</th>
</tr>

<tr>
<td>

![](./img/gutter_icons_square.png)

</td>

<td>

![](./img/gutter_icons_circle.png)

</td>
</tr>

<tr>
<th align="center">"letter"</th>
<th align="center">"emoji"</th>
</tr>

<tr>
<td>

![](./img/gutter_icons_letter.png)

</td>

<td>

![](./img/gutter_icons_emoji.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.gutterEmoji`

Control image shown in gutter when [errorLens.gutterIconSet](#errorlensguttericonset) is `"emoji"`. Can use other utf-8 symbols like ♞/⚃/⛆/★/▣/◈/... Possible to fit 2 symbols that are not as wide as emoji.

<table>
<tbody>
<tr>
<td>

```js
"errorLens.gutterEmoji": {
    "error": "🍎",
    "warning": "🍊",
    "info": "⟁",
    "hint": ":(",
},
```

</td>

<td>

<img width="300" src="./img/gutter_emoji.png">

</td>

</tr>
</tbody>
</table>

### `errorLens.errorGutterIconPath`

Set custom icons for gutter.

<table>
<tbody>
<tr>
<td>

```js
"errorLens.errorGutterIconPath": "C:\\temp\\Stop.png",
"errorLens.warningGutterIconPath": "C:\\temp\\Warning.png",
"errorLens.infoGutterIconPath": "C:\\temp\\vscode.png",
"errorLens.hintGutterIconPath": "C:\\temp\\folder.png",
```

</td>

<td>

<img width="400" src="./img/gutter_icon_path.png">

</td>

</tr>
</tbody>
</table>

### `errorLens.warningGutterIconPath`

Same as [errorLens.errorGutterIconPath](#errorlenserrorguttericonpath)

### `errorLens.infoGutterIconPath`

Same as [errorLens.errorGutterIconPath](#errorlenserrorguttericonpath)

### `errorLens.hintGutterIconPath`

Same as [errorLens.errorGutterIconPath](#errorlenserrorguttericonpath)

### `errorLens.errorGutterIconColor`

Change color of gutter icons (for shapes and letters).

<table>
<tbody>

<tr>
<td>

```js
"errorLens.gutterIconSet": "squareRounded",
"errorLens.errorGutterIconColor": "#6a54e4",
"errorLens.warningGutterIconColor": "#29d8ff",
"errorLens.infoGutterIconColor": "#21d439",
"errorLens.hintGutterIconColor": "#b5a7b0",
```

</td>
<td>

```js
"errorLens.gutterIconSet": "letter",
"errorLens.errorGutterIconColor": "#6a54e4",
"errorLens.warningGutterIconColor": "#29d8ff",
"errorLens.infoGutterIconColor": "#21d439",
"errorLens.hintGutterIconColor": "#b5a7b0",
```

</td>
</tr>

<tr>
<td>

<img width="300" src="./img/gutter_color_square.png">

</td>

<td>

<img width="300" src="./img/gutter_color_letter.png">

</td>

</tr>
</tbody>
</table>



### `errorLens.warningGutterIconColor`

Same as [errorLens.errorGutterIconPath](#errorlenserrorguttericoncolor)

### `errorLens.infoGutterIconColor`

Same as [errorLens.errorGutterIconPath](#errorlenserrorguttericoncolor)

### `errorLens.hintGutterIconColor`

Same as [errorLens.errorGutterIconPath](#errorlenserrorguttericoncolor)

### `errorLens.removeLinebreaks`

Diagnostic message may contain linebreaks, but inline message decorations are ... inline. This replaces linebreaks (multiple in a row too) with the symbol controlled by [errorLens.replaceLinebreaksSymbol](#errorlensreplacelinebreakssymbol).

### `errorLens.replaceLinebreaksSymbol`

When [errorLens.removeLinebreaks](#errorlensremovelinebreaks) is enabled => replaced linebreaks `\n` with the new symbol that can be represented inline (`⏎` by default).

### `errorLens.scrollbarHackEnabled`

VSCode has a setting to completely disable horizontal scrollbar (better than this scrollbar hack and also will apply to any other extension that contributes inline messages):

```js
"editor.scrollbar.horizontal": "hidden",
```

When showing inline message decorations - VSCode also shows horizontal scrollbar that stays even after message is removed. This is a hack that makes inline message to be absolutely positioned `position:absolute;` to not show any scrollbars. It can make the [errorLens.padding](#errorlenspadding) look differently though.

<table>
<tbody>

<tr>
<th>false</th>
<td>

![](./img/scrollbar_hack_disabled.png)

</td>
</tr>

<tr>
<th>true</th>
<td>

![](./img/scrollbar_hack_enabled.png)

</td>

</tr>
</tbody>
</table>

### `errorLens.decorations`

Advanced control over decorations (only problem message & problem range).

<table>
<tbody>

<tr>
<td>

```js
"errorLens.decorations": {
    "errorMessage": {
        "textDecoration": ";background:linear-gradient(to right, #0088ff, #0a9c33);border-radius:0.3em;padding:0 0.5ch;",
        "color": "#fff",
        "fontWeight": "bold",
    },
},
```

</td>
</tr>

<tr>
<td>

![](./img/decoration_linear_gradient_2colors.png)

</td>
</tr>

</tbody>
</table>

### `errorLens.ignoreUntitled`

When enabled - will not show any decorations in files with the file scheme `untitled` (newly created unsaved files).

### `errorLens.ignoreDirty`

When enabled - will not show any decorations on Dirty (modified) files. Only when `"files.autoSave"` is disabled (anything except `"afterDelay"`).

### `errorLens.codeLensEnabled`

Show messages as insets between the lines.

<img width="300" src="./img/code_lens_enabled.png">

### `errorLens.codeLensLength`

Enforce minimum and maximum length of code lens messages.

### `errorLens.codeLensTemplate`

Almost the same as [errorLens.messageTemplate](#errorlensmessagetemplate), but for the Code Lens feature.

### `errorLens.codeLensOnClick`

Code Lens is clickable. This setting configures what happens when you click on Code Lens message:

- `none` => does nothing
- `showProblemsView` => Open VSCode built-in `Problems` view (runs `workbench.actions.view.problems`)
- `showQuickFix` => Open Quick Fix menu (runs `editor.action.quickFix`)
- `searchForProblem` => Search for problem message in your default browser (runs `errorLens.searchForProblem`)

---

# Miscellaneous

## Custom CSS

Status bar messages can be hard to read, so I'm using [Custom CSS](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) to change the `font-size` of the status bar items:

```css
/* ──── StatusBar ───────────────────────────────────────────── */
.statusbar {
    /* Monospace font and emoji fallback */
	font-family: Menlo, Monaco, Consolas, 'Droid Sans Mono', 'Courier New', monospace, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji' !important;
	font-size: 14px !important;/* 12px => 14px */
}

.monaco-workbench .part.statusbar > .items-container > .statusbar-item {
	max-width: 70vw !important;/* 40% => 70% Viewport width */
}

.monaco-workbench .part.statusbar > .items-container > .statusbar-item > :first-child {
	margin-left: 0 !important;/* Remove margin (fit more items) */
	margin-right: 0 !important;
}
/* ──────────────────────────────────────────────────────────── */

/* ──── Target only Error Lens status bar items ─────────────── */
/* "errorLens.statusBarMessageEnabled": true, */
#usernamehw\.errorlens\.errorLensMessage {
    font-size: 14px !important;
}

/* "errorLens.statusBarIconsEnabled": true, */
#usernamehw\.errorlens\.errorLensError {}
#usernamehw\.errorlens\.errorLensWarning {}
/* ──────────────────────────────────────────────────────────── */
```

<table>
<tbody>

<tr>
<td>

![](./img/customCSS_statusBar_before.png)

</td>
</tr>

<tr>
<td>

![](./img/customCSS_statusBar_after.png)

</td>

</tr>
</tbody>
</table>
