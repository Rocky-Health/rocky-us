import { blogService } from "@/components/NewBlogs/services/blogService";
import { logger } from "@/utils/devLogger";
import { buildMetadata, stripHtml } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const canonicalPath = `/blog/${slug}`;

  try {
    const blog = await blogService.getBlogBySlug(slug);

    const title = stripHtml(
      blog?.yoast_head_json?.title ||
        blog?.title?.rendered ||
        "MyRocky Blog",
      120,
    );

    const description = stripHtml(
      blog?.yoast_head_json?.description || blog?.excerpt?.rendered,
    );

    const ogImage =
      blog?.yoast_head_json?.og_image?.[0]?.url ||
      blog?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      undefined;

    const authorName =
      blog?._embedded?.author?.[0]?.name ||
      blog?.yoast_head_json?.author ||
      undefined;

    const yoastCanonical = blog?.yoast_head_json?.canonical || undefined;

    return buildMetadata({
      title,
      description,
      path: canonicalPath,
      canonicalUrl: yoastCanonical,
      vertical: "blog",
      type: "article",
      ogImage,
      publishedTime: blog?.date,
      authors: authorName ? [authorName] : undefined,
    });
  } catch (error) {
    logger.error("Error generating blog metadata:", error);
    return buildMetadata({
      title: "MyRocky Blog",
      path: canonicalPath,
      vertical: "blog",
      type: "article",
    });
  }
}

export default function BlogSlugLayout({ children }) {
  return children;
}
