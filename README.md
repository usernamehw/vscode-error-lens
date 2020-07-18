ErrorLens turbo-charges language diagnostic features by making diagnostics stand out more prominently, highlighting
the entire line wherever a diagnostic is generated by the language and also prints the message inline.

![Demo image](https://raw.githubusercontent.com/usernamehw/vscode-error-lens/master/img/demo.png)

## Features

- Highlight lines containing diagnostics
- Append diagnostic as text to the end of the line
- Show icons in gutter
- Show message in status bar

## Settings

<details>

<summary> Table of contributed settings (prefix "errorLens."):</summary>

|Name|Default|Description|
| --- | --- |--- |
|fontSize|`""`|Font size of message (CSS units).|
|fontFamily|`""`|Font family of message. If the new font breaks layout - try to use smaller fontSize.|
|fontWeight|`"normal"`|Font weight of message.|
|fontStyleItalic|**`false`**|When enabled - shows message in italic.|
|margin|`"4ch"`|Distance between the end of the line and the message (CSS units).|
|padding|`""`|Padding of the message. Visible difference when `message` colors are set. [Issue #23](https://github.com/usernamehw/vscode-error-lens/issues/23). Example: `2px 1ch`.|
|borderRadius|`"3px"`|Border radius of the message. Visible difference when `message` colors are set. [Issue #23](https://github.com/usernamehw/vscode-error-lens/issues/23). Example: `"5px"`.|
|enabledDiagnosticLevels|**`["error", "warning", "info", "hint"]`**|Customize which diagnostic levels to highlight.|
|annotationPrefix|**`["ERROR: ", "WARNING: ", "INFO: ", "HINT: "]`**|Specify diagnostic message prefixes (when `addAnnotationTextPrefixes` is enabled). For example, emoji: ❗ ⚠ ℹ.|
|addAnnotationTextPrefixes|**`false`**|When enabled - prepends diagnostic severity ('ERROR:', 'WARNING:' etc) to the message. (Prefixes can be configured with `annotationPrefix` setting).|
|addNumberOfDiagnostics|**`false`**|When enabled - prepends number of diagnostics on the line. Like: `[1/2]`.|
|statusBarMessageEnabled|**`false`**|When enabled - shows message in status bar.|
|statusBarMessageType|`"activeLine"`|Pick what to show in Status Bar: closest message or only message for the active line. Possible values: `"activeLine"`, `"closestProblem"`. |
|statusBarColorsEnabled|**`false`**|When enabled - use message decoration foreground as color of Status Bar text.|
|exclude|**`[]`**|Specify messages that should not be highlighted (RegEx).|
|delay|**`0`**|**EXPERIMENTAL** Specify delay before showing problems.|
|onSave|**`false`**|When enabled - updates decorations only on document save.|
|gutterIconsEnabled|**`false`**|When enabled - shows gutter icons (In place of the debug breakpoint icon).|
|gutterIconsFollowCursorOverride|**`true`**|When enabled and `followCursor` setting is not `allLines`, then gutter icons would be rendered for all problems. But line decorations (background, message) only for active line."|
|gutterIconSize|`"100%"`|Change gutter icon size. Examples: `auto`, `contain`, `cover`, `50%`, `150%`|
|gutterIconSet|`"default"`|Customize gutter icon style. Possible values: `"default"`, `"defaultOutline"`, `"borderless"`, `"circle"`.|
|errorGutterIconPath|`""`|Set custom icons for gutter. Absolute path for error gutter icon.|
|warningGutterIconPath|`""`|Set custom icons for gutter. Absolute path for warning gutter icon.|
|infoGutterIconPath|`""`|Set custom icons for gutter. Absolute path for info gutter icon.|
|errorGutterIconColor|`"#e45454"`|Error color of the `circle` gutter icon set.|
|warningGutterIconColor|`"#ff942f"`|Warning color of the `circle` gutter icon set.|
|infoGutterIconColor|`"#00b7e4"`|Info color of the `circle` gutter icon set.|
|followCursor|`"allLines"`|Highlight only portion of the problems. Possible values: `"allLines"`, `"activeLine"`, `"closestProblem"`.|
|followCursorMore|**`0`**|Augments `followCursor`. Adds number of lines to top and bottom when `followCursor` is `activeLine`. Adds number of closest problems when `followCursor` is `closestProblem`|

</details>

## Commands

- `errorLens.toggle` Temporarily Enable/Disable ErrorLens.
- `errorLens.toggleError` Temporarily Enable/Disable Error level.
- `errorLens.toggleWarning` Temporarily Enable/Disable Warning level.
- `errorLens.toggleInfo` Temporarily Enable/Disable Info level.
- `errorLens.toggleHint` Temporarily Enable/Disable Hint level.
- `errorLens.copyProblemMessage` Copy problem message to clipboard (at the active line).

## Colors

Can be configured in `settings.json` (**`workbench.colorCustomizations`** section)

|Name|Light|Dark|
| --- | --- | --- |
|errorLens.errorBackground|`#e4545420`|`#e454541b`|
|errorLens.errorForeground|`#e45454` ![](https://placehold.it/15/e45454?text=+)|`#ff6464`|
|errorLens.errorMessageBackground|`#fff0`|`#fff0`|
|errorLens.warningBackground|`#ff942f20`|`#ff942f1b`|
|errorLens.warningForeground|`#ff942f` ![](https://placehold.it/15/ff942f?text=+)|`#fa973a`|
|errorLens.warningMessageBackground|`#fff0`|`#fff0`|
|errorLens.infoBackground|`#00b7e420`|`#00b7e420`|
|errorLens.infoForeground|`#00b7e4` ![](https://placehold.it/15/00b7e4?text=+)|`#00b7e4`|
|errorLens.infoMessageBackground|`#fff0`|`#fff0`|
|errorLens.hintBackground|`#17a2a220`|`#17a2a220`|
|errorLens.hintForeground|`#2faf64` ![](https://placehold.it/15/2faf64?text=+)|`#2faf64`|
|errorLens.hintMessageBackground|`#fff0`|`#fff0`|

> `#fff0` - is a completely transparent color.

## [Miscellaneous: `misc.md`](https://github.com/usernamehw/vscode-error-lens/blob/master/misc.md)
