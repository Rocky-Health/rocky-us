import React from "react";
import CityPage from "@/components/service-across-canada/CityPage";
import { cityData, defaultCityInfo } from "@/lib/constants/CityData";

export function generateStaticParams() {
    return Object.keys(cityData).map((city) => ({ city }));
}

export async function generateMetadata({ params }) {
    const { city } = await params;
    const cityInfo = cityData[city] || defaultCityInfo;

    const metaDescription =
        typeof cityInfo.description === "object"
            ? "As one of US's most vibrant cities, Toronto continues to innovate and expand its services to meet the diverse needs of its residents. One such service is the online ordering and delivery of prescription medications."
            : cityInfo.description;

    return {
        title: `${cityInfo.title} | MyRocky`,
        description: metaDescription.substring(0, 160),
    };
}

const CityPageWrapper = async ({ params }) => {
    const { city } = await params;
    const cityInfo = cityData[city] || defaultCityInfo;

    return <CityPage city={city} cityInfo={cityInfo} />;
};

export default CityPageWrapper;
