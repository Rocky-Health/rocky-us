import React from "react";
import CityCard from "./CityCard";

const ServicesAcrossCanada = ({ cities }) => {
    return (
        <main className="max-w-[1184px] mx-auto px-5 pt-8 md:pt-12 md:px-0">
            <h1 className="mb-8 md:mb-14 text-4xl font-bold text-start md:text-[56px] headers-font">
                Service Across US
            </h1>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {cities.map((city) => (
                    <CityCard key={city.slug} city={city} />
                ))}
            </div>
        </main>
    );
};

export default ServicesAcrossCanada;
