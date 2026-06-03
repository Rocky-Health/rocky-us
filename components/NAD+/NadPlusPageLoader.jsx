"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Loader from "../Loader";

export default function NadPlusPageLoader({ children }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
        window.scrollTo({
            top: "0",
            behavior: "smooth",
        });
    }, []);

    return (
        <>
            {/* Full-screen overlay that hides the global navbar/banner flash */}
            <div
                className={`pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-white transition-opacity duration-300 ${
                    loaded ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden="true"
            >
                <div className="relative h-[80px] w-[240px] z-[100] mb-36">
                    <Image
                        src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-white.webp"
                        alt="MyRocky"
                        fill
                        className="object-contain z-[100]"
                        priority
                    />
                </div>
                {/* Spinner */}
                {/* <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-800" /> */}
                <Loader />
            </div>
            {children}
        </>
    );
}
