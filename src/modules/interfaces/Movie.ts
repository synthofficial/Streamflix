interface Movie {
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
    type : "Movie";
    thumbnail : string;
    episodes?: [];
}