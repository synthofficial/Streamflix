interface Anime {
    id : number | string;
    genres : string[];
    description : string;
    totalEpisodes : number;
    title : {
        english?: string;
        native?: string;
        romaji?: string;
    };
    episodes: {
        id : string;
        absoluteEpisodeNumber: number;
        number: number;
        title?: string;
        description?: string;
        image?: string;
        releaseDate?: string;
    }[];
    duration : string;
    production: string;
    hasSub? : boolean;
    hasDub? : boolean;
    isAdult? : boolean;
    season? : string;
    cover : string;
    trailer : string;
    releaseDate : string;
    endDate : string;
    thumbnail : string;
    rating : number;
    status : string;
    type : "Anime";
}