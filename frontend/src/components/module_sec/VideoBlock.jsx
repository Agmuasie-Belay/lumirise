import {
  Box,
  Text,
  Badge,
  Progress,
  Skeleton,
  Flex,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";

// Extract YouTube ID safely
const getYouTubeId = (url) => {
  if (!url) return null;

  const regExp =
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regExp);
  return match ? match[1] : null;
};

// Load YouTube API once globally
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    if (document.getElementById("youtube-api")) {
      window.onYouTubeIframeAPIReady = () => resolve();
      return;
    }

    const tag = document.createElement("script");
    tag.id = "youtube-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => resolve();
  });
};

const VideoBlock = ({ data, title, onVideoComplete, saveProgressApi }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const currentQuestionRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [triggered, setTriggered] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [selectedOption, setSelectedOption] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoId = getYouTubeId(data?.url);
  const answeredRef = useRef({});
  const triggeredRef = useRef(new Set());
  // Example checkpoints
  const checkpoints = [
    {
      time: 5,
      question: {
        type: "multipleChoice",
        text: "What is 2 + 2?",
        options: ["3", "4"],
        answer: 1,
      },
    },
    {
      time: 10,
      question: {
        type: "trueFalse",
        text: "The sky is blue?",
        options: ["True", "False"],
        answer: 0,
      },
    },
  ];
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);
  // Initialize YouTube Player
  useEffect(() => {
    if (!videoId || !videoRef.current) return;

    let isMounted = true;

    loadYouTubeAPI().then(() => {
      if (!isMounted) return;

      playerRef.current = new window.YT.Player(videoRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            setIsLoaded(true);
            startProgressInterval();
          },
          onError: (e) => {
            console.error("YouTube Player Error:", e.data);
          },
        },
      });
    });

    return () => {
      isMounted = false;
      clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // Pause when tab inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) playerRef.current?.pauseVideo();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Progress tracking
  const startProgressInterval = () => {
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || !player.getCurrentTime) return;

      if (currentQuestionRef.current) return;

      const current = player.getCurrentTime();
      const duration = player.getDuration() || 1;
      const percent = (current / duration) * 100;

      setProgress(percent);

      // checkpoints.forEach((c, idx) => {
      //   if (
      //     current >= c.time &&
      //     !triggeredRef.current.has(idx) &&
      //     !answeredRef.current[idx]
      //   ) {
      //     triggeredRef.current.add(idx);

      //     player.pauseVideo();

      //     const questionData = { ...c, idx };

      //     currentQuestionRef.current = questionData;
      //     setCurrentQuestion(questionData);
      //     setSelectedOption(0);
      //   }
      // });

      if (percent >= 85 && !isCompleted) {
        setIsCompleted(true);
        onVideoComplete?.();
      }
    }, 250);
  };

  const saveProgress = async (percent) => {
    if (!saveProgressApi) return;
    try {
      await saveProgressApi({ videoId, progress: percent });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  // Handle answering
  const handleAnswer = (optionIndex) => {
    const { question, idx } = currentQuestion;

    if (optionIndex === question.answer) {
      answeredRef.current[idx] = true;

      currentQuestionRef.current = null;

      setAnsweredQuestions((prev) => ({ ...prev, [idx]: true }));
      setCurrentQuestion(null);

      playerRef.current?.playVideo();
    } else {
      alert("❌ Incorrect! Try again.");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!currentQuestion) return;

      const opts = currentQuestion.question.options.length;

      if (e.key === "ArrowRight")
        setSelectedOption((prev) => (prev + 1) % opts);

      if (e.key === "ArrowLeft")
        setSelectedOption((prev) => (prev + opts - 1) % opts);

      if (e.key === "Enter") handleAnswer(selectedOption);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentQuestion, selectedOption]);

  /* ---------------------------------- */
  /* Invalid URL fallback */
  /* ---------------------------------- */
  if (!videoId) {
    return <Text color="red.500">❌ Invalid or unsupported YouTube URL</Text>;
  }

  /* ---------------------------------- */
  /* UI */
  /* ---------------------------------- */
  return (
    <Box position="relative" overflow="hidden" borderRadius="xl">
      <Flex justify="space-between" align="center" mb={4} px={4} pt={2}>
        <Text fontSize="lg" fontWeight="bold">
          {title || "Video Lesson"}
        </Text>
        {isCompleted && (
          <Badge colorScheme="green" borderRadius="full" px={3}>
            Completed
          </Badge>
        )}
      </Flex>

      <Box position="relative" pb="56.25%" height={0} mx="auto">
        {!isLoaded && (
          <Skeleton position="absolute" top={0} left={0} w="100%" h="100%" />
        )}
        <Box
          ref={videoRef}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
        />
      </Box>

      {currentQuestion && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bg="rgba(0,0,0,0.6)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="auto"
        >
          {/* Block iframe interaction */}
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
          />

          {/* Question Card */}
          <Box
            bg="white"
            p={6}
            borderRadius="md"
            shadow="xl"
            maxW="400px"
            w="90%"
            zIndex={10000}
          >
            <VStack spacing={3}>
              <Text fontWeight="bold">{currentQuestion.question.text}</Text>

              <HStack wrap="wrap" spacing={2}>
                {currentQuestion.question.options.map((opt, i) => (
                  <Button
                    key={i}
                    colorScheme={i === selectedOption ? "blue" : "gray"}
                    onClick={() => handleAnswer(i)}
                  >
                    {opt}
                  </Button>
                ))}
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      <Box p={4}>
        <Progress
          value={progress}
          size="sm"
          borderRadius="full"
          colorScheme="green"
          bg="gray.100"
        />
        <Text mt={2} fontSize="sm" textAlign="right">
          {Math.floor(progress)}% watched
        </Text>
      </Box>
    </Box>
  );
};

export default VideoBlock;
