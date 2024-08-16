<div align="center">
    <h3>Streamflix</h3>
    [![](https://dcbadge.limes.pink/api/server/dpsjsrDjnV)](https://discord.gg/dpsjsrDjnV)
</div>

## About the project
I got tired of trying to watch stuff and constantly met with ads, so I made this program to start my journey in various tools.

<details>
    <summary>Table of Contents</summary>
    <ol>
        <li>
            <a href="#about-the-project">About the Project</a>
            <ul>
                <li><a href="#built-with">Built with</a></li>
            </ul>
        </li>
        <li>
            <a href="#getting-started">
                <ul>
                    <li><a href="#standard-install">Standard Install</a></li>
                    <li><a href="#developer-install">Developer Install</a></li>
                </ul>
            </a>
            <a href="#roadmap">Roadmap</a>
        </li>
    </ol>
</details>

## Built with
[![Tools](https://skillicons.dev/icons?i=tailwind,ts,react,electron)](https://skillicons.dev)

## Getting started

### Standard Install

To install this app and get started, just go into the Releases section and download the installer.

### Developer install

1. Clone the repo
```sh
git clone https://github.com/synthofficial/streamflix
```
2. Install NPM packages
```sh
npm i
```
3. Create a new file in **src/constants/API.ts** and fill with the below
```sh
export const TVMAZE_API_KEY = 'YOUR_TVMAZE_API';
export const TVMAZE_BASE_URL = 'https://api.tvmaze.com';
export const ANIME_BASE_URL = 'https://api.ani.zip/mappings?anilist_id=';
```
4. Run the program

**npm**
```sh
npm start
```
**bun**
```sh
bun start
```
**yarn**
```sh
yarn start
```

## Roadmap

- [x] Implement movies, shows, anime
- [x] Implement a custom video player
- [x] Implement basic user settings
- [x] Implement custom color theme
- [ ] Implement a login/register system to track watchlist, favourites etc.
- [ ] Add subtitle support
- [ ] Implement a watch together system
- [ ] Clean up code
