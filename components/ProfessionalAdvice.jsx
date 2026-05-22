"use client";
import Image from "next/image";
import Link from "next/link";

const CheckIcon = () => (
    <svg
        className="w-5 h-5 md:w-6 md:h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#clip0_6196_1567)">
            <path
                d="M10.5 16.0605L6.75 12.3097L7.80975 11.25L10.5 13.9395L16.1887 8.25L17.25 9.31125L10.5 16.0605Z"
                fill="black"
            ></path>
            <path
                d="M12 1.5C9.9233 1.5 7.89323 2.11581 6.16652 3.26957C4.4398 4.42332 3.09399 6.0632 2.29927 7.98182C1.50455 9.90045 1.29661 12.0116 1.70176 14.0484C2.1069 16.0852 3.10693 17.9562 4.57538 19.4246C6.04383 20.8931 7.91476 21.8931 9.95156 22.2982C11.9884 22.7034 14.0996 22.4955 16.0182 21.7007C17.9368 20.906 19.5767 19.5602 20.7304 17.8335C21.8842 16.1068 22.5 14.0767 22.5 12C22.5 9.21523 21.3938 6.54451 19.4246 4.57538C17.4555 2.60625 14.7848 1.5 12 1.5ZM12 21C10.22 21 8.47992 20.4722 6.99987 19.4832C5.51983 18.4943 4.36628 17.0887 3.68509 15.4442C3.0039 13.7996 2.82567 11.99 3.17294 10.2442C3.5202 8.49836 4.37737 6.89471 5.63604 5.63604C6.89472 4.37737 8.49836 3.5202 10.2442 3.17293C11.99 2.82567 13.7996 3.0039 15.4442 3.68508C17.0887 4.36627 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C21 14.3869 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.387 21 12 21Z"
                fill="black"
            ></path>
        </g>
        <defs>
            <clipPath id="clip0_6196_1567">
                <rect width="24" height="24" fill="white"></rect>
            </clipPath>
        </defs>
    </svg>
);

const ProfessionalAdvice = ({
    title = "Get Professional Advice",
    points = [
        "No GP or pharmacy visits needed.",
        "Free initial consultation with healthcare providers.",
        "Unlimited follow ups.",
        "No GP or pharmacy visits needed.",
    ],
    buttonText = "Start Free Visit",
    buttonLink = "/consultation",
    imageUrl = "https://myrocky.b-cdn.net/WP%20Images/ED-bag.webp",
    imageAlt = "Professional medical advice",
    reversed = false,
}) => {
    return (
        <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                reversed ? "lg:flex-row-reverse" : ""
            }`}
        >
            <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold">
                    {title.includes("<br>")
                        ? title.split("<br>").map((part, i) => (
                              <span key={i} className="block">
                                  {part}
                              </span>
                          ))
                        : title}
                </h2>

                <ul className="space-y-4">
                    {points.map((point, index) => (
                        <li key={index} className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <CheckIcon />
                            </div>
                            <span className="text-lg">{point}</span>
                        </li>
                    ))}
                </ul>

                <Link href={buttonLink} className="inline-block">
                    <button className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 transition hover:bg-gray-800">
                        {buttonText}
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8.00001 3.33325L7.06001 4.27325L10.1133 7.33325H3.33334V8.66659H10.1133L7.06001 11.7266L8.00001 12.6666L12.6667 7.99992L8.00001 3.33325Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </Link>
            </div>

            <div
                className={`rounded-xl overflow-hidden ${
                    reversed ? "lg:order-first" : ""
                }`}
            >
                <img
                    src={imageUrl}
                    alt={imageAlt}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default ProfessionalAdvice;
