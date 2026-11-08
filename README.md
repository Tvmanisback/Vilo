# Vilo for VuloChat

A userscript enhancement suite for [VuloChat](https://tvmanisback.github.io/VuloChat/).

## Install
1. Install a userscript manager such as [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).
2. Install [vilo.user.js](https://raw.githubusercontent.com/Tvmanisback/Vilo/main/vilo.user.js).
3. Open VuloChat and tap the floating **✦ Vilo** button.

## Plugins
24 plugin switches are included: timestamps, compact chat, quick copy, code copy, character and word counters, emoji row, hide avatars, hide typing, focus mode, collapse embeds, external link labels, jump to latest, draft backup, Enter-to-send, Markdown guide, image fit, reduce motion, message logger, local clock, message finder, theme manager, reply emphasis, readable text, and toolbar.

Some plugins depend on VuloChat's current DOM structure and may need selector updates if the site changes.

## Themes
Built-in presets: Violet Glow, Midnight, Emerald, Sunset, and Light. Import your own `.theme.css` from Vilo → Themes. Imported CSS remains in userscript-manager storage on your device.

## Message logger privacy
The logger is off by default. When enabled, it stores only message text found in currently rendered page elements, locally in your browser. It does not intercept network traffic, access hidden server data, or upload logs. Export or delete the archive from Vilo → Logger. Be thoughtful about other people's privacy and follow applicable rules before saving or sharing conversations.

Vilo is an independent userscript and is not an official VuloChat feature.
