"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryFilters from "../components/CategoryFilters";
import BlogGrid from "./components/BlogGrid";
import Pagination from "../shared/Pagination";
import NewsletterSignup from "../components/NewsletterSignup";
import MoreQuestions from "@/components/MoreQuestions";
import Link from "next/link";

export default function CategoryPage({
    category,
    initialBlogs = [],
    initialTotalPages = 1,
    categories = [],
}) {
    const router = useRouter();
    const [blogs, setBlogs] = useState(initialBlogs);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(
        category?.id?.toString() || "0"
    );

    // Handle category change
    const handleCategoryClick = (categoryId) => {
        if (categoryId === "0") {
            router.push("/blog/all");
        } else {
            const selectedCategory = categories.find(
                (cat) => cat.id.toString() === categoryId
            );
            if (selectedCategory) {
                router.push(`/blog/category/${selectedCategory.slug}`);
            }
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

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
                        <span>{category?.name?.toUpperCase()}</span>
                    </nav>
                </div>

                <div className="text-start mb-[30px]">
                    <h1 className="text-[40px] md:text-[60px] headers-font font-[550] leading-[114%] text-black mb-4 tracking-tight">
                        {category?.name}
                    </h1>
                    <p className="text-[16px] md:text-[18px] text-[#000000B8] max-w-md leading-[140%]">
                        Your guide to men's health from sex and hair to mental
                        health, weight loss and more.
                    </p>
                </div>

                {/* Category Filters */}
                <CategoryFilters
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategoryClick={handleCategoryClick}
                    showAllBlogs={true}
                />

                {/* Blog Grid */}
                <BlogGrid
                    blogs={blogs}
                    isLoading={isLoading}
                    className="mb-8"
                    categoryId={category?.id}
                    initialTotalPages={initialTotalPages}
                />

                {/* Pagination */}
                {/* <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mb-8"
                /> */}

                <MoreQuestions
                    title="Join 350K+ Customers & receive actionable health tips."
                    buttonText="Sign up to our newsletter"
                    buttonWidth="240"
                    link="/login-register?viewshow=register"
                />
            </div>
        </main>
    );
}
