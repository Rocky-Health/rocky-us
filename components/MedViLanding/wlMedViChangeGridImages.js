/**
 * “Change grid” masonry — seven slots matching the MEDVi-style layout (no copy).
 * Set `src` when assets are ready (e.g. `/medvi/your-photo.jpg`).
 *
 * Slot order matches desktop placement: left column top→bottom, then col2,
 * then tall center column, then right column.
 *
 * @typedef {{ id: string, src: string, alt: string }} WlMedViChangeGridTile
 * @type {WlMedViChangeGridTile[]}
 */
export const WL_MEDVI_CHANGE_GRID_TILES = [
    { id: "col1Top", src: "/medvi/change-grid-5.jpg", alt: "MyRocky patient" },
    {
        id: "col1Bottom",
        src: "/medvi/reviews-img-1.jpg",
        alt: "MyRocky patient",
    },
    { id: "col2Top", src: "/medvi/change-grid-10.jpg", alt: "MyRocky patient" },
    {
        id: "col2Bottom",
        src: "/medvi/hero-grid-2-p-1080.jpg",
        alt: "MyRocky patient",
    },
    {
        id: "centerTall",
        src: "/medvi/change-grid-9.jpg",
        alt: "MyRocky patient",
    },
    { id: "col4Top", src: "/medvi/change-grid-4.jpg", alt: "MyRocky patient" },
    {
        id: "col4Bottom",
        src: "/medvi/change-grid-11.jpg",
        alt: "MyRocky patient",
    },
];
