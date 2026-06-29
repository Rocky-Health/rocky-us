import axios from "axios";
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

// Revalidate the rendered page (ISR) every hour, matching the product route.
export const revalidate = 3600;

// Pre-generate the most recent blog posts at build time.
export async function generateStaticParams() {
  try {
    if (!process.env.BASE_URL || !process.env.ADMIN_TOKEN) {
      logger.error("generateStaticParams: BASE_URL or ADMIN_TOKEN missing");
      return [];
    }

    const apiUrl = `${process.env.BASE_URL}/wp-json/wp/v2/posts`;
    const res = await axios.get(apiUrl, {
      params: { per_page: 100, _fields: "slug" },
      headers: { Authorization: process.env.ADMIN_TOKEN },
      timeout: 10000,
    });

    if (!Array.isArray(res.data)) {
      return [];
    }

    return res.data
      .filter((post) => post && post.slug)
      .map((post) => ({ slug: post.slug }));
  } catch (error) {
    logger.error("Error in generateStaticParams:", error.message);
    return [];
  }
}

// Server-side fetch of a single blog post by slug (mirrors /api/blogs/[slug]).
async function fetchBlogBySlug(slug) {
  if (!slug || !process.env.BASE_URL || !process.env.ADMIN_TOKEN) {
    return null;
  }

  const apiUrl = `${process.env.BASE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed=true`;
  logger.log("Blog page: fetching blog by slug server-side:", apiUrl);

  const res = await axios.get(apiUrl, {
    headers: { Authorization: process.env.ADMIN_TOKEN },
    timeout: 10000,
  });

  if (!res.data || res.data.length === 0) {
    return null;
  }

  return res.data[0];
}

// Server-side fetch of related/recent articles (mirrors /api/blogs).
async function fetchRelatedBlogs({ category, currentBlogId }) {
  if (!process.env.BASE_URL || !process.env.ADMIN_TOKEN) {
    return [];
  }

  try {
    const params = { _embed: true, per_page: category ? 6 : 3, page: 1 };
    if (category) {
      params.categories = category;
    }

    const apiUrl = `${process.env.BASE_URL}/wp-json/wp/v2/posts`;
    const res = await axios.get(apiUrl, {
      params,
      headers: { Authorization: process.env.ADMIN_TOKEN },
      timeout: 10000,
    });

    if (!Array.isArray(res.data)) {
      return [];
    }

    return res.data
      .filter((blog) => blog.id !== currentBlogId)
      .slice(0, 3);
  } catch (error) {
    logger.error("Error fetching related blogs server-side:", error.message);
    return [];
  }
}

// Derive the presentational fields the page needs from the raw blog object.
function deriveBlogFields(blog) {
  let featuredImage = DEFAULT_FEATURED_IMAGE;
  let category = "";
  let estReadTime = "4 min Read";
  let authorContent = "";

  if (
    blog._embedded &&
    blog._embedded.author &&
    blog._embedded.author.length > 0
  ) {
    const author = blog._embedded.author[0];
    authorContent = {
      display_name: author.name,
      description: author.description,
      avatar_url: author.mpp_avatar?.full || author.avatar_urls?.[96] || "",
    };
  }

  if (
    blog._embedded &&
    blog._embedded["wp:featuredmedia"] &&
    blog._embedded["wp:featuredmedia"][0] &&
    blog._embedded["wp:featuredmedia"][0].source_url
  ) {
    featuredImage = blog._embedded["wp:featuredmedia"][0].source_url;
  }

  if (blog.class_list && blog.class_list[7]) {
    category = blog.class_list[7]
      .replace("category-", "")
      .replace(/-/g, " ");
  } else if (blog.categories && blog.categories.length > 0) {
    category = blog.categories[0];
  }

  if (blog.yoast_head_json?.twitter_misc?.["Est. reading time"]) {
    estReadTime =
      blog.yoast_head_json.twitter_misc["Est. reading time"] + " read";
  }

  return { featuredImage, category, estReadTime, authorContent };
}

export default async function BlogSlugPage({ params }) {
  const { slug } = await params;

  let blog;
  try {
    blog = await fetchBlogBySlug(slug);
  } catch (error) {
    logger.error("Error fetching blog server-side:", error.message);
    return <NotFound />;
  }

  // Show 404 page if blog not found or missing required properties.
  if (!blog || !blog.title || !blog.content) {
    return <NotFound />;
  }

  const { featuredImage, category, estReadTime, authorContent } =
    deriveBlogFields(blog);

  // Fetch related articles by category, falling back to recent articles.
  const relatedCategory =
    blog.categories && blog.categories.length > 0
      ? blog.categories[0]
      : category || null;
  const relatedBlogs = await fetchRelatedBlogs({
    category: relatedCategory,
    currentBlogId: blog.id,
  });

  return (
    <main>
      <Section>
        <CenterContainer loading={false}>
          <CategoryBtn category={category} loading={false}></CategoryBtn>
          <TitleWrapper title={blog?.title?.rendered}></TitleWrapper>
        </CenterContainer>

        <ArticleImg
          src={featuredImage}
          loading={false}
          alt={blog?.title.rendered}
        ></ArticleImg>

        <Content
          html={blog?.content?.rendered}
          loading={false}
          AuthorContent={authorContent}
        ></Content>

        <RelatedArticles
          RelatedBlogs={Array.isArray(relatedBlogs) ? relatedBlogs : []}
          loading={false}
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
