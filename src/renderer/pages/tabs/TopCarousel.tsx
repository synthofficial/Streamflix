import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Badge,
  Button,
  Image,
  Skeleton,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FaStar, FaCalendar, FaClock, FaPlay } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { getTopTrendingMovie, getTopTrendingShow } from "../../../modules/api/Movies";
import { convertMinutesToHours } from "../../../modules/functions";
import MediaModal from "../modals/MediaModal";

interface Props {
  onPlayClick: (media: Movie | Show, episodeData?: any, episodeUrl?: string) => void;
}

const TopCarousel: React.FC<Props> = ({ onPlayClick }) => {
  const [topMedia, setTopMedia] = useState<(Movie | Show)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMedia, setSelectedMedia] = useState<Movie | Show | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const loadTopMedia = async () => {
      try {
        const [movies, shows] = await Promise.all([
          getTopTrendingMovie(),
          getTopTrendingShow(),
        ]);
        setTopMedia([...movies, ...shows].slice(0, 5));
      } catch (error) {
        console.error("Error loading media:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTopMedia();
  }, []);

  const handleOpenModal = (media: Movie | Show) => {
    setSelectedMedia(media);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
    onClose();
  };

  const handlePlayClick = (media: any, episodeData?: any, episodeUrl?: string) => {
    onClose();
    if (selectedMedia) {
      onPlayClick(media, episodeData, episodeUrl);
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    adaptiveHeight: true,
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden group rounded-lg shadow-lg">
      <Skeleton className="rounded-lg h-[500px] w-full" isLoaded={!loading}>
        <Slider {...settings}>
          {topMedia.map((media) => (
            <div
              key={media.title}
              className="relative w-full h-[500px] cursor-pointer group"
              onClick={() => handleOpenModal(media)}
            >
              <div className="relative h-full overflow-hidden">
                <Image
                  src={media.cover}
                  alt={media.title}
                  className="h-full w-full object-cover rounded-lg transition-transform duration-300 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent rounded-lg"></div>
              </div>
              <div className="absolute bottom-0 left-0 ml-4 mb-6 z-10 w-[600px]">
                <div className="flex flex-col">
                  <Text
                    className="text-white text-3xl font-bold mb-2"
                    noOfLines={2}
                  >
                    {media.title}
                  </Text>
                  <div className="flex flex-row gap-1 items-center mb-2">
                      <Badge variant="outline" colorScheme="brand">
                        {media.type}
                      </Badge>
                      <Badge variant="subtle" colorScheme="yellow">
                        <div className="flex flex-row gap-1 items-center">
                          <FaStar />
                          {media.rating}
                        </div>
                      </Badge>
                      <Badge variant="subtle" colorScheme="blue">
                        <div className="flex flex-row gap-1 items-center">
                          <FaCalendar />
                          {media.releaseDate}
                        </div>
                      </Badge>
                      <Badge variant="subtle" colorScheme="green">
                        <div className="flex flex-row gap-1 items-center">
                          <FaClock />
                          {convertMinutesToHours(media.duration)}
                        </div>
                      </Badge>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </Skeleton>

      <MediaModal
        isOpen={!!selectedMedia}
        onClose={handleCloseModal}
        media={selectedMedia!}
        onPlayClick={handlePlayClick}
      /> 

    </div>
  );
};

export default TopCarousel;