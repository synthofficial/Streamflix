interface WatchlistItem {
    id : string;
    title : string;
    thumbnail : string;
    movieUrl? : string;
    cover : string;
    description : string;
    genres : string[];
    actors : string[];
    country : string[];
    episodes? : {
        id?: string;
        title?: string;
        number?: number;
        season?: number;
        description?: string;
        thumbnail?: string;
        url?: string;
        completed? : boolean;
        timestamp? : number;
    }[];
    rating : number;
    production : string;
    releaseDate : string;
    duration : string;
    timestamp? : number;
    finishTimestamp: number;
    completed? : boolean;
    timesWatched? : number;
    type : 'Movie' | 'Show' | 'Anime';
}