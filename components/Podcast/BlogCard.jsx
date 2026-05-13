import Image from "next/image";
import Link from "next/link";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export const BlogCard = ({ post }) => {
  const title = post.title?.rendered || "";
  const excerpt = post.excerpt?.rendered || "";
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const slug = post.slug || "";
  const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name || "Blog";

  const imageUrl =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium
      ?.source_url ||
    "/placeholder-image.jpg";

  return (
    <Link href={`/blog/${slug}`} className="block group">
      <div className="flex flex-col h-full">
        <div className="mb-4 overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={250}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <span className="text-xs md:text-sm text-[#929292] mb-1">{date}</span>
          <h3 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-[#AE7E56] transition-colors">
            {title}
          </h3>
          <div
            className="text-base md:text-lg font-medium text-[#6B6967] mb-4 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(excerpt) }}
          />
          <div className="mt-auto">
            <span className="text-xs md:text-sm px-3 py-2 bg-[#0000000A] text-black rounded-full border border-[#00000014]">
              {category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
