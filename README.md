# Icon Library, version 1.3.2: (December 13, 2022)
This is WEB application based on Apps from Gurtam (http://apps.wialon.com).

**This is a legacy app: it is no longer developed or maintained. The code is published as is, without support.**

## Description
Icon Library allows top accounts to upload custom icons (PNG, JPG, GIF, SVG) for units, unit groups and
geofences. The icons are kept in the file storage of the account, so they are available both in the app
and in the monitoring system. An icon from the library can be assigned to several objects at once: choose
the icon, select the objects in the list (it can be searched by name, geofences can also be filtered by
resource) and apply. When an icon is deleted from the library, it is also reset on the objects that used it.

## License
[The MIT License](LICENSE-MIT)

## Requirements
 * Browser: a current version of Google Chrome, Firefox, Safari or Edge
 * Language: en, br, cs, es, fi, fr, pl, pt, ru, uk
 * Components: SDK
 * URL params: Active SID, Base URL, Host URL, Language, Current user

## Quick start
Apps activation through the management system: https://help.wialon.com/en/wialon-hosting/user-guide/management-system/apps  
Working with applications in the GPS tracking system: https://help.wialon.com/en/wialon-hosting/user-guide/monitoring-system/apps

## Installation
The repository contains the app in the form it is hosted in. Put the files on a web server and open `index.html` with the URL params listed above, for example
`index.html?sid=<Active SID>&baseUrl=https://hst-api.wialon.com&user=<Current user>&lang=en`.

 * Third-party libraries are in `bower_components/` (only the files the app uses).
