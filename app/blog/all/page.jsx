import { blogService } from "@/components/NewBlogs/services/blogService";
import { AllBlogsPage } from "@/components/NewBlogs/AllBlogsPage";
import { logger } from "@/utils/devLogger";

export const dynamic = "force-dynamic";

export default async function AllBlogsPageRoute({ searchParams }) {
  try {
    // Await searchParams as it's now a promise in Next.js 15+
    const resolvedSearchParams = await searchParams;

    // Get category from query parameter, default to "0" if not provided
    const categoryId = resolvedSearchParams?.category || "0";

    // Get current page from searchParams for initial load
    const currentPage = parseInt(resolvedSearchParams?.page) || 1;

    // Fetch all blogs and categories using the new getAllPageBlogs function
    const blogsData = await blogService.getAllPageBlogs(
      currentPage,
      categoryId
    );

    return (
      <AllBlogsPage
        initialBlogs={blogsData.blogs || []}
        initialTotalPages={blogsData.totalPagesCount || 1}
        categories={blogsData.categories || []}
        initialSelectedCategoryId={categoryId}
        initialCurrentPage={currentPage}
      />
    );
  } catch (error) {
    logger.error("Error loading all blogs page:", error);

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
