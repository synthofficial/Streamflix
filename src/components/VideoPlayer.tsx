import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, Tooltip, useToast, IconButton, Flex } from "@chakra-ui/react";
import Hls from "hls.js";
import { IoIosArrowBack } from "react-icons/io";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaVolumeDown } from "react-icons/fa";
import { TbRewindBackward10, TbRewindForward10, TbPlayerTrackNextFilled } from "react-icons/tb";
import { getEpisodeSource, getEpisodeSubtitles } from "../modules/api/Movies";
import discordRPCManager from "../constants/DiscordRPC";
import { useVideoPlayer } from "../renderer/contexts/VideoPlayerContext";
import { getAnimeSource } from "../modules/api/Anime";
import { convertDurationToSeconds, getWatchingList, isInWatchingList, isInWatchlist, updateEpisodeWatchTime, updateWatchingListMovieTime, updateWatchlistMovieTime } from "../modules/functions";

const convertSecondsToTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours > 0 ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

interface Cue {
    start: number;
    end: number;
    text: string;
  }

const VideoPlayer: React.FC = () => {
    const { 
        showPlayer, 
        setShowPlayer, 
        currentMedia: movieData, 
        currentEpisode: episodeData, 
        currentUrl: episodeUrl,
        setCurrentMedia,
        setCurrentEpisode,
        setCurrentUrl
    } = useVideoPlayer();

    const videoRef = useRef<HTMLVideoElement>(null);
    const [hlsData, setHlsData] = useState<Hls>();
    const [episodeDetails, setEpisodeDetails] = useState<any>(episodeData);
    const [currentTime, setCurrentTime] = useState<string>("00:00");
    const [duration, setDuration] = useState<string>("00:00");
    const [playing, setPlaying] = useState<boolean>(false);
    const [showControls, setShowControls] = useState<boolean>(false);
    const [fullscreen] = useState<boolean>(false);
    const [showVolume, setShowVolume] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(50);
    const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
    const [subtitles, setSubtitles] = useState<Cue[]>([]);
    const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
    const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);

    const watchingList = getWatchingList();

    const handleControlsVisibility = useCallback(() => {
        if (!showControls) {
            setShowControls(true);
        }
        
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }
        
        const newTimeout = setTimeout(() => {
            setShowControls(false);
        }, 3000);
        
        setHideTimeout(newTimeout);
    }, [hideTimeout]);

    useEffect(() => {
        const fetchSubtitles = async () => {
            if (episodeData && movieData) {
                try {
                    const subtitleData = await getEpisodeSubtitles(episodeData.id, movieData.id as string);
                    console.log("Subtitle data:", subtitleData);
                    if (subtitleData && subtitleData.file) {
                        setSubtitleUrl(subtitleData.file);
                        console.log("Subtitles URL:", subtitleData.file);
                    } else {
                        console.log("No subtitle URL available");
                    }
                } catch (error) {
                    console.error("Error fetching subtitle URL:", error);
                }
            }else if(movieData){
                if(movieData.type == "Movie" && movieData.subtitles.file){
                    setSubtitleUrl(movieData.subtitles.file);
                    console.log("Subtitles URL:", movieData.subtitles.file);
                }
            }
        };
        fetchSubtitles();
    }, [episodeData, movieData]);
    const parseWebVTT = (vttText: string): Cue[] => {
        const lines = vttText.trim().split('\n');
        const cues: Cue[] = [];
        let currentCue: Partial<Cue> | null = null;
    
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.includes('-->')) {
            const [start, end] = line.split('-->').map(timeString => {
              const [minutes, seconds] = timeString.trim().split(':');
              return parseInt(minutes) * 60 + parseFloat(seconds);
            });
            currentCue = { start, end, text: '' };
          } else if (currentCue) {
            if (line !== '') {
              currentCue.text += (currentCue.text ? '\n' : '') + line;
            } else if (currentCue.text) {
              cues.push(currentCue as Cue);
              currentCue = null;
            }
          }
        }
        if (currentCue && currentCue.text) {
          cues.push(currentCue as Cue);
        }
        return cues;
      };

      useEffect(() => {
        const loadSubtitles = async () => {
            if (subtitleUrl) {
                try {
                    const response = await fetch(subtitleUrl);
                    const text = await response.text();
                    const parsedCues = parseWebVTT(text);
                    console.log("Parsed subtitles:", parsedCues);
                    setSubtitles(parsedCues);
                } catch (error) {
                    console.error("Error loading subtitles:", error);
                }
            }
        };

        loadSubtitles();
    }, [subtitleUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || subtitles.length === 0) return;
      
        const updateSubtitle = () => {
          const currentTime = video.currentTime;
          const currentCue = subtitles.find(
            cue => currentTime >= cue.start && currentTime <= cue.end
          );
          setCurrentSubtitle(currentCue ? currentCue.text : '');
        };
      
        video.addEventListener('timeupdate', updateSubtitle);
      
        return () => {
          video.removeEventListener('timeupdate', updateSubtitle);
        };
      }, [subtitles]);

    useEffect(() => {
        const handleMouseMove = () => {
            handleControlsVisibility();
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        };
    }, [handleControlsVisibility, hideTimeout]);

    const toast = useToast();

    const playHlsVideo = useCallback((url: string) => {
        if (Hls.isSupported() && videoRef.current) {
            const hls = new Hls({
                // Start at a lower quality and switch to higher quality as the buffer builds
                startLevel: -1, // Start with the lowest level
                autoStartLoad: true,
                maxBufferLength: 30,
                maxBufferSize: 60 * 1000 * 1000, // 60 MB
                maxBufferHole: 0.5, // Reduce buffer hole to minimize stalls
                lowLatencyMode: true, // Enable low-latency streaming
                liveSyncDurationCount: 3, // Sync to the live edge with less delay
            });
            console.log(url);
            hls.loadSource(url);
            hls.attachMedia(videoRef.current);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if(videoRef.current){
                    hls.currentLevel = hls.levels.length - 1; // Automatically switch to the highest quality
                    setHlsData(hls);
                    videoRef.current.play().catch(e => console.error("Playback failed:", e));
                }
            });
            
            if(watchingList.find((m) => m.id == movieData?.id) && movieData?.type === "Movie"){
                videoRef.current.currentTime = getWatchingList().find((m) => m.id == movieData?.id)?.timestamp || 0;
            }

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS error:", event, data);
            });
        }
    }, [toast]);

    useEffect(() => {
        if (showPlayer) {
            playHlsVideo(movieData?.type == "Movie" ? movieData?.movieUrl : episodeUrl!);
            discordRPCManager.setPresence({
                state: movieData?.type === "Show" ? `Season ${episodeDetails?.season} - Episode ${episodeDetails?.number}` : movieData?.type === "Anime" ? `Episode ${episodeDetails?.number}` : "Using Streamflix",
                details: movieData?.type === "Movie" ? `Watching ${movieData?.title}` : movieData?.type === "Show" ? `Watching ${movieData?.title}` : `Watching ${movieData?.title.english}`,
                startTimestamp: Date.now(),
                largeImageKey: movieData?.thumbnail || '',
                largeImageText: movieData?.title?.toString() || '',
            });
        }
    }, [showPlayer, movieData, episodeDetails, episodeUrl, playHlsVideo]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            setCurrentTime(convertSecondsToTime(video.currentTime));

            if(isInWatchingList(movieData?.id as string)){
                updateWatchingListMovieTime(movieData?.id as string, video.currentTime);
            }
            if(isInWatchlist(movieData?.id as string)){
                updateWatchlistMovieTime(movieData?.id as string, video.currentTime);
            }
        }
        const onLoadedMetadata = () => setDuration(convertSecondsToTime(video.duration));
        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
        };
    }, []);

    const handlePlayerClose = () => {
        setShowPlayer(false);
        if(movieData?.type === "Show"){
            updateEpisodeWatchTime(movieData?.id as string, episodeData?.id, Math.floor(videoRef.current!.currentTime), convertDurationToSeconds(movieData?.duration) as number);
        }
    };

    const handleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    const handleSliderChange = (value: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value;
        }
    };

    const handleVolumeChange = (value: number) => {
        if (videoRef.current) {
            videoRef.current.volume = value / 100;
            setVolume(value);
        }
    };

    const handleEpisodeChange = async () => {
        if (!movieData) return;

        const nextEpisode = episodeDetails.number + 1;
        const nextEpisodeData = movieData.type !== "Movie" && movieData.episodes?.find((episode: any) => episode.number === nextEpisode);
        
        if (nextEpisodeData) {
            toast({
                title: "Fetching Next Episode",
                description: "Please wait...",
                status: "info",
                duration: 3000,
                isClosable: true,
            });

            try {
                let source;
                if(movieData.type === "Anime"){
                    source = await getAnimeSource(`${nextEpisodeData.id}`);
                }else source = await getEpisodeSource(`${nextEpisodeData.id}`,  String(movieData.id));
                if (source) {
                    setEpisodeDetails(nextEpisodeData);
                    setCurrentEpisode(nextEpisodeData);
                    setCurrentUrl(source);
                    playHlsVideo(source);
                }
            } catch (error) {
                console.error("Error fetching next episode:", error);
            }
        }
    };

    if (!showPlayer) return null;

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            width="100%"
            height="100%"
            zIndex="9999"
            bg="black"
            onMouseEnter={() => handleControlsVisibility()}
            onMouseLeave={() => setShowControls(false)}
        >
            <video ref={videoRef} className="w-full h-full object-cover" />
            <Box
        position="absolute"
        bottom="10%"
        left="50%"
        transform="translateX(-50%)"
        textAlign="center"
        color="white"
        fontSize="xl"
        fontWeight="bold"
        textShadow="0 0 4px black"
        padding="0.5rem"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        borderRadius="md"
        maxWidth="80%"
      >
        {currentSubtitle.replaceAll(/(<([^>]+)>)/ig, "")}
      </Box>
            <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                bg="rgba(0,0,0,0.5)"
                opacity={showControls ? 1 : 0}
                transition="opacity 0.3s"
                pointerEvents={showControls ? "auto" : "none"}
            >
                {/* Top Controls */}
                <Flex position="absolute" top="4" left="4" right="4" alignItems="center">
                    <IconButton
                        aria-label="Close player"
                        icon={<IoIosArrowBack className="w-12 h-12" />}
                        onClick={handlePlayerClose}
                        variant="ghost"
                        _hover={{ bg: "transparent" }}
                        color="white"
                    />
                    <div className="flex flex-col w-full">
                        <Text color="gray" fontSize="md" textAlign="center">
                            Now watching
                        </Text>
                        <Text color="white" fontSize="xl" textAlign="center">
                            {movieData?.type == "Anime" ? movieData?.title.english : movieData?.title || episodeDetails.title}
                        </Text>
                        {episodeDetails && (
                            <Text color="gray" fontSize="md" textAlign="center">
                                {episodeDetails.season && `Season ${episodeDetails.season}`} Episode {episodeDetails.number}
                            </Text>
                        )}
                    </div>
                    <Box width={12} />
                </Flex>

                {/* Middle Controls */}
                <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" gap="12">
                    <IconButton
                        aria-label="Rewind 10 seconds"
                        icon={<TbRewindBackward10 className="w-10 h-10" />}
                        onClick={() => {
                            if (videoRef.current) videoRef.current.currentTime -= 10;
                        }}
                        _hover={{ bg: "transparent" }}
                        variant="ghost"
                        color="white"
                        size="lg"
                    />
                    <IconButton
                        aria-label={playing ? "Pause" : "Play"}
                        icon={playing ? <FaPause className="w-16 h-16" /> : <FaPlay className="w-16 h-16" />}
                        onClick={() => {
                            if (videoRef.current) {
                                playing ? videoRef.current.pause() : videoRef.current.play();
                            }
                        }}
                        _hover={{ bg: "transparent" }}
                        variant="ghost"
                        color="white"
                        size="lg"
                    />
                    <IconButton
                        aria-label="Forward 10 seconds"
                        icon={<TbRewindForward10 className="w-10 h-10" />}
                        onClick={() => {
                            if (videoRef.current) videoRef.current.currentTime += 10;
                        }}
                        _hover={{ bg: "transparent" }}
                        variant="ghost"
                        color="white"
                        size="lg"
                    />
                </Flex>

                {/* Bottom Controls */}
                <Box position="absolute" bottom="4" left="4" right="4">
                    <Flex justifyContent="space-between" mb="2">
                        <Text color="white">{currentTime}</Text>
                        <Text color="white">{duration}</Text>
                    </Flex>
                    <Slider
                        aria-label="video-progress"
                        value={videoRef.current?.currentTime}
                        min={0}
                        max={videoRef.current?.duration || 100}
                        onChange={handleSliderChange}
                        colorScheme="brand"
                    >
                        <SliderTrack bg="#27272a">
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Flex mt="2">
                        <Flex 
                            alignItems="center" 
                            position="relative"
                            onMouseEnter={() => setShowVolume(true)}
                            onMouseLeave={() => setShowVolume(false)}
                        >
                            <IconButton
                                aria-label="Volume"
                                icon={volume === 0 ? <FaVolumeMute /> : volume < 50 ? <FaVolumeDown /> : <FaVolumeUp />}
                                variant="ghost"
                                color="white"
                                _hover={{ bg: "transparent" }}
                            />
                            <Box
                                position="absolute"
                                left="100%"
                                top="50%"
                                transform="translateY(-50%)"
                                width="100px"
                                height="40px"
                                bg="rgba(0,0,0,0.7)"
                                borderRadius="md"
                                ml="2"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                opacity={showVolume ? 1 : 0}
                                transition="opacity 0.1s ease-in-out"
                            >
                                <Slider
                                    aria-label="volume"
                                    min={0}
                                    max={100}
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    colorScheme="brand"
                                    width="80%"
                                >
                                    <SliderTrack bg="#27272a">
                                        <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb />
                                </Slider>
                            </Box>
                        </Flex>
                        <Flex marginLeft={"auto"} gap={4}>
                        {episodeDetails && (
                            <Tooltip label={`Next Episode: ${episodeDetails.number + 1}`}>
                                <IconButton
                                    aria-label="Next episode"
                                    icon={<TbPlayerTrackNextFilled className="w-10 h-10" />}
                                    onClick={handleEpisodeChange}
                                    _hover={{ bg: "transparent" }}
                                    variant="ghost"
                                    color="white"
                                />
                            </Tooltip>
                        )}
                        <IconButton
                            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                            icon={fullscreen ? <MdFullscreenExit className="w-10 h-10" /> : <MdFullscreen className="w-10 h-10" />}
                            _hover={{ bg: "transparent" }}
                            onClick={handleFullscreen}
                            variant="ghost"
                            color="white"
                        />
                        </Flex>
                    </Flex>
                </Box>
            </Box>
        </Box>
    );
};

export default VideoPlayer;