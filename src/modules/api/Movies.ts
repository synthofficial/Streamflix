import MovieHdWatch from "@consumet/extensions/dist/providers/movies/movidhdwatch";
import FlixHQ from "@consumet/extensions/dist/providers/movies/flixhq";
import { fetchEpisodeDetails, fetchTVSeriesDetails } from "./TVMaze";
import Goku from "@consumet/extensions/dist/providers/movies/goku";

import axios from "axios";
import { IMovieResult, ISearch } from "@consumet/extensions";

const api = new MovieHdWatch();
const flix = new FlixHQ();
const fmovies = new Goku();

interface FileData {
    file: string;
    type: string;
}

function getFileFromJson(jsonString: string): string | null {
    try {
        // Parse the JSON string into an object
        const data: FileData[] = JSON.parse(jsonString);

        // Check if the data array is not empty and return the 'file' property of the first element
        if (data.length > 0 && data[0].file) {
            return data[0].file;
        }

        // Return null if the 'file' property is not found or the array is empty
        return null;
    } catch (error) {
        // Handle JSON parsing errors
        console.error("Error parsing JSON:", error);
        return null;
    }
}

export const getMovieSource = async (episodeId: string, movieId: string) => {
    try {
        const servers = await api.fetchEpisodeServers(episodeId, movieId);

        if (servers.length > 0) {
            const url = servers.find((server) => server.url.includes("rabbitstream"))?.url;
            if (!url) {
                console.log("No rabbitstream URL found");
                return null;
            }
            const regex = /embed-4\/([a-zA-Z0-9_-]+)/;
            const match = url.match(regex);
            if (!match) {
                console.log("No match found in URL");
                return null;
            }
            const source = await axios.get(`https://api.fffapifree.cam/get-source?id=${match[1]}`);
            console.log(source);
            const fileUrl = getFileFromJson(source.data.data.sources);
            return fileUrl;
        }
        return null;
    } catch (error) {
        console.error("Error in getMovieSource:", error);
        return null;
    }
}

export const getEpisodeSource = async(episodeId : string, movieId : string) => {
    console.log(episodeId, movieId)
    
    try{
        const servers = await api.fetchEpisodeServers(episodeId, movieId);

        if (servers.length > 0) {
            const url = servers.find((server) => server.url.includes("rabbitstream"))?.url;
            if (!url) {
                console.log("No rabbitstream URL found");
                return null;
            }
            const regex = /embed-4\/([a-zA-Z0-9_-]+)/;
            const match = url.match(regex);
            if (!match) {
                console.log("No match found in URL");
                return null;
            }
            const source = await axios.get(`https://api.fffapifree.cam/get-source?id=${match[1]}`);
            const fileUrl = getFileFromJson(source.data.data.sources);
            return fileUrl;
        }
        return null;
    }catch(e){
        console.log(e)
        return null;
    }

}

export const searchMedia = async (query: string): Promise<SearchResult[]> => {
    const results = await api.search(query, 1).then(async(res) => {
        const data = await Promise.all(
            res.results.map(async(result: IMovieResult) => {
                const data = await api.fetchMediaInfo(result.id);
                let type: 'Movie' | 'Show' | 'Anime';
                if (result.type === 'Movie') {
                    type = 'Movie';
                } else if (result.type === 'TV Series') {
                    type = 'Show';
                } else {
                    type = 'Anime';
                }
                
                let episodes : any = [];

                if(type == "Show"){
                    const tmdbData = await fetchTVSeriesDetails(data.title as string);
                    const epData = await fetchEpisodeDetails(tmdbData.id);
    
                    episodes = await Promise.all(
                    await epData.map(async(episode : any) => {
                        if(!episode.id) return;
                        const absoluteEpisodeId = data.episodes!.find((episodeData : any) => episodeData.number === episode.number && episodeData.season === episode.season);
                        return {
                            id: absoluteEpisodeId?.id,
                            title: episode.name,
                            number: episode.number,
                            season: episode.season,
                            thumbnail: episode.image,
                            description: episode.summary, 
                        }
                    })
                )
                }
    
                return {
                    id: type === 'Movie' ? result.id : type === 'Show' ? result.id : result.malId as string,
                    title: result.title as string,
                    type: type,  // Use the previously defined variable
                    thumbnail: result.image as string,
                    releaseDate: data.releaseDate as string,
                    cover: data.cover as string,
                    movieUrl: type === 'Movie' ? await getMovieSource(data.episodes![0].id, result.id) : undefined,
                    description: data.description as string,
                    genres: data.genres as string[],
                    actors: data.casts as string[],
                    country: data.country as string[],
                    duration: data.duration as string,
                    rating: data.rating as number ?? "N/A",
                    production: data.production as string,
                    episodes: episodes
                };
            })
        );
        return data;
    });
    return results;
};

