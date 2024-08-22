import { useEffect, useState } from "react";
import { getTrendingShows } from "../../../modules/api/Movies";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Image,
  ModalOverlay,
  Skeleton,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  TableContainer,
  Tbody,
  Tr,
  Td,
  Table,
  Box,
  AspectRatio,
  SkeletonText,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { FaCalendar, FaCheck, FaClock, FaPlay, FaPlus, FaStar, FaTv } from "react-icons/fa6";
import { MdOutlineNoAdultContent } from "react-icons/md";
import { getTrendingAnime } from "../../../modules/api/Anime";
import { addToWatchlist, convertDurationToSeconds, convertMinutesToHours, isInWatchlist, removeFromWatchlist } from "../../../modules/functions";
import { IoIosArrowDown } from "react-icons/io";
import MediaModal from "../modals/MediaModal";

interface Props {
  onPlayClick: (media: Anime, episodeData?: any, episodeUrl?: string) => void;
}

const TrendingAnime : React.FC<Props> = ({ onPlayClick }) => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Anime | null>(null);
  const [selectedRange, setSelectedRange] = useState<number>(0); // 0 index for first range
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [watchlistStatus, setWatchlistStatus] = useState<{[key: string]: boolean}>({});

  const toast = useToast();

  useEffect(() => {
    const loadTrendingAnime = async () => {
      try {
        const anime = await getTrendingAnime();
        console.log(anime);
        setTrendingAnime(anime);
        const initialStatus = trendingAnime.reduce((acc, movie) => {
          acc[movie.id] = isInWatchlist(movie.id as string);
          return acc;
      }, {} as {[key: string]: boolean});
      setWatchlistStatus(initialStatus);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading trending anime:", error);
      }
    };

    loadTrendingAnime();
  }, []);

  const handleOpenModal = (media: Anime) => {
    setSelectedMedia(media);
    console.log(media);
    onOpen();
  };

  const handlePlayClick = (selectedMedia?: any, episode?: any, episodeUrl?: any) => {
    onClose();
    console.log(episodeUrl);
    if (selectedMedia) {
      onPlayClick(selectedMedia, episode, episodeUrl);
    }
  }

  const handleCloseModal = () => {
    setSelectedMedia(null);
    onClose();
  };

  const handleWatchlistClick = async (event: React.MouseEvent, movie: Anime) => {
    event.stopPropagation();
    const newStatus = !watchlistStatus[movie.id];
    if (newStatus) {
        addToWatchlist({
            id: movie.id as string,
            title: movie.title.english as string,
            thumbnail: movie.thumbnail,
            genres: movie.genres,
            actors: [],
            country: [],
            cover : movie.cover,
            rating: movie.rating,
            production: movie.production,
            releaseDate: movie.releaseDate,
            description: movie.description,
            type: movie.type,
            finishTimestamp: convertDurationToSeconds(movie.duration) as number,
            duration: convertMinutesToHours(movie.duration) as string,
            completed: false,
            timesWatched: 0
        });
        toast({
            title: "Added to watchlist",
            status: "success",
            duration: 2000,
            isClosable: true
        });
    } else {
        removeFromWatchlist(movie.id as string);
        toast({
            title: "Removed from watchlist",
            status: "success",
            duration: 2000,
            isClosable: true
        });
    }
    setWatchlistStatus(prev => ({...prev, [movie.id]: newStatus}));
};

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 9.5,
    slidesToScroll: 9.5,
    responsive: [
        {
            breakpoint: 1536,
            settings: {
                slidesToShow: 6,
                slidesToScroll: 6,
            }
        },
        {
            breakpoint: 1280,
            settings: {
                slidesToShow: 5,
                slidesToScroll: 5,
            }
        },
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            }
        }
    ]
};

  const createRanges = (numEpisodes: number, rangeSize: number) => {
    const ranges = [];
    for (let i = 0; i < numEpisodes; i += rangeSize) {
      ranges.push({ start: i + 1, end: Math.min(i + rangeSize, numEpisodes) });
    }
    return ranges;
  };

  const filteredEpisodes = selectedMedia?.episodes
    .filter((episode) => !episode.number.toString().includes("S")) || [];
  const ranges = createRanges(filteredEpisodes.length, 30);
  const currentRangeEpisodes = filteredEpisodes.slice(
    selectedRange * 30,
    (selectedRange + 1) * 30
  );

  const renderSkeletons = () => {
    return Array(10).fill(0).map((_, index) => (
        <Box key={index} p={2}>
            <Box className="relative">
                <AspectRatio ratio={2/3} maxH="360px" maxW="240px">
                    <Skeleton height="100%" width="100%" borderRadius="lg" />
                </AspectRatio>
                <Box 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    p={2}
                >
                    <SkeletonText noOfLines={2} spacing='4' skeletonHeight='2' width="80%" />
                    <Box className="flex flex-wrap gap-1 items-center justify-center mt-2">
                        <Skeleton height="20px" width="50px" />
                        <Skeleton height="20px" width="50px" />
                        <Skeleton height="20px" width="50px" />
                    </Box>
                </Box>
            </Box>
        </Box>
    ));
};

  return (
    <div className="text-white">
      <Text className="text-white text-3xl font-semibold mb-2">
        Trending Anime
      </Text>
      <Slider {...settings}>
        {isLoading ? renderSkeletons() : (
                    trendingAnime.map((show) => (
                      <div
                        key={show.title.english}
                        className="p-2"
                        onClick={() => handleOpenModal(show)}
                      >
                        <div className="relative group">
                          <div className="relative overflow-hidden rounded-lg cursor-pointer group-hover:scale-105 transition-transform duration-300">
                          <AspectRatio ratio={2/3} maxH="360px" maxW="240px">
                                    <Box
                                        backgroundImage={`url(${show.thumbnail})`}
                                        backgroundSize="cover"
                                        backgroundPosition="center"
                                        className="rounded-lg transition-all duration-300 group-hover:blur-sm"
                                    />
                                </AspectRatio>
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-black/30">
                            <IconButton
                                        aria-label="Add to Watchlist"
                                        icon={isInWatchlist(show.id as string) ? <FaCheck /> : <FaPlus />}
                                        onClick={(e) => handleWatchlistClick(e, show)}
                                        _hover={{ bg: "gray.200"}}
                                        zIndex={10}
                                        bg={"white"}
                                        color="black"
                                        position="absolute"
                                        top={2}
                                        right={3}
                                    />
                              <Text
                                className={`text-white font-semibold ${
                                  show.title.english!.length > 25
                                    ? "text-xs"
                                    : show.title.english!.length > 10
                                    ? "text-sm"
                                    : "text-md"
                                }`}
                              >
                                {show.title.english!.length > 25
                                  ? show.title.english!.substring(0, 25) + "..."
                                  : show.title.english}
                              </Text>
                              <div className="flex flex-wrap gap-1 items-center justify-center mt-2 p-2">
                                <Badge variant="subtle" colorScheme="yellow">
                                  <div className="flex flex-row gap-1 items-center">
                                    <FaStar />
                                    {isNaN(show.rating) ? "N/A" : `${show.rating}%`}
                                  </div>
                                </Badge>
                                <Badge variant="subtle" colorScheme="blue">
                                  <div className="flex flex-row gap-1 items-center">
                                    <FaCalendar />
                                    {show.releaseDate}
                                  </div>
                                </Badge>
                                <Badge variant="subtle" colorScheme="green">
                                  <div className="flex flex-row gap-1 items-center">
                                    <FaClock />
                                    {show.duration}
                                  </div>
                                </Badge>
                                <Badge variant="subtle" colorScheme="orange">
                                  <div className="flex flex-row gap-1 items-center">
                                    <FaTv />
                                    {show.totalEpisodes.toLocaleString("en-US")} Episodes
                                  </div>
                                </Badge>
                                {show.isAdult ? (
                                  <Badge variant="subtle" colorScheme="red">
                                    <div className="flex flex-row gap-1 items-center">
                                      <MdOutlineNoAdultContent />
                                      Adult
                                    </div>
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
        )}
      </Slider>

      <MediaModal
        isOpen={!!selectedMedia}
        onClose={handleCloseModal}
        media={selectedMedia!}
        onPlayClick={handlePlayClick}
        /> 
    </div>
  );
};

export default TrendingAnime;
