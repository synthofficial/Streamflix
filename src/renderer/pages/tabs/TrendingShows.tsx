import { useEffect, useState } from "react";
import { getEpisodeSource, getTrendingShows } from "../../../modules/api/Movies";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AspectRatio, Badge, Box, Skeleton, SkeletonText, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { FaCalendar, FaClock, FaPlay, FaStar, FaTv } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { convertMinutesToHours } from "../../../modules/functions";
import "../../App.css"
import MediaModal from "../modals/MediaModal";

interface TrendingShowsProps {
  onPlayClick: (media: Show | Movie | Anime, episodeData?: any, episodeUrl?: string) => void;
}

const TrendingShows : React.FC<TrendingShowsProps> = ({ onPlayClick }) => {
  const [trendingShows, setTrendingShows] = useState<Show[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Show | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    const loadTrendingShows = async () => {
      try {
        const shows = await getTrendingShows();
        setTrendingShows(shows);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading trending shows:", error);
      }
    };

    loadTrendingShows();
  }, []);

  const handleOpenModal = (media: Show) => {
    setSelectedMedia(media);
    setSelectedSeason(1); // Reset selected season
    console.log(media);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
    onClose();
  };

  const handlePlayClick = (selectedMedia?: any, episode?: any, episodeUrl?: any) => {
    onClose();
    console.log(episodeUrl);
    if (selectedMedia) {
      onPlayClick(selectedMedia, episode, episodeUrl);
    }
  }

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
      <Text className="text-white text-3xl font-semibold mb-2">Trending Shows</Text>
      <Slider {...settings}>
        {isLoading ? renderSkeletons() : (
          trendingShows.map((show) => (
            <div key={show.title} className="p-2" onClick={() => handleOpenModal(show)}>
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
                    <Text className={`text-white font-semibold ${show.title.length > 25 ? "text-xs" : show.title.length > 10 ? "text-sm" : "text-md"}`}>
                      {show.title.length > 25 ? show.title.substring(0, 25) + "..." : show.title}
                    </Text>
                    <div className="flex flex-wrap gap-1 items-center justify-center mt-2 p-2">
                      <Badge variant="subtle" colorScheme="yellow">
                        <div className="flex flex-row gap-1 items-center">
                          <FaStar />
                          {isNaN(show.rating) ? "N/A" : show.rating}
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
                          {convertMinutesToHours(show.duration)}
                        </div>
                      </Badge>
                      <Badge variant="subtle" colorScheme="orange">
                        <div className="flex flex-row gap-1 items-center">
                          <FaTv />
                          {show.totalEpisodes.toLocaleString("en-US")} Episodes
                        </div>
                      </Badge>
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

export default TrendingShows;
