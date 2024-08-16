interface SearchResult {
    id: string;
    title: string;
    type: 'Movie' | 'Show' | 'Anime';
    thumbnail: string;
    releaseDate : string;
    cover : string;
    movieUrl: string | null | undefined;
    description : string;
    genres : string[];
    actors : string[];
    country : string[];
    duration : string;
    rating : number;
    production: string;
    episodes?: {
        id?: string;
        title?: string;
        number?: number;
        season?: number;
        description?: string;
        thumbnail?: string;
    }[]
}