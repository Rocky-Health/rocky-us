import NavContainer from "./Navbar/NavContainer";
// import DesktopIcons from "./Navbar/DesktopIcons";
import Logo from "./Navbar/Logo";
import Navlinks from "./Navbar/Navlinks"; // Changed from MegaMenu to Navlinks, which is the correct component name
// import MobileMenu from "./Navbar/MobileMenu";
import HeaderProudPartner from "./Navbar/HeaderProudPartner";

// TK-438: no server-side cookie read here. The auth-dependent display (name /
// logged-in state) is derived client-side in Navlinks, so this component uses
// no dynamic APIs and every route under the root layout can prerender as
// static HTML. Markup, styling, and navigation are unchanged.
const Navbar = ({
    className,
    hideTrustpilot = false,
    hidePartnerBanner = false,
}) => {
    return (
        <header className={`${className || ""}`}>
            {!hidePartnerBanner && <HeaderProudPartner />}
            <NavContainer>
                {/* <MobileMenu
          menuItems={menuItems}
          token={token}
          displayName={nameToShow}
        /> */}
                <Logo />
                {/* Changed from MegaMenu to Navlinks */}
                {/* <DesktopIcons /> */}
                <Navlinks menuItems={menuItems} />
            </NavContainer>
        </header>
    );
};

export default Navbar;

const menuItems = [
    {
        category: "Sexual Health",
        image: "https://myrocky.b-cdn.net/WP%20Images/ED-bag-2.webp",
        assessmentText: "Start Your ED Assessment",
        description: "Get Confidence Back in Bed",
        treatments: [
            {
                text: "Erectile Dysfunction",
                link: "/sex",
                quizLink: "/ed-pre-consultation-quiz",
            },
        ],
        medications: [
            {
                text: "Sildenafil (Generic Viagra)",
                link: "/product/sildenafil-viagra/",
                type: "most-popular",
            },
            {
                text: "Tadalafil (Generic Cialis®)",
                link: "/product/tadalafil-cialis/",
                type: "most-popular",
            },
            // { text: "Viagra®", link: "/product/viagra/" },
            // { text: "Cialis®", link: "/product/cialis/" },
        ],
        // prematureEjaculation: [
        //   { text: "Numb Ointment", link: "/product/lidocaine/" },
        //   { text: "Numb Spray", link: "/product/lidocaine-spray/" },
        // ],
        // supplements: [
        //   { text: "Essential T-Boost", link: "/product/testosterone-support/" },
        // ],
    },
    {
        category: "Weight Loss",
        image: "https://myrocky.b-cdn.net/WP%20Images/Weight%20Loss/wl.webp",
        assessmentText: "Start Your Weight Loss Assessment",
        description: "Lose Weight With Science",
        treatments: [
            {
                text: "Weight Loss",
                link: "/body-optimization",
                quizLink: "/wl-pre-consultation",
            },
        ],
        medications: [
            {
                text: "Ozempic®",
                link: "/product/ozempic/",
                type: "most-popular",
            },
            { text: "Mounjaro®", link: "/product/mounjaro/" },
            { text: "Wegovy®", link: "/product/wegovy/" },
            { text: "Rybelsus®", link: "/product/rybelsus/" },
        ],
        supplements: [
            // { text: "Essential Gut Support", link: "/product/essential-gut-relief/" },
            // { text: "Numb Spray", link: "/product/essential-gut-relief/" },
            // { text: "Essential T-Boost", link: "/product/testosterone-support" },
        ],
    },
    {
        category: "Hair Loss",
        image: "https://myrocky.b-cdn.net/WP%20Images/Hair%20Loss/hair.webp",
        assessmentText: "Start Your Hair Loss Assessment",
        description: "Stop Hair Loss in Its Tracks",
        treatments: [
            { text: "Hair Loss", link: "/hair", quizLink: "/hair-flow" },
        ],
        medications: [
            {
                text: "Finasteride & Minoxidil Topical Foam",
                link: "/product/finasteride-minoxidil-topical-foam/",
                type: "most-popular",
            },
            // { text: "Finasteride (Propecia®)", link: "/product/finasteride/" },
            // { text: "Minoxidil (Rogaine®)", link: "/product/minoxidil/" },
        ],
        // supplements: [
        //   {
        //     text: "Essential Follicle Support",
        //     link: "/product/hair-growth-support/",
        //   },
        // ],
    },
    {
        category: "NAD+",
        description: "Boost Your Cellular Energy",
        link: "/longevity-nad-lp",
    },
    // {
    //   category: "Mental Health",
    //   // image: "https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/mh.webp",
    //   image:
    //     "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Mental%20Health%20Page/image-1-new.webp",
    //   assessmentText: "Start Your Mental Health Assessment",
    //   treatments: [
    //     {
    //       text: "Mental Health",
    //       link: "/mental-health",
    //       quizLink: "/mh-pre-quiz",
    //     },
    //   ],

    //   medications: [
    //     { text: "Bupropion XL", link: "/mh-pre-quiz" },
    //     { text: "Citalopram", link: "/mh-pre-quiz" },
    //     { text: "Escitalopram", link: "/mh-pre-quiz" },
    //     { text: "Fluoxetine", link: "/mh-pre-quiz" },
    //     { text: "Paroxetine", link: "/mh-pre-quiz" },
    //     { text: "Sertraline", link: "/mh-pre-quiz" },
    //     { text: "Trazodone", link: "/mh-pre-quiz" },
    //     { text: "Venlafaxine XR", link: "/mh-pre-quiz" },
    //     // { text: "Bupropion XL", link: "/product/bupropion/" },
    //     // { text: "Citalopram", link: "/product/citalopram/" },
    //     // { text: "Escitalopram", link: "/product/escitalopram/" },
    //     // { text: "Fluoxetine", link: "/product/fluoxetine/" },
    //     // { text: "Paroxetine", link: "/product/paroxetine/" },
    //     // { text: "Sertraline", link: "/product/sertraline/" },
    //     // { text: "Trazodone", link: "/product/trazodone/" },
    //     // { text: "Venlafaxine XR", link: "/product/venlafaxine/" },
    //   ],
    //   supplements: [
    //     {
    //       text: "Essential Mood Balance",
    //       link: "/product/essential-mood-balance/",
    //     },
    //     {
    //       text: "Essential Night Boost",
    //       link: "/product/essential-night-boost/",
    //     },
    //   ],
    // },

    // {
    //   category: "Smoking Cessation",
    //   image: "/zonic/zonnic-life.webp",
    //   assessmentText: "A New Way To Quit Smoking",
    //   treatments: [
    //     {
    //       text: "ZONNIC Nicotine Pouches",
    //       link: "/product/zonnic/",
    //       quizLink: "/product/zonnic/",
    //     },
    //   ],
    // },
    // {
    //   category: "Recovery",
    //   image: "https://myrocky.b-cdn.net/WP%20Images/dhm/DHMBlendPP.png?v=1",
    //   assessmentText: "The Smarter Way To Recover!",
    //   treatments: [
    //     {
    //       text: "DHM Blend",
    //       link: "/product/dhm-blend/",
    //       quizLink: "/product/dhm-blend/",
    //     },
    //   ],
    // },
    // {
    //   category: "Skin Care",
    //   image: "/skin-care/acne-main.jpg",
    //   description: "Personalized Prescription Skincare",
    //   link: "/skincare",
    // },
    // {
    //   category: "Merch",
    //   image: "",
    //   description: "Shop Our Merch",
    //   link: "/merch",
    // },
];
