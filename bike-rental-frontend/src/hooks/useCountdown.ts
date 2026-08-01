import { useEffect, useState } from "react";

const useCountdown = (seconds: number) => {

    const [count, setCount] = useState(seconds);

    useEffect(() => {

        if (count <= 0) return;

        const timer = setTimeout(() => {

            setCount((prev) => prev - 1);

        }, 1000);

        return () => clearTimeout(timer);

    }, [count]);

    const restart = () => {

        setCount(seconds);

    };

    return {

        count,

        restart,

        finished: count === 0

    };

};

export default useCountdown;