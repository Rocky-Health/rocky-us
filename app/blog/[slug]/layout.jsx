import { blogService } from "@/components/NewBlogs/services/blogService";
import { logger } from "@/utils/devLogger";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const canonicalPath = `/blog/${slug}`;

  try {
    const blog = await blogService.getBlogBySlug(slug);

    const yoast = blog?.yoast_head_json || {};
    const title =
      yoast.title ||
      blog?.title?.rendered ||
      "MyRocky - Your Health Partner";
    const description =
      yoast.description ||
      blog?.excerpt?.rendered?.replace(/<[^>]*>/g, "").trim() ||
      "Get professional healthcare advice and treatment online";
    const ogImage =
      yoast.og_image?.[0]?.url ||
      blog?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      undefined;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title,
        description,
        url: canonicalPath,
        type: "article",
        ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch (error) {
    logger.error("Error generating blog metadata:", error);
    return {
      alternates: {
        canonical: canonicalPath,
      },
    };
  }
}

export default function BlogSlugLayout({ children }) {
  return children;
}
