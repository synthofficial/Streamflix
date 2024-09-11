import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  Text,
  Flex,
  Box,
  Image,
  Badge,
  VStack,
  HStack,
  Icon,
  Tooltip,
  useColorModeValue,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
} from '@chakra-ui/react';
import { FaPlay, FaStar, FaClock, FaCalendar } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { addToWatchingList, convertDurationToSeconds, convertMinutesToHours, getWatchingList, getWatchlist, isInWatchingList } from '../../../modules/functions';
import { getEpisodeSource } from '../../../modules/api/Movies';
import { getAnimeSource } from '../../../modules/api/Anime';

interface Episode {
  id: string;
  title: string;
  number: number;
  description: string;
  thumbnail?: string;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: Movie | Show | Anime;
  onPlayClick: (media: Movie | Show | Anime, episodeData?: any, episodeUrl?: string) => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, media, onPlayClick }) => {
  console.log(media);
  if (!media) return null;
  const [selectedRange, setSelectedRange] = useState<number>(0);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [watchList, setWatchlist] = useState<WatchlistItem[]>(getWatchlist());
  const [episodes, setEpisodes] = useState<any[]>([]);
  const toast = useToast();

  const watchingList = getWatchingList();

  console.log(media);

  useEffect(() => {
    if (media.type !== 'Movie' && 'episodes' in media) {
      setEpisodes(media.episodes);
    }
  }, [media]);

  const isMovie = media.type === 'Movie';
  const isAnime = media.type === 'Anime';
  const isTVShow = media.type === 'Show';

  const createRanges = (numEpisodes: number, rangeSize: number) => {
    const ranges = [];
    for (let i = 0; i < numEpisodes; i += rangeSize) {
      ranges.push({ start: i + 1, end: Math.min(i + rangeSize, numEpisodes) });
    }
    console.log(ranges);
    return ranges;
  };


  const episodeRanges = useMemo(() => {
    if (isAnime) {
      return createRanges(media.episodes.length, 30);
    } else {
      return [];
    }
  }, [episodes, isAnime]);

  const filteredEpisodes = useMemo(() => {
    if (isTVShow) {
      return episodes.filter(ep => ep.season === selectedSeason);
    } else if (isAnime) {
      const start = selectedRange * 30;
      const end = start + 30;
      return episodes.slice(start, end);
    }
    return [];
  }, [episodes, selectedSeason, selectedRange, isTVShow, isAnime]);

  const seasons = useMemo(() => {
    if (isTVShow) {
      return [...new Set(episodes.map(ep => ep.season))];
    }
    return [];
  }, [episodes, isTVShow]);

  const handlePlayClick = async() => {
    if (media.type === 'Movie') {
      console.log("loading movie");
      onPlayClick(media, null, undefined);
    }
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
  }

  const handleEpisodeClick = async (episode: Episode) => {
    
    toast({
      title: "Fetching Episode URL...",
      description: "Please wait while we prepare your video.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    try {
      let source;
      if(isAnime){
        source = await getAnimeSource(episode.id);
      }
      if(isTVShow){
        console.log(`episode id: ${episode.id}, episode: ${episode.number} season: ${selectedSeason}`);
        source = await getEpisodeSource(episode.id, String(media.id));
        console.log(source);
      }
      if (source) {
        toast({
          title: "Ready to Play",
          description: "Enjoy your video!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onPlayClick(media, episode, source);
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
        onClose();
      } else {
        throw new Error("Failed to fetch episode URL");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch the episode. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="7xl" motionPreset="slideInTop">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="transparent" overflow="hidden" padding={8}>
        <ModalBody p={0}>
          <Flex height="80vh" direction={isMovie ? 'column' : 'row'}>
            <Box 
              width={isMovie ? "100%" : "65%"} 
              height={isMovie ? "100%" : "auto"} 
              position="relative" 
              overflow="hidden"
            >
              <Image
                src={media.cover}
                alt={isAnime ? media.title.english : media.title.toString()}
                objectFit="fill"
                w="100%"
                h="100%"
              />
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bgGradient="linear(to-t, blackAlpha.900, blackAlpha.700, transparent)"
                p={4}
                overflowY="auto"
              >
                <Flex direction="column" color="white">
                  <Text fontSize="2xl" fontWeight="bold" mb={1}>
                    {isAnime ? media.title.english : media.title}
                  </Text>
                  <HStack spacing={3} mb={2} flexWrap="wrap">
                    <Badge colorScheme="green" fontSize="xs">
                      {isMovie ? 'MOVIE' : isAnime ? 'ANIME' : 'TV SERIES'}
                    </Badge>
                    <HStack>
                      <Icon as={FaStar} color="yellow.400" boxSize={3} />
                      <Text fontSize="sm">{media.rating || "N/A"}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaCalendar} boxSize={3} />
                      <Text fontSize="sm">{media.releaseDate}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaClock} boxSize={3} />
                      <Text fontSize="sm">{convertMinutesToHours(media.duration)}</Text>
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" mb={2} noOfLines={3}>
                    {media.description}
                  </Text>
                  <Tooltip label={media.description} placement="top">
                    <Text fontSize="xs" color="gray.300" mb={2} cursor="pointer">
                      Read more
                    </Text>
                  </Tooltip>
                  <HStack spacing={3} mb={2}>
                    <Button
                      leftIcon={<FaPlay />}
                      colorScheme="brand"
                      size="sm"
                      borderRadius={"4px"}
                      onClick={() => isMovie ? handlePlayClick() : handleEpisodeClick(episodes[0])}
                    >
                      {watchingList.find((movie) => movie.id === media.id)?.timestamp! > 0 ? 'Continue Watching' : 'Watch Now'}
                    </Button>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="bold" fontSize="xs">Genres:</Text>
                      <Text fontSize="xs" noOfLines={2}>{media.genres.join(', ')}</Text>
                    </VStack>
                  </HStack>
                  <VStack align="flex-start" spacing={0}>
                    <Text fontWeight="bold" fontSize="xs">Produced by:</Text>
                    <Text fontSize="xs" noOfLines={2}>{media.production.replaceAll(',', ', ')}</Text>
                  </VStack>
                </Flex>
              </Box>
            </Box>
            {!isMovie && (
              <Box width="35%" bg="dark.100" borderLeft="1px solid" borderColor="dark.200">
                <Flex direction="column" height="100%">
                  <Flex justifyContent="space-between" alignItems="center" p={4} borderBottom="1px solid" borderColor="dark.200">
                    <Text fontSize="2xl" fontWeight="bold" color="white">
                      Episodes
                    </Text>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<IoIosArrowDown />}
                        bg="transparent"
                        color="white"
                        border="1px solid"
                        borderColor="brand.500"
                        _hover={{ bg: "whiteAlpha.200" }}
                        _active={{ bg: "whiteAlpha.300" }}
                      >
                        {isTVShow
                          ? `Season ${selectedSeason} (${episodes.filter((episode) => episode.season === selectedSeason).length + " Episodes"})`
                          : `Episodes ${episodeRanges[selectedRange]?.start}-${episodeRanges[selectedRange]?.end}`
                        }
                      </MenuButton>
                      <MenuList bg="dark.200" border="none" boxShadow="dark-lg">
                        {isTVShow
                          ? seasons.map((season) => (
                              <MenuItem
                                key={season}
                                onClick={() => setSelectedSeason(season)}
                                bg="transparent"
                                _hover={{ bg: "whiteAlpha.200" }}
                              >
                                Season {season} <span className="text-gray-400 ml-1">({episodes.filter((episode) => episode.season === season).length + " Episodes"})</span>
                              </MenuItem>
                            ))
                          : episodeRanges.map((range, index) => (
                              <MenuItem
                                key={index}
                                onClick={() => setSelectedRange(index)}
                                bg="transparent"
                                _hover={{ bg: "whiteAlpha.200" }}
                              >
                                Episodes {range.start}-{range.end}
                              </MenuItem>
                            ))
                        }
                      </MenuList>
                    </Menu>
                  </Flex>
                  <Box overflowY="auto" flex={1} css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'gray.500',
                      borderRadius: '24px',
                    },
                  }}>
                    {filteredEpisodes.map((episode, index) => {
                                    const watchedEpisode = watchingList.find((item) => item.id === media.id)?.episodes?.find((ep) => ep.id === episode.id);
                                    const watchedProgress = watchedEpisode ? watchedEpisode.timestamp : 0;
                                    const totalDuration = convertDurationToSeconds(episode.duration || media.duration);
                                    
                                    console.log(`Episode ${episode.number} progress:`, watchedProgress, 'out of', totalDuration);
                      return(
                        <Flex
                        key={episode.id}
                        p={4}
                        borderBottom="1px solid"
                        borderColor="dark.200"
                        _hover={{ bg: "whiteAlpha.100" }}
                        cursor="pointer"
                        onClick={() => handleEpisodeClick(episode)}
                      >
                        <Box position="relative" minWidth="160px" height="90px" mr={4}>
                          <Image
                            src={episode.image || episode.thumbnail.medium}
                            alt={episode.title}
                            objectFit="cover"
                            width="100%"
                            height="100%"
                            borderRadius="md"
                          />
                          <Progress
                                        position="absolute"
                                        bottom={1}
                                        left={0}
                                        right={0}
                                        colorScheme='brand'
                                        m={1}
                                        size={"sm"}
                                        borderRadius={"10px"}
                                        className='group-hover:opacity-0 transition-opacity duration-300'
                                        bg={"dark.300"}
                                        value={watchedProgress}
                                        max={convertDurationToSeconds(media.duration) as number}
                                    />
                          <Flex
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            alignItems="center"
                            justifyContent="center"
                            bg="blackAlpha.600"
                            opacity={0}
                            _hover={{ opacity: 1 }}
                            transition="opacity 0.2s"
                            borderRadius="md"
                          >
                            <Icon as={FaPlay} color="white" boxSize={6} />
                          </Flex>
                          <Box
                            position="absolute"
                            top={2}
                            left={2}
                            bg="blackAlpha.700"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            <Text fontSize="xs" fontWeight="bold" color="white">
                              {index + 1}
                            </Text>
                          </Box>
                        </Box>
                        <Flex direction="column" justifyContent="center" flex={1}>
                          <Text fontWeight="bold" color="white" mb={1}>
                            {episode.title}
                          </Text>
                          <Text fontSize="sm" color="gray.400" noOfLines={2}>
                            {episode.description.replace(/<\/?[^>]+(>|$)/g, "")}
                          </Text>
                        </Flex>
                      </Flex>
                      )
                    })}
                  </Box>
                </Flex>
              </Box>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MediaModal;