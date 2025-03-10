import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import aiProfile from '../assets/images/ai-profile.png';
import { TypingEffect } from '../components/TypingEffect'; // TypingEffect 컴포넌트 import

interface AiGuideChatProps {
    messages: { id: number; type: "user" | "bot"; text: string; isNew?: boolean }[];
    hasMore: boolean;
    loadMore: () => void;
}

const AiGuideChat: React.FC<AiGuideChatProps> = ({ messages, hasMore, loadMore }) => {
    const [isLoadMore, setIsLoadMore] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    // 메시지가 변경될 때마다 스크롤 조정
    useEffect(() => {
        if (messagesContainerRef.current) {
            if (isLoadMore) {
                // 더보기 버튼 클릭 시 스크롤을 위로 이동
                messagesContainerRef.current.scrollTop = 0;
            } else {
                // 새 메시지가 오면 자동으로 아래로 스크롤
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }
    }, [messages, isLoadMore]);

    // 더보기 버튼 클릭 시 처리
    const handleLoadMore = async () => {
        setIsLoadMore(true);
        await loadMore();
        setIsLoadMore(false);
    };

    // 텍스트에서 <br>을 렌더링
    const renderTextWithBrTags = (text: string) => {
        // **볼드체** -> <b>볼드체</b>로 변환하고, 줄바꿈은 <br>로 변환
        const boldText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // **bold** -> <b>bold</b>
        return { __html: boldText.replace(/\n/g, "<br>") }; // 줄바꿈을 <br>로 변환
    };

    // 타이핑 완료 후 스크롤 자동 하단으로 이동
    const handleTypingFinished = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    return (
        <div id="messagesContainer-scroll" ref={messagesContainerRef}>
            <div className="div-loadMoreButton">
                {hasMore && (
                    <button
                        id="loadMoreButton"
                        onClick={handleLoadMore}
                    >
                        •••
                    </button>
                )}
            </div>

            {/* 메시지 목록 표시 */}
            <AnimatePresence>
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        className="chat-row"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", duration: 0.6 }}
                    >
                        {message.type === "bot" && (
                            <img
                                src={aiProfile}
                                alt="ai-profile"
                            />
                        )}

                        <div className={`message ${message.type}`}>
                            {message.text === "loading" ? (
                                <LoadingAnimation />
                            ) : message.type === "bot" && message.isNew ? (
                                <TypingEffect text={message.text} onTypingFinished={handleTypingFinished} />
                            ) : (
                                // dangerouslySetInnerHTML을 사용하여 <br> 처리된 텍스트를 렌더링
                                <div dangerouslySetInnerHTML={renderTextWithBrTags(message.text)}/>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

const LoadingAnimation: React.FC = () => {
    const dotVariants: Variants = {
        hidden: { opacity: 0.2, y: 0 },
        visible: (i: number) => ({
            opacity: 1,
            y: -10,
            transition: {
                delay: i * 0.2,
                duration: 0.6,
                repeat: Infinity,
                repeatType: "mirror"
            }
        })
    };

    return (
        <div style={{ display: "flex", gap: "5px" }}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    custom={i}
                    variants={dotVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#555",
                        borderRadius: "50%"
                    }}
                />
            ))}
        </div>
    );
};

export default AiGuideChat;
