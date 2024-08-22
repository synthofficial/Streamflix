import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import TopCarousel from "./tabs/TopCarousel";
import TrendingMovies from "./tabs/TrendingMovies";
import TrendingShows from "./tabs/TrendingShows";
import TrendingAnime from "./tabs/TrendingAnime";
import discordRPCManager from '../../constants/DiscordRPC';
import { useVideoPlayer } from '../contexts/VideoPlayerContext'; // Make sure this path is correct
import Navbar from '../../components/Navbar';
import Watchlist from '../../components/Watchlist';
import { addToWatchingList, convertDurationToSeconds, getWatchingList, getWatchlist, isInWatchingList } from '../../modules/functions';
import ContinueWatching from './tabs/ContinueWatching';

const Homepage: React.FC = () => {
  const { setShowPlayer, setCurrentMedia, setCurrentEpisode, setCurrentUrl } = useVideoPlayer();
  const [selectedTab, setSelectedTab] = React.useState('home');

  const handlePlayClick = (media: Movie | Show | Anime, episodeData?: any, url?: string) => {
    setCurrentMedia(media);
    setCurrentEpisode(episodeData || null);
    setCurrentUrl(url || null);
    setShowPlayer(true);

    console.log(media, episodeData, url);
    
    //Add to Continue Watching
    if(!isInWatchingList(media.id as string)){
        addToWatchingList(
          {
            id: media.id as string,
            title: media.type !== "Anime" ? media.title! : media.title!.english!,
            movieUrl: media.type === "Movie" ? media.movieUrl : undefined,
            thumbnail: media.type !== "Anime" ? media.thumbnail! : media.cover!,
            cover: media.cover,
            description: media.description,
            genres: media.genres,
            actors: media.type !== "Anime" ? media.actors : [],
            country: media.type !== "Anime" ? media.country : [],
            rating: media.rating,
            production: media.production,
            releaseDate: media.releaseDate,
            duration: media.duration,
            finishTimestamp: convertDurationToSeconds(media.duration) as number,
            completed: false,
            timesWatched: 0,
            episodes: media.type !== "Movie" ? media.episodes : undefined,
            type: media.type
          }
        )
    }
    
  };

  discordRPCManager.setPresence({
    state: 'Looking for something to watch.',
    details: "In the homepage",
    startTimestamp: Date.now(),
  });

  return (
    <Box className="w-full h-full text-white overflow-y-auto">
      <Navbar selectedTab={''} onTabChange={(tab : string) => { setSelectedTab(tab) }}/>
      {selectedTab === 'home' && (
        <VStack spacing={8} align="stretch" className="p-8 overflow-x-hidden">
        <TopCarousel onPlayClick={handlePlayClick} />
        {getWatchingList().length > 0 && <ContinueWatching onPlayClick={handlePlayClick} />}
        <TrendingMovies onPlayClick={handlePlayClick} />
        <TrendingShows onPlayClick={handlePlayClick} />
        <TrendingAnime onPlayClick={handlePlayClick}/>
      </VStack>
      )}
      {
        selectedTab === 'watchlist' && <Watchlist onPlayClick={handlePlayClick} />
      }
    </Box>
  );
};

export default Homepage;