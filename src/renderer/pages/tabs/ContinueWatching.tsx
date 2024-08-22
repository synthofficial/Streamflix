import React, { useEffect, useState } from "react";
import { getTrendingMovies } from "../../../modules/api/Movies";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Badge, Text, useDisclosure, Box, AspectRatio, Skeleton, SkeletonText, useToast, IconButton, Progress, Tooltip } from "@chakra-ui/react";
import { convertMinutesToHours, getWatchingList, getWatchlist, markAsCompleteInWatchingList } from "../../../modules/functions";
import MediaModal from "../modals/MediaModal";
import { FaCalendar, FaCheck, FaClock, FaStar } from "react-icons/fa";

interface Props {
    onPlayClick: (media: Movie | Show | Anime) => void;
}

const ContinueWatching: React.FC<Props> = ({ onPlayClick }) => {
    const [watchingList, setWatchingList] = useState<WatchlistItem[]>(getWatchingList());
    console.log(watchingList)
    const [selectedMedia, setSelectedMedia] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const toast = useToast();

    const handleOpenModal = (media: any) => {
        if(!media.duration){

        }
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

    const handleMarkAsComplete = (e: React.MouseEvent, media: any) => {
        e.stopPropagation();
        markAsCompleteInWatchingList(media.id);
        
        // Update the state to trigger a re-render
        const updatedWatchingList = watchingList.map(movie => 
            movie.id === media.id ? { ...movie, completed: true } : movie
        );
        
        // Set the updated list in the state
        setWatchingList(updatedWatchingList);
    
        toast({
            title: "Marked as completed",
            status: "success",
            duration: 3000,
            isClosable: true
        });
    }
    

    const slidesToShow = Math.min(watchingList.length, 1);

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: slidesToShow,  // Dynamically set the number of slides to show
        initialSlide: 0,
        slidesToScroll: slidesToShow,  // Ensure it scrolls the correct number of slides
        variableWidth: true,
        centerMode: false,
    };

    const renderSkeletons = () => {
        return Array(watchingList.length).fill(0).map((_, index) => (
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
            <Text className="text-white text-3xl font-semibold mb-2">Continue Watching</Text>
            <Slider {...settings}>
                {watchingList.length === 0 ? renderSkeletons() : (
                    watchingList.map((movie) => (
                        movie.completed === false && (
                            <Box key={movie.title} p={2}>
                            <Box className="relative group cursor-pointer hover:scale-105 transition-transform duration-300 w-[240px]" onClick={() => handleOpenModal(movie)}>
                                <AspectRatio ratio={2/3} maxH="360px" maxW="240px">
                                    <Box
                                        backgroundImage={`url(${movie.thumbnail})`}
                                        backgroundSize="cover"
                                        backgroundPosition="center"
                                        className="rounded-lg transition-all duration-300 group-hover:blur-sm"
                                    />
                                </AspectRatio>
                                <Box 
                                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-black/30 rounded-lg w-[240px]"
                                    p={2}
                                >
                                    <Tooltip hasArrow label="Mark as completed">
                                        <IconButton
                                            aria-label="Mark as Complete"
                                            icon={<FaCheck />}
                                            onClick={(e) => handleMarkAsComplete(e, movie)}
                                            _hover={{ bg: "gray.200"}}
                                            zIndex={10}
                                            bg={"white"}
                                            color="black"
                                            position="absolute"
                                            top={2}
                                            right={3}
                                        />
                                    </Tooltip>
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
                                        value={Math.floor(movie.timestamp! || 0)}
                                        max={movie.finishTimestamp}
                                    />
                            </Box>
                        </Box>
                        )
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

export default ContinueWatching;