export const getMediaInfo = async (id: string) => {
    const data = await api.fetchMediaInfo(id);
    if(data){
        switch(data.type){
            case "Movie":
                return{
                    id: data.id,
                    title: data.title as string,
                    type: "Movie",  // Use the previously defined variable
                    thumbnail: data.image as string,
                    releaseDate: data.releaseDate as string,
                    cover: data.cover as string,
                    movieUrl: await getMovieSource(data.episodes![0].id, data.id),
                    description: data.description as string,
                    genres: data.genres as string[],
                    actors: data.casts as string[],
                    country: data.country as string[],
                    duration: data.duration as string,
                    rating: data.rating as number ?? "N/A",
                    production: data.production as string,
                }
            case "TV Series":

                let episodes : any = [];

                const tmdbData = await fetchTVSeriesDetails(data.title as string);
                const epData = await fetchEpisodeDetails(tmdbData.id);

                episodes = await Promise.all(
                await epData.map(async(episode : any) => {
                    if(!episode.id) return;
                    const absoluteEpisodeId = data.episodes!.find((episodeData : any) => episodeData.number === episode.number && episodeData.season === episode.season);
                    return {
                        id: absoluteEpisodeId?.id,
                        title: episode.name,
                        number: episode.number,
                        season: episode.season,
                        thumbnail: episode.image,
                        description: episode.summary.replaceAll("<p>", ""), 
                    }
                }))

                return{
                    id: data.id,
                    title: data.title as string,
                    type: "Show",  // Use the previously defined variable
                    thumbnail: data.image as string,
                    releaseDate: data.releaseDate as string,
                    cover: data.cover as string,
                    description: data.description as string,
                    genres: data.genres as string[],
                    actors: data.casts as string[],
                    country: data.country as string[],
                    duration: data.duration as string,
                    rating: data.rating as number ?? "N/A",
                    production: data.production as string,
                    episodes: episodes
                }
        }
    }
    return data;
};

export const getTopTrendingMovie = async () : Promise<Movie[]> => {
    const movies = await api.fetchTrendingMovies();

    const data : Movie[] = [];
    
    const movieData = await api.fetchMediaInfo(movies[0].id);
    const movieUrl = await getMovieSource(movieData.episodes![0].id, movies[0].id);

    data.push({
        id: movies[0].id as string,
        title: movieData.title as string,
        movieUrl : movieUrl as unknown as string,
        cover : movieData.cover as string,
        description : movieData.description as string,
        genres : movieData.genres as string[],
        actors : movieData.casts as string[],
        country : movieData.country as string[],
        duration : movieData.duration as string,
        rating : movieData.rating as number,
        production: movieData.production as string,
        releaseDate: movieData.releaseDate as string,
        type: "Movie",
        thumbnail: movieData.image as string,
    });

    return data;
}

export const getTrendingMovies = async () : Promise<Movie[]> => {
    const movies = await api.fetchTrendingMovies();

    const data : Movie[] = await Promise.all(
        movies.map(async (movie) => {
            const movieData = await api.fetchMediaInfo(movie.id);
            const movieUrl = await getMovieSource(movieData.episodes![0].id, movie.id);
    
            return {
                id: movie.id as string,
                title: movieData.title as string,
                movieUrl : movieUrl as unknown as string,
                cover : movieData.cover as string,
                description : movieData.description as string,
                genres : movieData.genres as string[],
                actors : movieData.actors as string[],
                country : movieData.country as string[],
                duration : movieData.duration as string,
                rating : movieData.rating as number,
                production: movieData.production as string,
                releaseDate: movieData.releaseDate as string,
                type: "Movie",
                thumbnail: movieData.image as string,
            }
        })
    );

    return data;

}

export const getTopTrendingShow = async () : Promise<Show[]> => {
    const shows = await api.fetchTrendingTvShows();

    const data : Show[] = [];

    const showData = await api.fetchMediaInfo(shows[0].id);
    const tmdbData = await fetchTVSeriesDetails(showData.title as string);
    const showEpisodeData = await fetchEpisodeDetails(tmdbData.id);

    const episodes = await Promise.all(
        await showEpisodeData.map(async(episode : any) => {
            const absoluteEpisodeId = showData.episodes!.find((episodeData : any) => episodeData.number === episode.number)
            return {
                id: absoluteEpisodeId?.id,
                title: episode.name,
                number: episode.number,
                season: episode.season,
                thumbnail: episode.image,
                description: episode.summary,
            }
        })
    )

    data.push({
        id: shows[0].id,
        title: showData.title as string,
        movieUrl : "",
        cover : showData.cover as string,
        description : showData.description as string,
        genres : showData.genres as string[],
        actors : showData.actors as string[],
        country : showData.country as string[],
        duration : showData.duration as string,
        rating : showData.rating as number,
        production: showData.production as string,
        releaseDate: showData.releaseDate as string,
        type: "Show",
        thumbnail: showData.image as string,
        totalEpisodes: showData.episodes?.length as number,
        episodes: episodes,
    });

    return data;
}

export const getTrendingShows = async (): Promise<Show[]> => {
    const shows = await api.fetchTrendingTvShows();
    const data: Show[] = await Promise.all(
        shows.map(async (show) => {
            const showData = await api.fetchMediaInfo(show.id);
            const tmdbData = await fetchTVSeriesDetails(show.title as string);
            const showEpisodeData = await fetchEpisodeDetails(tmdbData.id);
            const episodes = (await Promise.all(
                showEpisodeData.map(async (episode: any) => {
                    if (!episode.summary) {
                        return null; // Return null for episodes without airtime
                    }
                    const absoluteEpisodeId = showData.episodes!.find((episodeData: any) => episodeData.number === episode.number);
                    return {
                        id: absoluteEpisodeId?.id,
                        title: episode.name,
                        number: episode.number,
                        season: episode.season,
                        thumbnail: episode.image,
                        description: episode.summary.replace("<p>", "").replace("</p>", ""),
                    };
                })
            )).filter(episode => episode !== null); // Filter out null episodes

            return {
                id: showData.id as string,
                title: showData.title as string,
                movieUrl: showData.url as string,
                cover: showData.cover as string,
                description: showData.description as string,
                genres: showData.genres as string[],
                actors: showData.casts as string[],
                country: showData.country as string[],
                duration: showData.duration as string,
                rating: showData.rating as number,
                production: showData.production as string,
                releaseDate: showData.releaseDate as string,
                type: "Show",
                thumbnail: showData.image as string,
                totalEpisodes: episodes.length,
                episodes: episodes
            };
        })
    );
    return data;
};