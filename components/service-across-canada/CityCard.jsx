import React from "react";
import Link from "next/link";
import Image from "next/image";

const CityCard = ({ city }) => {
    return (
        <Link
            href={`/service-across-canada/${city.slug}`}
            key={city.slug}
            className="overflow-hidden relative w-full rounded-2xl transition-transform duration-300 group hover:scale-105"
        >
            <div className="relative w-full h-[250px] md:h-[436px]">
                <Image
                    src={city.image}
                    alt={`${city.name} city skyline`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 16vw"
                    priority
                />
                {city.name}
            </div>
        </Link>
    );
};

export default CityCard;
