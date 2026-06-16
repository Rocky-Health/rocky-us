import { blogService } from "@/components/NewBlogs/services/blogService";
import { CategoryPage } from "@/components/NewBlogs/CategoryPage";
import { logger } from "@/utils/devLogger";
import { buildMetadata, stripHtml } from "@/lib/seo/metadata";

// ISR: cached HTML per category, regenerated at most every 5 min (was force-dynamic).
export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = `/blog/category/${slug}`;

  try {
    const categories = await blogService.getBlogCategories();
    const current = categories?.find((cat) => cat.slug === slug);
    const categoryName = current?.name || slug.replace(/-/g, " ");
    const description =
      stripHtml(current?.description) ||
      `Articles on ${categoryName} from MyRocky — men's health articles for the US.`;

    return buildMetadata({
      title: `${categoryName} Articles`,
      description,
      path,
      vertical: "blog",
    });
  } catch (error) {
    logger.error("Error generating blog category metadata:", error);
    return buildMetadata({
      title: "Blog Category",
      path,
      vertical: "blog",
    });
  }
}

export default async function CategoryBlogsPage({ params }) {
  try {
    const { slug } = await params;

    // Fetch category details and blogs for this category
    const [categories, blogsData] = await Promise.all([
      blogService.getBlogCategories(),
      blogService.getBlogsByCategory(slug, 1),
    ]);

    // Find the current category
    const currentCategory = categories.find((cat) => cat.slug === slug);

    if (!currentCategory) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Category not found
            </h1>
            <p className="text-gray-600">
              The category you're looking for doesn't exist.
            </p>
          </div>
        </div>
      );
    }

    return (
      <CategoryPage
        category={currentCategory}
        initialBlogs={blogsData.blogs || []}
        initialTotalPages={blogsData.totalPages || 1}
        categories={categories}
      />
    );
  } catch (error) {
    logger.error("Error loading category page:", error);

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600">
            We're having trouble loading this category. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
