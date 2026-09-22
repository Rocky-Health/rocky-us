import { notFound } from "next/navigation";
import { logger } from "@/utils/devLogger";
import { blogService } from "@/components/NewBlogs/services/blogService";
import { SITE, stripHtml } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

import Section from "@/components/utils/Section";
import MoreQuestions from "@/components/MoreQuestions";
import CategoryBtn from "@/components/Blogs/CategoryBtn";
import CenterContainer from "@/components/Article/CenterContainer";
import TitleWrapper from "@/components/Article/TitleWrapper";
import ArticleImg from "@/components/Article/ArticleImg";
import Content from "@/components/Article/Content";
import RelatedArticles from "@/components/Article/RelatedArticles";

// ISR: server-rendered HTML cached and regenerated at most every 5 min.
// Body is now rendered on the server so crawlers get the full article.
export const revalidate = 300;

// Opt the route into ISR without prebuilding any post at build time.
// Every post renders on first request, then caches per `revalidate`.
export function generateStaticParams() {
  return [];
}

const DEFAULT_FEATURED_IMAGE =
  "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg";

// Pre-generate article routes at build time from the published posts.
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/wp-json/wp/v2/posts?per_page=100&_fields=slug`,
      {
        headers: {
          Authorization: process.env.ADMIN_TOKEN,
        },
      }
    );

    if (!res.ok) {
      logger.error("Failed to fetch posts for static generation");
      return [];
    }

    const posts = await res.json();

    if (!Array.isArray(posts)) {
      return [];
    }

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    logger.error("Error in generateStaticParams:", error);
    return [];
  }
}

function deriveCategory(blog) {
  if (blog?.class_list?.[7]) {
    return blog.class_list[7].replace("category-", "").replace(/-/g, " ");
  }
  if (Array.isArray(blog?.categories) && blog.categories.length > 0) {
    return blog.categories[0];
  }
  return "";
}

function deriveFeaturedImage(blog) {
  return (
    blog?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    DEFAULT_FEATURED_IMAGE
  );
}

function deriveAuthor(blog) {
  const author = blog?._embedded?.author?.[0];
  if (!author) return "";
  return {
    display_name: author.name,
    description: author.description,
    avatar_url: author.mpp_avatar?.full || author.avatar_urls?.[96] || "",
  };
}

async function getRelated(blog) {
  try {
    const categoryId =
      Array.isArray(blog?.categories) && blog.categories.length > 0
        ? blog.categories[0]
        : null;

    const { blogs } = categoryId
      ? await blogService.getBlogs(1, categoryId)
      : await blogService.getBlogs(1);

    return (blogs || []).filter((b) => b.id !== blog.id).slice(0, 3);
  } catch (error) {
    logger.error("Error fetching related blogs:", error);
    return [];
  }
}

export default async function BlogSlugPage({ params }) {
  const { slug } = await params;

  let blog;
  try {
    blog = await blogService.getBlogBySlug(slug);
  } catch (error) {
    logger.error("Error fetching blog:", error);
    notFound();
  }

  if (!blog?.title || !blog?.content) {
    notFound();
  }

  const category = deriveCategory(blog);
  const featuredImage = deriveFeaturedImage(blog);
  const author = deriveAuthor(blog);
  const relatedBlogs = await getRelated(blog);

  const headline = stripHtml(blog?.title?.rendered, 110);
  const canonicalUrl = `${SITE.baseUrl}/blog/${slug}`;
  const jsonLd = [
    articleSchema({
      headline,
      description: stripHtml(blog?.excerpt?.rendered),
      url: canonicalUrl,
      image: featuredImage,
      datePublished: blog?.date_gmt ? `${blog.date_gmt}Z` : blog?.date,
      dateModified: blog?.modified_gmt ? `${blog.modified_gmt}Z` : blog?.modified,
      authorName: author?.display_name,
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: headline, path: `/blog/${slug}` },
    ]),
  ];

  return (
    <main>
      <JsonLd data={jsonLd} />
      <Section>
        <CenterContainer>
          <CategoryBtn category={category} />
          <TitleWrapper title={blog?.title?.rendered} />
        </CenterContainer>

        <ArticleImg src={featuredImage} alt={blog?.title?.rendered} />

        <Content html={blog?.content?.rendered} AuthorContent={author} />

        <RelatedArticles RelatedBlogs={relatedBlogs} />

        <MoreQuestions
          title="Your path to better health begins here."
          buttonText="Get Started For Free"
          buttonWidth="240"
        />
      </Section>
    </main>
  );
}
