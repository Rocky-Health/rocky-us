import { Suspense } from "react";
import { logger } from "@/utils/devLogger";
import { blogService } from "@/components/NewBlogs/services/blogService";
import { MainBlogsPage } from "@/components/NewBlogs";
import BlogPageSkeleton from "@/components/NewBlogs/components/BlogPageSkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: {
    canonical: "/blog",
  },
};

async function BlogsContent() {
  try {
    const [blogsData, categories] = await Promise.all([
      blogService.getBlogs(1),
      blogService.getBlogCategories(),
    ]);

    return (
      <MainBlogsPage
        initialBlogs={blogsData.blogs || []}
        initialCategories={categories || []}
        initialTotalPages={blogsData.totalPages || 1}
      />
    );
  } catch (error) {
    logger.error("Error loading blogs page:", error);

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600">
            We're having trouble loading the blogs. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogsContent />
    </Suspense>
  );
}
