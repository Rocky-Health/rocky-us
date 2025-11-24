"use client";

import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import BlogGrid from "./components/BlogGrid";
import Pagination from "../shared/Pagination";
import { blogService } from "../services/blogService";
import MoreQuestions from "@/components/MoreQuestions";

export default function AllBlogsPage({
    initialBlogs = [],
    initialTotalPages = 1,
    categories = [],
    initialSelectedCategoryId = "0",
    initialCurrentPage = 1,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [blogs, setBlogs] = useState(initialBlogs);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [currentPage, setCurrentPage] = useState(initialCurrentPage);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(
        initialSelectedCategoryId
    );

    // Get dynamic title based on selected category
    const getPageTitle = () => {
        if (selectedCategoryId === "0") {
            return "All Articles";
        }

        const selectedCategory = categories.find(
            (cat) => cat.id.toString() === selectedCategoryId
        );

        return selectedCategory
            ? `All ${selectedCategory.name} Articles`
            : "All Articles";
    };

    // Get selected category for breadcrumbs
    const getSelectedCategory = () => {
        if (selectedCategoryId === "0") {
            return null;
        }

        return categories.find(
            (cat) => cat.id.toString() === selectedCategoryId
        );
    };

    // Handle page change
    const handlePageChange = async (page) => {
        if (page === currentPage || page < 1 || page > totalPages) {
            return;
        }

        try {
            setIsLoading(true);

            // Update URL with new page parameter
            const url = new URL(window.location);
            url.searchParams.set("page", page.toString());
            router.push(url.pathname + url.search, { scroll: false });

            // Fetch blogs for the new page with the selected category
            const blogsData = await blogService.getBlogs(
                page,
                selectedCategoryId
            );

            setBlogs(blogsData.blogs || []);
            setTotalPages(blogsData.totalPages || 1);
            setCurrentPage(page);

            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            logger.error("Error fetching blogs for page:", page, error);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle initial page load if URL has page parameter
    useEffect(() => {
        const urlPage = parseInt(searchParams.get("page")) || 1;
        if (urlPage !== 1 && urlPage !== currentPage) {
            handlePageChange(urlPage);
        }
    }, [searchParams]);

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="mb-6">
                    <nav className="text-sm text-gray-500">
                        <span>
                            <Link href="/blog">HOME</Link>
                        </span>
                        <span className="mx-2">/</span>
                        {getSelectedCategory() ? (
                            <>
                                <span>
                                    <Link
                                        href={`/blog/category/${
                                            getSelectedCategory().slug
                                        }`}
                                    >
                                        {getSelectedCategory().name.toUpperCase()}
                                    </Link>
                                </span>
                                <span className="mx-2">/</span>
                                <span className="text-[#000000B8]">ALL</span>
                            </>
                        ) : (
                            <span>ALL</span>
                        )}
                    </nav>
                </div>

                <div className="text-start mb-[30px]">
                    <h1 className="text-[40px] md:text-[60px] headers-font font-[550] leading-[115%] text-black mb-4 tracking-[-3%]">
                        {getPageTitle()}
                    </h1>
                </div>

                {/* Blog Grid */}
                <BlogGrid
                    blogs={blogs}
                    isLoading={isLoading}
                    className="mb-14"
                />

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mb-8"
                />

                {/* Newsletter Signup */}
                <MoreQuestions
                    title="Join 350K+ Customers & receive actionable health tips."
                    buttonText="Sign up to our newsletter"
                    buttonWidth="240"
                    link="/login-register?viewshow=register"
                ></MoreQuestions>
            </div>
        </main>
    );
}
