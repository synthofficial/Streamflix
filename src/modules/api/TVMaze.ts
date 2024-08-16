import { TVMAZE_BASE_URL, TVMAZE_API_KEY } from "../../constants/API";
import axios from 'axios';


export const fetchTVSeriesDetails = async (showTitle : string) => {
        try {
            const response = await axios.get(`${TVMAZE_BASE_URL}/singlesearch/shows?q=${showTitle}`, {
                params: {
                    api_key: TVMAZE_API_KEY,
                    language: 'en-US',
                },
            });
            return response.data; // Return movie details
        } catch (error) {
            console.error('Error fetching movie details:', error);
            throw error; // Propagate the error
        }
    };

export const fetchEpisodeDetails = async(showId : number) => {
    try{
        const response = await axios.get(`${TVMAZE_BASE_URL}/shows/${showId}/episodes`, {
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TVMAZE_API_KEY}`,
        }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Episode details:', error);
    }
}