import React, { useState, useEffect } from 'react';
import { AspectRatio, Box, Flex, useDisclosure, Spinner, Progress, Badge, Text } from "@chakra-ui/react";
import { convertMinutesToHours, getCompletedList, getWatchlist } from "../modules/functions";
import { getMediaInfo, searchMedia } from "../modules/api/Movies";
import MediaModal from "../renderer/pages/modals/MediaModal";
import { FaCalendar, FaClock, FaStar } from 'react-icons/fa';
import { BsArrowCounterclockwise } from "react-icons/bs";

interface Props {
    onPlayClick: (media: Movie | Show | Anime, episodeData?: any, episodeUrl?: string) => void;
}

const Watchlist: React.FC<Props> = ({ onPlayClick }) => {
    const [selectedMedia, setSelectedMedia] = useState<Movie | Show | Anime | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [completedList, setCompletedList] = useState<WatchlistItem[]>(getCompletedList());

    useEffect(() => {
        const storedWatchlist = getWatchlist();
        console.log(storedWatchlist);
        setWatchlist(storedWatchlist);
    }, []);

    const handleOpenModal = async (item: WatchlistItem) => {
        setIsLoading(true);
        try {
            setSelectedMedia(item as any);
            onOpen();
        } catch (error) {
            console.error('Error fetching media data:', error);
            // Handle the error appropriately
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedMedia(null);
        onClose();
    };

    const handlePlayClick = (media : Movie | Show | Anime, episodeData?: any, url?: string) => {
        onClose();
        if (selectedMedia) {
            onPlayClick(selectedMedia, episodeData!, url!);
        }
    };

    return (
        <>
            <Box
                as="header"
                p={4}
                m={2}
                borderRadius={"10px"}
                bg="dark.200"    
            >
                <div className="w-full font-bold text-2xl mb-2">Watchlist</div>
                <Flex gap={4} className="w-full">
                    {watchlist.length === 0 ? (
                        <div className="w-full font-bold text-xl">No items in watchlist</div>
                    ) : (
                        <Flex
                            gap={1}
                            className="w-full"
                            flexDirection={"row"}
                            flexWrap="wrap"
                        >
                            {watchlist.map((item : WatchlistItem, index) => (
                                <Box
                                    key={index}
                                    w={"240px"}
                                    className="relative group cursor-pointer hover:scale-105 transition-transform duration-300"
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <AspectRatio ratio={2/3} maxH="360px" maxW="240px">
                                        <Box
                                            backgroundImage={`url(${item.thumbnail})`}
                                            backgroundSize="cover"
                                            backgroundPosition="center"
                                            className="rounded-lg transition-all duration-300 group-hover:blur-sm"  
                                        />
                                    </AspectRatio>
                                    <Box 
                                        position="absolute" 
                                        top={0} 
                                        left={0} 
                                        bg="rgba(0,0,0,0.7)" 
                                        color="white" 
                                        px={2} 
                                        py={1} 
                                        borderTopLeftRadius="lg"
                                        className="group-hover:opacity-0 transition-opacity duration-300"
                                    >
                                        {item.type}
                                    </Box>
                                    {item.type === "Movie" && (
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
                                        value={Math.floor(item.timestamp! || 0)}
                                        max={item.finishTimestamp}
                                    />
                                    )}
                                </Box>
                            ))}
                        </Flex>
                    )}
                </Flex>
            </Box>
            <Box
                as="header"
                p={4}
                m={2}
                borderRadius={"10px"}
                bg="dark.200"    
            >
                <div className="w-full font-bold text-2xl mb-2">Completed</div>
                <Flex gap={4} className="w-full">
                    {completedList.length === 0 ? (
                        <div className="w-full font-bold text-xl">No items in watchlist</div>
                    ) : (
                        <Flex
                            gap={1}
                            className="w-full"
                            flexDirection={"row"}
                            flexWrap="wrap"
                        >
                            {completedList.map((item : WatchlistItem, index) => (
                                <Box
                                    key={index}
                                    w={"240px"}
                                    className="relative group cursor-pointer hover:scale-105 transition-transform duration-300"
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <AspectRatio ratio={2/3} maxH="360px" maxW="240px">
                                        <Box
                                            backgroundImage={`url(${item.thumbnail})`}
                                            backgroundSize="cover"
                                            backgroundPosition="center"
                                            className="rounded-lg transition-all duration-300 group-hover:blur-sm"  
                                        />
                                    </AspectRatio>
                                    <Box 
                                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-black/30 rounded-lg"
                                    p={2}
                                >
                                    <Text className={`text-white font-semibold text-center ${item.title.length > 25 ? "text-xs" : item.title.length > 10 ? "text-sm" : "text-md"}`}>
                                        {item.title.length > 25 ? item.title.substring(0, 25) + "..." : item.title}
                                    </Text>
                                    <Box className="flex flex-wrap gap-1 items-center justify-center mt-2">
                                        <Badge variant="subtle" colorScheme="yellow">
                                            <Box className="flex flex-row gap-1 items-center">
                                                <FaStar />
                                                {isNaN(item.rating) ? "N/A" : item.rating}
                                            </Box>
                                        </Badge>
                                        <Badge variant="subtle" colorScheme="blue">
                                            <Box className="flex flex-row gap-1 items-center">
                                                <FaCalendar />
                                                {item.releaseDate}
                                            </Box>
                                        </Badge>
                                        <Badge variant="subtle" colorScheme="green">
                                            <Box className="flex flex-row gap-1 items-center">
                                                <FaClock />
                                                {convertMinutesToHours(item.duration)}
                                            </Box>
                                        </Badge>
                                        <Badge variant="subtle" colorScheme='pink'>
                                            <Box className="flex flex-row gap-1 items-center">
                                                <BsArrowCounterclockwise />
                                                {item.timesWatched} times watched
                                            </Box>
                                        </Badge>
                                    </Box>
                                </Box>
                                    
                                </Box>
                            ))}
                        </Flex>
                    )}
                </Flex>
            </Box>
            {selectedMedia && (
                <MediaModal
                    isOpen={!!selectedMedia}
                    onClose={handleCloseModal}
                    media={selectedMedia!}
                    onPlayClick={handlePlayClick}
                />
            )}
        </>
    );
};

export default Watchlist;