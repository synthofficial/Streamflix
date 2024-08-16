export const fetchAnimeOrShowById = async (mediaId : string) => {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          episodes
          description
          chapters
          volumes
          streamingEpisodes {
            title
            thumbnail
            url
          }
          coverImage {
            large
            medium
          }
          averageScore
          genres
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
        }
      }
    `;
  
    const variables = {
      id: mediaId,  // The ID of the media (anime/show) you want to fetch
    };
  
    const url = 'https://graphql.anilist.co';
  
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    };
  
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      return data.data.Media; // Access the 'Media' field to get details
    } catch (error) {
      console.error('Error fetching anime or show data:', error);
      throw error;
    }
  };
  