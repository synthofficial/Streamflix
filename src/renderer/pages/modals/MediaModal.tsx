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
} from '@chakra-ui/react';
import { FaPlay, FaStar, FaClock, FaCalendar } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { convertMinutesToHours } from '../../../modules/functions';
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
  if (!media) return null;
  const [selectedRange, setSelectedRange] = useState<number>(0);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const toast = useToast();

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



  const bgColor = useColorModeValue('#18181b', 'gray.900');
  const textColor = useColorModeValue('gray.100', 'gray.50');
  const hoverBgColor = useColorModeValue('#27272a', 'gray.800');

  const handlePlayClick = async() => {
    if (media.type === 'Movie') {
      console.log("loading movie");
      onPlayClick(media, null, undefined);
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
      let source //= await getEpisodeSource(episode.id, String(media.id));
      if(isAnime){
        source = await getAnimeSource(episode.id);
      }
      if(isTVShow){
        source = await getEpisodeSource(episode.id, String(media.id));
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
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" motionPreset="slideInBottom">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="transparent" overflow="hidden">
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
                objectFit="cover"
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
                      onClick={() => isMovie ? handlePlayClick() : handleEpisodeClick(episodes[0])}
                    >
                      Play
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
              <Box width="35%" p={4} overflowY="auto" bg={bgColor} borderLeft="1px solid" borderColor="gray.700">
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                    Episodes
                  </Text>
                  <Menu>
                    <MenuButton
                    zIndex={9999}
                      as={Button}
                      rightIcon={<IoIosArrowDown />}
                      bg={"#27272a"}
                      color={"white"}
                      border={"1px solid"}
                      borderColor={"brand.500"}
                      _hover={{ background: "#3f3f46", borderColor: "brand.500" }}
                      _active={{ background: "#27272a" }}
                      _focus={{ background: "#18181b" }}
                    >
                      {isTVShow 
                        ? `Season ${selectedSeason}`
                        : `Episodes ${episodeRanges[selectedRange]?.start}-${episodeRanges[selectedRange]?.end}`
                      }
                    </MenuButton>
                    <MenuList bg={"#27272a"} border={"#3f3f46 1px solid"} zIndex={9999}>
                      {isTVShow
                        ? seasons.map((season) => (
                            <MenuItem
                              key={season}
                              onClick={() => setSelectedSeason(season)}
                              bg={"#27272a"}
                              _hover={{ background: "#3f3f46" }}
                            >
                              Season {season}
                            </MenuItem>
                          ))
                        : episodeRanges.map((range, index) => (
                            <MenuItem
                              key={index}
                              onClick={() => setSelectedRange(index)}
                              bg={"#27272a"}
                              _hover={{ background: "#3f3f46" }}
                            >
                              Episodes {range.start}-{range.end}
                            </MenuItem>
                          ))
                      }
                    </MenuList>
                  </Menu>
                </Flex>
                <VStack spacing={2} align="stretch">
                  {filteredEpisodes.map((episode, index) => (
                    <Box 
                      key={episode.id}
                      p={3}
                      borderRadius="md"
                      transition="all 0.2s"
                      _hover={{ bg: hoverBgColor }}
                      cursor="pointer"
                      onClick={() => handleEpisodeClick(episode)}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3} width="90%">
                          <Text fontWeight="bold" color="gray.400" width="10%">
                            {isTVShow ? episode.number : selectedRange * 30 + index + 1}
                          </Text>
                          <VStack align="start" spacing={0} width="90%">
                            <Text fontWeight="semibold" color={textColor}>
                              {episode.title}
                            </Text>
                            <Text fontSize="sm" color="gray.400" noOfLines={2}>
                              {episode.description}
                            </Text>
                          </VStack>
                        </HStack>
                        <Icon as={FaPlay} color="brand.500" boxSize={4} />
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MediaModal;