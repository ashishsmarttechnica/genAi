import { useRef, useCallback } from 'react';

const useInfiniteScroll = ({ loading, hasMore, onLoadMore }) => {
    const observer = useRef();

    const lastElementRef = useCallback(
        (node) => {
            // Do not trigger if already loading
            if (loading) return;

            // Disconnect previous observer if it exists
            if (observer.current) {
                observer.current.disconnect();
            }

            // Create new observer
            observer.current = new IntersectionObserver((entries) => {
                // If target is visible and we have more data, trigger the callback
                if (entries[0].isIntersecting && hasMore) {
                    onLoadMore();
                }
            });

            // Observe the new target node
            if (node) {
                observer.current.observe(node);
            }
        },
        [loading, hasMore, onLoadMore]
    );

    return lastElementRef;
};

export default useInfiniteScroll;
