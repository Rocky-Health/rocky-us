import { getPostBySlug, getRelatedPosts } from "@/lib/api/getPosts";
import { logger } from "@/utils/devLogger";

import Section from "@/components/utils/Section";
import MoreQuestions from "@/components/MoreQuestions";
import CategoryBtn from "@/components/Blogs/CategoryBtn";
import CenterContainer from "@/components/Article/CenterContainer";
import TitleWrapper from "@/components/Article/TitleWrapper";
import ArticleImg from "@/components/Article/ArticleImg";
import Content from "@/components/Article/Content";
import RelatedArticles from "@/components/Article/RelatedArticles";
import NotFound from "./not-found";

const DEFAULT_FEATURED_IMAGE =
  "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg";

// Revalidate the statically generated article every hour (ISR).
export const revalidate = 3600;

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

// Derive the category label from the post, mirroring the previous client logic.
function deriveCategory(blog) {
  if (blog?.class_list && blog.class_list[7]) {
    return blog.class_list[7].replace("category-", "").replace(/-/g, " ");
  }

  if (blog?.categories && blog.categories.length > 0) {
    return blog.categories[0];
  }

  return "";
}

// Derive the author content from the embedded author, mirroring the previous client logic.
function deriveAuthorContent(blog) {
  if (blog?._embedded?.author && blog._embedded.author.length > 0) {
    const author = blog._embedded.author[0];

    return {
      display_name: author.name,
      description: author.description,
      avatar_url: author.mpp_avatar?.full || author.avatar_urls?.[96] || "",
    };
  }

  return "";
}

export default async function BlogSlugPage({ params }) {
  const { slug } = await params;

  let blog = null;

  try {
    blog = await getPostBySlug(slug);
  } catch (error) {
    logger.error("Error fetching blog:", error);
    return <NotFound />;
  }

  // Show 404 page when the post is missing or incomplete.
  if (!blog || !blog.title || !blog.content) {
    return <NotFound />;
  }

  const AuthorContent = deriveAuthorContent(blog);

  const FeaturedImage =
    blog._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    DEFAULT_FEATURED_IMAGE;

  const Category = deriveCategory(blog);

  // Fetch related articles server-side, preferring the post's own category,
  // then the derived category label, then recent posts as a fallback.
  const relatedCategory =
    blog.categories && blog.categories.length > 0
      ? blog.categories[0]
      : Category || undefined;

  const fetchedRelated = await getRelatedPosts({ category: relatedCategory });
  const RelatedBlogs = fetchedRelated
    .filter((related) => related.id !== blog.id)
    .slice(0, 3);

  return (
    <main>
      <Section>
        <CenterContainer>
          <CategoryBtn category={Category}></CategoryBtn>
          <TitleWrapper title={blog?.title?.rendered}></TitleWrapper>
        </CenterContainer>

        <ArticleImg
          src={FeaturedImage}
          alt={blog?.title?.rendered}
        ></ArticleImg>

        <Content
          html={blog?.content?.rendered}
          AuthorContent={AuthorContent}
        ></Content>

        <RelatedArticles
          RelatedBlogs={Array.isArray(RelatedBlogs) ? RelatedBlogs : []}
        ></RelatedArticles>

        <MoreQuestions
          title="Your path to better health begins here."
          buttonText="Get Started For Free"
          buttonWidth="240"
        ></MoreQuestions>
      </Section>
    </main>
  );
}
