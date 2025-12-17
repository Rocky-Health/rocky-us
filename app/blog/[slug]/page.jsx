"use client";

import { useState, useEffect, use } from "react";
import { logger } from "@/utils/devLogger";

import Section from "@/components/utils/Section";
import MoreQuestions from "@/components/MoreQuestions";
import CategoryBtn from "@/components/Blogs/CategoryBtn";
import CenterContainer from "@/components/Article/CenterContainer";
import TitleWrapper from "@/components/Article/TitleWrapper";
import Author from "@/components/Article/Author";
import ArticleImg from "@/components/Article/ArticleImg";
import HtmlContent from "@/components/Article/HtmlContent";
import Content from "@/components/Article/Content";
import RelatedArticles from "@/components/Article/RelatedArticles";
import Loader from "@/components/Loader";
import NotFound from "./not-found";

export default function BlogSlugPage({ params }) {
  const resolvedParams = use(params);
  const [Blog, setBlog] = useState(null);
  const [BlogLoading, setBlogLoading] = useState(true);
  const [showNotFound, setShowNotFound] = useState(false);
  const [RelatedBlogs, setRelatedBlogs] = useState([]);
  const [RelatedBlogsLoading, setRelatedBlogsLoading] = useState(true);
  const [FeaturedImage, setFeaturedImage] = useState(
    "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"
  );
  const [Category, setCategory] = useState("");
  const [EstReadTime, setEstReadTime] = useState("4 min Read");
  const [AuthorContent, setAuthorContent] = useState("");

  const fetchBlog = async () => {
    try {
      setBlogLoading(true);

      // Check if slug is available
      if (!resolvedParams || !resolvedParams.slug) {
        logger.error("No slug available:", resolvedParams);
        throw new Error("No slug provided");
      }

      // Use the individual blog API route
      var url = `/api/blogs/${resolvedParams.slug}`;
      logger.log("Fetching blog from URL:", url);
      logger.log("Slug object:", resolvedParams);
      logger.log("Slug slug property:", resolvedParams.slug);

      const res = await fetch(url);
      logger.log("Response status:", res.status);
      logger.log("Response ok:", res.ok);

      // If the blog is not found (404), show 404 page
      if (res.status === 404) {
        logger.log("Blog not found, showing 404 page");
        setShowNotFound(true);
        return;
      }

      if (!res.ok) {
        throw new Error(`API call failed with status ${res.status}`);
      }

      const data = await res.json();
      logger.log("Response data:", data);

      // Check if the response contains an error indicating blog not found
      if (data.error) {
        if (data.error === "Blog post not found" || res.status === 404) {
          logger.log("Blog not found via error response, showing 404 page");
          setShowNotFound(true);
          return;
        }
        throw new Error(data.error);
      }

      // Individual blog API route returns a single blog object, not an array
      const blog = data;
      logger.log("Blog object:", blog);

      if (!blog) {
        logger.log("No blog data received, showing 404 page");
        setShowNotFound(true);
        return;
      }

      // Check if blog has required properties
      if (!blog.title || !blog.content) {
        logger.error("Blog missing required properties:", blog);
        logger.log("Blog data incomplete, showing 404 page");
        setShowNotFound(true);
        return;
      }

      setBlog(blog);

      if (blog.authors && blog.authors.length > 0) {
        setAuthorContent(blog.authors[0]);
      }

      if (
        blog._embedded &&
        blog._embedded["wp:featuredmedia"] &&
        blog._embedded["wp:featuredmedia"][0] &&
        blog._embedded["wp:featuredmedia"][0].source_url
      ) {
        setFeaturedImage(blog._embedded["wp:featuredmedia"][0].source_url);
      }

      // Get the category name
      if (blog.class_list && blog.class_list[7]) {
        const categoryName = blog.class_list[7]
          .replace("category-", "")
          .replace(/-/g, " ");
        logger.log("Category name extracted:", categoryName);
        setCategory(categoryName);
      } else {
        logger.log("No class_list[7] found, trying categories array");
        // Try to get category from categories array
        if (blog.categories && blog.categories.length > 0) {
          logger.log("Found categories array:", blog.categories);
          setCategory(blog.categories[0]);
        } else {
          logger.log("No categories found in blog data");
        }
      }

      if (blog.yoast_head_json?.twitter_misc?.["Est. reading time"]) {
        setEstReadTime(
          blog.yoast_head_json.twitter_misc["Est. reading time"] + " read"
        );
      }
    } catch (error) {
      logger.error("Error fetching blogs:", error);
      logger.error("Error details:", error.message);
      logger.error("Error stack:", error.stack);
    } finally {
      setBlogLoading(false);
    }
  };

  const fetchRecentArticles = async () => {
    try {
      setRelatedBlogsLoading(true);
      logger.log("Fetching recent articles as fallback");

      var url = `/api/blogs?per_page=3`;
      logger.log("Recent articles URL:", url);

      const res = await fetch(url);
      logger.log("Recent articles response status:", res.status);

      if (!res.ok) {
        throw new Error(
          `Recent articles API call failed with status ${res.status}`
        );
      }

      const data = await res.json();
      logger.log("Recent articles data:", data);

      if (Array.isArray(data)) {
        // Filter out the current blog from recent articles
        const filteredData = data.filter((blog) => blog.id !== Blog?.id);
        logger.log("Filtered recent articles:", filteredData);

        // Take only the first 3 recent articles
        const finalData = filteredData.slice(0, 3);
        logger.log("Final recent articles (limited to 3):", finalData);
        setRelatedBlogs(finalData);
      } else {
        logger.error("Recent articles data is not an array:", data);
        setRelatedBlogs([]);
      }
    } catch (error) {
      logger.error("Error fetching recent articles: ", error);
      setRelatedBlogs([]);
    } finally {
      setRelatedBlogsLoading(false);
    }
  };

  const fetchRelated = async ({ category }) => {
    try {
      setRelatedBlogsLoading(true);
      logger.log("Fetching related blogs for category:", category);

      // Use the main blogs API route for related blogs by category
      // Fetch more to account for filtering out the current blog
      var url = `/api/blogs?categories=${category}&per_page=6`;
      logger.log("Related blogs URL:", url);

      const res = await fetch(url);
      logger.log("Related blogs response status:", res.status);

      if (!res.ok) {
        throw new Error(
          `Related blogs API call failed with status ${res.status}`
        );
      }

      const data = await res.json();
      logger.log("Related blogs data:", data);
      logger.log("Related blogs data type:", typeof data);
      logger.log(
        "Related blogs data length:",
        Array.isArray(data) ? data.length : "not an array"
      );

      // Ensure data is an array
      if (Array.isArray(data)) {
        // Filter out the current blog from related articles
        const filteredData = data.filter((blog) => blog.id !== Blog?.id);
        logger.log("Filtered related blogs:", filteredData);

        // Take only the first 3 related articles
        const finalData = filteredData.slice(0, 3);
        logger.log("Final related blogs (limited to 3):", finalData);
        setRelatedBlogs(finalData);
      } else {
        logger.error("Related blogs data is not an array:", data);
        setRelatedBlogs([]);
      }
    } catch (error) {
      logger.error("Error fetching related blogs: ", error);
      setRelatedBlogs([]); // Set empty array on error
    } finally {
      setRelatedBlogsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  // Fetch related blogs when blog is loaded (same as original blog-old)
  useEffect(() => {
    if (Blog && Blog.categories && Blog.categories.length > 0) {
      logger.log(
        "Blog loaded, fetching related articles for category:",
        Blog.categories[0]
      );
      fetchRelated({ category: Blog.categories[0] });
    } else if (Blog && Category) {
      logger.log(
        "Blog loaded, fetching related articles for category:",
        Category
      );
      fetchRelated({ category: Category });
    } else if (Blog) {
      logger.log(
        "Blog loaded but no categories found, fetching recent articles as fallback"
      );
      fetchRecentArticles();
    }
  }, [Blog]);

  const onClickCategoryBtn = (category) => { };

  // Show system loader while blog is loading
  if (BlogLoading) {
    return <Loader />;
  }

  // Show 404 page if blog not found
  if (showNotFound) {
    return <NotFound />;
  }

  return (
    <main>
      <Section>
        <CenterContainer loading={BlogLoading}>
          <CategoryBtn
            category={Category}
            loading={BlogLoading}
            onClick={onClickCategoryBtn}
          ></CategoryBtn>
          <TitleWrapper title={Blog?.title?.rendered}></TitleWrapper>
          {/* <Author
            name={AuthorContent?.display_name}
            readTime={EstReadTime}
            date={Blog?.date}
            avatarUrl={AuthorContent?.avatar_url}
          ></Author> */}
        </CenterContainer>

        <ArticleImg
          src={FeaturedImage}
          loading={BlogLoading}
          alt={Blog?.title.rendered}
        ></ArticleImg>

        <Content
          html={Blog?.content?.rendered}
          loading={BlogLoading}
          AuthorContent={AuthorContent}
        ></Content>

        <RelatedArticles
          RelatedBlogs={Array.isArray(RelatedBlogs) ? RelatedBlogs : []}
          loading={RelatedBlogsLoading}
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
