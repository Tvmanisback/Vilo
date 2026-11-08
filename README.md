# Vilo for VuloChat

Vilo is a userscript enhancement suite for [VuloChat](https://tvmanisback.github.io/VuloChat/). Version 2 adds a **Vilo tab inside VuloChat's native User Settings** navigation.

## Install

1. Install a userscript manager that supports the GM storage API.
2. Install [vilo.user.js](https://raw.githubusercontent.com/Tvmanisback/Vilo/main/vilo.user.js).
3. Refresh VuloChat and open **User Settings → Vilo**.

## 21 working plugin options

- Message timestamps (keeps VuloChat's native message times visible)
- Compact messages
- Quick copy for loaded messages
- Code block copy
- Character counter
- Word counter
- Quick emoji bar
- Hide message avatars
- Focus mode
- Collapse message images/media
- External link labels
- Jump to latest
- Draft backup
- Enter to send (desktop only; VuloChat's native behavior is retained by default)
- Markdown helper
- Image fit
- Reduce motion
- Local message logger
- Search currently loaded messages
- Reply highlighting
- Readable text spacing

Plugins are enabled individually in **Settings → Vilo → Plugins**. Changes apply immediately and are saved in the userscript manager's local storage.

## Themes

Built-in themes: Violet Glow, Midnight, Emerald, Sunset, and Light. They update VuloChat's actual `--vulo-*` color variables so the whole app changes, not only the Vilo panel.

To use a custom theme, open **Settings → Vilo → Themes** and import a `.theme.css` file. Custom CSS is saved locally and applied in the current browser.

## Message logger

The logger is off by default. When enabled, it saves text from message elements currently rendered in the open chat view, on this device only. It does not request hidden history, intercept network traffic, or upload messages. You can export the local archive as JSON or delete it in **Settings → Vilo → Logger**. Be thoughtful about other people's privacy before exporting or sharing an archive.

## Compatibility

Vilo targets VuloChat's current web app structure (message articles, native settings dialog, and message composer). If VuloChat changes those components, selectors may need an update. The userscript does not modify VuloChat's backend or grant additional account permissions.

Vilo is an independent community userscript and is not an official VuloChat feature.
