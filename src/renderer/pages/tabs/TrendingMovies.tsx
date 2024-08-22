import React, { useEffect, useState } from "react";
import { getMovieSource, getTrendingMovies } from "../../../modules/api/Movies";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Badge, Text, useDisclosure, Box, AspectRatio, Skeleton, SkeletonText, useToast, IconButton } from "@chakra-ui/react";
import { FaCalendar, FaClock, FaStar } from "react-icons/fa6";
import { addToWatchlist, convertDurationToSeconds, convertMinutesToHours, getWatchlist, isInWatchlist, removeFromWatchlist } from "../../../modules/functions";
import MediaModal from "../modals/MediaModal";
import { FaCheck, FaPlus } from "react-icons/fa";

interface TrendingMoviesProps {
    onPlayClick: (media: Movie | Show | Anime) => void;
}

const TrendingMovies: React.FC<TrendingMoviesProps> = ({ onPlayClick }) => {
    const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [watchlistStatus, setWatchlistStatus] = useState<{[key: string]: boolean}>({});
    const { isOpen, onOpen, onClose } = useDisclosure();

    const toast = useToast();

    useEffect(() => {
        const loadTrendingMovies = async () => {
            setIsLoading(true);
            try {
                const movies = await getTrendingMovies();
                setTrendingMovies(movies);

                const initialStatus = trendingMovies.reduce((acc, movie) => {
                    acc[movie.id] = isInWatchlist(movie.id);
                    return acc;
                }, {} as {[key: string]: boolean});
                setWatchlistStatus(initialStatus);

            } catch (error) {
                console.error("Error loading trending movies:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadTrendingMovies();
    }, []);

    const handleOpenModal = (media: Movie) => {
        setSelectedMedia(media);
        onOpen();
    };

    const handleCloseModal = () => {
        setSelectedMedia(null);
        onClose();
    }

    const handlePlayClick = () => {
        onClose();
        if (selectedMedia) {
            onPlayClick(selectedMedia);
        }
    };

const handleWatchlistClick = async (event: React.MouseEvent, movie: Movie) => {
    event.stopPropagation();
    const newStatus = !watchlistStatus[movie.id];
    if (newStatus) {
        addToWatchlist({
            id: movie.id,
            title: movie.title,
            thumbnail: movie.thumbnail,
            movieUrl : movie.movieUrl,
            genres: movie.genres,
            actors: movie.actors,
            country: movie.country,
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
        removeFromWatchlist(movie.id);
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
            <Text className="text-white text-3xl font-semibold mb-2">Trending Movies</Text>
            <Slider {...settings}>
                {isLoading ? renderSkeletons() : (
                    trendingMovies.map((movie) => (
                        <Box key={movie.title} p={2}>
                            <Box className="relative group cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => handleOpenModal(movie)}>
                                <AspectRatio ratio={2/3} maxH="360px" maxW="240px">
                                    <Box
                                        backgroundImage={`url(${movie.thumbnail})`}
                                        backgroundSize="cover"
                                        backgroundPosition="center"
                                        className="rounded-lg transition-all duration-300 group-hover:blur-sm"
                                    />
                                </AspectRatio>
                                <Box 
                                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-black/30 rounded-lg"
                                    p={2}
                                >
                                    <IconButton
                                        aria-label="Add to Watchlist"
                                        icon={isInWatchlist(movie.id) ? <FaCheck /> : <FaPlus />}
                                        onClick={(e) => handleWatchlistClick(e, movie)}
                                        _hover={{ bg: "gray.200"}}
                                        zIndex={10}
                                        bg={"white"}
                                        color="black"
                                        position="absolute"
                                        top={2}
                                        right={3}
                                    />
                                    <Text className={`text-white font-semibold text-center ${movie.title.length > 25 ? "text-xs" : movie.title.length > 10 ? "text-sm" : "text-md"}`}>
                                        {movie.title.length > 25 ? movie.title.substring(0, 25) + "..." : movie.title}
                                    </Text>
                                    <Box className="flex flex-wrap gap-1 items-center justify-center mt-2">
                                        <Badge variant="subtle" colorScheme="yellow">
                                            <Box className="flex flex-row gap-1 items-center">
                                                <FaStar />
                                                {isNaN(movie.rating) ? "N/A" : movie.rating}
                                            </Box>
                                        </Badge>
                                        <Badge variant="subtle" colorScheme="blue">
                                            <Box className="flex flex-row gap-1 items-center">
                                                <FaCalendar />
                                                {movie.releaseDate}
                                            </Box>
                                        </Badge>
                                        <Badge variant="subtle" colorScheme="green">
                                            <Box className="flex flex-row gap-1 items-center">
                                                <FaClock />
                                                {convertMinutesToHours(movie.duration)}
                                            </Box>
                                        </Badge>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
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
}

export default TrendingMovies;