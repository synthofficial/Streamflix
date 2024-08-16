import Zoro from "@consumet/extensions/dist/providers/anime/zoro";
import Gogoanime from "@consumet/extensions/dist/providers/anime/gogoanime";
import Anilist from "@consumet/extensions/dist/providers/meta/anilist";
import { ITitle } from "@consumet/extensions";
import { fetchAnimeOrShowById } from "./Anilist";
import { ANIME_BASE_URL } from "../../constants/API";

const api = new Anilist();
const sources = new Gogoanime();

export const getAnimeSource = async (episodeId: string) => {
    console.log("lets get source for episode: " + episodeId);
    const servers = await api.fetchEpisodeSources(String(episodeId));

    if (servers.sources.length > 0) {
        return servers.sources.find((source) => source.quality === "1080p" || source.quality === "720p")!.url;
    }
}
export const fetchEpisodeInfo = async (id: string) => {
    const response = await fetch(ANIME_BASE_URL + id);
    const data = await response.json();
    return data;
  }
  

  export const getTrendingAnime = async(): Promise<Anime[]> => {
    // Fetch popular anime
    const animeList = (await api.fetchPopularAnime(1, 20)).results;
    
    // Process each anime and fetch detailed information
    const data: Anime[] = await Promise.all(
        animeList.map(async (anime) => {
            // Fetch basic anime data
            const animeData = await api.fetchAnimeInfo(anime.id);
            console.log(animeData)
            // Fetch detailed episode information
            const anilistData = await fetchEpisodeInfo(anime.id);
            // Extract the title object
            const title: ITitle = animeData.title as ITitle;

            // Combine episode data from both sources
            const combinedEpisodes = animeData.episodes?.map((ep: any, index: number) => {
                const anilistEp = anilistData.episodes[index + 1];
                return {
                    id: ep.id,
                    absoluteEpisodeNumber: index,
                    number: ep.number,
                    title: anilistEp?.title?.en,
                    description: anilistEp?.overview,
                    image: anilistEp?.image || '',
                    releaseDate: anilistEp?.airDate || '',
                };
            }) || [];

            // Return an object conforming to the Anime type
            return {
                title: {
                    english: title.english as string,
                },
                episodes: combinedEpisodes,
                id: animeData.id as string,
                production: animeData.studios![0] as string,
                genres: animeData.genres as string[],
                description: animeData.description?.replaceAll("<br>", "").replaceAll("</br>", "") as string,
                duration: `${animeData.duration} min`,
                totalEpisodes: animeData.totalEpisodes as number,
                hasSub: animeData.hasSub as boolean,
                hasDub: animeData.hasDub as boolean,
                isAdult: animeData.isAdult as boolean,
                season: animeData.season as string,
                cover: animeData.cover as string,
                trailer: animeData.trailer?.site as string,
                releaseDate: `${animeData.startDate?.year}-${animeData.startDate?.month}-${animeData.startDate?.day}`,
                endDate: `${animeData.endDate?.year}-${animeData.endDate?.month}-${animeData.endDate?.day}`,
                thumbnail: animeData.image as string,
                rating: animeData.rating as number,
                status: animeData.status as string,
                type: "Anime",
            };
        })
    );
    return data;
}
