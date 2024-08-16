interface Show {
    id : string;
    title: string;
    movieUrl : string;
    cover : string;
    description : string;
    genres : string[];
    actors : string[];
    country : string[];
    duration : string;
    rating : number;
    production : string;
    releaseDate : string;
    type : "Show";
    thumbnail : string;
    totalEpisodes : number;
    episodes: {
        id?: string;
        title?: string;
        number?: number;
        season?: number;
        description?: string;
        thumbnail?: string;
        url?: string;
    } []
}